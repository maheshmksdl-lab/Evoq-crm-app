"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartBarIcon, DownloadSimpleIcon, MagnifyingGlassIcon, PencilSimpleIcon, PlusIcon, PushPinIcon, PushPinSlashIcon, TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SeriesChart } from "@/components/charts/series-chart";
import { SelectField } from "@/components/forms/field-input";
import { MultiPick } from "@/components/forms/activity-forms";
import { FiltersPopover } from "@/components/lists/filters-popover";
import { ConfirmDialog, Field, PageHeader, SectionCard } from "@/components/shared/primitives";
import { CardSkeleton, EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/badges";
import { useAdmin, useReport, useReports, useSession } from "@/lib/query/hooks";
import { reports as reportsSvc, ValidationError, type ReportResult } from "@/lib/services";
import { FIELDS } from "@/lib/domain/fields";
import { money, num, pct, relative } from "@/lib/domain/format";
import { download, toCsv } from "@/lib/domain/csv";
import type { FilterRule, Report } from "@/lib/schemas";
import type { z } from "zod";
import { ReportInput as ReportInputSchema } from "@/lib/schemas/inputs";

/** Parsed (defaults applied) report configuration used by the builder. */
type ReportInput = z.output<typeof ReportInputSchema>;

type Src = Report["source"];
const SOURCES: { value: Src; label: string }[] = [
  { value: "leads", label: "Leads" }, { value: "deals", label: "Deals" }, { value: "accounts", label: "Accounts" }, { value: "contacts", label: "Contacts" },
  { value: "tasks", label: "Tasks" }, { value: "calls", label: "Calls" }, { value: "meetings", label: "Meetings" },
];
const VIS = [
  { value: "table", label: "Table only" }, { value: "column", label: "Column chart" }, { value: "bar", label: "Bar chart" }, { value: "line", label: "Line chart" },
  { value: "area", label: "Area chart" }, { value: "pie", label: "Pie chart" }, { value: "donut", label: "Donut chart" },
];
const RANGES = [
  { value: "all", label: "All time" }, { value: "this_month", label: "This month" }, { value: "last_30", label: "Last 30 days" },
  { value: "this_quarter", label: "This quarter" }, { value: "this_year", label: "This year" },
];

/** Starting points — every one uses only fields that exist in the data model. */
const TEMPLATES: { name: string; description: string; cfg: Partial<ReportInput> & { source: Src } }[] = [
  { name: "Lead conversion", description: "Leads by status, including converted", cfg: { source: "leads", groupBy: "status", visualization: "donut", measure: { op: "count", field: null } } },
  { name: "Pipeline by stage", description: "Open deal value per stage", cfg: { source: "deals", groupBy: "stage", visualization: "bar", measure: { op: "sum", field: "amount" }, filters: [{ field: "stage", op: "is_not", value: "Closed Won" }] } },
  { name: "Activities by owner", description: "Tasks per assignee", cfg: { source: "tasks", groupBy: "assigneeId", visualization: "bar", measure: { op: "count", field: null } } },
  { name: "Revenue forecast", description: "Expected revenue (amount × probability) by stage", cfg: { source: "deals", groupBy: "stage", visualization: "column", measure: { op: "sum", field: "expectedRevenue" }, filters: [{ field: "stage", op: "is_not", value: "Closed Won" }] } },
  { name: "Sales performance", description: "Won revenue per owner", cfg: { source: "deals", groupBy: "ownerId", visualization: "column", measure: { op: "sum", field: "amount" }, filters: [{ field: "stage", op: "is", value: "Closed Won" }] } },
];

/* ═════════════ library ═════════════ */
export function ReportsLibrary() {
  const q = useReports();
  const admin = useAdmin();
  const router = useRouter();
  const perms = useSession().data?.permissions.Reports ?? {};
  const [search, setSearch] = useState("");
  const [coll, setColl] = useState("All");
  const [del, setDel] = useState<string | null>(null);
  const all = useMemo(() => q.data ?? [], [q.data]);
  const collections = useMemo(() => ["All", ...[...new Set(all.map((r) => r.collection))].sort()], [all]);
  const shown = all.filter((r) => (coll === "All" || r.collection === coll) && (!search.trim() || [r.name, r.description, ...r.tags].some((t) => t.toLowerCase().includes(search.trim().toLowerCase()))))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.lastAccessedAt ?? "").localeCompare(a.lastAccessedAt ?? ""));
  return (
    <>
      <PageHeader title="Reports" description="Saved reports and the builder. Every number has a written definition."
        actions={perms.create !== false && <Button size="sm" onClick={() => router.push("/reports/new")}><PlusIcon weight="bold" />Create report</Button>} />
      {q.isError ? <ErrorState error={q.error} onRetry={() => q.refetch()} backHref="/" backLabel="Dashboard" /> : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Report collections" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {collections.map((c) => (
              <button key={c} type="button" aria-current={coll === c} onClick={() => setColl(c)} className={`flex shrink-0 items-center justify-between rounded-lg px-3 py-2 text-left text-body outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${coll === c ? "bg-crm-tint font-medium text-crm-depth dark:bg-info-bg dark:text-info-fg" : "text-ink-body hover:bg-hover"}`}>
                {c}<span className="ml-2 text-caption text-ink-muted">{c === "All" ? all.length : all.filter((r) => r.collection === c).length}</span></button>
            ))}
          </nav>
          <SectionCard flush>
            <div className="border-b border-line p-3"><div className="relative max-w-sm"><MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" /><Input className="pl-8" placeholder="Search by name, description or tag" aria-label="Search reports" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div>
            {q.isPending ? <TableSkeleton cols={4} rows={5} /> : shown.length === 0 ? (
              all.length === 0 ? (
                <div className="p-6"><EmptyState icon={ChartBarIcon} title="No reports yet" description="Start from a template to see conversion, pipeline, activity or forecast numbers." />
                  <TemplateGrid onPick={(i) => router.push(`/reports/new?template=${i}`)} /></div>
              ) : <EmptyState title="No matching reports" description="Try a different search or collection." />
            ) : (
              <Table aria-label="Reports">
                <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Collection</TableHead><TableHead className="hidden lg:table-cell">Created by</TableHead><TableHead className="hidden md:table-cell">Last opened</TableHead><TableHead className="w-28" /></TableRow></TableHeader>
                <TableBody>{shown.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => router.push(`/reports/${r.id}`)}>
                    <TableCell><Link href={`/reports/${r.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:text-crm-primary hover:underline">{r.name}</Link>{r.pinned && <StatusBadge tone="brand" className="ml-2">Pinned</StatusBadge>}{r.description && <p className="max-w-md truncate text-caption text-ink-muted">{r.description}</p>}</TableCell>
                    <TableCell className="hidden md:table-cell">{r.collection}</TableCell><TableCell className="hidden lg:table-cell">{r.ownerName}</TableCell>
                    <TableCell className="hidden md:table-cell text-ink-muted">{r.lastAccessedAt ? relative(r.lastAccessedAt) : "Never"}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}><div className="flex justify-end gap-0.5">
                      <Button variant="ghost" size="icon-xs" aria-label={r.pinned ? `Unpin ${r.name}` : `Pin ${r.name}`} onClick={() => admin.togglePin.mutate([r.id])}>{r.pinned ? <PushPinSlashIcon /> : <PushPinIcon />}</Button>
                      {perms.update !== false && <Button asChild variant="ghost" size="icon-xs"><Link href={`/reports/${r.id}/edit`} aria-label={`Edit ${r.name}`}><PencilSimpleIcon /></Link></Button>}
                      {perms.delete !== false && <Button variant="ghost" size="icon-xs" aria-label={`Delete ${r.name}`} onClick={() => setDel(r.id)}><TrashIcon /></Button>}
                    </div></TableCell>
                  </TableRow>))}</TableBody>
              </Table>
            )}
          </SectionCard>
        </div>
      )}
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} destructive confirmLabel="Delete report" title="Delete this report?" description="This can't be undone." onConfirm={async () => { if (del) await admin.removeReport.mutateAsync([del]); }} />
    </>
  );
}

function TemplateGrid({ onPick }: { onPick: (i: number) => void }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((t, i) => (
        <button key={t.name} type="button" onClick={() => onPick(i)} className="rounded-xl border border-line bg-card p-4 text-left outline-none transition-colors hover:border-crm-hover focus-visible:ring-3 focus-visible:ring-ring/50">
          <p className="text-card-title text-heading">{t.name}</p><p className="mt-1 text-caption text-ink-muted">{t.description}</p></button>
      ))}
    </div>
  );
}

/* ═════════════ shared result renderer ═════════════ */
function exportResult(name: string, r: ReportResult) {
  const rows = r.groups ? [["Group", r.measureLabel, "Records"], ...r.groups.map((g) => [g.label, g.value, g.count])] : [r.columns.map((c) => c.label), ...r.rows.map((x) => r.columns.map((c) => x[c.key]))];
  download(`${name.replace(/[^\w-]+/g, "_")}.csv`, toCsv(rows));
}
const cell = (v: string | number | null, type: string) => (v === null || v === "" ? <span className="text-ink-faint">—</span> : type === "money" ? money(Number(v)) : type === "percent" ? pct(Number(v)) : typeof v === "number" ? num(v) : v);

export function ResultView({ r, vis, title }: { r: ReportResult; vis: Report["visualization"]; title: string }) {
  const money_ = /sum|average/i.test(r.measureLabel) && /amount|revenue|value/i.test(r.measureLabel);
  return (
    <div className="space-y-4">
      <p className="text-caption text-ink-muted"><strong className="text-ink">Definition:</strong> {r.definition} {r.total} record{r.total === 1 ? "" : "s"} matched.</p>
      {r.groups && vis !== "table" && r.groups.length > 0 && <SeriesChart title={title} series={r.groups.map((g) => ({ label: g.label, value: g.value }))} labels={[r.measureLabel]} kind={money_ ? "money" : "count"} visualization={vis} />}
      {r.total === 0 ? <EmptyState title="No matching records" description="Loosen the filters or date range." className="py-8" /> : r.groups ? (
        <Table aria-label="Grouped results"><TableHeader><TableRow className="hover:bg-transparent"><TableHead>Group</TableHead><TableHead className="text-right">{r.measureLabel}</TableHead><TableHead className="text-right">Records</TableHead></TableRow></TableHeader>
          <TableBody>{r.groups.map((g) => <TableRow key={g.label}><TableCell>{g.label}</TableCell><TableCell className="text-right tabular">{money_ ? money(g.value) : num(g.value)}</TableCell><TableCell className="text-right tabular">{g.count}</TableCell></TableRow>)}</TableBody></Table>
      ) : (
        <Table aria-label="Report rows"><TableHeader><TableRow className="hover:bg-transparent">{r.columns.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{r.rows.map((x, i) => <TableRow key={i}>{r.columns.map((c) => <TableCell key={c.key} className={["money", "number", "percent"].includes(c.type) ? "text-right tabular" : undefined}>{cell(x[c.key], c.type)}</TableCell>)}</TableRow>)}</TableBody></Table>
      )}
      {!r.groups && r.total > r.rows.length && <p className="text-caption text-ink-muted">Showing the first {r.rows.length} of {r.total} rows. Export includes the same rows; narrow the filters for the rest.</p>}
    </div>
  );
}

/* ═════════════ viewer ═════════════ */
export function ReportViewer({ id }: { id: string }) {
  const router = useRouter();
  const rep = useReport(id);
  const admin = useAdmin();
  const [del, setDel] = useState(false);
  const run = useQuery({ queryKey: ["crm", "reportRun", id, rep.data?.updatedAt], queryFn: async () => { await reportsSvc.touch(id); return reportsSvc.run(rep.data); }, enabled: !!rep.data });
  if (rep.isPending) return <CardSkeleton lines={8} />;
  if (rep.isError) return <ErrorState error={rep.error} onRetry={() => rep.refetch()} backHref="/reports" backLabel="Back to reports" />;
  const r = rep.data;
  return (
    <>
      <PageHeader title={r.name} description={r.description || `${r.collection} · ${r.source}`} breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: r.name }]}
        actions={<>
          <Button variant="outline" size="sm" disabled={!run.data} onClick={() => run.data && exportResult(r.name, run.data)}><DownloadSimpleIcon />Export CSV</Button>
          <Button asChild variant="outline" size="sm"><Link href={`/reports/${id}/edit`}><PencilSimpleIcon />Edit</Link></Button>
          <Button variant="destructive" size="sm" onClick={() => setDel(true)}><TrashIcon />Delete</Button>
        </>} />
      <SectionCard>{run.isPending ? <CardSkeleton lines={6} /> : run.isError ? <ErrorState error={run.error} onRetry={() => run.refetch()} /> : <ResultView r={run.data} vis={r.visualization} title={r.name} />}</SectionCard>
      <ConfirmDialog open={del} onOpenChange={setDel} destructive confirmLabel="Delete report" title="Delete this report?" description="This can't be undone." onConfirm={async () => { await admin.removeReport.mutateAsync([id]); router.replace("/reports"); }} />
    </>
  );
}

/* ═════════════ builder ═════════════ */
const BLANK: ReportInput = { name: "", description: "", collection: "My Reports", source: "deals", joins: [], columns: [], filters: [], dateField: null, dateRange: "all", groupBy: null, measure: { op: "count", field: null }, visualization: "table", tags: [], pinned: false };

export function ReportBuilder({ id, template }: { id?: string; template?: number }) {
  const router = useRouter();
  const admin = useAdmin();
  const existing = useReport(id ?? "");
  if (id && existing.isPending) return <CardSkeleton lines={10} />;
  if (id && existing.isError) return <ErrorState error={existing.error} backHref="/reports" backLabel="Back to reports" />;
  const t = template !== undefined ? TEMPLATES[template] : undefined;
  const initial: ReportInput = id && existing.data ? { ...BLANK, ...existing.data } : t ? { ...BLANK, name: t.name, description: t.description, ...t.cfg } : BLANK;
  return <BuilderInner key={id ?? `new-${template ?? "blank"}`} id={id} initial={initial} saving={admin.saveReport.isPending} onSave={async (v) => { const saved = (await admin.saveReport.mutateAsync([v, id])) as { id: string }; router.push(`/reports/${saved.id}`); }} />;
}

function BuilderInner({ id, initial, onSave, saving }: { id?: string; initial: ReportInput; onSave: (v: ReportInput) => Promise<void>; saving: boolean }) {
  const [cfg, setCfg] = useState<ReportInput>(initial);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (p: Partial<ReportInput>) => { setCfg((c) => ({ ...c, ...p })); setDirty(true); };
  const defs = FIELDS[cfg.source];
  const groupable = defs.filter((f) => ["select", "user", "ref", "boolean"].includes(f.type) || f.key === "name");
  const numeric = defs.filter((f) => ["money", "number", "percent"].includes(f.type));
  const dates = defs.filter((f) => ["date", "datetime"].includes(f.type));
  const colOpts = defs.filter((f) => f.type !== "textarea").map((f) => ({ value: f.key, label: f.label }));

  const parsed = ReportInputSchema.safeParse(cfg);
  const preview = useQuery({
    queryKey: ["crm", "reportRun", "builder", JSON.stringify(cfg)], enabled: parsed.success && cfg.name !== "__none",
    queryFn: () => reportsSvc.run(cfg), retry: false,
  });
  const save = async () => {
    setErr(null);
    if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
    if (cfg.measure.op !== "count" && !cfg.measure.field) { setErr("Choose which field to " + (cfg.measure.op === "sum" ? "add up" : "average")); return; }
    try { await onSave(cfg); setDirty(false); } catch (e) { setErr(e instanceof ValidationError || e instanceof Error ? e.message : "Could not save."); }
  };
  return (
    <>
      <PageHeader title={id ? "Edit report" : "New report"} description="Choose a source, narrow it down, group it and pick how to show it. The preview updates as you go."
        breadcrumbs={[{ label: "Reports", href: "/reports" }, { label: id ? "Edit" : "New" }]}
        actions={<><Button asChild variant="outline" size="sm"><Link href="/reports" onClick={(e) => { if (dirty && !confirm("Discard your unsaved changes?")) e.preventDefault(); }}>Cancel</Link></Button><Button size="sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save report"}</Button></>} />
      {err && <div role="alert" className="mb-3 rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg">{err}</div>}
      {!id && !dirty && <div className="mb-4"><p className="mb-1 text-label font-medium text-ink">Start from a template</p><div className="flex flex-wrap gap-2">{TEMPLATES.map((t) => <Button key={t.name} size="sm" variant="outline" onClick={() => { setCfg({ ...BLANK, name: t.name, description: t.description, ...t.cfg }); setDirty(true); }}>{t.name}</Button>)}</div></div>}
      <div className="grid items-start gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <SectionCard title="Configure" className="lg:sticky lg:top-[calc(var(--header-h)+1rem)]" bodyClassName="space-y-3">
          <Field label="Name" htmlFor="rb-name" required><Input id="rb-name" value={cfg.name} onChange={(e) => set({ name: e.target.value })} maxLength={120} /></Field>
          <Field label="Description" htmlFor="rb-desc"><Textarea id="rb-desc" rows={2} value={cfg.description} onChange={(e) => set({ description: e.target.value })} /></Field>
          <Field label="Collection" htmlFor="rb-coll"><Input id="rb-coll" value={cfg.collection} onChange={(e) => set({ collection: e.target.value })} maxLength={60} /></Field>
          <Field label="1 · Data source" htmlFor="rb-src"><SelectField id="rb-src" value={cfg.source} allowEmpty={false} onChange={(v) => set({ source: v as Src, columns: [], filters: [], groupBy: null, dateField: null, measure: { op: "count", field: null } })} options={SOURCES} /></Field>
          <div><p className="mb-1.5 text-label font-medium text-ink">2 · Filters</p><FiltersPopover key={JSON.stringify(cfg.filters) + cfg.source} module={cfg.source} filters={cfg.filters as FilterRule[]} onChange={(f) => set({ filters: f })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date field" htmlFor="rb-df"><SelectField id="rb-df" value={cfg.dateField ?? ""} onChange={(v) => set({ dateField: v || null, dateRange: v ? cfg.dateRange : "all" })} options={dates.map((d) => ({ value: d.key, label: d.label }))} placeholder="None" /></Field>
            <Field label="Date range" htmlFor="rb-dr"><SelectField id="rb-dr" value={cfg.dateRange} allowEmpty={false} onChange={(v) => set({ dateRange: v as ReportInput["dateRange"] })} options={RANGES} disabled={!cfg.dateField} /></Field>
          </div>
          <Field label="3 · Group by" htmlFor="rb-gb" hint="Leave empty for a plain list of records."><SelectField id="rb-gb" value={cfg.groupBy ?? ""} onChange={(v) => set({ groupBy: v || null, visualization: v ? (cfg.visualization === "table" ? "column" : cfg.visualization) : "table" })} options={groupable.map((g) => ({ value: g.key, label: g.label }))} placeholder="No grouping" /></Field>
          {cfg.groupBy ? (
            <div className="grid grid-cols-2 gap-2">
              <Field label="4 · Measure" htmlFor="rb-op"><SelectField id="rb-op" value={cfg.measure.op} allowEmpty={false} onChange={(v) => set({ measure: { op: v as "count", field: v === "count" ? null : cfg.measure.field } })} options={[{ value: "count", label: "Count" }, { value: "sum", label: "Sum" }, { value: "avg", label: "Average" }]} /></Field>
              <Field label="Of field" htmlFor="rb-mf"><SelectField id="rb-mf" value={cfg.measure.field ?? ""} disabled={cfg.measure.op === "count"} onChange={(v) => set({ measure: { ...cfg.measure, field: v || null } })} options={numeric.map((n) => ({ value: n.key, label: n.label }))} placeholder="Choose field" /></Field>
            </div>
          ) : <MultiPick label="4 · Columns" options={colOpts} value={cfg.columns} onChange={(v) => set({ columns: v })} />}
          <Field label="5 · Show as" htmlFor="rb-vis"><SelectField id="rb-vis" value={cfg.visualization} allowEmpty={false} onChange={(v) => set({ visualization: v as ReportInput["visualization"] })} options={cfg.groupBy ? VIS : VIS.slice(0, 1)} /></Field>
        </SectionCard>
        <SectionCard title="Preview" description={cfg.name || "Untitled report"}>
          {!parsed.success ? <p className="text-body text-ink-muted">Give the report a name to preview it.</p>
            : preview.isPending ? <CardSkeleton lines={6} /> : preview.isError ? <ErrorState error={preview.error} /> : <ResultView r={preview.data} vis={cfg.visualization} title={cfg.name} />}
        </SectionCard>
      </div>
    </>
  );
}
