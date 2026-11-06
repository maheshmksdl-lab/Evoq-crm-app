"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, ChartBarIcon, ListBulletsIcon, NumberSquareOneIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiPick } from "@/components/forms/activity-forms";
import { SelectField } from "@/components/forms/field-input";
import { Field, PageHeader, SectionCard } from "@/components/shared/primitives";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { useAdmin, useReports, useRoles, useSession } from "@/lib/query/hooks";
import { useQuery } from "@tanstack/react-query";
import { dashboards } from "@/lib/services";
import { METRICS } from "@/lib/domain/metrics";
import type { Dashboard, Widget } from "@/lib/schemas";
import { WidgetView } from "./dashboard-widgets";

const LISTS = [
  { key: "my_work", title: "My upcoming work", hint: "Open tasks, calls and meetings by due time" },
  { key: "attention", title: "Needs attention", hint: "Leads and deals matching an attention rule" },
  { key: "recent_activity", title: "Recent activity", hint: "Latest completed calls, meetings, emails and tasks" },
  { key: "team", title: "Team overview", hint: "Workload and follow-up coverage (managers)" },
];
const CHARTS = [{ value: "column", label: "Column" }, { value: "bar", label: "Bar" }, { value: "line", label: "Line" }, { value: "area", label: "Area" }, { value: "pie", label: "Pie" }, { value: "donut", label: "Donut" }];
const uid = () => `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function DashboardBuilder({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["crm", "dashboard", id], queryFn: () => dashboards.get(id) });
  if (q.isPending) return <CardSkeleton lines={10} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} backHref="/" backLabel="Dashboard" />;
  return <Builder key={q.data.updatedAt} dash={q.data} />;
}

function Builder({ dash }: { dash: Dashboard }) {
  const router = useRouter();
  const admin = useAdmin();
  const user = useSession().data?.user;
  const reports = useReports();
  const roles = useRoles();
  const [d, setD] = useState<Dashboard>(dash);
  const [err, setErr] = useState<string | null>(null);
  const dirty = useMemo(() => JSON.stringify(d) !== JSON.stringify(dash), [d, dash]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  const scope = user ? [user.id] : null;
  const patchW = (i: number, p: Partial<Widget>) => setD((x) => ({ ...x, widgets: x.widgets.map((w, j) => (j === i ? { ...w, ...p } : w)) }));
  const add = (w: Omit<Widget, "id">) => setD((x) => ({ ...x, widgets: [...x.widgets, { id: uid(), ...w }] }));
  const move = (i: number, dir: -1 | 1) => setD((x) => { const a = [...x.widgets]; const j = i + dir; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, widgets: a }; });
  const locked = d.locked && dash.ownerId !== user?.id;

  const save = async () => {
    setErr(null);
    if (!d.name.trim()) { setErr("Name the dashboard"); return; }
    try { await admin.saveDashboard.mutateAsync([{ name: d.name, description: d.description, visibility: d.visibility, roles: d.roles, locked: d.locked, widgets: d.widgets }, d.id]); router.push("/"); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not save."); }
  };
  const cancel = () => { if (!dirty || confirm("Discard your unsaved dashboard changes?")) router.push("/"); };

  return (
    <>
      <PageHeader title="Customize dashboard" description="Add, arrange and resize widgets. What you see below is how the dashboard will look."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: d.name }]}
        actions={<><Button variant="outline" size="sm" onClick={cancel}>Cancel</Button><Button size="sm" onClick={save} disabled={!dirty || admin.saveDashboard.isPending || locked}>{admin.saveDashboard.isPending ? "Saving…" : "Save dashboard"}</Button></>} />
      {err && <div role="alert" className="mb-3 rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg">{err}</div>}
      {locked && <div role="status" className="mb-3 rounded-lg border border-warning/40 bg-warning-bg px-3 py-2 text-body text-warning-fg">This dashboard is locked by its owner. You can look, but not change it.</div>}
      <div className="grid items-start gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4 xl:sticky xl:top-[calc(var(--header-h)+1rem)]">
          <SectionCard title="Settings" bodyClassName="space-y-3">
            <Field label="Name" htmlFor="db-n" required><Input id="db-n" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} maxLength={80} disabled={locked} /></Field>
            <Field label="Who can see it" htmlFor="db-v"><SelectField id="db-v" value={d.visibility} allowEmpty={false} disabled={locked} onChange={(v) => setD({ ...d, visibility: v as Dashboard["visibility"] })} options={[{ value: "private", label: "Only me" }, { value: "all", label: "Everyone" }, { value: "roles", label: "Specific roles" }]} /></Field>
            {d.visibility === "roles" && <MultiPick label="Roles" options={(roles.data ?? []).map((r) => ({ value: r.name, label: r.name }))} value={d.roles} onChange={(v) => setD({ ...d, roles: v })} />}
            <label className="flex items-center justify-between gap-3 text-body"><span>Lock (only I can edit)</span><Switch checked={d.locked} disabled={dash.ownerId !== user?.id} onCheckedChange={(c) => setD({ ...d, locked: c })} aria-label="Lock dashboard" /></label>
          </SectionCard>
          <SectionCard title="Add a widget">
            <Tabs defaultValue="metrics">
              <TabsList variant="line"><TabsTrigger value="metrics"><NumberSquareOneIcon />Metrics</TabsTrigger><TabsTrigger value="lists"><ListBulletsIcon />Lists</TabsTrigger><TabsTrigger value="reports"><ChartBarIcon />Reports</TabsTrigger></TabsList>
              <TabsContent value="metrics" className="mt-2"><ul className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin">{METRICS.map((m) => (
                <li key={m.key}><button type="button" disabled={locked} onClick={() => add({ kind: "metric", key: m.key, reportId: null, title: m.label, span: m.kind === "kpi" ? 1 : 2, visualization: m.kind === "kpi" ? "kpi" : "column" })} className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-hover disabled:opacity-50"><PlusIcon className="mt-0.5 size-4 shrink-0 text-crm-primary" /><span><span className="block text-body font-medium text-ink">{m.label}</span><span className="block text-caption text-ink-muted">{m.definition}</span></span></button></li>))}</ul></TabsContent>
              <TabsContent value="lists" className="mt-2"><ul className="space-y-1">{LISTS.map((l) => (
                <li key={l.key}><button type="button" disabled={locked} onClick={() => add({ kind: "worklist", key: l.key, reportId: null, title: l.title, span: 2, visualization: null })} className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-hover disabled:opacity-50"><PlusIcon className="mt-0.5 size-4 shrink-0 text-crm-primary" /><span><span className="block text-body font-medium text-ink">{l.title}</span><span className="block text-caption text-ink-muted">{l.hint}</span></span></button></li>))}</ul></TabsContent>
              <TabsContent value="reports" className="mt-2">{(reports.data ?? []).length === 0 ? <p className="text-body text-ink-muted">No saved reports yet. Create one under Reports.</p> : <ul className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin">{(reports.data ?? []).map((r) => (
                <li key={r.id}><button type="button" disabled={locked} onClick={() => add({ kind: "report", key: null, reportId: r.id, title: r.name, span: 2, visualization: r.visualization === "table" ? "column" : r.visualization })} className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-hover disabled:opacity-50"><PlusIcon className="mt-0.5 size-4 shrink-0 text-crm-primary" /><span><span className="block text-body font-medium text-ink">{r.name}</span><span className="block text-caption text-ink-muted">{r.collection}</span></span></button></li>))}</ul>}</TabsContent>
            </Tabs>
          </SectionCard>
        </div>
        <div className="min-w-0">
          {d.widgets.length === 0 ? <SectionCard><EmptyState title="No widgets yet" description="Pick a metric, list or report from the left to start building." /></SectionCard> : (
            <ul className="space-y-4">{d.widgets.map((w, i) => (
              <li key={w.id} className="rounded-2xl border border-dashed border-line bg-card/50 p-3">
                <div className="mb-3 flex flex-wrap items-end gap-2">
                  <div className="min-w-[160px] flex-1"><Field label="Title" htmlFor={`w-t-${w.id}`}><Input id={`w-t-${w.id}`} value={w.title} maxLength={80} disabled={locked} onChange={(e) => patchW(i, { title: e.target.value })} /></Field></div>
                  <div className="w-28"><Field label="Width" htmlFor={`w-s-${w.id}`}><SelectField id={`w-s-${w.id}`} value={String(w.span)} allowEmpty={false} disabled={locked} onChange={(v) => patchW(i, { span: Number(v) as Widget["span"] })} options={[{ value: "1", label: "¼ width" }, { value: "2", label: "½ width" }, { value: "3", label: "¾ width" }, { value: "4", label: "Full width" }]} /></Field></div>
                  {(w.kind === "report" || (w.kind === "metric" && w.visualization !== "kpi")) && <div className="w-28"><Field label="Chart" htmlFor={`w-c-${w.id}`}><SelectField id={`w-c-${w.id}`} value={w.visualization ?? "column"} allowEmpty={false} disabled={locked} onChange={(v) => patchW(i, { visualization: v as Widget["visualization"] })} options={CHARTS} /></Field></div>}
                  <div className="flex gap-0.5 pb-0.5">
                    <Button variant="outline" size="icon-sm" aria-label={`Move ${w.title} up`} disabled={i === 0 || locked} onClick={() => move(i, -1)}><ArrowUpIcon /></Button>
                    <Button variant="outline" size="icon-sm" aria-label={`Move ${w.title} down`} disabled={i === d.widgets.length - 1 || locked} onClick={() => move(i, 1)}><ArrowDownIcon /></Button>
                    <Button variant="outline" size="icon-sm" aria-label={`Remove ${w.title}`} disabled={locked} onClick={() => setD({ ...d, widgets: d.widgets.filter((_, j) => j !== i) })}><TrashIcon /></Button>
                  </div>
                </div>
                <div className={w.span === 1 ? "max-w-xs" : w.span === 2 ? "max-w-2xl" : undefined}><WidgetView w={w} scope={scope} /></div>
              </li>))}</ul>
          )}
        </div>
      </div>
    </>
  );
}
