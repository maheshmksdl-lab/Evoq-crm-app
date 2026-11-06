"use client";

import Link from "next/link";
import { LEAD_STATUSES } from "@/lib/schemas/options";
import { useSetLeadStatus } from "@/lib/query/hooks";
import type { LeadRow } from "@/lib/services";
import { date } from "@/lib/domain/format";
import { ModuleList, type ColumnDef } from "@/components/lists/module-list";
import type { KanbanDef } from "@/components/lists/kanban";
import { HealthIndicator, LeadStatusBadge, PriorityBadge, RatingBadge, StatusBadge } from "@/components/shared/badges";
import { OwnerCell } from "@/components/shared/primitives";
import { AttentionSummary, LastInteractionCell, NextActionCell, QuickActions } from "@/components/records/cells";

const columns: ColumnDef<LeadRow>[] = [
  { key: "name", label: "Lead", sort: "name", locked: true, cell: (r) => (
    <div className="min-w-0 max-w-[220px]">
      <Link href={`/leads/${r.id}`} onClick={(e) => e.stopPropagation()} className="block truncate font-medium text-ink hover:text-crm-primary hover:underline">{r.name}{r.converted && <StatusBadge tone="success" className="ml-2 align-middle">Converted</StatusBadge>}</Link>
      <p className="truncate text-caption text-ink-muted">{[r.title, r.company].filter(Boolean).join(" · ") || "—"}</p>
    </div>
  ) },
  { key: "status", label: "Status", sort: "status", cell: (r) => <LeadStatusBadge status={r.status} /> },
  { key: "priority", label: "Priority", sort: "priority", cell: (r) => <PriorityBadge priority={r.priority} /> },
  { key: "health", label: "Lead health", sort: "healthScore", cell: (r) => <HealthIndicator health={r.health} /> },
  { key: "last", label: "Last interaction", sort: "lastInteractionAt", hideBelow: "lg", cell: (r) => <LastInteractionCell at={r.lastInteractionAt} label={r.lastInteractionLabel} /> },
  { key: "next", label: "Next action", sort: "nextActionDue", cell: (r) => (
    <div className="max-w-[190px] space-y-1">{r.converted ? <span className="text-caption text-ink-faint">Moved to deal/contact</span> : <NextActionCell next={r.nextAction} />}<AttentionSummary items={r.attention.filter((a) => a.code !== "no_next_action" && a.code !== "overdue_follow_up")} /></div>
  ) },
  { key: "owner", label: "Owner", sort: "ownerId", hideBelow: "md", cell: (r) => <OwnerCell name={r.ownerName} /> },
  { key: "rating", label: "Rating", sort: "rating", defaultVisible: false, cell: (r) => <RatingBadge rating={r.rating} /> },
  { key: "source", label: "Source", sort: "leadSource", defaultVisible: false, cell: (r) => r.leadSource || "—" },
  { key: "email", label: "Email", sort: "email", defaultVisible: false, cell: (r) => r.email || "—" },
  { key: "phone", label: "Phone", defaultVisible: false, cell: (r) => r.mobile || r.phone || "—" },
  { key: "created", label: "Created", sort: "createdAt", defaultVisible: false, cell: (r) => date(r.createdAt) },
  { key: "actions", label: "", locked: true, className: "w-[110px] text-right", cell: (r) => (r.converted ? null : <QuickActions related={{ module: "leads", id: r.id }} phone={r.mobile || r.phone} email={r.email} />) },
];

export function LeadsList() {
  const setStatus = useSetLeadStatus();
  const kanban: KanbanDef<LeadRow> = {
    groups: LEAD_STATUSES, groupOf: (r) => r.status, title: (r) => r.name,
    move: (r, g) => { if (r.converted) return; setStatus.mutate([r.id, g as LeadRow["status"]]); },
    card: (r) => (
      <div className="space-y-1.5 pr-5">
        <p className="truncate text-body font-medium text-ink">{r.name}</p>
        <p className="truncate text-caption text-ink-muted">{r.company || "No company"}</p>
        <div className="flex flex-wrap items-center gap-1.5"><HealthIndicator health={r.health} compact /><PriorityBadge priority={r.priority} /></div>
        <NextActionCell next={r.nextAction} empty="No next action" />
        <p className="text-caption text-ink-muted">{r.ownerName}</p>
      </div>
    ),
  };
  return (
    <ModuleList<LeadRow>
      module="leads" title="Leads" singular="Lead" description="Prioritize follow-ups and move leads forward"
      columns={columns} rowHref={(r) => `/leads/${r.id}`} defaultSort={[{ field: "updatedAt", dir: "desc" }]} importable
      tabs={{ param: "status", label: "Lead status", options: [{ value: "All", label: "All" }, ...LEAD_STATUSES.map((s) => ({ value: s, label: s }))] }}
      kpis={[
        { label: "Due today", quick: { due: "today" }, definition: "Open leads whose next action is due today." },
        { label: "Overdue", quick: { due: "overdue" }, tone: "error", definition: "Leads whose next action's due time has passed." },
        { label: "Hot leads", quick: { rating: "Hot" }, definition: "Leads rated Hot." },
        { label: "No recent activity", quick: { attention: "no_recent_activity" }, tone: "warning", definition: "No completed call, meeting, logged email or task in the last 14 days." },
      ]}
      kanban={kanban}
      gridCard={(r) => (
        <Link href={`/leads/${r.id}`} className="block space-y-2 rounded-xl border border-line bg-card p-4 shadow-card transition-colors hover:border-crm-hover">
          <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-medium text-ink">{r.name}</p><p className="truncate text-caption text-ink-muted">{[r.title, r.company].filter(Boolean).join(" · ") || "—"}</p></div><LeadStatusBadge status={r.status} /></div>
          <div className="flex flex-wrap items-center gap-1.5"><HealthIndicator health={r.health} /><PriorityBadge priority={r.priority} /></div>
          <NextActionCell next={r.nextAction} empty="No next action" />
          <OwnerCell name={r.ownerName} />
        </Link>
      )}
    />
  );
}
