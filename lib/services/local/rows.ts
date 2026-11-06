import type { Account, Call, Contact, Db, Deal, FilterRule, Lead, Meeting, ModuleKey, RecordRef, SortRule, Task } from "@/lib/schemas";
import { intelligenceFor, isDealOpen, type Attention, type LeadHealth, type NextAction } from "@/lib/domain/intelligence";
import { personName, userName } from "@/lib/domain/names";
import { fieldDef, getPath } from "@/lib/domain/fields";
import { endOfDay, now, todayIso } from "@/lib/domain/clock";
import { DAY_MS } from "@/lib/domain/rules-config";

/* ───────── row types returned by list()/get() — the API "DTOs" ───────── */
export interface Derived {
  ownerName: string;
  lastInteractionAt: number | null;
  lastInteractionLabel: string | null;
  nextAction: NextAction | null;
  nextActionDue: number | null;
  attention: Attention[];
  attentionCount: number;
}
export type LeadRow = Lead & Derived & { name: string; health: LeadHealth | null; healthScore: number | null; healthBand: string | null };
export type ContactRow = Contact & Derived & { name: string; accountName: string | null; openDeals: number };
export type AccountRow = Account & Derived & { primaryContactName: string | null; primaryContactId: string | null; contactsCount: number; openDeals: number; openDealValue: number };
export type DealRow = Deal & Derived & { accountName: string | null; contactName: string | null; expectedRevenue: number; stageAgeDays: number };
export type TaskRow = Task & { ownerName: string; assigneeName: string; relatedLabel: string | null; contactName: string | null; overdue: boolean };
export type CallRow = Call & { ownerName: string; relatedLabel: string | null; contactName: string | null; overdue: boolean };
export type MeetingRow = Meeting & { ownerName: string; relatedLabel: string | null; participantNames: string; overdue: boolean };
export type AnyRow = LeadRow | ContactRow | AccountRow | DealRow | TaskRow | CallRow | MeetingRow;
export interface RowMap { leads: LeadRow; contacts: ContactRow; accounts: AccountRow; deals: DealRow; tasks: TaskRow; calls: CallRow; meetings: MeetingRow }

export function refLabel(db: Db, ref: RecordRef | null): string | null {
  if (!ref) return null;
  switch (ref.module) {
    case "leads": { const r = db.leads.find((x) => x.id === ref.id); return r ? personName(r) : "Deleted lead"; }
    case "contacts": { const r = db.contacts.find((x) => x.id === ref.id); return r ? personName(r) : "Deleted contact"; }
    case "accounts": return db.accounts.find((x) => x.id === ref.id)?.name ?? "Deleted account";
    case "deals": return db.deals.find((x) => x.id === ref.id)?.name ?? "Deleted deal";
  }
}

function derived(db: Db, ref: RecordRef, ownerId: string | null) {
  const intel = intelligenceFor(db, ref);
  return {
    intel,
    d: {
      ownerName: userName(db.users, ownerId),
      lastInteractionAt: intel.lastInteraction?.at ?? null,
      lastInteractionLabel: intel.lastInteraction ? `${intel.lastInteraction.kind === "email" ? "Email" : intel.lastInteraction.kind[0].toUpperCase() + intel.lastInteraction.kind.slice(1)}: ${intel.lastInteraction.title}` : null,
      nextAction: intel.nextAction,
      nextActionDue: intel.nextAction?.dueAt ?? null,
      attention: intel.attention,
      attentionCount: intel.attention.length,
    } satisfies Derived,
  };
}

export const toRow = {
  leads(db: Db, l: Lead): LeadRow {
    const { intel, d } = derived(db, { module: "leads", id: l.id }, l.ownerId);
    return { ...l, ...d, name: personName(l), health: intel.health, healthScore: intel.health?.score ?? null, healthBand: intel.health?.band ?? null };
  },
  contacts(db: Db, c: Contact): ContactRow {
    const { d } = derived(db, { module: "contacts", id: c.id }, c.ownerId);
    return { ...c, ...d, name: personName(c), accountName: c.accountId ? db.accounts.find((a) => a.id === c.accountId)?.name ?? null : null, openDeals: db.deals.filter((x) => x.contactId === c.id && isDealOpen(x)).length };
  },
  accounts(db: Db, a: Account): AccountRow {
    const { d } = derived(db, { module: "accounts", id: a.id }, a.ownerId);
    const contacts = db.contacts.filter((c) => c.accountId === a.id).sort((x, y) => x.createdAt.localeCompare(y.createdAt));
    const open = db.deals.filter((x) => x.accountId === a.id && isDealOpen(x));
    return { ...a, ...d, primaryContactName: contacts[0] ? personName(contacts[0]) : null, primaryContactId: contacts[0]?.id ?? null, contactsCount: contacts.length, openDeals: open.length, openDealValue: open.reduce((s, x) => s + x.amount, 0) };
  },
  deals(db: Db, x: Deal): DealRow {
    const { d } = derived(db, { module: "deals", id: x.id }, x.ownerId);
    const contact = x.contactId ? db.contacts.find((c) => c.id === x.contactId) : null;
    return {
      ...x, ...d, accountName: x.accountId ? db.accounts.find((a) => a.id === x.accountId)?.name ?? null : null,
      contactName: contact ? personName(contact) : null, expectedRevenue: (x.amount * x.probability) / 100,
      stageAgeDays: Math.max(0, Math.floor((now() - Date.parse(x.stageChangedAt)) / DAY_MS)),
    };
  },
  tasks(db: Db, t: Task): TaskRow {
    const contact = t.contactId ? db.contacts.find((c) => c.id === t.contactId) : null;
    return { ...t, ownerName: userName(db.users, t.ownerId), assigneeName: userName(db.users, t.assigneeId ?? t.ownerId), relatedLabel: refLabel(db, t.related), contactName: contact ? personName(contact) : null, overdue: t.status !== "Completed" && !!t.dueDate && endOfDay(t.dueDate) < now() };
  },
  calls(db: Db, c: Call): CallRow {
    const contact = c.contactId ? db.contacts.find((x) => x.id === c.contactId) : null;
    return { ...c, ownerName: userName(db.users, c.ownerId), relatedLabel: refLabel(db, c.related), contactName: contact ? personName(contact) : null, overdue: c.status === "Scheduled" && Date.parse(c.scheduledAt) < now() };
  },
  meetings(db: Db, m: Meeting): MeetingRow {
    const names = [
      ...m.participantContactIds.map((id) => { const c = db.contacts.find((x) => x.id === id); return c ? personName(c) : null; }),
      ...m.participantUserIds.map((id) => userName(db.users, id)),
    ].filter(Boolean);
    return { ...m, ownerName: userName(db.users, m.ownerId), relatedLabel: refLabel(db, m.related), participantNames: names.join(", "), overdue: m.status === "Scheduled" && Date.parse(m.endAt) < now() };
  },
};

export function allRows<M extends ModuleKey>(db: Db, module: M): RowMap[M][] {
  const fn = toRow[module] as (db: Db, r: unknown) => RowMap[M];
  return (db[module] as unknown[]).map((r) => fn(db, r));
}

/* ───────── query engine (search / filters / sort / paging) ───────── */
export interface ListParams {
  search?: string;
  filters?: FilterRule[];
  sort?: SortRule[];
  page?: number;
  pageSize?: number;
  /** quick filters used by tabs/KPI cards: e.g. { status: "New" }, { owner: "me" } */
  quick?: Record<string, string>;
  /** owner ids to include (team/my scope) */
  ownerIds?: string[] | null;
}
export interface ListResult<R> { rows: R[]; total: number; page: number; pageSize: number }

const SEARCH_FIELDS: Record<ModuleKey, string[]> = {
  leads: ["name", "company", "email", "phone", "mobile", "title"],
  contacts: ["name", "email", "phone", "mobile", "accountName", "title"],
  accounts: ["name", "phone", "website", "industry", "primaryContactName"],
  deals: ["name", "accountName", "contactName", "refId", "nextStep"],
  tasks: ["subject", "relatedLabel", "contactName", "description"],
  calls: ["subject", "relatedLabel", "contactName", "phone"],
  meetings: ["title", "relatedLabel", "location", "participantNames"],
};

export function displayValue(db: Db, module: ModuleKey, row: unknown, key: string): string {
  const v = getPath(row, key);
  const def = fieldDef(module, key);
  if (v === null || v === undefined || v === "") return "";
  if (def?.type === "user") return userName(db.users, String(v));
  if (def?.type === "ref" && def.ref) return refLabel(db, { module: def.ref, id: String(v) }) ?? "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

function comparable(db: Db, module: ModuleKey, row: unknown, key: string): string | number | null {
  const def = fieldDef(module, key);
  const v = getPath(row, key);
  if (v === null || v === undefined || v === "") return null;
  if (def && ["number", "money", "percent"].includes(def.type)) return Number(v);
  if (def && ["date", "datetime"].includes(def.type)) return typeof v === "number" ? v : Date.parse(String(v));
  return displayValue(db, module, row, key).toLowerCase();
}

export function matchesFilter(db: Db, module: ModuleKey, row: unknown, f: FilterRule): boolean {
  const raw = comparable(db, module, row, f.field);
  const text = displayValue(db, module, row, f.field).toLowerCase();
  const val = f.value.trim().toLowerCase();
  const def = fieldDef(module, f.field);
  const numeric = def && ["number", "money", "percent"].includes(def.type);
  const dated = def && ["date", "datetime"].includes(def.type);
  switch (f.op) {
    case "is_empty": return raw === null;
    case "is_not_empty": return raw !== null;
    case "is": return def?.type === "user" ? String(getPath(row, f.field) ?? "") === f.value || text === val : text === val;
    case "is_not": return def?.type === "user" ? String(getPath(row, f.field) ?? "") !== f.value && text !== val : text !== val;
    case "contains": return text.includes(val);
    case "not_contains": return !text.includes(val);
    case "gt": return numeric && raw !== null ? Number(raw) > Number(f.value) : false;
    case "lt": return numeric && raw !== null ? Number(raw) < Number(f.value) : false;
    case "before": return dated && raw !== null ? Number(raw) < Date.parse(f.value) : false;
    case "after": return dated && raw !== null ? Number(raw) > endOfDay(f.value.slice(0, 10)) : false;
  }
}

export function runQuery<R>(db: Db, module: ModuleKey, rows: R[], p: ListParams): ListResult<R> {
  let out = rows;
  if (p.ownerIds) {
    const ids = new Set(p.ownerIds);
    out = out.filter((r) => {
      const rec = r as { ownerId?: string | null; assigneeId?: string | null };
      return ids.has(rec.assigneeId ?? rec.ownerId ?? "");
    });
  }
  if (p.quick) {
    for (const [k, v] of Object.entries(p.quick)) {
      if (!v || v === "All") continue;
      out = out.filter((r) => quickMatch(r as Record<string, unknown>, k, v));
    }
  }
  const q = p.search?.trim().toLowerCase();
  if (q) out = out.filter((r) => SEARCH_FIELDS[module].some((k) => String(getPath(r, k) ?? "").toLowerCase().includes(q)));
  for (const f of p.filters ?? []) out = out.filter((r) => matchesFilter(db, module, r, f));
  const sort = p.sort?.length ? p.sort : [{ field: "updatedAt", dir: "desc" as const }];
  out = [...out].sort((a, b) => {
    for (const s of sort) {
      const av = comparable(db, module, a, s.field);
      const bv = comparable(db, module, b, s.field);
      if (av === bv) continue;
      if (av === null) return 1; // empties last regardless of direction
      if (bv === null) return -1;
      const c = av < bv ? -1 : 1;
      return s.dir === "asc" ? c : -c;
    }
    return 0;
  });
  const pageSize = p.pageSize ?? 20;
  const total = out.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, p.page ?? 1), pages);
  return { rows: out.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
}

function quickMatch(r: Record<string, unknown>, k: string, v: string): boolean {
  const t = now();
  switch (k) {
    case "attention": return v === "any" ? (r.attentionCount as number) > 0 : (r.attention as Attention[] | undefined)?.some((a) => a.code === v) ?? false;
    case "due": {
      // Activity rows carry their own due time; record rows (leads/deals) use their next action.
      const own = r.dueDate ? endOfDay(r.dueDate as string) : r.scheduledAt ? Date.parse(r.scheduledAt as string) : r.startAt ? Date.parse(r.startAt as string) : undefined;
      const due = own ?? (r.nextActionDue as number | null | undefined) ?? null;
      const isActivity = "subject" in r || "title" in r && "startAt" in r;
      const open = isActivity ? r.status !== "Completed" && r.status !== "Cancelled" : true;
      const overdue = isActivity ? Boolean(r.overdue) : Boolean((r.nextAction as NextAction | null)?.overdue);
      const endToday = endOfDay(todayIso());
      if (v === "today") return open && due !== null && due <= endToday && due >= endToday - DAY_MS + 1;
      if (v === "overdue") return open && overdue;
      if (v === "upcoming") return open && due !== null && due >= t;
      if (v === "open") return open;
      if (v === "none") return !isActivity && due === null && !r.nextAction;
      return true;
    }
    case "converted": return v === "yes" ? Boolean(r.converted) : !r.converted;
    default: return String(r[k] ?? "") === v;
  }
}
