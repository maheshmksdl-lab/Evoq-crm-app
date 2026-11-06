import type { ModuleKey, RecordRef } from "@/lib/schemas";
import type { ListParams } from "@/lib/services";

/** One key factory = one invalidation vocabulary. */
export const qk = {
  all: ["crm"] as const,
  session: () => ["crm", "session"] as const,
  list: (m: ModuleKey, p?: ListParams) => ["crm", "list", m, p ?? {}] as const,
  listAll: (m: ModuleKey, p?: unknown) => ["crm", "listAll", m, p ?? {}] as const,
  detail: (m: ModuleKey, id: string) => ["crm", "detail", m, id] as const,
  timeline: (r: RecordRef) => ["crm", "timeline", r.module, r.id] as const,
  intel: (r: RecordRef) => ["crm", "intel", r.module, r.id] as const,
  related: (r: RecordRef) => ["crm", "related", r.module, r.id] as const,
  search: (q: string) => ["crm", "search", q] as const,
  metrics: (keys: string[], scope: unknown) => ["crm", "metrics", keys, scope] as const,
  work: (scope: unknown) => ["crm", "work", scope] as const,
  attention: (scope: unknown) => ["crm", "attention", scope] as const,
  recent: (scope: unknown) => ["crm", "recent", scope] as const,
  team: () => ["crm", "team"] as const,
  views: (m: ModuleKey) => ["crm", "views", m] as const,
  reports: () => ["crm", "reports"] as const,
  report: (id: string) => ["crm", "report", id] as const,
  reportRun: (cfg: unknown) => ["crm", "reportRun", cfg] as const,
  dashboards: () => ["crm", "dashboards"] as const,
  settings: () => ["crm", "settings"] as const,
  users: () => ["crm", "users"] as const,
  roles: () => ["crm", "roles"] as const,
  agent: (r?: RecordRef) => ["crm", "agent", r?.module ?? "all", r?.id ?? "all"] as const,
  evi: (r: RecordRef, q: string) => ["crm", "evi", r.module, r.id, q] as const,
};
