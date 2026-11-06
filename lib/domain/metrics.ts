import type { Db } from "@/lib/schemas";
import { DEAL_STAGES, LEAD_PIPELINE } from "@/lib/schemas/options";
import { isDealOpen, isLeadOpen } from "./intelligence";
import { endOfDay, now, todayIso } from "./clock";
import { DAY_MS } from "./rules-config";
import { money, num, pct } from "./format";
import { userName } from "./names";

/**
 * Dashboard / report metrics. Every metric carries the exact definition shown to users
 * (handoff: "every score, alert and metric has a documented definition and source").
 * `scope` = owner user ids to include, or null for everyone the viewer may see.
 */
export type Scope = string[] | null;
export interface SeriesPoint { label: string; value: number; secondary?: number }
export interface MetricResult {
  value: number | null;
  display: string;
  series?: SeriesPoint[];
  seriesLabels?: [string, string?];
  href?: string;
  empty?: string;
}
export interface MetricDef {
  key: string;
  label: string;
  definition: string;
  kind: "kpi" | "series";
  format: "count" | "money" | "percent" | "days";
  compute: (db: Db, scope: Scope) => MetricResult;
}

const inScope = (scope: Scope, owner: string | null) => scope === null || (owner !== null && scope.includes(owner));
const monthKey = (ts: number) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const monthLabel = (key: string) => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
function monthWindow(before: number, after: number) {
  const d = new Date(now());
  const keys: string[] = [];
  for (let i = -before; i <= after; i++) keys.push(monthKey(new Date(d.getFullYear(), d.getMonth() + i, 1).getTime()));
  return keys;
}

export const METRICS: MetricDef[] = [
  {
    key: "open_leads", label: "Open leads", kind: "kpi", format: "count",
    definition: "Leads not converted and not Lost or Unqualified.",
    compute: (db, s) => { const v = db.leads.filter((l) => isLeadOpen(l) && inScope(s, l.ownerId)).length; return { value: v, display: num(v), href: "/leads" }; },
  },
  {
    key: "open_deals", label: "Open deals", kind: "kpi", format: "count",
    definition: "Deals in any stage except Closed Won.",
    compute: (db, s) => { const v = db.deals.filter((d) => isDealOpen(d) && inScope(s, d.ownerId)).length; return { value: v, display: num(v), href: "/deals" }; },
  },
  {
    key: "pipeline_value", label: "Pipeline value", kind: "kpi", format: "money",
    definition: "Sum of Amount across open deals (not probability-weighted).",
    compute: (db, s) => { const v = db.deals.filter((d) => isDealOpen(d) && inScope(s, d.ownerId)).reduce((a, d) => a + d.amount, 0); return { value: v, display: money(v, { compact: true }), href: "/deals" }; },
  },
  {
    key: "weighted_pipeline", label: "Expected revenue", kind: "kpi", format: "money",
    definition: "Sum of Amount × Probability across open deals.",
    compute: (db, s) => { const v = db.deals.filter((d) => isDealOpen(d) && inScope(s, d.ownerId)).reduce((a, d) => a + (d.amount * d.probability) / 100, 0); return { value: v, display: money(v, { compact: true }), href: "/deals" }; },
  },
  {
    key: "won_revenue", label: "Won revenue", kind: "kpi", format: "money",
    definition: "Sum of Amount for deals in Closed Won.",
    compute: (db, s) => { const v = db.deals.filter((d) => d.stage === "Closed Won" && inScope(s, d.ownerId)).reduce((a, d) => a + d.amount, 0); return { value: v, display: money(v, { compact: true }), href: "/deals?stage=Closed%20Won" }; },
  },
  {
    key: "tasks_due", label: "Tasks due today", kind: "kpi", format: "count",
    definition: "Open tasks (not Completed) whose due date is today, by assignee.",
    compute: (db, s) => { const today = todayIso(); const v = db.tasks.filter((t) => t.status !== "Completed" && t.dueDate === today && inScope(s, t.assigneeId ?? t.ownerId)).length; return { value: v, display: num(v), href: "/tasks?due=today" }; },
  },
  {
    key: "overdue_activities", label: "Overdue activities", kind: "kpi", format: "count",
    definition: "Open tasks past their due date plus calls/meetings still Scheduled after their time.",
    compute: (db, s) => {
      const t = now();
      const v = db.tasks.filter((k) => k.status !== "Completed" && k.dueDate && endOfDay(k.dueDate) < t && inScope(s, k.assigneeId ?? k.ownerId)).length
        + db.calls.filter((c) => c.status === "Scheduled" && Date.parse(c.scheduledAt) < t && inScope(s, c.ownerId)).length
        + db.meetings.filter((m) => m.status === "Scheduled" && Date.parse(m.endAt) < t && inScope(s, m.ownerId)).length;
      return { value: v, display: num(v), href: "/tasks?due=overdue" };
    },
  },
  {
    key: "conversion_rate", label: "Lead conversion", kind: "kpi", format: "percent",
    definition: "Converted leads ÷ all leads, for leads owned within scope.",
    compute: (db, s) => {
      const all = db.leads.filter((l) => inScope(s, l.ownerId));
      if (!all.length) return { value: null, display: "—", empty: "No leads yet" };
      const v = (all.filter((l) => l.converted).length / all.length) * 100;
      return { value: v, display: pct(v), href: "/leads" };
    },
  },
  {
    key: "avg_time_to_close", label: "Avg. time to close", kind: "kpi", format: "days",
    definition: "Average days from deal creation to reaching Closed Won.",
    compute: (db, s) => {
      const won = db.deals.filter((d) => d.stage === "Closed Won" && inScope(s, d.ownerId));
      if (!won.length) return { value: null, display: "—", empty: "No won deals yet" };
      const v = won.reduce((a, d) => a + (Date.parse(d.stageChangedAt) - Date.parse(d.createdAt)) / DAY_MS, 0) / won.length;
      return { value: v, display: `${Math.round(v)} days` };
    },
  },
  {
    key: "deals_by_stage", label: "Pipeline by stage", kind: "series", format: "money",
    definition: "Open deal count and total Amount per stage, in pipeline order.",
    compute: (db, s) => {
      const series = DEAL_STAGES.filter((st) => st !== "Closed Won").map((st) => {
        const ds = db.deals.filter((d) => d.stage === st && inScope(s, d.ownerId));
        return { label: st, value: ds.reduce((a, d) => a + d.amount, 0), secondary: ds.length };
      });
      const total = series.reduce((a, p) => a + (p.secondary ?? 0), 0);
      return { value: total, display: num(total), series, seriesLabels: ["Amount", "Deals"], empty: total ? undefined : "No open deals" };
    },
  },
  {
    key: "lead_funnel", label: "Lead funnel", kind: "series", format: "count",
    definition: "Leads currently at each lead status, plus leads converted to deals.",
    compute: (db, s) => {
      const ls = db.leads.filter((l) => inScope(s, l.ownerId));
      const series: SeriesPoint[] = LEAD_PIPELINE.map((st) => ({ label: st, value: ls.filter((l) => l.status === st && !l.converted).length }));
      series.push({ label: "Converted", value: ls.filter((l) => l.converted).length });
      return { value: ls.length, display: num(ls.length), series, seriesLabels: ["Leads"], empty: ls.length ? undefined : "No leads yet" };
    },
  },
  {
    key: "forecast_vs_actual", label: "Forecast vs actual", kind: "series", format: "money",
    definition: "Forecast = Amount × Probability of open deals by expected closing month. Actual = Amount of deals that reached Closed Won in that month.",
    compute: (db, s) => {
      const keys = monthWindow(4, 1);
      const series = keys.map((k) => ({
        label: monthLabel(k),
        value: db.deals.filter((d) => isDealOpen(d) && inScope(s, d.ownerId) && d.closingDate.startsWith(k)).reduce((a, d) => a + (d.amount * d.probability) / 100, 0),
        secondary: db.deals.filter((d) => d.stage === "Closed Won" && inScope(s, d.ownerId) && monthKey(Date.parse(d.stageChangedAt)) === k).reduce((a, d) => a + d.amount, 0),
      }));
      const any = series.some((p) => p.value || p.secondary);
      return { value: null, display: "", series, seriesLabels: ["Forecast", "Actual"], empty: any ? undefined : "No deals close in this window" };
    },
  },
  {
    key: "sales_trend", label: "Sales trend", kind: "series", format: "money",
    definition: "Amount of deals reaching Closed Won, by month, over the last 6 months.",
    compute: (db, s) => {
      const keys = monthWindow(5, 0);
      const series = keys.map((k) => ({ label: monthLabel(k), value: db.deals.filter((d) => d.stage === "Closed Won" && inScope(s, d.ownerId) && monthKey(Date.parse(d.stageChangedAt)) === k).reduce((a, d) => a + d.amount, 0) }));
      return { value: null, display: "", series, seriesLabels: ["Won"], empty: series.some((p) => p.value) ? undefined : "No deals won in the last 6 months" };
    },
  },
  {
    key: "activities_by_owner", label: "Activities by owner", kind: "series", format: "count",
    definition: "Completed calls, completed meetings, completed tasks and logged emails per owner (all time).",
    compute: (db, s) => {
      const counts = new Map<string, number>();
      const bump = (o: string | null) => { if (o && inScope(s, o)) counts.set(o, (counts.get(o) ?? 0) + 1); };
      db.calls.filter((c) => c.status === "Completed").forEach((c) => bump(c.ownerId));
      db.meetings.filter((m) => m.status === "Completed").forEach((m) => bump(m.ownerId));
      db.tasks.filter((t) => t.status === "Completed").forEach((t) => bump(t.assigneeId ?? t.ownerId));
      db.emails.forEach((e) => bump(e.ownerId));
      const series = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id, v]) => ({ label: userName(db.users, id), value: v }));
      return { value: series.reduce((a, p) => a + p.value, 0), display: "", series, seriesLabels: ["Activities"], empty: series.length ? undefined : "No completed activities yet" };
    },
  },
  {
    key: "leads_by_source", label: "Leads by source", kind: "series", format: "count",
    definition: "All leads grouped by Lead Source.",
    compute: (db, s) => {
      const m = new Map<string, number>();
      db.leads.filter((l) => inScope(s, l.ownerId)).forEach((l) => m.set(l.leadSource || "Not set", (m.get(l.leadSource || "Not set") ?? 0) + 1));
      const series = [...m.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));
      return { value: null, display: "", series, seriesLabels: ["Leads"], empty: series.length ? undefined : "No leads yet" };
    },
  },
];

export const METRIC_BY_KEY = Object.fromEntries(METRICS.map((m) => [m.key, m])) as Record<string, MetricDef>;
