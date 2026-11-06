import { z } from "zod";
import { Db, EmailSettings, Layout, ModuleConfig, OrgSettings, PermissionMatrix, type ModuleKey, type RecordModule, type Report, type User } from "@/lib/schemas";
import {
  AccountInput, ContactInput, CustomFieldInput, DashboardInput, DealInput, LeadInput, ReportInput, RoleInput, SavedViewInput, TaskInput, UserInput,
} from "@/lib/schemas/inputs";
import { STAGE_PROBABILITY } from "@/lib/schemas/options";
import { can, PermissionError, type PermModule } from "@/lib/domain/permissions";
import { FIELDS, fieldDef, getPath } from "@/lib/domain/fields";
import { nowIso, now } from "@/lib/domain/clock";
import { DAY_MS } from "@/lib/domain/rules-config";
import { userName } from "@/lib/domain/names";
import { commit, getDb, nextId, replaceAll, resetToSeed } from "./store";
import { me, NotFoundError, ValidationError } from "./api";
import { allRows, displayValue, matchesFilter, refLabel } from "./rows";

function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const r = schema.safeParse(input);
  if (!r.success) {
    const issues = r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    throw new ValidationError(issues[0]?.message ?? "Check the highlighted fields", issues);
  }
  return r.data;
}
function assertCan(db: Db, mod: PermModule, action: Parameters<typeof can>[3]) {
  if (!can(db, me(db), mod, action)) throw new PermissionError(mod, action);
}

/* ═════════════ settings ═════════════ */
export const settings = {
  async get() {
    const db = getDb();
    me(db);
    return db.settings;
  },
  async updateOrg(input: unknown) {
    const v = parse(OrgSettings, input);
    return commit((d) => { assertCan(d, "Organizations", "update"); d.settings.org = v; return v; });
  },
  async updateEmail(input: unknown) {
    const v = parse(EmailSettings, input);
    return commit((d) => { assertCan(d, "Organizations", "update"); d.settings.email = v; return v; });
  },
  async updateModules(input: unknown) {
    const v = parse(z.array(ModuleConfig), input);
    return commit((d) => { assertCan(d, "Modules and Fields", "update"); d.settings.modules = v; return v; });
  },
  async savePermissions(input: unknown) {
    const v = parse(PermissionMatrix, input);
    return commit((d) => { assertCan(d, "Permissions", "update"); d.settings.permissions = v; return v; });
  },
  async addCustomField(input: unknown) {
    const v = parse(CustomFieldInput, input);
    return commit((d) => {
      assertCan(d, "Modules and Fields", "create");
      if (FIELDS[v.module].some((f) => f.key === v.key) || d.settings.customFields.some((f) => f.module === v.module && f.key === v.key)) {
        throw new ValidationError(`A field with key "${v.key}" already exists in this module.`, [{ path: "key", message: "Key already in use" }]);
      }
      if (v.type === "select" && v.options.length < 1) throw new ValidationError("Add at least one option", [{ path: "options", message: "Add at least one option" }]);
      const f = { ...v, id: nextId(d, "customFields"), createdAt: nowIso() };
      d.settings.customFields = [...d.settings.customFields, f];
      return f;
    });
  },
  async updateCustomField(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Modules and Fields", "update");
      const cur = d.settings.customFields.find((f) => f.id === id);
      if (!cur) throw new NotFoundError("Field");
      const v = parse(CustomFieldInput, { ...cur, ...(patch as object), key: cur.key, module: cur.module });
      d.settings.customFields = d.settings.customFields.map((f) => (f.id === id ? { ...f, ...v } : f));
    });
  },
  async removeCustomField(id: string) {
    return commit((d) => {
      assertCan(d, "Modules and Fields", "delete");
      d.settings.customFields = d.settings.customFields.filter((f) => f.id !== id);
    });
  },
  async saveLayout(input: unknown) {
    const v = parse(Layout, { ...(input as object), updatedAt: nowIso() });
    return commit((d) => {
      assertCan(d, "Modules and Fields", "update");
      d.settings.layouts = [...d.settings.layouts.filter((l) => l.module !== v.module), v];
      return v;
    });
  },
  async resetLayout(module: RecordModule) {
    return commit((d) => {
      assertCan(d, "Modules and Fields", "update");
      d.settings.layouts = d.settings.layouts.filter((l) => l.module !== module);
    });
  },
  async setActiveDashboard(id: string) {
    return commit((d) => {
      if (!d.dashboards.some((x) => x.id === id)) throw new NotFoundError("Dashboard");
      d.settings.activeDashboardId = id;
    });
  },
};

/* ═════════════ users & roles ═════════════ */
export const users = {
  async list() {
    const db = getDb();
    me(db);
    return db.users;
  },
  async create(input: unknown) {
    const v = parse(UserInput, input);
    return commit((d) => {
      assertCan(d, "Users", "create");
      if (d.users.some((u) => u.email.toLowerCase() === v.email.toLowerCase())) throw new ValidationError("A user with this email already exists.", [{ path: "email", message: "Email already in use" }]);
      const u: User = { ...v, name: v.name || [v.firstName, v.lastName].filter(Boolean).join(" ") || v.email, id: nextId(d, "users"), createdAt: nowIso() };
      d.users = [...d.users, u];
      return u;
    });
  },
  async update(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Users", "update");
      const cur = d.users.find((u) => u.id === id);
      if (!cur) throw new NotFoundError("User");
      const v = parse(UserInput, { ...cur, ...(patch as object) });
      if (d.users.some((u) => u.id !== id && u.email.toLowerCase() === v.email.toLowerCase())) throw new ValidationError("A user with this email already exists.", [{ path: "email", message: "Email already in use" }]);
      if (id === me(d).id && !v.active) throw new ValidationError("You cannot deactivate your own account.");
      if (cur.role === "Super Admin" && v.role !== "Super Admin" && d.users.filter((u) => u.role === "Super Admin" && u.active).length <= 1) {
        throw new ValidationError("At least one active Super Admin is required.");
      }
      const next = { ...cur, ...v, name: v.name || [v.firstName, v.lastName].filter(Boolean).join(" ") || cur.name };
      d.users = d.users.map((u) => (u.id === id ? next : u));
      return next;
    });
  },
};

export const roles = {
  async list() { const db = getDb(); me(db); return db.roles; },
  async activity() {
    const db = getDb();
    return db.audit.length ? [] : [];
  },
  async create(input: unknown) {
    const v = parse(RoleInput, input);
    return commit((d) => {
      assertCan(d, "Roles", "create");
      if (d.roles.some((r) => r.name.toLowerCase() === v.name.toLowerCase())) throw new ValidationError("A role with this name already exists.", [{ path: "name", message: "Name already in use" }]);
      if (v.reportsTo && !d.roles.some((r) => r.id === v.reportsTo)) throw new NotFoundError("Parent role");
      const r = { ...v, id: `role${nextId(d, "roles")}`, createdAt: nowIso() };
      d.roles = [...d.roles, r];
      return r;
    });
  },
  async update(id: string, patch: unknown) {
    return commit((d) => {
      assertCan(d, "Roles", "update");
      const cur = d.roles.find((r) => r.id === id);
      if (!cur) throw new NotFoundError("Role");
      const v = parse(RoleInput, { ...cur, ...(patch as object) });
      // Built-in role names are referenced by users and the permission matrix — keep them stable.
      if (v.name !== cur.name && d.users.some((u) => u.role === cur.name)) throw new ValidationError("This role is assigned to users, so it cannot be renamed.");
      let p = v.reportsTo;
      while (p) { if (p === id) throw new ValidationError("A role cannot report to itself or one of its sub-roles."); p = d.roles.find((r) => r.id === p)?.reportsTo ?? null; }
      d.roles = d.roles.map((r) => (r.id === id ? { ...r, ...v } : r));
    });
  },
  async remove(id: string) {
    return commit((d) => {
      assertCan(d, "Roles", "delete");
      const cur = d.roles.find((r) => r.id === id);
      if (!cur) throw new NotFoundError("Role");
      if (d.users.some((u) => u.role === cur.name)) throw new ValidationError(`"${cur.name}" is assigned to users. Reassign them first.`);
      if (d.roles.some((r) => r.reportsTo === id)) throw new ValidationError("Move or delete its sub-roles first.");
      d.roles = d.roles.filter((r) => r.id !== id);
    });
  },
};

/* ═════════════ saved views ═════════════ */
export const views = {
  async list(module: ModuleKey) {
    const db = getDb();
    const u = me(db);
    return db.views.filter((v) => v.module === module && (v.ownerId === u.id || v.shared));
  },
  async save(input: unknown, id?: string) {
    const v = parse(SavedViewInput, input);
    return commit((d) => {
      const u = me(d);
      if (id) {
        const cur = d.views.find((x) => x.id === id);
        if (!cur) throw new NotFoundError("View");
        if (cur.ownerId !== u.id) throw new PermissionError("Views", "change other people's");
        const next = { ...cur, ...v };
        d.views = d.views.map((x) => (x.id === id ? next : x));
        return next;
      }
      const view = { ...v, id: nextId(d, "views"), ownerId: u.id, createdAt: nowIso() };
      d.views = [...d.views, view];
      return view;
    });
  },
  async remove(id: string) {
    return commit((d) => {
      const cur = d.views.find((x) => x.id === id);
      if (!cur) throw new NotFoundError("View");
      if (cur.ownerId !== me(d).id) throw new PermissionError("Views", "delete other people's");
      d.views = d.views.filter((x) => x.id !== id);
    });
  },
};

/* ═════════════ reports ═════════════ */
export interface ReportResult {
  columns: { key: string; label: string; type: string }[];
  rows: Record<string, string | number | null>[];
  groups: { label: string; value: number; count: number }[] | null;
  total: number;
  measureLabel: string;
  definition: string;
}

function inRange(ts: number, range: Report["dateRange"]) {
  if (range === "all") return true;
  const d = new Date(now());
  const start =
    range === "this_month" ? new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    : range === "last_30" ? now() - 30 * DAY_MS
    : range === "this_quarter" ? new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1).getTime()
    : new Date(d.getFullYear(), 0, 1).getTime();
  return ts >= start && ts <= now() + 366 * DAY_MS;
}

export function runReportOn(db: Db, r: Pick<Report, "source" | "columns" | "filters" | "groupBy" | "measure" | "dateField" | "dateRange">): ReportResult {
  const permMod = ({ leads: "Leads", contacts: "Contacts", accounts: "Accounts", deals: "Deals", tasks: "Tasks", calls: "Calls", meetings: "Meetings" } as const)[r.source];
  if (!can(db, me(db), permMod, "read")) throw new PermissionError(permMod, "read");
  let rows = allRows(db, r.source) as unknown[];
  for (const f of r.filters) rows = rows.filter((x) => matchesFilter(db, r.source, x, f));
  if (r.dateField && r.dateRange !== "all") {
    rows = rows.filter((x) => { const v = getPath(x, r.dateField!); const ts = typeof v === "number" ? v : Date.parse(String(v)); return !Number.isNaN(ts) && inRange(ts, r.dateRange); });
  }
  const defs = FIELDS[r.source];
  const cols = (r.columns.length ? r.columns : defs.filter((f) => !f.derived && !f.group?.includes("address") && f.type !== "textarea").slice(0, 6).map((f) => f.key));
  const columns = cols.map((k) => ({ key: k, label: fieldDef(r.source, k)?.label ?? k, type: fieldDef(r.source, k)?.type ?? "text" }));
  const measureField = r.measure.field ? fieldDef(r.source, r.measure.field) : null;
  const measureLabel = r.measure.op === "count" ? "Count" : `${r.measure.op === "sum" ? "Sum" : "Average"} of ${measureField?.label ?? r.measure.field}`;
  const val = (x: unknown) => Number(getPath(x, r.measure.field ?? "") ?? 0) || 0;
  const agg = (xs: unknown[]) => r.measure.op === "count" ? xs.length : r.measure.op === "sum" ? xs.reduce<number>((s, x) => s + val(x), 0) : xs.length ? xs.reduce<number>((s, x) => s + val(x), 0) / xs.length : 0;
  let groups: ReportResult["groups"] = null;
  if (r.groupBy) {
    const m = new Map<string, unknown[]>();
    for (const x of rows) { const k = displayValue(db, r.source, x, r.groupBy) || "Not set"; m.set(k, [...(m.get(k) ?? []), x]); }
    const order = fieldDef(r.source, r.groupBy)?.options;
    groups = [...m.entries()].map(([label, xs]) => ({ label, value: Math.round(agg(xs) * 100) / 100, count: xs.length }))
      .sort((a, b) => order ? order.indexOf(a.label) - order.indexOf(b.label) : b.value - a.value);
  }
  const out = rows.slice(0, 500).map((x) => Object.fromEntries(columns.map((c) => {
    const raw = getPath(x, c.key);
    return [c.key, ["money", "number", "percent"].includes(c.type) && raw !== null && raw !== "" && raw !== undefined ? Number(raw) : displayValue(db, r.source, x, c.key) || null];
  })));
  return {
    columns, rows: out, groups, total: rows.length, measureLabel,
    definition: `${measureLabel} of ${r.source}${r.groupBy ? ` grouped by ${fieldDef(r.source, r.groupBy)?.label ?? r.groupBy}` : ""}${r.filters.length ? `, ${r.filters.length} filter${r.filters.length > 1 ? "s" : ""}` : ""}${r.dateField && r.dateRange !== "all" ? `, ${fieldDef(r.source, r.dateField)?.label} in ${r.dateRange.replace(/_/g, " ")}` : ""}.`,
  };
}

export const reports = {
  async list() {
    const db = getDb();
    assertCan(db, "Reports", "read");
    return db.reports.map((r) => ({ ...r, ownerName: userName(db.users, r.ownerId) }));
  },
  async get(id: string) {
    const db = getDb();
    assertCan(db, "Reports", "read");
    const r = db.reports.find((x) => x.id === id);
    if (!r) throw new NotFoundError("Report");
    return r;
  },
  async run(input: unknown) {
    const v = parse(ReportInput, input);
    return runReportOn(getDb(), v);
  },
  async touch(id: string) {
    return commit((d) => { d.reports = d.reports.map((r) => (r.id === id ? { ...r, lastAccessedAt: nowIso() } : r)); });
  },
  async save(input: unknown, id?: string) {
    const v = parse(ReportInput, input);
    return commit((d) => {
      const u = me(d);
      if (id) {
        assertCan(d, "Reports", "update");
        const cur = d.reports.find((r) => r.id === id);
        if (!cur) throw new NotFoundError("Report");
        const next = { ...cur, ...v, updatedAt: nowIso() };
        d.reports = d.reports.map((r) => (r.id === id ? next : r));
        return next;
      }
      assertCan(d, "Reports", "create");
      const rep = { ...v, id: `r${nextId(d, "reports")}`, ownerId: u.id, createdAt: nowIso(), updatedAt: nowIso(), lastAccessedAt: nowIso() };
      d.reports = [...d.reports, rep];
      return rep;
    });
  },
  async togglePin(id: string) {
    return commit((d) => { d.reports = d.reports.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r)); });
  },
  async remove(id: string) {
    return commit((d) => {
      assertCan(d, "Reports", "delete");
      if (d.dashboards.some((x) => x.widgets.some((w) => w.reportId === id))) throw new ValidationError("This report is used on a dashboard. Remove the widget first.");
      d.reports = d.reports.filter((r) => r.id !== id);
    });
  },
};

/* ═════════════ dashboards ═════════════ */
export const dashboards = {
  async list() {
    const db = getDb();
    const u = me(db);
    return db.dashboards.filter((x) => x.ownerId === u.id || x.visibility === "all" || (x.visibility === "roles" && x.roles.includes(u.role)));
  },
  async get(id: string) {
    const db = getDb();
    const x = db.dashboards.find((d) => d.id === id);
    if (!x) throw new NotFoundError("Dashboard");
    return x;
  },
  async save(input: unknown, id?: string) {
    const v = parse(DashboardInput, input);
    return commit((d) => {
      assertCan(d, "Dashboard Customization", id ? "update" : "create");
      if (id) {
        const cur = d.dashboards.find((x) => x.id === id);
        if (!cur) throw new NotFoundError("Dashboard");
        if (cur.locked && v.locked && cur.ownerId !== me(d).id) throw new ValidationError("This dashboard is locked by its owner.");
        const next = { ...cur, ...v, updatedAt: nowIso() };
        d.dashboards = d.dashboards.map((x) => (x.id === id ? next : x));
        return next;
      }
      const x = { ...v, id: `hp${nextId(d, "dashboards")}`, ownerId: me(d).id, createdAt: nowIso(), updatedAt: nowIso() };
      d.dashboards = [...d.dashboards, x];
      return x;
    });
  },
  async remove(id: string) {
    return commit((d) => {
      assertCan(d, "Dashboard Customization", "delete");
      if (d.dashboards.length <= 1) throw new ValidationError("Keep at least one dashboard.");
      d.dashboards = d.dashboards.filter((x) => x.id !== id);
      if (d.settings.activeDashboardId === id) d.settings.activeDashboardId = d.dashboards[0].id;
    });
  },
};

/* ═════════════ import / export / backup ═════════════ */
const IMPORTABLE = { leads: LeadInput, contacts: ContactInput, accounts: AccountInput, deals: DealInput, tasks: TaskInput } as const;
export type ImportModule = keyof typeof IMPORTABLE;

export function importableFields(module: ImportModule) {
  return FIELDS[module].filter((f) => !f.derived && f.key !== "createdAt" && f.key !== "updatedAt" && f.key !== "refId");
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let o = obj;
  parts.slice(0, -1).forEach((p) => { o[p] = (o[p] as Record<string, unknown>) ?? {}; o = o[p] as Record<string, unknown>; });
  o[parts[parts.length - 1]] = value;
}

/** Convert one CSV row (via a column→field mapping) into a validated record payload. */
function coerce(db: Db, module: ImportModule, mapped: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, rawVal] of Object.entries(mapped)) {
    const raw = rawVal.trim();
    const def = fieldDef(module, key);
    if (!def) continue;
    let v: unknown = raw;
    if (def.type === "money" || def.type === "number" || def.type === "percent") v = raw === "" ? null : Number(raw.replace(/[^\d.-]/g, ""));
    if (def.type === "boolean") v = /^(true|yes|1)$/i.test(raw);
    if (def.type === "user") v = raw ? db.users.find((u) => u.email.toLowerCase() === raw.toLowerCase() || u.name.toLowerCase() === raw.toLowerCase())?.id ?? `__unknown:${raw}` : null;
    if (def.type === "ref" && def.ref) {
      const list = db[def.ref] as { id: string; name?: string; firstName?: string; lastName?: string }[];
      v = raw ? list.find((r) => (r.name ?? [r.firstName, r.lastName].filter(Boolean).join(" ")).toLowerCase() === raw.toLowerCase())?.id ?? `__unknown:${raw}` : null;
    }
    if (def.type === "date" && raw) { const t = Date.parse(raw); v = Number.isNaN(t) ? raw : new Date(t).toISOString().slice(0, 10); }
    if (def.type === "select" && raw && def.options) v = def.options.find((o) => o.toLowerCase() === raw.toLowerCase()) ?? raw;
    setPath(out, key, v);
  }
  return out;
}

export const dataAdmin = {
  async preview(module: ImportModule, rows: Record<string, string>[]) {
    const db = getDb();
    assertCan(db, "Import", "import");
    const me_ = me(db).id;
    return rows.map((raw, i) => {
      const payload = coerce(db, module, raw);
      const unknownRef = Object.entries(payload).find(([, v]) => typeof v === "string" && v.startsWith("__unknown:"));
      if (unknownRef) return { row: i + 2, ok: false as const, error: `${fieldDef(module, unknownRef[0])?.label}: "${String(unknownRef[1]).slice(10)}" not found` };
      if (!("ownerId" in payload) && module !== "tasks") payload.ownerId = me_;
      if (module === "tasks" && !("ownerId" in payload)) payload.ownerId = me_;
      if (module === "leads" && !payload.status) payload.status = "New";
      if (module === "deals") { payload.stage ??= "Qualification"; payload.amount ??= 0; }
      const schema = IMPORTABLE[module] as z.ZodType;
      const r = schema.safeParse(payload);
      return r.success ? { row: i + 2, ok: true as const, payload: r.data as Record<string, unknown> } : { row: i + 2, ok: false as const, error: r.error.issues.map((x) => `${x.path.join(".") || "row"}: ${x.message}`).join("; ") };
    });
  },
  /** Imports only valid rows; returns what was skipped and why. All-or-nothing per row. */
  async import(module: ImportModule, rows: Record<string, string>[]) {
    const results = await dataAdmin.preview(module, rows);
    const ok = results.filter((r) => r.ok);
    commit((d) => {
      assertCan(d, "Import", "import");
      const u = me(d).id;
      const ts = nowIso();
      for (const r of ok) {
        const p = r.payload as Record<string, unknown>;
        const id = nextId(d, module);
        const base = { ...p, id, createdAt: ts, updatedAt: ts, createdBy: u, updatedBy: u };
        if (module === "leads") d.leads = [...d.leads, { ...base, statusChangedAt: ts, converted: null, healthOverride: null } as never];
        if (module === "contacts") d.contacts = [...d.contacts, base as never];
        if (module === "accounts") d.accounts = [...d.accounts, base as never];
        if (module === "tasks") d.tasks = [...d.tasks, { ...base, completedAt: null } as never];
        if (module === "deals") {
          const stage = p.stage as keyof typeof STAGE_PROBABILITY;
          const prob = (p.probability as number | undefined) ?? STAGE_PROBABILITY[stage];
          d.deals = [...d.deals, { ...base, probability: prob, refId: `CRM-DEAL-${new Date().getFullYear()}-${id.padStart(5, "0")}`, stageChangedAt: ts, stageHistory: [{ at: ts, by: u, from: null, to: stage, probabilityFrom: null, probabilityTo: prob, amount: p.amount as number }], fromLeadId: null } as never];
        }
      }
    });
    return { created: ok.length, failed: results.filter((r) => !r.ok) as { row: number; error: string }[] };
  },
  async exportRows(module: ModuleKey) {
    const db = getDb();
    assertCan(db, "Export", "export");
    const defs = FIELDS[module].filter((f) => f.type !== "textarea" || f.key === "description");
    const rows = allRows(db, module);
    return [defs.map((f) => f.label), ...rows.map((r) => defs.map((f) => {
      const v = getPath(r, f.key);
      if (f.type === "user") return userName(db.users, v as string);
      if (f.type === "ref" && f.ref) return v ? refLabel(db, { module: f.ref, id: String(v) }) ?? "" : "";
      if (f.type === "datetime" && typeof v === "number") return new Date(v).toISOString();
      return v === null || v === undefined ? "" : String(v);
    }))];
  },
  async backup() {
    const db = getDb();
    assertCan(db, "Data Backup", "export");
    return JSON.stringify({ app: "evoq-crm", exportedAt: nowIso(), data: db }, null, 2);
  },
  async restore(json: string) {
    const db = getDb();
    assertCan(db, "Data Backup", "import");
    let parsed: unknown;
    try { parsed = JSON.parse(json); } catch { throw new ValidationError("That file is not valid JSON."); }
    const data = (parsed as { data?: unknown })?.data ?? parsed;
    const r = Db.safeParse(data);
    if (!r.success) throw new ValidationError(`That backup doesn't match the EVOQ CRM format (${r.error.issues[0]?.path.join(".")}: ${r.error.issues[0]?.message}).`);
    replaceAll(r.data);
  },
  async resetSample() {
    const db = getDb();
    assertCan(db, "Data Backup", "import");
    resetToSeed();
  },
};
