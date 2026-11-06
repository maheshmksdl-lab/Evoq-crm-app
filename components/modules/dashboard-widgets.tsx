"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckSquareIcon, CalendarCheckIcon, PhoneIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { SeriesChart } from "@/components/charts/series-chart";
import { StatusBadge } from "@/components/shared/badges";
import { EmptyState, CardSkeleton } from "@/components/shared/states";
import { SectionCard, Stat } from "@/components/shared/primitives";
import { useAttention, useMetrics, useRecent, useReport, useTeam, useWork } from "@/lib/query/hooks";
import { reports } from "@/lib/services";
import { METRIC_BY_KEY } from "@/lib/domain/metrics";
import { recordHref } from "@/lib/domain/names";
import { relative } from "@/lib/domain/format";
import type { Widget } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { useForms } from "@/components/forms/create-context";

export type DashScope = string[] | null;

const ICON = { task: CheckSquareIcon, call: PhoneIcon, meeting: CalendarCheckIcon };

function MyWork({ scope }: { scope: DashScope }) {
  const q = useWork(scope);
  const { create } = useForms();
  if (q.isPending) return <CardSkeleton />;
  const items = (q.data ?? []).slice(0, 8);
  if (!items.length) return <EmptyState className="py-6" title="Nothing scheduled" description="Plan a task, call or meeting to see it here." action={<Button size="sm" variant="outline" onClick={() => create("tasks")}>Create task</Button>} />;
  return (
    <ul className="divide-y divide-line-soft">
      {items.map((i) => {
        const I = ICON[i.kind];
        return (
          <li key={`${i.kind}-${i.id}`}>
            <Link href={`/${i.kind}s/${i.id}`} className="flex items-center gap-3 py-2.5 hover:bg-hover/60">
              <I className="size-4 shrink-0 text-ink-muted" />
              <span className="min-w-0 flex-1"><span className="block truncate text-body font-medium text-ink">{i.title}</span>{i.relatedLabel && <span className="block truncate text-caption text-ink-muted">{i.relatedLabel}</span>}</span>
              {i.overdue ? <StatusBadge tone="error" icon={WarningIcon}>Overdue {i.at ? relative(i.at).replace(" ago", "") : ""}</StatusBadge> : <span className="shrink-0 text-caption text-ink-muted">{i.at ? relative(i.at) : "No date"}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Attention({ scope }: { scope: DashScope }) {
  const q = useAttention(scope);
  if (q.isPending) return <CardSkeleton />;
  const items = (q.data ?? []).slice(0, 7);
  if (!items.length) return <EmptyState className="py-6" title="All clear" description="No lead or deal currently matches an attention rule." />;
  return (
    <ul className="divide-y divide-line-soft">
      {items.map((r) => (
        <li key={`${r.ref.module}-${r.ref.id}`}>
          <Link href={recordHref(r.ref.module, r.ref.id)} className="block py-2.5 hover:bg-hover/60">
            <span className="flex items-center justify-between gap-2"><span className="truncate text-body font-medium text-ink">{r.title}</span><span className="shrink-0 text-caption capitalize text-ink-muted">{r.ref.module.slice(0, -1)}</span></span>
            <span className="mt-1 flex flex-wrap gap-1">{r.attention.slice(0, 3).map((a) => <StatusBadge key={a.code} tone={a.severity === "high" ? "error" : "warning"}>{a.label}</StatusBadge>)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Recent({ scope }: { scope: DashScope }) {
  const q = useRecent(scope);
  if (q.isPending) return <CardSkeleton />;
  const items = q.data ?? [];
  if (!items.length) return <EmptyState className="py-6" title="No activity yet" description="Calls, meetings, emails and completed tasks appear here." />;
  return (
    <ul className="divide-y divide-line-soft">
      {items.slice(0, 8).map((i) => (
        <li key={i.key}><Link href={recordHref(i.recordRef.module, i.recordRef.id)} className="flex items-center justify-between gap-3 py-2.5 hover:bg-hover/60">
          <span className="min-w-0"><span className="block truncate text-body text-ink"><span className="capitalize">{i.kind}</span>: {i.title}</span><span className="block truncate text-caption text-ink-muted">{i.recordLabel}</span></span>
          <span className="shrink-0 text-caption text-ink-muted">{relative(i.at)}</span></Link></li>
      ))}
    </ul>
  );
}

export function TeamTable() {
  const q = useTeam();
  if (q.isPending) return <CardSkeleton lines={5} />;
  const rows = q.data ?? [];
  if (!rows.length) return <EmptyState className="py-6" title="No team activity" description="Team members with open leads, deals or tasks appear here." />;
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[640px] text-body">
        <thead><tr className="border-b border-line text-left text-caption text-ink-muted">{["Person", "Open leads", "Open deals", "Pipeline", "Follow-up coverage", "Overdue", "Stalled", "Open tasks"].map((h, i) => <th key={h} className={`py-2 font-medium ${i ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.userId} className="border-b border-line-soft last:border-0">
            <td className="py-2.5"><span className="block font-medium text-ink">{r.name}</span><span className="text-caption text-ink-muted">{r.role}</span></td>
            <td className="py-2.5 text-right tabular">{r.openLeads}</td><td className="py-2.5 text-right tabular">{r.openDeals}</td>
            <td className="py-2.5 text-right tabular">{new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(r.pipeline)}</td>
            <td className="py-2.5 text-right tabular">{r.coverage === null ? "—" : `${r.coverage}%`}</td>
            <td className={`py-2.5 text-right tabular ${r.overdue ? "font-medium text-error-fg" : ""}`}>{r.overdue}</td>
            <td className={`py-2.5 text-right tabular ${r.stalled ? "font-medium text-warning-fg" : ""}`}>{r.stalled}</td><td className="py-2.5 text-right tabular">{r.openTasks}</td>
          </tr>))}</tbody>
      </table>
      <p className="mt-2 text-caption text-ink-muted">Coverage = open leads and deals with a planned, not-overdue next action ÷ all open leads and deals.</p>
    </div>
  );
}

function ReportWidget({ reportId, w }: { reportId: string; w: Widget }) {
  const rep = useReport(reportId);
  const run = useQuery({ queryKey: ["crm", "reportRun", "widget", reportId, rep.data?.updatedAt], queryFn: () => reports.run(rep.data), enabled: !!rep.data });
  if (rep.isPending || run.isPending) return <CardSkeleton />;
  if (rep.isError || run.isError) return <p role="alert" className="text-body text-error-fg">This report could not be loaded. It may have been deleted or you may not have access.</p>;
  const r = run.data;
  if (!r.groups) return <p className="text-body text-ink-muted">{r.total} record{r.total === 1 ? "" : "s"} match. Add a grouping to this report to chart it.</p>;
  return <SeriesChart title={rep.data.name} series={r.groups.map((g) => ({ label: g.label, value: g.value }))} labels={[r.measureLabel]} kind={rep.data.measure.op === "count" ? "count" : "money"} visualization={w.visualization ?? rep.data.visualization} />;
}

/** One dashboard widget — used by the dashboard and by the builder preview. */
export function WidgetView({ w, scope }: { w: Widget; scope: DashScope }) {
  const def = w.key ? METRIC_BY_KEY[w.key] : null;
  const keys = def ? [def.key] : [];
  const m = useMetrics(keys, scope);
  if (w.kind === "worklist") {
    const body = w.key === "my_work" ? <MyWork scope={scope} /> : w.key === "attention" ? <Attention scope={scope} /> : w.key === "team" ? <TeamTable /> : <Recent scope={scope} />;
    return <SectionCard title={w.title}>{body}</SectionCard>;
  }
  if (w.kind === "report" && w.reportId) return <SectionCard title={w.title}><ReportWidget reportId={w.reportId} w={w} /></SectionCard>;
  if (!def) return <SectionCard title={w.title}><p className="text-body text-ink-muted">This widget&apos;s metric is no longer available. Remove it in dashboard settings.</p></SectionCard>;
  const r = m.data?.[def.key];
  if (def.kind === "kpi") {
    return <Stat label={w.title} value={r?.display ?? "—"} href={r?.href} definition={def.definition} loading={m.isPending} hint={r?.empty} />;
  }
  return (
    <SectionCard title={w.title} description={def.definition}>
      {m.isPending ? <CardSkeleton /> : r?.empty || !r?.series ? <EmptyState className="py-8" title={r?.empty ?? "No data"} /> : <SeriesChart title={w.title} series={r.series} labels={r.seriesLabels} kind={def.format === "money" ? "money" : "count"} visualization={w.visualization ?? (def.key === "deals_by_stage" || def.key === "lead_funnel" ? "bar" : "column")} />}
    </SectionCard>
  );
}
