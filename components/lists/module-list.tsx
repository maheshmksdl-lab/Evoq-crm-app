"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownIcon, ArrowUpIcon, ArrowsDownUpIcon, BookmarkSimpleIcon, CaretLeftIcon, CaretRightIcon, ColumnsIcon, DownloadSimpleIcon,
  GridFourIcon, KanbanIcon, ListIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon, UploadSimpleIcon, UserSwitchIcon, XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PageHeader, SectionCard, Stat, ConfirmDialog, Field } from "@/components/shared/primitives";
import { EmptyState, ErrorState, NoResults, TableSkeleton } from "@/components/shared/states";
import { useForms } from "@/components/forms/create-context";
import { useAdmin, useBulkAssign, useBulkRemove, useList, useSession, useUsers, useViews } from "@/lib/query/hooks";
import { dataAdmin } from "@/lib/services";
import { toCsv, download } from "@/lib/domain/csv";
import { MODULE_PERM } from "@/lib/domain/permissions";
import type { ModuleKey, SortRule } from "@/lib/schemas";
import { FiltersPopover } from "./filters-popover";
import { useListState, type Scope, type ViewMode } from "./use-list-state";
import { KanbanBoard, type KanbanDef } from "./kanban";

export interface ColumnDef<R> {
  key: string;
  label: string;
  /** field key used for sorting; omit to make the column unsortable */
  sort?: string;
  cell: (r: R) => ReactNode;
  className?: string;
  hideBelow?: "md" | "lg" | "xl";
  defaultVisible?: boolean;
  locked?: boolean;
}
export interface TabsDef { param: string; label?: string; options: { value: string; label: string }[] }
export interface KpiDef { label: string; quick: Record<string, string>; tone?: "default" | "warning" | "error"; definition?: string }

const HIDE = { md: "hidden md:table-cell", lg: "hidden lg:table-cell", xl: "hidden xl:table-cell" } as const;
const MAX = Number.MAX_SAFE_INTEGER;

export function ModuleList<R extends { id: string; ownerId?: string | null }>({
  module, title, description, singular, columns, rowHref, tabs, kpis, kanban, gridCard, defaultSort, importable, createDefaults, extraActions, emptyHint, bulkAssign = true,
}: {
  module: ModuleKey; title: string; description: string; singular: string; columns: ColumnDef<R>[];
  rowHref: (r: R) => string; tabs?: TabsDef; kpis?: KpiDef[]; kanban?: KanbanDef<R>; gridCard?: (r: R) => ReactNode;
  defaultSort: SortRule[]; importable?: boolean; createDefaults?: Record<string, unknown>; extraActions?: ReactNode; emptyHint?: string; bulkAssign?: boolean;
}) {
  const router = useRouter();
  const { create } = useForms();
  const session = useSession();
  const users = useUsers();
  const bulkRemove = useBulkRemove();
  const bulkOwner = useBulkAssign();
  const perm = MODULE_PERM[module];
  const perms = session.data?.permissions[perm] ?? {};
  const tier = session.data?.tier ?? "rep";

  const list = useListState({ sort: defaultSort, view: "table" });
  const { state } = list;
  const scope: Scope = state.scope ?? (tier === "admin" ? "all" : tier === "manager" ? "team" : "mine");
  const uid = session.data?.user?.id;
  const ownerIds = scope === "all" ? null : scope === "mine" ? (uid ? [uid] : []) : session.data?.teamUserIds ?? [];
  const useAll = state.view === "kanban";

  const query = useList(module, {
    search: state.q, filters: state.filters, sort: state.sort, quick: state.quick, ownerIds,
    page: useAll ? 1 : state.page, pageSize: useAll ? MAX : state.pageSize,
  });
  const rows = (query.data?.rows ?? []) as unknown as R[];
  const total = query.data?.total ?? 0;
  const page = query.data?.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / state.pageSize));

  /* the search box owns its text and commits (debounced) to the URL; resetKey remounts it when the list is cleared or a view is applied */
  const [resetKey, setResetKey] = useState(0);
  const clearAll = () => { list.clearAll(); setResetKey((k) => k + 1); };
  const applyView: typeof list.applyView = (v) => { list.applyView(v); setResetKey((k) => k + 1); };

  /* column visibility (per module, remembered in this browser) */
  const colKey = `evoq-crm:cols:${module}`;
  const [visible, setVisible] = useState<string[] | null>(() => { try { const raw = localStorage.getItem(colKey); return raw ? (JSON.parse(raw) as string[]) : null; } catch { return null; } });
  const shown = useMemo(() => columns.filter((c) => c.locked || (visible ? visible.includes(c.key) : c.defaultVisible !== false)), [columns, visible]);
  const saveVisible = (v: string[] | null) => {
    setVisible(v);
    try { if (v) localStorage.setItem(colKey, JSON.stringify(v)); else localStorage.removeItem(colKey); } catch { /* storage unavailable: applies for this session only */ }
  };

  /* selection */
  // selection belongs to one exact result set; a different page/search/filter/scope starts empty
  const resultKey = JSON.stringify([module, state.q, state.page, state.filters, state.quick, scope, state.view]);
  const [sel, setSel] = useState<{ key: string; ids: Set<string> }>({ key: resultKey, ids: new Set() });
  const selected = sel.key === resultKey ? sel.ids : new Set<string>();
  const setSelected = (u: Set<string> | ((s: Set<string>) => Set<string>)) => setSel({ key: resultKey, ids: typeof u === "function" ? u(selected) : u });
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const [delOpen, setDelOpen] = useState(false);

  const sortFor = (key: string) => state.sort.find((s) => s.field === key)?.dir;
  const toggleSort = (key: string) => {
    const cur = sortFor(key);
    list.setSort([{ field: key, dir: cur === "asc" ? "desc" : "asc" }]);
  };

  const hasFilters = !!state.q || state.filters.length > 0 || Object.keys(state.quick).length > 0;
  const viewModes: { v: ViewMode; label: string; icon: typeof ListIcon; ok: boolean }[] = [
    { v: "table", label: "Table", icon: ListIcon, ok: true }, { v: "kanban", label: "Kanban", icon: KanbanIcon, ok: !!kanban }, { v: "grid", label: "Grid", icon: GridFourIcon, ok: !!gridCard },
  ];

  return (
    <>
      <PageHeader
        title={title} description={description}
        actions={<>
          {extraActions}
          {importable && perms.import !== false && <Button asChild variant="outline" size="sm"><Link href="/settings?tab=import"><UploadSimpleIcon />Import</Link></Button>}
          {perms.export !== false && (
            <Button variant="outline" size="sm" onClick={async () => { download(`${module}.csv`, toCsv(await dataAdmin.exportRows(module))); }}><DownloadSimpleIcon />Export</Button>
          )}
          {perms.create !== false && <Button size="sm" onClick={() => create(module, null, createDefaults)}><PlusIcon weight="bold" />New {singular}</Button>}
        </>}
      />

      {kpis && (
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => <KpiCard key={k.label} module={module} def={k} ownerIds={ownerIds} active={Object.entries(k.quick).every(([a, b]) => state.quick[a] === b)} onToggle={(on) => { list.clearQuick(); if (on) Object.entries(k.quick).forEach(([a, b]) => list.setQuick(a, b)); }} />)}
        </div>
      )}

      <SectionCard flush>
        {/* toolbar */}
        <div className="space-y-3 border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-input p-0.5" role="group" aria-label="View">
              {viewModes.filter((m) => m.ok).map((m) => (
                <Button key={m.v} variant={state.view === m.v ? "secondary" : "ghost"} size="xs" aria-pressed={state.view === m.v} onClick={() => list.setView(m.v)}><m.icon />{m.label}</Button>
              ))}
            </div>
            <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <SearchInput key={resetKey} initial={state.q} onCommit={list.setSearch} placeholder={`Search ${title.toLowerCase()}…`} label={`Search ${title}`} />
            </div>
            <Select value={scope} onValueChange={(v) => list.setScope(v as Scope)}>
              <SelectTrigger size="sm" className="w-[130px]" aria-label="Whose records"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">My {title.toLowerCase()}</SelectItem>
                {tier !== "rep" && <SelectItem value="team">My team</SelectItem>}
                {tier !== "rep" && <SelectItem value="all">Everyone</SelectItem>}
                {tier === "rep" && <SelectItem value="all">Everyone</SelectItem>}
              </SelectContent>
            </Select>
            <FiltersPopover key={JSON.stringify(state.filters)} module={module} filters={state.filters} onChange={list.setFilters} />
            <SortMenu sort={state.sort} columns={columns} onChange={list.setSort} />
            <ColumnsMenu columns={columns} shown={shown.map((c) => c.key)} onChange={saveVisible} />
            <ViewsMenu module={module} state={state} onApply={applyView} activeId={state.viewId} />
            {hasFilters && <Button variant="ghost" size="sm" onClick={clearAll}><XIcon />Clear</Button>}
          </div>
          {tabs && (
            <div role="tablist" aria-label={tabs.label ?? "Filter"} className="flex flex-wrap gap-1">
              {tabs.options.map((o) => {
                const on = (state.quick[tabs.param] ?? "All") === o.value;
                return <button key={o.value} role="tab" aria-selected={on} type="button" onClick={() => list.setQuick(tabs.param, o.value)}
                  className={cn("rounded-full px-3 py-1 text-label outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50", on ? "bg-crm-primary text-white" : "text-ink-body hover:bg-hover")}>{o.label}</button>;
              })}
            </div>
          )}
        </div>

        {/* bulk bar */}
        {selected.size > 0 && (
          <div role="region" aria-label="Bulk actions" className="flex flex-wrap items-center gap-2 border-b border-line bg-crm-surface px-4 py-2 dark:bg-info-bg">
            <span className="text-label font-medium text-ink">{selected.size} selected</span>
            {bulkAssign && perms.update !== false && module !== "calls" && module !== "meetings" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><UserSwitchIcon />Assign owner</Button></DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-72 overflow-y-auto">
                  <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                  {(users.data ?? []).filter((u) => u.active).map((u) => (
                    <DropdownMenuItem key={u.id} onSelect={() => bulkOwner.mutate([module as "leads", [...selected], u.id], { onSuccess: () => setSelected(new Set()) })}>{u.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {perms.delete !== false && <Button variant="destructive" size="sm" onClick={() => setDelOpen(true)}><TrashIcon />Delete</Button>}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>Clear selection</Button>
          </div>
        )}

        {/* body */}
        {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} backHref="/" backLabel="Dashboard" />
          : query.isPending ? <TableSkeleton cols={Math.min(6, shown.length)} />
          : total === 0 ? (hasFilters ? <NoResults onClear={clearAll} /> : (
              <EmptyState title={`No ${title.toLowerCase()} yet`} description={emptyHint ?? `Create your first ${singular.toLowerCase()} to get started.`} action={perms.create !== false && <Button size="sm" onClick={() => create(module, null, createDefaults)}><PlusIcon weight="bold" />New {singular}</Button>} />))
          : state.view === "kanban" && kanban ? <KanbanBoard rows={rows} def={kanban} rowHref={rowHref} canMove={perms.update !== false} />
          : state.view === "grid" && gridCard ? (
            <ul className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{rows.map((r) => <li key={r.id}>{gridCard(r)}</li>)}</ul>
          ) : (
            <>
              <div className="hidden md:block">
            <Table aria-label={title}>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 pr-0"><Checkbox aria-label="Select all on this page" checked={allOnPage} onCheckedChange={(c) => setSelected(c === true ? new Set(rows.map((r) => r.id)) : new Set())} /></TableHead>
                  {shown.map((c) => {
                    const dir = c.sort ? sortFor(c.sort) : undefined;
                    return (
                      <TableHead key={c.key} aria-sort={dir ? (dir === "asc" ? "ascending" : "descending") : undefined} className={cn(c.hideBelow && HIDE[c.hideBelow], c.className)}>
                        {c.sort ? (
                          <button type="button" onClick={() => toggleSort(c.sort!)} className="inline-flex items-center gap-1 rounded outline-none hover:text-heading focus-visible:ring-2 focus-visible:ring-ring">
                            {c.label}{dir === "asc" ? <ArrowUpIcon className="size-3" /> : dir === "desc" ? <ArrowDownIcon className="size-3" /> : <ArrowsDownUpIcon className="size-3 opacity-40" />}
                          </button>
                        ) : c.label}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} data-state={selected.has(r.id) ? "selected" : undefined} className="cursor-pointer data-[state=selected]:bg-crm-surface dark:data-[state=selected]:bg-info-bg" onClick={() => router.push(rowHref(r))}>
                    <TableCell className="w-10 pr-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label="Select row" checked={selected.has(r.id)} onCheckedChange={(c) => setSelected((s) => { const n = new Set(s); if (c === true) n.add(r.id); else n.delete(r.id); return n; })} />
                    </TableCell>
                    {shown.map((c) => <TableCell key={c.key} className={cn(c.hideBelow && HIDE[c.hideBelow], c.className)}>{c.cell(r)}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
              {/* below md the table becomes cards: title first, then the most useful fields as label/value pairs */}
              <ul className="divide-y divide-line-soft md:hidden" aria-label={title}>
                {rows.map((r) => {
                  const withLabel = shown.filter((c) => c.label);
                  const bare = shown.filter((c) => !c.label);
                  const [head, ...rest] = withLabel;
                  return (
                    <li key={r.id} className="flex gap-3 px-4 py-3">
                      <div className="pt-0.5"><Checkbox aria-label="Select row" checked={selected.has(r.id)} onCheckedChange={(c) => setSelected((x) => { const n = new Set(x); if (c === true) n.add(r.id); else n.delete(r.id); return n; })} /></div>
                      <div className="min-w-0 flex-1 space-y-2" onClick={() => router.push(rowHref(r))}>
                        <div className="flex items-start justify-between gap-2"><div className="min-w-0">{head?.cell(r)}</div><div className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>{bare.map((c) => <span key={c.key}>{c.cell(r)}</span>)}</div></div>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {rest.slice(0, 5).map((c) => (
                            <div key={c.key} className="min-w-0"><dt className="text-micro uppercase tracking-wide text-ink-faint">{c.label}</dt><dd className="truncate text-body text-ink">{c.cell(r)}</dd></div>
                          ))}
                        </dl>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

        {/* pagination */}
        {!useAll && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-caption text-ink-muted">
            <span aria-live="polite">Showing {(page - 1) * state.pageSize + 1}–{Math.min(page * state.pageSize, total)} of {total}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5">Rows
                <Select value={String(state.pageSize)} onValueChange={(v) => list.setPageSize(Number(v))}>
                  <SelectTrigger size="sm" className="w-[72px]" aria-label="Rows per page"><SelectValue /></SelectTrigger>
                  <SelectContent>{[10, 20, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" aria-label="Previous page" disabled={page <= 1} onClick={() => list.setPage(page - 1)}><CaretLeftIcon /></Button>
                <span className="px-1 tabular">Page {page} of {pages}</span>
                <Button variant="outline" size="icon-sm" aria-label="Next page" disabled={page >= pages} onClick={() => list.setPage(page + 1)}><CaretRightIcon /></Button>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <ConfirmDialog open={delOpen} onOpenChange={setDelOpen} destructive confirmLabel={`Delete ${selected.size}`} title={`Delete ${selected.size} ${selected.size === 1 ? singular.toLowerCase() : title.toLowerCase()}?`}
        description="This can't be undone. Notes, comments and attachments on these records are deleted with them. Tasks, calls and meetings are kept but unlinked."
        onConfirm={async () => { await bulkRemove.mutateAsync([module, [...selected]]); setSelected(new Set()); }} />
    </>
  );
}

function SearchInput({ initial, onCommit, placeholder, label }: { initial: string; onCommit: (q: string) => void; placeholder: string; label: string }) {
  const [v, setV] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const change = (next: string) => {
    setV(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onCommit(next), 300);
  };
  return <Input value={v} onChange={(e) => change(e.target.value)} placeholder={placeholder} aria-label={label} className="pl-8" />;
}

function KpiCard({ module, def, ownerIds, active, onToggle }: { module: ModuleKey; def: KpiDef; ownerIds: string[] | null; active: boolean; onToggle: (on: boolean) => void }) {
  const q = useList(module, { quick: def.quick, ownerIds, page: 1, pageSize: 1 });
  return (
    <div className={cn("relative rounded-xl", active && "ring-2 ring-crm-primary")}>
      <Stat label={def.label} value={q.data?.total ?? "—"} tone={(q.data?.total ?? 0) > 0 ? def.tone : "default"} definition={def.definition} loading={q.isPending} />
      {/* the whole card is the filter toggle; it is a sibling of (not an ancestor of) the definition button */}
      <button type="button" aria-pressed={active} aria-label={`Filter by: ${def.label}`} onClick={() => onToggle(!active)} className="absolute inset-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
    </div>
  );
}

function SortMenu({ sort, columns, onChange }: { sort: SortRule[]; columns: ColumnDef<never>[]; onChange: (s: SortRule[]) => void }) {
  const cur = sort[0];
  const sortable = columns.filter((c) => c.sort);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><ArrowsDownUpIcon />Sort</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-56 overflow-y-auto">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        {sortable.map((c) => (
          <DropdownMenuItem key={c.key} onSelect={() => onChange([{ field: c.sort!, dir: cur?.field === c.sort && cur.dir === "asc" ? "desc" : "asc" }])}>
            {c.label}{cur?.field === c.sort && (cur.dir === "asc" ? <ArrowUpIcon className="ml-auto" /> : <ArrowDownIcon className="ml-auto" />)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ColumnsMenu({ columns, shown, onChange }: { columns: ColumnDef<never>[]; shown: string[]; onChange: (v: string[] | null) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild><Button variant="outline" size="sm"><ColumnsIcon />Columns</Button></PopoverTrigger>
      <PopoverContent align="start" className="max-h-80 w-60 space-y-1 overflow-y-auto p-2">
        {columns.map((c) => (
          <label key={c.key} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-hover", c.locked && "opacity-60")}>
            <Checkbox disabled={c.locked} checked={shown.includes(c.key)} onCheckedChange={(on) => onChange(on === true ? [...shown, c.key] : shown.filter((k) => k !== c.key))} />
            <span className="text-body">{c.label}</span>
          </label>
        ))}
        <Button variant="ghost" size="sm" className="mt-1 w-full" onClick={() => onChange(null)}>Reset to default</Button>
      </PopoverContent>
    </Popover>
  );
}

function ViewsMenu({ module, state, onApply, activeId }: { module: ModuleKey; state: ReturnType<typeof useListState>["state"]; onApply: ReturnType<typeof useListState>["applyView"]; activeId: string | null }) {
  const views = useViews(module);
  const admin = useAdmin();
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const active = (views.data ?? []).find((v) => v.id === activeId);
  const save = async () => {
    setErr(null);
    try {
      await admin.saveView.mutateAsync([{ module, name, search: state.q, filters: state.filters, sort: state.sort, columns: [], shared }]);
      setSaveOpen(false); setName(""); setShared(false);
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not save the view."); }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant={active ? "secondary" : "outline"} size="sm"><BookmarkSimpleIcon />{active ? active.name : "Views"}</Button></DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Saved views</DropdownMenuLabel>
          {(views.data ?? []).length === 0 && <p className="px-2 py-2 text-caption text-ink-muted">No saved views yet.</p>}
          {(views.data ?? []).map((v) => (
            <DropdownMenuItem key={v.id} onSelect={() => onApply(v)}>
              <span className="truncate">{v.name}</span>{v.shared && <span className="ml-auto text-micro text-ink-muted">Shared</span>}
              <button type="button" aria-label={`Delete view ${v.name}`} className="ml-1 rounded p-0.5 text-ink-faint hover:text-error" onClick={(e) => { e.stopPropagation(); admin.removeView.mutate([v.id]); }}><TrashIcon className="size-3.5" /></button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSaveOpen(true)}><PlusIcon />Save current view…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Save view</DialogTitle><DialogDescription>Saves the current search, filters and sort order.</DialogDescription></DialogHeader>
          <Field label="Name" htmlFor="sv-name" error={err ?? undefined}><Input id="sv-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={60} /></Field>
          <label className="flex items-center gap-2 text-body"><Checkbox checked={shared} onCheckedChange={(c) => setShared(c === true)} />Share with everyone</label>
          <DialogFooter><Button variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button><Button onClick={save} disabled={admin.saveView.isPending}>Save view</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
