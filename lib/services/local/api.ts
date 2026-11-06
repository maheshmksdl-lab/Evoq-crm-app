import { z } from "zod";
import type {
  Account, AuditEvent, Call, Contact, Db, Deal, DealStage, Lead, Meeting, ModuleKey, PermAction, RecordModule, RecordRef, Task, User,
} from "@/lib/schemas";
import {
  AccountInput, CallInput, CommentInput, ContactInput, ConvertLeadInput, DealInput, EmailLogInput, HealthOverrideInput,
  LeadInput, MeetingInput, NoteInput, SignInInput, TaskInput,
} from "@/lib/schemas/inputs";
import { STAGE_PROBABILITY } from "@/lib/schemas/options";
import { can, MODULE_PERM, PermissionError, teamUserIds, tierOf, type PermModule } from "@/lib/domain/permissions";
import { intelligenceFor, isDealOpen, isLeadOpen } from "@/lib/domain/intelligence";
import { activitiesFor, splitStream } from "@/lib/domain/activity";
import { personName, recordTitle } from "@/lib/domain/names";
import { nowIso, now, todayIso } from "@/lib/domain/clock";
import { METRIC_BY_KEY, type Scope } from "@/lib/domain/metrics";
import { commit, getDb, getLoadIssue, nextId } from "./store";
import { clearSession, getSessionUserId, setSessionUserId } from "./session";
import { allRows, runQuery, toRow, type ListParams, type ListResult, type RowMap } from "./rows";

/* ═════════════════════ errors ═════════════════════ */
export class NotFoundError extends Error {
  constructor(what: string) { super(`${what} was not found. It may have been deleted.`); this.name = "NotFoundError"; }
}
export class ValidationError extends Error {
  constructor(message: string, public readonly issues: { path: string; message: string }[] = []) { super(message); this.name = "ValidationError"; }
}
export class AuthError extends Error {
  constructor(message = "Your session has ended. Sign in again.") { super(message); this.name = "AuthError"; }
}

function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const r = schema.safeParse(input);
  if (!r.success) {
    const issues = r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    throw new ValidationError(issues[0]?.message ?? "Check the highlighted fields", issues);
  }
  return r.data;
}

/* ═════════════════════ session & authorization ═════════════════════ */
export function me(db: Db = getDb()): User {
  const id = getSessionUserId();
  const u = id ? db.users.find((x) => x.id === id && x.active) : null;
  if (!u) throw new AuthError();
  return u;
}
function assertCan(db: Db, mod: PermModule, action: PermAction) {
  if (!can(db, me(db), mod, action)) throw new PermissionError(mod, action);
}
const permFor = (m: ModuleKey | RecordModule) => MODULE_PERM[m];

/**
 * DEMO AUTH — mirrors the pre-migration login, which accepted exactly one hardcoded credential.
 * SECURITY BLOCKER: a credential in client code is visible to anyone. Replace with backend auth
 * (httpOnly session, hashed passwords, rate limiting) before production. See docs/IMPLEMENTATION_REPORT.md.
 */
const DEMO_CREDENTIAL = { email: "tech@evoq.one", password: "Sdl@T3#1" };

export const session = {
  async current() {
    const db = getDb();
    const id = getSessionUserId();
    const user = id ? db.users.find((u) => u.id === id && u.active) ?? null : null;
    return {
      user, tier: user ? tierOf(user.role) : null, teamUserIds: user ? teamUserIds(db, user) : [],
      loadIssue: getLoadIssue(),
      permissions: user ? Object.fromEntries(Object.keys(db.settings.permissions).map((m) => [m, Object.fromEntries(["create", "read", "update", "delete", "import", "export", "email", "print"].map((a) => [a, can(db, user, m as PermModule, a as PermAction)]))])) as Record<string, Record<string, boolean>> : {},
    };
  },
  async signIn(input: unknown) {
    const { email, password } = parse(SignInInput, input);
    const db = getDb();
    if (email.toLowerCase() !== DEMO_CREDENTIAL.email || password !== DEMO_CREDENTIAL.password) {
      throw new AuthError("Invalid email or password. Please try again.");
    }
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.active) throw new AuthError("This account is inactive. Contact your administrator.");
    setSessionUserId(user.id);
    return user;
  },
  /**
   * Public "request access": records an INACTIVE user for an administrator to review in Settings ▸ Users.
   * It does not create credentials — issuing sign-in for additional users needs the authentication
   * backend (documented blocker).
   */
  async requestAccess(input: unknown) {
    const v = parse(z.object({
      firstName: z.string().trim().min(1, "First name is required").max(80), lastName: z.string().trim().min(1, "Last name is required").max(80),
      email: z.email("Enter a valid email address"), phone: z.string().trim().max(20).default(""),
      role: z.enum(["Sales Executive", "Support Executive", "Operations Manager", "Team Leader", "VP of Operations"]),
    }), input);
    const mapped = v.role === "Sales Executive" ? "Support Executive" : v.role;
    return commit((d) => {
      if (d.users.some((u) => u.email.toLowerCase() === v.email.toLowerCase())) {
        throw new ValidationError("An account or request with this email already exists.", [{ path: "email", message: "Already registered" }]);
      }
      const u: User = { id: nextId(d, "users"), firstName: v.firstName, lastName: v.lastName, name: `${v.firstName} ${v.lastName}`, email: v.email, phone: v.phone, role: mapped as User["role"], active: false, managerId: null, createdAt: nowIso() };
      d.users = [...d.users, u];
      return { id: u.id };
    });
  },
  /** Personal settings: users may always edit their own name and phone (not role, email or status). */
  async updateProfile(input: unknown) {
    const v = parse(z.object({ firstName: z.string().trim().max(80), lastName: z.string().trim().max(80), phone: z.string().trim().max(20).refine((p) => p === "" || /^[+()\-\s\d]{6,20}$/.test(p), "Enter a valid phone number") }), input);
    return commit((d) => {
      const u = me(d);
      const name = [v.firstName, v.lastName].filter(Boolean).join(" ");
      if (!name) throw new ValidationError("Enter at least a first or last name.", [{ path: "firstName", message: "Enter a name" }]);
      d.users = d.users.map((x) => (x.id === u.id ? { ...x, ...v, name } : x));
    });
  },
  async signOut() {
    clearSession();
  },
  /** Super Admin only: act as another user to verify role-based journeys (QA/demo aid). */
  async switchUser(userId: string) {
    const db = getDb();
    if (me(db).role !== "Super Admin") throw new PermissionError("Users", "switch user");
    const u = db.users.find((x) => x.id === userId && x.active);
    if (!u) throw new NotFoundError("User");
    setSessionUserId(u.id);
    return u;
  },
};

/* ═════════════════════ audit helper ═════════════════════ */
function audit(draft: Db, related: RecordRef, action: AuditEvent["action"], changes: AuditEvent["changes"] = []) {
  const ev: AuditEvent = { id: nextId(draft, "audit"), related, action, changes, by: me(draft).id, at: nowIso() };
  draft.audit = [...draft.audit, ev];
}
const fmt = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v));
function diff<T extends object>(before: T, after: T, labels: Record<string, string>) {
  return Object.keys(labels)
    .filter((k) => fmt((before as Record<string, unknown>)[k]) !== fmt((after as Record<string, unknown>)[k]))
    .map((k) => ({ field: labels[k], from: fmt((before as Record<string, unknown>)[k]), to: fmt((after as Record<string, unknown>)[k]) }));
}
const AUDITED: Record<RecordModule, Record<string, string>> = {
  leads: { firstName: "First name", lastName: "Last name", company: "Company", title: "Title", email: "Email", phone: "Phone", mobile: "Mobile", rating: "Rating", priority: "Priority", leadSource: "Lead source", industry: "Industry", website: "Website", description: "Description" },
  contacts: { firstName: "First name", lastName: "Last name", email: "Email", phone: "Phone", mobile: "Mobile", title: "Title", accountId: "Account", department: "Department" },
  accounts: { name: "Name", phone: "Phone", website: "Website", accountType: "Type", industry: "Industry", rating: "Rating", parentAccountId: "Parent account" },
  deals: { name: "Name", amount: "Amount", probability: "Probability", closingDate: "Closing date", accountId: "Account", contactId: "Contact", nextStep: "Next step", type: "Type" },
};

function checkCustom(db: Db, module: RecordModule, custom: Record<string, unknown> | undefined) {
  for (const f of db.settings.customFields.filter((c) => c.module === module && c.required)) {
    const v = custom?.[f.key];
    if (v === undefined || v === null || v === "") throw new ValidationError(`${f.label} is required`, [{ path: `custom.${f.key}`, message: `${f.label} is required` }]);
  }
}

/* ═════════════════════ generic list / get ═════════════════════ */
export async function list<M extends ModuleKey>(module: M, params: ListParams = {}): Promise<ListResult<RowMap[M]>> {
  const db = getDb();
  assertCan(db, permFor(module), "read");
  return runQuery(db, module, allRows(db, module), params);
}

/** All rows (no paging) — used by Kanban, exports and reports. */
export async function listAll<M extends ModuleKey>(module: M, params: Omit<ListParams, "page" | "pageSize"> = {}) {
  const r = await list(module, { ...params, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
  return r.rows;
}

export async function get<M extends ModuleKey>(module: M, id: string): Promise<RowMap[M]> {
  const db = getDb();
  assertCan(db, permFor(module), "read");
  const rec = (db[module] as { id: string }[]).find((r) => r.id === id);
  if (!rec) throw new NotFoundError(module.slice(0, -1).replace(/^./, (c) => c.toUpperCase()));
  return (toRow[module] as (db: Db, r: unknown) => RowMap[M])(db, rec);
}

export async function timeline(ref: RecordRef) {
  const db = getDb();
  assertCan(db, permFor(ref.module), "read");
  return splitStream(activitiesFor(db, ref));
}

export async function intelligence(ref: RecordRef) {
  const db = getDb();
  assertCan(db, permFor(ref.module), "read");
  return intelligenceFor(db, ref);
}

/** Related records shown on detail pages. */
export async function related(ref: RecordRef) {
  const db = getDb();
  assertCan(db, permFor(ref.module), "read");
  const contacts = ref.module === "accounts" ? db.contacts.filter((c) => c.accountId === ref.id)
    : ref.module === "deals" ? db.contacts.filter((c) => c.id === db.deals.find((d) => d.id === ref.id)?.contactId) : [];
  const deals = ref.module === "accounts" ? db.deals.filter((d) => d.accountId === ref.id)
    : ref.module === "contacts" ? db.deals.filter((d) => d.contactId === ref.id)
    : ref.module === "leads" ? db.deals.filter((d) => d.fromLeadId === ref.id) : [];
  const childAccounts = ref.module === "accounts" ? db.accounts.filter((a) => a.parentAccountId === ref.id) : [];
  return {
    contacts: contacts.map((c) => toRow.contacts(db, c)),
    deals: deals.map((d) => toRow.deals(db, d)),
    childAccounts: childAccounts.map((a) => toRow.accounts(db, a)),
    notes: db.notes.filter((n) => n.related.module === ref.module && n.related.id === ref.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    comments: db.comments.filter((n) => n.related.module === ref.module && n.related.id === ref.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    attachments: db.attachments.filter((n) => n.related.module === ref.module && n.related.id === ref.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

/* ═════════════════════ records: create / update / delete ═════════════════════ */
export const leads = {
  async create(input: unknown) {
    const v = parse(LeadInput, input);
    return commit((d) => {
      assertCan(d, "Leads", "create");
      checkCustom(d, "leads", v.custom);
      const u = me(d).id;
      const lead: Lead = { ...v, id: nextId(d, "leads"), statusChangedAt: nowIso(), converted: null, healthOverride: null, createdAt: nowIso(), updatedAt: nowIso(), createdBy: u, updatedBy: u };
      d.leads = [...d.leads, lead];
      audit(d, { module: "leads", id: lead.id }, "created");
      return lead;
    });
  },
  async update(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Leads", "update");
      const cur = d.leads.find((l) => l.id === id);
      if (!cur) throw new NotFoundError("Lead");
      if (cur.converted) throw new ValidationError("This lead has been converted and can no longer be edited. Edit the contact, account or deal instead.");
      const v = parse(LeadInput, { ...cur, ...(patch as object) });
      const next: Lead = { ...cur, ...v, updatedAt: nowIso(), updatedBy: me(d).id };
      checkCustom(d, "leads", next.custom);
      if (v.status !== cur.status) {
        next.statusChangedAt = nowIso();
        audit(d, { module: "leads", id }, "status_changed", [{ field: "Status", from: cur.status, to: v.status }]);
      }
      if (v.ownerId !== cur.ownerId) audit(d, { module: "leads", id }, "owner_changed", [{ field: "Owner", from: d.users.find((u) => u.id === cur.ownerId)?.name ?? "Unassigned", to: d.users.find((u) => u.id === v.ownerId)?.name ?? "Unassigned" }]);
      const changes = diff(cur, next, AUDITED.leads);
      if (changes.length) audit(d, { module: "leads", id }, "updated", changes);
      d.leads = d.leads.map((l) => (l.id === id ? next : l));
      return next;
    });
  },
  async setStatus(id: string, status: Lead["status"]) {
    return leads.update(id, { status });
  },
  async overrideHealth(id: string, input: unknown) {
    const v = parse(HealthOverrideInput, input);
    return commit((d) => {
      assertCan(d, "Leads", "update");
      const cur = d.leads.find((l) => l.id === id);
      if (!cur) throw new NotFoundError("Lead");
      const override = { ...v, by: me(d).id, at: nowIso() };
      d.leads = d.leads.map((l) => (l.id === id ? { ...l, healthOverride: override, updatedAt: nowIso() } : l));
      audit(d, { module: "leads", id }, "health_override", [{ field: "Health", from: cur.healthOverride?.band ?? "Calculated", to: `${v.band} — ${v.reason}` }]);
    });
  },
  async clearHealthOverride(id: string) {
    return commit((d) => {
      assertCan(d, "Leads", "update");
      const cur = d.leads.find((l) => l.id === id);
      if (!cur?.healthOverride) return;
      d.leads = d.leads.map((l) => (l.id === id ? { ...l, healthOverride: null, updatedAt: nowIso() } : l));
      audit(d, { module: "leads", id }, "health_override", [{ field: "Health", from: cur.healthOverride.band, to: "Calculated" }]);
    });
  },
  /**
   * Convert a lead (pre-existing rules from ConvertToDealDrawer, now persisted):
   * - creates (or links) an Account and creates a Contact; optionally creates a Deal
   *   (name + closing date required, default stage Qualification);
   * - the lead is marked converted and becomes read-only;
   * - OPEN tasks/calls/meetings move to the new contact (or deal, if created) so follow-ups
   *   continue; notes, emails and history stay on the lead for the record.
   */
  async convert(id: string, input: unknown) {
    const v = parse(ConvertLeadInput, input);
    return commit((d) => {
      assertCan(d, "Leads", "update");
      assertCan(d, "Contacts", "create");
      const lead = d.leads.find((l) => l.id === id);
      if (!lead) throw new NotFoundError("Lead");
      if (lead.converted) throw new ValidationError("This lead was already converted.");
      const u = me(d).id;
      const ts = nowIso();
      let accountId: string;
      if (v.account.mode === "existing") {
        const existingId = v.account.accountId;
        if (!d.accounts.some((a) => a.id === existingId)) throw new NotFoundError("Account");
        accountId = existingId;
      } else {
        assertCan(d, "Accounts", "create");
        const acc: Account = {
          ...parse(AccountInput, { name: v.account.name, ownerId: v.ownerId, phone: lead.phone, website: lead.website, industry: lead.industry, annualRevenue: lead.annualRevenue, employees: lead.noOfEmployees, rating: lead.rating, billing: lead.address, description: "" }),
          id: nextId(d, "accounts"), createdAt: ts, updatedAt: ts, createdBy: u, updatedBy: u,
        };
        d.accounts = [...d.accounts, acc];
        accountId = acc.id;
        audit(d, { module: "accounts", id: acc.id }, "created", [{ field: "Source", from: "", to: `Converted from lead ${personName(lead)}` }]);
      }
      const contact: Contact = {
        ...parse(ContactInput, { salutation: lead.salutation, firstName: v.contact.firstName, lastName: v.contact.lastName, accountId, ownerId: v.ownerId, email: lead.email, phone: lead.phone, mobile: lead.mobile, title: lead.title, leadSource: lead.leadSource, mailing: lead.address, emailOptOut: lead.emailOptOut, twitter: lead.twitter, description: lead.description, fax: lead.fax }),
        id: nextId(d, "contacts"), createdAt: ts, updatedAt: ts, createdBy: u, updatedBy: u,
      };
      d.contacts = [...d.contacts, contact];
      audit(d, { module: "contacts", id: contact.id }, "created", [{ field: "Source", from: "", to: `Converted from lead ${personName(lead)}` }]);
      let dealId: string | null = null;
      if (v.deal.create) {
        assertCan(d, "Deals", "create");
        const did = nextId(d, "deals");
        const prob = STAGE_PROBABILITY[v.deal.stage];
        const deal: Deal = {
          id: did, refId: `CRM-DEAL-${new Date().getFullYear()}-${did.padStart(5, "0")}`, name: v.deal.name, amount: v.deal.amount, ownerId: v.ownerId,
          accountId, contactId: contact.id, stage: v.deal.stage, type: "New Business", nextStep: "", probability: prob, leadSource: lead.leadSource,
          closingDate: v.deal.closingDate, description: "", stageChangedAt: ts,
          stageHistory: [{ at: ts, by: u, from: null, to: v.deal.stage, probabilityFrom: null, probabilityTo: prob, amount: v.deal.amount }],
          fromLeadId: lead.id, custom: {}, createdAt: ts, updatedAt: ts, createdBy: u, updatedBy: u,
        };
        d.deals = [...d.deals, deal];
        dealId = did;
      }
      const target: RecordRef = dealId ? { module: "deals", id: dealId } : { module: "contacts", id: contact.id };
      const isLeadRef = (r: RecordRef | null) => r?.module === "leads" && r.id === id;
      d.tasks = d.tasks.map((t) => (isLeadRef(t.related) && t.status !== "Completed" ? { ...t, related: target, contactId: t.contactId ?? contact.id, updatedAt: ts } : t));
      d.calls = d.calls.map((c) => (isLeadRef(c.related) && c.status === "Scheduled" ? { ...c, related: target, contactId: c.contactId ?? contact.id, updatedAt: ts } : c));
      d.meetings = d.meetings.map((m) => (isLeadRef(m.related) && m.status === "Scheduled" ? { ...m, related: target, participantContactIds: [...new Set([...m.participantContactIds, contact.id])], updatedAt: ts } : m));
      d.leads = d.leads.map((l) => (l.id === id ? { ...l, converted: { at: ts, by: u, accountId, contactId: contact.id, dealId }, updatedAt: ts, updatedBy: u } : l));
      audit(d, { module: "leads", id }, "converted", [
        { field: "Account", from: "", to: d.accounts.find((a) => a.id === accountId)!.name },
        { field: "Contact", from: "", to: personName(contact) },
        ...(dealId ? [{ field: "Deal", from: "", to: d.deals.find((x) => x.id === dealId)!.name }] : []),
      ]);
      return { accountId, contactId: contact.id, dealId };
    });
  },
};

export const contacts = {
  async create(input: unknown) {
    const v = parse(ContactInput, input);
    return commit((d) => {
      assertCan(d, "Contacts", "create");
      checkCustom(d, "contacts", v.custom);
      const u = me(d).id;
      const c: Contact = { ...v, id: nextId(d, "contacts"), createdAt: nowIso(), updatedAt: nowIso(), createdBy: u, updatedBy: u };
      d.contacts = [...d.contacts, c];
      audit(d, { module: "contacts", id: c.id }, "created");
      return c;
    });
  },
  async update(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Contacts", "update");
      const cur = d.contacts.find((x) => x.id === id);
      if (!cur) throw new NotFoundError("Contact");
      const next: Contact = { ...cur, ...parse(ContactInput, { ...cur, ...(patch as object) }), updatedAt: nowIso(), updatedBy: me(d).id };
      checkCustom(d, "contacts", next.custom);
      if (next.reportingToId === id) throw new ValidationError("A contact cannot report to themselves.");
      ownerAudit(d, "contacts", id, cur.ownerId, next.ownerId);
      const changes = diff(cur, next, AUDITED.contacts);
      if (changes.length) audit(d, { module: "contacts", id }, "updated", changes);
      d.contacts = d.contacts.map((x) => (x.id === id ? next : x));
      return next;
    });
  },
};

export const accounts = {
  async create(input: unknown) {
    const v = parse(AccountInput, input);
    return commit((d) => {
      assertCan(d, "Accounts", "create");
      checkCustom(d, "accounts", v.custom);
      if (d.accounts.some((a) => a.name.trim().toLowerCase() === v.name.trim().toLowerCase())) {
        throw new ValidationError(`An account named "${v.name}" already exists.`, [{ path: "name", message: "An account with this name already exists" }]);
      }
      const u = me(d).id;
      const a: Account = { ...v, id: nextId(d, "accounts"), createdAt: nowIso(), updatedAt: nowIso(), createdBy: u, updatedBy: u };
      d.accounts = [...d.accounts, a];
      audit(d, { module: "accounts", id: a.id }, "created");
      return a;
    });
  },
  async update(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Accounts", "update");
      const cur = d.accounts.find((x) => x.id === id);
      if (!cur) throw new NotFoundError("Account");
      const next: Account = { ...cur, ...parse(AccountInput, { ...cur, ...(patch as object) }), updatedAt: nowIso(), updatedBy: me(d).id };
      checkCustom(d, "accounts", next.custom);
      if (next.parentAccountId === id) throw new ValidationError("An account cannot be its own parent.");
      // prevent cycles in the parent chain
      let p = next.parentAccountId;
      const seen = new Set([id]);
      while (p) {
        if (seen.has(p)) throw new ValidationError("That parent account would create a loop.");
        seen.add(p);
        p = d.accounts.find((a) => a.id === p)?.parentAccountId ?? null;
      }
      if (d.accounts.some((a) => a.id !== id && a.name.trim().toLowerCase() === next.name.trim().toLowerCase())) {
        throw new ValidationError(`An account named "${next.name}" already exists.`, [{ path: "name", message: "An account with this name already exists" }]);
      }
      ownerAudit(d, "accounts", id, cur.ownerId, next.ownerId);
      const changes = diff(cur, next, AUDITED.accounts);
      if (changes.length) audit(d, { module: "accounts", id }, "updated", changes);
      d.accounts = d.accounts.map((x) => (x.id === id ? next : x));
      return next;
    });
  },
};

export const deals = {
  async create(input: unknown) {
    const v = parse(DealInput, input);
    return commit((d) => {
      assertCan(d, "Deals", "create");
      checkCustom(d, "deals", v.custom);
      const u = me(d).id;
      const id = nextId(d, "deals");
      const prob = v.probability ?? STAGE_PROBABILITY[v.stage];
      const deal: Deal = {
        ...v, probability: prob, id, refId: `CRM-DEAL-${new Date().getFullYear()}-${id.padStart(5, "0")}`, stageChangedAt: nowIso(),
        stageHistory: [{ at: nowIso(), by: u, from: null, to: v.stage, probabilityFrom: null, probabilityTo: prob, amount: v.amount }],
        fromLeadId: null, createdAt: nowIso(), updatedAt: nowIso(), createdBy: u, updatedBy: u,
      };
      d.deals = [...d.deals, deal];
      return deal;
    });
  },
  async update(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Deals", "update");
      const cur = d.deals.find((x) => x.id === id);
      if (!cur) throw new NotFoundError("Deal");
      const v = parse(DealInput, { ...cur, ...(patch as object) });
      const manualProb = patch && typeof patch === "object" && "probability" in patch ? v.probability : undefined;
      let next: Deal = { ...cur, ...v, probability: v.probability ?? cur.probability, updatedAt: nowIso(), updatedBy: me(d).id };
      checkCustom(d, "deals", next.custom);
      if (v.stage !== cur.stage) next = withStage(d, cur, next, v.stage, manualProb);
      ownerAudit(d, "deals", id, cur.ownerId, next.ownerId);
      const changes = diff(cur, next, AUDITED.deals);
      if (changes.length) audit(d, { module: "deals", id }, "updated", changes);
      d.deals = d.deals.map((x) => (x.id === id ? next : x));
      return next;
    });
  },
  /** Stage move (stage bar / Kanban). Probability follows the stage default, as in the existing timelines. */
  async setStage(id: string, stage: DealStage) {
    return commit((d) => {
      assertCan(d, "Deals", "update");
      const cur = d.deals.find((x) => x.id === id);
      if (!cur) throw new NotFoundError("Deal");
      if (cur.stage === stage) return cur;
      const next = withStage(d, cur, { ...cur, updatedAt: nowIso(), updatedBy: me(d).id }, stage);
      d.deals = d.deals.map((x) => (x.id === id ? next : x));
      return next;
    });
  },
};
function withStage(d: Db, cur: Deal, next: Deal, stage: DealStage, manualProbability?: number): Deal {
  const prob = manualProbability ?? STAGE_PROBABILITY[stage];
  return {
    ...next, stage, probability: prob, stageChangedAt: nowIso(),
    stageHistory: [...cur.stageHistory, { at: nowIso(), by: me(d).id, from: cur.stage, to: stage, probabilityFrom: cur.probability, probabilityTo: prob, amount: next.amount }],
  };
}
function ownerAudit(d: Db, module: RecordModule, id: string, from: string | null, to: string | null) {
  if (from === to) return;
  audit(d, { module, id }, "owner_changed", [{ field: "Owner", from: d.users.find((u) => u.id === from)?.name ?? "Unassigned", to: d.users.find((u) => u.id === to)?.name ?? "Unassigned" }]);
}

/**
 * Delete a record. Owned content (notes, comments, attachments, logged emails, history) is
 * removed with it; independent activities (tasks, calls, meetings) are kept and unlinked;
 * references from other records are cleared (never cascades into other records).
 */
export async function removeRecord(module: RecordModule, id: string) {
  return commit((d) => {
    assertCan(d, permFor(module), "delete");
    const rec = (d[module] as { id: string }[]).find((r) => r.id === id);
    if (!rec) throw new NotFoundError("Record");
    const isRef = (r: RecordRef | null) => r?.module === module && r.id === id;
    (d as Record<string, unknown>)[module] = (d[module] as { id: string }[]).filter((r) => r.id !== id);
    d.notes = d.notes.filter((n) => !isRef(n.related));
    d.comments = d.comments.filter((n) => !isRef(n.related));
    d.attachments = d.attachments.filter((n) => !isRef(n.related));
    d.emails = d.emails.filter((n) => !isRef(n.related));
    d.audit = d.audit.filter((n) => !isRef(n.related));
    d.agentActions = d.agentActions.filter((n) => !isRef(n.related));
    d.tasks = d.tasks.map((t) => (isRef(t.related) ? { ...t, related: null } : t));
    d.calls = d.calls.map((t) => (isRef(t.related) ? { ...t, related: null } : t));
    d.meetings = d.meetings.map((t) => (isRef(t.related) ? { ...t, related: null } : t));
    if (module === "accounts") {
      d.contacts = d.contacts.map((c) => (c.accountId === id ? { ...c, accountId: null } : c));
      d.deals = d.deals.map((x) => (x.accountId === id ? { ...x, accountId: null } : x));
      d.accounts = d.accounts.map((a) => (a.parentAccountId === id ? { ...a, parentAccountId: null } : a));
    }
    if (module === "contacts") {
      d.deals = d.deals.map((x) => (x.contactId === id ? { ...x, contactId: null } : x));
      d.contacts = d.contacts.map((c) => (c.reportingToId === id ? { ...c, reportingToId: null } : c));
      d.tasks = d.tasks.map((t) => (t.contactId === id ? { ...t, contactId: null } : t));
      d.calls = d.calls.map((t) => (t.contactId === id ? { ...t, contactId: null } : t));
      d.meetings = d.meetings.map((m) => ({ ...m, participantContactIds: m.participantContactIds.filter((c) => c !== id) }));
    }
  });
}

/** What a delete would affect — shown in the confirmation dialog before deleting. */
export async function deleteImpact(module: RecordModule, id: string) {
  const db = getDb();
  const isRef = (r: RecordRef | null) => r?.module === module && r.id === id;
  return {
    notes: db.notes.filter((n) => isRef(n.related)).length + db.comments.filter((n) => isRef(n.related)).length,
    attachments: db.attachments.filter((n) => isRef(n.related)).length,
    activitiesUnlinked: db.tasks.filter((t) => isRef(t.related)).length + db.calls.filter((t) => isRef(t.related)).length + db.meetings.filter((t) => isRef(t.related)).length,
    contactsUnlinked: module === "accounts" ? db.contacts.filter((c) => c.accountId === id).length : 0,
    dealsUnlinked: module === "accounts" ? db.deals.filter((x) => x.accountId === id).length : module === "contacts" ? db.deals.filter((x) => x.contactId === id).length : 0,
  };
}

/** Bulk owner assignment / delete from list selections. */
export async function bulkAssign(module: RecordModule | "tasks", ids: string[], ownerId: string | null) {
  return commit((d) => {
    assertCan(d, permFor(module), "update");
    const set = new Set(ids);
    if (module === "tasks") { d.tasks = d.tasks.map((t) => (set.has(t.id) ? { ...t, assigneeId: ownerId, updatedAt: nowIso() } : t)); return ids.length; }
    (d as Record<string, unknown>)[module] = (d[module] as { id: string; ownerId: string | null }[]).map((r) => {
      if (!set.has(r.id) || r.ownerId === ownerId) return r;
      ownerAudit(d, module, r.id, r.ownerId, ownerId);
      return { ...r, ownerId, updatedAt: nowIso() };
    });
    return ids.length;
  });
}
export async function bulkRemove(module: ModuleKey, ids: string[]) {
  for (const id of ids) {
    if (module === "tasks" || module === "calls" || module === "meetings") await activities.remove(module, id);
    else await removeRecord(module, id);
  }
  return ids.length;
}

/* ═════════════════════ activities ═════════════════════ */
function assertRelated(d: Db, ref: RecordRef | null) {
  if (ref && !(d[ref.module] as { id: string }[]).some((r) => r.id === ref.id)) throw new NotFoundError("Related record");
}
function assertNotConvertedLead(d: Db, ref: RecordRef | null) {
  if (ref?.module === "leads" && d.leads.find((l) => l.id === ref.id)?.converted) {
    throw new ValidationError("This lead has been converted. Log new activity on its contact or deal.");
  }
}

export const activities = {
  async createTask(input: unknown) {
    const v = parse(TaskInput, input);
    return commit((d) => {
      assertCan(d, "Tasks", "create");
      assertRelated(d, v.related); assertNotConvertedLead(d, v.related);
      const u = me(d).id;
      const t: Task = { ...v, assigneeId: v.assigneeId ?? v.ownerId, completedAt: v.status === "Completed" ? nowIso() : null, id: nextId(d, "tasks"), createdAt: nowIso(), updatedAt: nowIso(), createdBy: u, updatedBy: u };
      d.tasks = [...d.tasks, t];
      return t;
    });
  },
  async updateTask(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Tasks", "update");
      const cur = d.tasks.find((t) => t.id === id);
      if (!cur) throw new NotFoundError("Task");
      const v = parse(TaskInput, { ...cur, ...(patch as object) });
      assertRelated(d, v.related ?? null);
      const status = v.status;
      const next: Task = { ...cur, ...v, completedAt: status === "Completed" ? cur.completedAt ?? nowIso() : null, updatedAt: nowIso(), updatedBy: me(d).id };
      d.tasks = d.tasks.map((t) => (t.id === id ? next : t));
      return next;
    });
  },
  async completeTask(id: string, done = true) {
    return activities.updateTask(id, { status: done ? "Completed" : "To-Do" });
  },
  async createCall(input: unknown) {
    const v = parse(CallInput, input);
    return commit((d) => {
      assertCan(d, "Calls", "create");
      assertRelated(d, v.related); assertNotConvertedLead(d, v.related);
      const u = me(d).id;
      const c: Call = { ...v, completedAt: v.status === "Completed" ? v.scheduledAt : null, id: nextId(d, "calls"), createdAt: nowIso(), updatedAt: nowIso(), createdBy: u, updatedBy: u };
      d.calls = [...d.calls, c];
      return c;
    });
  },
  async updateCall(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Calls", "update");
      const cur = d.calls.find((t) => t.id === id);
      if (!cur) throw new NotFoundError("Call");
      const merged = { ...cur, ...(patch as object) };
      const v = parse(CallInput, merged);
      const next: Call = { ...cur, ...v, completedAt: v.status === "Completed" ? cur.completedAt ?? nowIso() : null, updatedAt: nowIso(), updatedBy: me(d).id };
      d.calls = d.calls.map((t) => (t.id === id ? next : t));
      return next;
    });
  },
  async createMeeting(input: unknown) {
    const v = parse(MeetingInput, input);
    return commit((d) => {
      assertCan(d, "Meetings", "create");
      assertRelated(d, v.related); assertNotConvertedLead(d, v.related);
      const u = me(d).id;
      const m: Meeting = { ...v, completedAt: v.status === "Completed" ? v.endAt : null, id: nextId(d, "meetings"), createdAt: nowIso(), updatedAt: nowIso(), createdBy: u, updatedBy: u };
      d.meetings = [...d.meetings, m];
      return m;
    });
  },
  async updateMeeting(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Meetings", "update");
      const cur = d.meetings.find((t) => t.id === id);
      if (!cur) throw new NotFoundError("Meeting");
      const v = parse(MeetingInput, { ...cur, ...(patch as object) });
      const next: Meeting = { ...cur, ...v, completedAt: v.status === "Completed" ? cur.completedAt ?? nowIso() : null, updatedAt: nowIso(), updatedBy: me(d).id };
      d.meetings = d.meetings.map((t) => (t.id === id ? next : t));
      return next;
    });
  },
  async remove(module: "tasks" | "calls" | "meetings", id: string) {
    return commit((d) => {
      assertCan(d, permFor(module), "delete");
      const rec = (d[module] as { id: string; related: RecordRef | null }[]).find((r) => r.id === id);
      if (!rec) throw new NotFoundError("Activity");
      (d as Record<string, unknown>)[module] = (d[module] as { id: string }[]).filter((r) => r.id !== id);
      if (rec.related) audit(d, rec.related, "deleted_activity", [{ field: module.slice(0, -1), from: (rec as { subject?: string; title?: string }).subject ?? (rec as { title?: string }).title ?? "", to: "" }]);
    });
  },
  async addNote(input: unknown) {
    const v = parse(NoteInput, input);
    return commit((d) => {
      assertCan(d, permFor(v.related.module), "update");
      assertRelated(d, v.related);
      const n = { ...v, id: nextId(d, "notes"), authorId: me(d).id, createdAt: nowIso(), updatedAt: nowIso() };
      d.notes = [...d.notes, n];
      return n;
    });
  },
  async updateNote(id: string, body: string) {
    return commit((d) => {
      const cur = d.notes.find((n) => n.id === id);
      if (!cur) throw new NotFoundError("Note");
      if (cur.authorId !== me(d).id && tierOf(me(d).role) !== "admin") throw new PermissionError("Notes", "edit other people's");
      const v = parse(NoteInput, { related: cur.related, body });
      d.notes = d.notes.map((n) => (n.id === id ? { ...n, body: v.body, updatedAt: nowIso() } : n));
    });
  },
  async removeNote(id: string) {
    return commit((d) => {
      const cur = d.notes.find((n) => n.id === id);
      if (!cur) throw new NotFoundError("Note");
      if (cur.authorId !== me(d).id && tierOf(me(d).role) !== "admin") throw new PermissionError("Notes", "delete other people's");
      d.notes = d.notes.filter((n) => n.id !== id);
    });
  },
  async addComment(input: unknown) {
    const v = parse(CommentInput, input);
    return commit((d) => {
      assertCan(d, permFor(v.related.module), "read");
      assertRelated(d, v.related);
      const c = { ...v, id: nextId(d, "comments"), authorId: me(d).id, createdAt: nowIso() };
      d.comments = [...d.comments, c];
      return c;
    });
  },
  async removeComment(id: string) {
    return commit((d) => {
      const cur = d.comments.find((n) => n.id === id);
      if (!cur) throw new NotFoundError("Comment");
      if (cur.authorId !== me(d).id && tierOf(me(d).role) !== "admin") throw new PermissionError("Comments", "delete other people's");
      d.comments = d.comments.filter((n) => n.id !== id);
    });
  },
  /** Attachments up to 512 KB are kept inline so download works locally; real file storage is a backend dependency. */
  async addAttachment(related: RecordRef, file: { name: string; size: number; type: string; dataUrl: string }) {
    if (file.size > ATTACHMENT_LIMIT) throw new ValidationError(`"${file.name}" is ${Math.round(file.size / 1024)} KB. Files up to ${ATTACHMENT_LIMIT / 1024} KB can be stored until file storage is connected.`);
    return commit((d) => {
      assertCan(d, permFor(related.module), "update");
      assertRelated(d, related);
      const a = { id: nextId(d, "attachments"), related, name: file.name, size: file.size, mime: file.type || "application/octet-stream", dataUrl: file.dataUrl, uploadedBy: me(d).id, createdAt: nowIso() };
      d.attachments = [...d.attachments, a];
      return a;
    });
  },
  async removeAttachment(id: string) {
    return commit((d) => {
      const cur = d.attachments.find((n) => n.id === id);
      if (!cur) throw new NotFoundError("Attachment");
      assertCan(d, permFor(cur.related.module), "update");
      d.attachments = d.attachments.filter((n) => n.id !== id);
    });
  },
  /** Log an email that was sent/received outside the CRM (no email integration exists). */
  async logEmail(input: unknown) {
    const v = parse(EmailLogInput, input);
    return commit((d) => {
      assertCan(d, permFor(v.related.module), "update");
      assertRelated(d, v.related); assertNotConvertedLead(d, v.related);
      const e = { ...v, id: nextId(d, "emails"), ownerId: me(d).id, createdAt: nowIso() };
      d.emails = [...d.emails, e];
      return e;
    });
  },
};
export const ATTACHMENT_LIMIT = 512 * 1024;

/* ═════════════════════ search, work queues, metrics ═════════════════════ */
export async function search(q: string) {
  const db = getDb();
  const user = me(db);
  const term = q.trim().toLowerCase();
  if (term.length < 2) return [];
  const out: { module: ModuleKey; id: string; title: string; subtitle: string }[] = [];
  const push = (module: ModuleKey, id: string, title: string, subtitle: string, hay: string[]) => {
    if (hay.some((h) => h && h.toLowerCase().includes(term))) out.push({ module, id, title, subtitle });
  };
  if (can(db, user, "Leads", "read")) db.leads.forEach((l) => push("leads", l.id, personName(l), [l.company, l.status].filter(Boolean).join(" · "), [personName(l), l.company, l.email, l.phone, l.mobile]));
  if (can(db, user, "Contacts", "read")) db.contacts.forEach((c) => push("contacts", c.id, personName(c), [db.accounts.find((a) => a.id === c.accountId)?.name, c.email].filter(Boolean).join(" · "), [personName(c), c.email, c.phone, c.mobile]));
  if (can(db, user, "Accounts", "read")) db.accounts.forEach((a) => push("accounts", a.id, a.name, [a.accountType, a.industry].filter(Boolean).join(" · "), [a.name, a.phone, a.website]));
  if (can(db, user, "Deals", "read")) db.deals.forEach((x) => push("deals", x.id, x.name, [db.accounts.find((a) => a.id === x.accountId)?.name, x.stage].filter(Boolean).join(" · "), [x.name, x.refId]));
  if (can(db, user, "Tasks", "read")) db.tasks.forEach((t) => push("tasks", t.id, t.subject, t.status ?? "", [t.subject]));
  if (can(db, user, "Calls", "read")) db.calls.forEach((c) => push("calls", c.id, c.subject, c.status, [c.subject, c.phone]));
  if (can(db, user, "Meetings", "read")) db.meetings.forEach((m) => push("meetings", m.id, m.title, m.status, [m.title, m.location]));
  return out.slice(0, 40);
}

/** Records needing attention, most severe first. */
export async function attentionQueue(scope: Scope = null) {
  const db = getDb();
  const user = me(db);
  const rows: { ref: RecordRef; title: string; ownerId: string | null; attention: ReturnType<typeof intelligenceFor>["attention"]; nextTitle: string | null }[] = [];
  const consider = (ref: RecordRef, title: string, ownerId: string | null) => {
    if (scope && !(ownerId && scope.includes(ownerId)) && ownerId !== null) return;
    const intel = intelligenceFor(db, ref);
    if (intel.attention.length) rows.push({ ref, title, ownerId, attention: intel.attention, nextTitle: intel.nextAction?.title ?? null });
  };
  if (can(db, user, "Leads", "read")) db.leads.filter(isLeadOpen).forEach((l) => consider({ module: "leads", id: l.id }, personName(l), l.ownerId));
  if (can(db, user, "Deals", "read")) db.deals.filter(isDealOpen).forEach((x) => consider({ module: "deals", id: x.id }, x.name, x.ownerId));
  const weight = (r: (typeof rows)[number]) => r.attention.reduce((s, a) => s + (a.severity === "high" ? 10 : 1), 0);
  return rows.sort((a, b) => weight(b) - weight(a));
}

/** Upcoming/overdue open activities assigned to the scope (dashboard "My work"). */
export async function workQueue(scope: Scope) {
  const db = getDb();
  const inS = (o: string | null) => scope === null || (o !== null && scope.includes(o));
  const t = now();
  const items = [
    ...db.tasks.filter((k) => k.status !== "Completed" && inS(k.assigneeId ?? k.ownerId)).map((k) => ({ kind: "task" as const, id: k.id, title: k.subject, at: k.dueDate ? Date.parse(`${k.dueDate}T23:59:00`) : null, related: k.related, ownerId: k.assigneeId ?? k.ownerId, priority: k.priority })),
    ...db.calls.filter((c) => c.status === "Scheduled" && inS(c.ownerId)).map((c) => ({ kind: "call" as const, id: c.id, title: c.subject, at: Date.parse(c.scheduledAt), related: c.related, ownerId: c.ownerId, priority: null })),
    ...db.meetings.filter((m) => m.status === "Scheduled" && inS(m.ownerId)).map((m) => ({ kind: "meeting" as const, id: m.id, title: m.title, at: Date.parse(m.startAt), related: m.related, ownerId: m.ownerId, priority: null })),
  ].map((i) => ({ ...i, overdue: i.at !== null && i.at < t, relatedLabel: i.related ? recordLabel(db, i.related) : null }));
  return items.sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity));
}
function recordLabel(db: Db, ref: RecordRef) {
  const r = (db[ref.module] as { id: string }[]).find((x) => x.id === ref.id);
  return r ? recordTitle(ref.module, r as never) : null;
}

/** Recent activity across the CRM for the dashboard feed. */
export async function recentActivity(scope: Scope, limit = 12) {
  const db = getDb();
  const inS = (o: string | null) => scope === null || (o !== null && scope.includes(o));
  const t = now();
  const refs: RecordRef[] = [
    ...db.leads.map((l) => ({ module: "leads" as const, id: l.id })), ...db.deals.map((x) => ({ module: "deals" as const, id: x.id })),
    ...db.contacts.map((c) => ({ module: "contacts" as const, id: c.id })), ...db.accounts.map((a) => ({ module: "accounts" as const, id: a.id })),
  ];
  const seen = new Set<string>();
  const out: (ReturnType<typeof activitiesFor>[number] & { recordLabel: string | null; recordRef: RecordRef })[] = [];
  for (const ref of refs) {
    for (const i of activitiesFor(db, ref)) {
      if (i.via || seen.has(i.key) || i.open || i.kind === "history" || i.at > t || !inS(i.ownerId)) continue;
      seen.add(i.key);
      out.push({ ...i, recordLabel: recordLabel(db, ref), recordRef: ref });
    }
  }
  return out.sort((a, b) => b.at - a.at).slice(0, limit);
}

export async function metrics(keys: string[], scope: Scope) {
  const db = getDb();
  return Object.fromEntries(keys.filter((k) => METRIC_BY_KEY[k]).map((k) => [k, METRIC_BY_KEY[k].compute(db, scope)]));
}

/** Manager view: per-owner workload and coverage within the viewer's team. */
export async function teamOverview() {
  const db = getDb();
  const user = me(db);
  const ids = teamUserIds(db, user);
  const users = db.users.filter((u) => ids.includes(u.id));
  return users.map((u) => {
    const ls = db.leads.filter((l) => l.ownerId === u.id && isLeadOpen(l));
    const ds = db.deals.filter((x) => x.ownerId === u.id && isDealOpen(x));
    const intelL = ls.map((l) => intelligenceFor(db, { module: "leads", id: l.id }));
    const intelD = ds.map((x) => intelligenceFor(db, { module: "deals", id: x.id }));
    const all = [...intelL, ...intelD];
    return {
      userId: u.id, name: u.name, role: u.role,
      openLeads: ls.length, openDeals: ds.length, pipeline: ds.reduce((s, x) => s + x.amount, 0),
      withNextAction: all.filter((i) => i.nextAction).length,
      overdue: all.filter((i) => i.nextAction?.overdue).length,
      stalled: all.filter((i) => i.attention.some((a) => a.code === "stalled")).length,
      coverage: all.length ? Math.round((all.filter((i) => i.nextAction && !i.nextAction.overdue).length / all.length) * 100) : null,
      openTasks: db.tasks.filter((t) => t.status !== "Completed" && (t.assigneeId ?? t.ownerId) === u.id).length,
    };
  }).filter((r) => r.openLeads + r.openDeals + r.openTasks > 0 || r.userId === user.id);
}

export { todayIso };
