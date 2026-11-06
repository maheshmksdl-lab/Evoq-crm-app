"use client";

import Link from "next/link";
import { DEAL_STAGES, TASK_STATUSES } from "@/lib/schemas/options";
import { useActivityActions, useSetStage } from "@/lib/query/hooks";
import type { AccountRow, CallRow, ContactRow, DealRow, MeetingRow, TaskRow } from "@/lib/services";
import { date, dateTime, money, pct } from "@/lib/domain/format";
import { ModuleList, type ColumnDef } from "@/components/lists/module-list";
import type { KanbanDef } from "@/components/lists/kanban";
import { ActivityStatusBadge, DealStageBadge, PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { OwnerCell } from "@/components/shared/primitives";
import { Checkbox } from "@/components/ui/checkbox";
import { AttentionSummary, LastInteractionCell, NextActionCell, QuickActions, RecordLink } from "@/components/records/cells";
import { useForms } from "@/components/forms/create-context";
import { Button } from "@/components/ui/button";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr";

const Name = ({ href, title, sub }: { href: string; title: string; sub?: string }) => (
  <div className="min-w-0 max-w-[260px]">
    <Link href={href} onClick={(e) => e.stopPropagation()} className="block truncate font-medium text-ink hover:text-crm-primary hover:underline">{title}</Link>
    {sub && <p className="truncate text-caption text-ink-muted">{sub}</p>}
  </div>
);
const Dash = ({ v }: { v: string | null | undefined }) => <>{v || <span className="text-ink-faint">—</span>}</>;

/* ───────── Contacts ───────── */
const contactCols: ColumnDef<ContactRow>[] = [
  { key: "name", label: "Contact", sort: "name", locked: true, cell: (r) => <Name href={`/contacts/${r.id}`} title={r.name} sub={r.title} /> },
  { key: "account", label: "Account", sort: "accountId", cell: (r) => (r.accountId ? <RecordLink href={`/accounts/${r.accountId}`}>{r.accountName}</RecordLink> : <Dash v={null} />) },
  { key: "email", label: "Email", sort: "email", hideBelow: "lg", cell: (r) => <Dash v={r.email} /> },
  { key: "phone", label: "Phone", hideBelow: "lg", cell: (r) => <Dash v={r.mobile || r.phone} /> },
  { key: "last", label: "Last interaction", sort: "lastInteractionAt", hideBelow: "xl", cell: (r) => <LastInteractionCell at={r.lastInteractionAt} label={r.lastInteractionLabel} /> },
  { key: "next", label: "Next action", sort: "nextActionDue", hideBelow: "md", cell: (r) => <NextActionCell next={r.nextAction} empty="—" /> },
  { key: "deals", label: "Open deals", sort: "openDeals", hideBelow: "xl", className: "text-right", cell: (r) => r.openDeals },
  { key: "owner", label: "Owner", sort: "ownerId", hideBelow: "md", cell: (r) => <OwnerCell name={r.ownerName} /> },
  { key: "actions", label: "", locked: true, className: "w-[110px] text-right", cell: (r) => <QuickActions related={{ module: "contacts", id: r.id }} phone={r.mobile || r.phone} email={r.email} /> },
];
export const ContactsList = () => (
  <ModuleList<ContactRow> module="contacts" title="Contacts" singular="Contact" description="People you work with, and the history with each of them" importable
    columns={contactCols} rowHref={(r) => `/contacts/${r.id}`} defaultSort={[{ field: "updatedAt", dir: "desc" }]}
    gridCard={(r) => (
      <Link href={`/contacts/${r.id}`} className="block space-y-1 rounded-xl border border-line bg-card p-4 shadow-card hover:border-crm-hover">
        <p className="truncate font-medium text-ink">{r.name}</p><p className="truncate text-caption text-ink-muted">{[r.title, r.accountName].filter(Boolean).join(" · ") || "—"}</p>
        <p className="truncate text-caption text-ink-body">{r.email || r.mobile || r.phone || "No contact details"}</p><NextActionCell next={r.nextAction} empty="No next action" />
      </Link>
    )}
  />
);

/* ───────── Accounts ───────── */
const accountCols: ColumnDef<AccountRow>[] = [
  { key: "name", label: "Account", sort: "name", locked: true, cell: (r) => <Name href={`/accounts/${r.id}`} title={r.name} sub={[r.accountType, r.industry].filter(Boolean).join(" · ")} /> },
  { key: "contact", label: "Primary contact", hideBelow: "md", cell: (r) => (r.primaryContactId ? <RecordLink href={`/contacts/${r.primaryContactId}`}>{r.primaryContactName}</RecordLink> : <Dash v={null} />) },
  { key: "deals", label: "Open deals", sort: "openDeals", cell: (r) => (r.openDeals ? <span><span className="tabular">{r.openDeals}</span> · {money(r.openDealValue, { compact: true })}</span> : <Dash v={null} />) },
  { key: "last", label: "Last activity", sort: "lastInteractionAt", hideBelow: "lg", cell: (r) => <LastInteractionCell at={r.lastInteractionAt} label={r.lastInteractionLabel} /> },
  { key: "next", label: "Next action", sort: "nextActionDue", hideBelow: "xl", cell: (r) => <NextActionCell next={r.nextAction} empty="—" /> },
  { key: "phone", label: "Phone", hideBelow: "lg", cell: (r) => <Dash v={r.phone} /> },
  { key: "website", label: "Website", defaultVisible: false, cell: (r) => <Dash v={r.website} /> },
  { key: "owner", label: "Owner", sort: "ownerId", hideBelow: "md", cell: (r) => <OwnerCell name={r.ownerName} /> },
  { key: "actions", label: "", locked: true, className: "w-[110px] text-right", cell: (r) => <QuickActions related={{ module: "accounts", id: r.id }} phone={r.phone} /> },
];
export const AccountsList = () => (
  <ModuleList<AccountRow> module="accounts" title="Accounts" singular="Account" description="Organizations, their people and their deals" importable
    columns={accountCols} rowHref={(r) => `/accounts/${r.id}`} defaultSort={[{ field: "name", dir: "asc" }]}
    gridCard={(r) => (
      <Link href={`/accounts/${r.id}`} className="block space-y-1 rounded-xl border border-line bg-card p-4 shadow-card hover:border-crm-hover">
        <p className="truncate font-medium text-ink">{r.name}</p><p className="truncate text-caption text-ink-muted">{[r.accountType, r.industry].filter(Boolean).join(" · ") || "—"}</p>
        <p className="text-caption text-ink-body">{r.contactsCount} contact{r.contactsCount === 1 ? "" : "s"} · {r.openDeals} open deal{r.openDeals === 1 ? "" : "s"}</p>
      </Link>
    )}
  />
);

/* ───────── Deals ───────── */
const dealCols: ColumnDef<DealRow>[] = [
  { key: "name", label: "Deal", sort: "name", locked: true, cell: (r) => <Name href={`/deals/${r.id}`} title={r.name} sub={[r.accountName, r.contactName].filter(Boolean).join(" · ")} /> },
  { key: "stage", label: "Stage", sort: "stage", cell: (r) => <DealStageBadge stage={r.stage} /> },
  { key: "amount", label: "Value", sort: "amount", className: "text-right", cell: (r) => <span className="tabular">{money(r.amount)}</span> },
  { key: "prob", label: "Probability", sort: "probability", hideBelow: "md", className: "text-right", cell: (r) => <span className="tabular">{pct(r.probability)}</span> },
  { key: "expected", label: "Expected", sort: "expectedRevenue", hideBelow: "xl", className: "text-right", cell: (r) => <span className="tabular">{money(r.expectedRevenue)}</span> },
  { key: "close", label: "Expected close", sort: "closingDate", hideBelow: "md", cell: (r) => date(r.closingDate) },
  { key: "next", label: "Next action", sort: "nextActionDue", hideBelow: "lg", cell: (r) => (
    <div className="max-w-[220px] space-y-1"><NextActionCell next={r.nextAction} /><AttentionSummary items={r.attention.filter((a) => a.code === "stalled" || a.code === "no_owner")} /></div>
  ) },
  { key: "owner", label: "Owner", sort: "ownerId", hideBelow: "lg", cell: (r) => <OwnerCell name={r.ownerName} /> },
  { key: "age", label: "Days in stage", sort: "stageAgeDays", defaultVisible: false, className: "text-right", cell: (r) => r.stageAgeDays },
  { key: "ref", label: "Deal ID", sort: "refId", defaultVisible: false, cell: (r) => r.refId },
  { key: "actions", label: "", locked: true, className: "w-[110px] text-right", cell: (r) => <QuickActions related={{ module: "deals", id: r.id }} /> },
];
export function DealsList() {
  const setStage = useSetStage();
  const kanban: KanbanDef<DealRow> = {
    groups: DEAL_STAGES, groupOf: (r) => r.stage, title: (r) => r.name, move: (r, g) => setStage.mutate([r.id, g as DealRow["stage"]]),
    summary: (rs) => money(rs.reduce((a, r) => a + r.amount, 0), { compact: true }),
    card: (r) => (
      <div className="space-y-1.5 pr-5">
        <p className="truncate text-body font-medium text-ink">{r.name}</p><p className="truncate text-caption text-ink-muted">{r.accountName ?? "No account"}</p>
        <p className="tabular text-body font-semibold text-heading">{money(r.amount)} <span className="text-caption font-normal text-ink-muted">· {pct(r.probability)}</span></p>
        <NextActionCell next={r.nextAction} empty="No next action" /><p className="text-caption text-ink-muted">Closes {date(r.closingDate)} · {r.ownerName}</p>
      </div>
    ),
  };
  return (
    <ModuleList<DealRow> module="deals" title="Deals" singular="Deal" description="Pipeline, commercial value and what happens next" importable
      columns={dealCols} rowHref={(r) => `/deals/${r.id}`} defaultSort={[{ field: "closingDate", dir: "asc" }]}
      tabs={{ param: "stage", label: "Deal stage", options: [{ value: "All", label: "All" }, ...DEAL_STAGES.map((s) => ({ value: s, label: s }))] }}
      kpis={[
        { label: "Overdue follow-up", quick: { due: "overdue" }, tone: "error", definition: "Deals whose next action's due time has passed." },
        { label: "No next action", quick: { attention: "no_next_action" }, tone: "warning", definition: "Open deals with no open task, scheduled call/meeting or Next step." },
        { label: "Stalled", quick: { attention: "stalled" }, tone: "warning", definition: "Stage unchanged for more than 30 days." },
        { label: "Needing attention", quick: { attention: "any" }, definition: "Open deals matching any attention rule." },
      ]}
      kanban={kanban}
      gridCard={(r) => (
        <Link href={`/deals/${r.id}`} className="block space-y-2 rounded-xl border border-line bg-card p-4 shadow-card hover:border-crm-hover">
          <div className="flex items-start justify-between gap-2"><p className="truncate font-medium text-ink">{r.name}</p><DealStageBadge stage={r.stage} /></div>
          <p className="tabular text-section font-semibold text-heading">{money(r.amount)}</p><NextActionCell next={r.nextAction} empty="No next action" />
        </Link>
      )}
    />
  );
}

/* ───────── Tasks ───────── */
function TaskCheck({ r }: { r: TaskRow }) {
  const act = useActivityActions();
  return <Checkbox aria-label={r.status === "Completed" ? "Mark as not done" : "Mark as done"} checked={r.status === "Completed"} onCheckedChange={(c) => act.completeTask.mutate([r.id, c === true])} onClick={(e) => e.stopPropagation()} />;
}
const taskCols: ColumnDef<TaskRow>[] = [
  { key: "done", label: "", locked: true, className: "w-8 pr-0", cell: (r) => <TaskCheck r={r} /> },
  { key: "subject", label: "Title", sort: "subject", locked: true, cell: (r) => <Name href={`/tasks/${r.id}`} title={r.subject} sub={r.type !== "Task" ? r.type : undefined} /> },
  { key: "due", label: "Due date", sort: "dueDate", cell: (r) => (r.dueDate ? <span className={r.overdue ? "font-medium text-error-fg" : undefined}>{date(r.dueDate)}{r.overdue && " · overdue"}</span> : <Dash v={null} />) },
  { key: "priority", label: "Priority", sort: "priority", cell: (r) => <PriorityBadge priority={r.priority} /> },
  { key: "status", label: "Status", sort: "status", cell: (r) => <ActivityStatusBadge status={r.status ?? "No status"} /> },
  { key: "assignee", label: "Assigned to", sort: "assigneeId", hideBelow: "md", cell: (r) => <OwnerCell name={r.assigneeName} /> },
  { key: "related", label: "Related to", hideBelow: "lg", cell: (r) => (r.related && r.relatedLabel ? <RecordLink href={`/${r.related.module}/${r.related.id}`}>{r.relatedLabel}</RecordLink> : <Dash v={null} />) },
  { key: "contact", label: "Contact", hideBelow: "xl", cell: (r) => <Dash v={r.contactName} /> },
  { key: "owner", label: "Owner", sort: "ownerId", defaultVisible: false, cell: (r) => <OwnerCell name={r.ownerName} /> },
];
export function TasksList() {
  const act = useActivityActions();
  const { open } = useForms();
  const groups = [...TASK_STATUSES, "No status"] as const;
  const kanban: KanbanDef<TaskRow> = {
    groups, groupOf: (r) => r.status ?? "No status", title: (r) => r.subject,
    move: (r, g) => act.updateTask.mutate([r.id, { status: g === "No status" ? null : g }]),
    card: (r) => (<div className="space-y-1.5 pr-5"><p className="truncate text-body font-medium text-ink">{r.subject}</p><p className={r.overdue ? "text-caption font-medium text-error-fg" : "text-caption text-ink-muted"}>{r.dueDate ? `${r.overdue ? "Overdue · " : "Due "}${date(r.dueDate)}` : "No due date"}</p><div className="flex items-center gap-1.5"><PriorityBadge priority={r.priority} /><span className="truncate text-caption text-ink-muted">{r.relatedLabel}</span></div></div>),
  };
  return (
    <ModuleList<TaskRow> module="tasks" title="Tasks" singular="Task" description="Everything you need to do, by when" importable
      columns={[...taskCols, { key: "edit", label: "", locked: true, className: "w-10", cell: (r) => <Button variant="ghost" size="icon-xs" aria-label={`Edit ${r.subject}`} onClick={(e) => { e.stopPropagation(); open({ kind: "task", id: r.id }); }}><PencilSimpleIcon /></Button> }]}
      rowHref={(r) => `/tasks/${r.id}`} defaultSort={[{ field: "dueDate", dir: "asc" }]}
      tabs={{ param: "status", label: "Task status", options: [{ value: "All", label: "All" }, ...TASK_STATUSES.map((s) => ({ value: s, label: s }))] }}
      kpis={[
        { label: "Due today", quick: { due: "today" }, definition: "Open tasks due today." },
        { label: "Overdue", quick: { due: "overdue" }, tone: "error", definition: "Open tasks past their due date." },
        { label: "Upcoming", quick: { due: "upcoming" }, definition: "Open tasks due later." },
        { label: "High priority", quick: { priority: "High" }, tone: "warning" },
      ]}
      kanban={kanban}
      gridCard={(r) => (<Link href={`/tasks/${r.id}`} className="block space-y-2 rounded-xl border border-line bg-card p-4 shadow-card hover:border-crm-hover"><p className="truncate font-medium text-ink">{r.subject}</p><div className="flex items-center gap-1.5"><ActivityStatusBadge status={r.status ?? "No status"} overdue={r.overdue} /><PriorityBadge priority={r.priority} /></div><p className="text-caption text-ink-muted">{r.dueDate ? date(r.dueDate) : "No due date"} · {r.assigneeName}</p></Link>)}
    />
  );
}

/* ───────── Calls ───────── */
const callCols: ColumnDef<CallRow>[] = [
  { key: "subject", label: "Subject", sort: "subject", locked: true, cell: (r) => <Name href={`/calls/${r.id}`} title={r.subject} sub={r.phone} /> },
  { key: "direction", label: "Direction", sort: "direction", hideBelow: "md", cell: (r) => <StatusBadge tone={r.direction === "Inbound" ? "info" : "brand"}>{r.direction}</StatusBadge> },
  { key: "when", label: "Call time", sort: "scheduledAt", cell: (r) => dateTime(r.scheduledAt) },
  { key: "status", label: "Status", sort: "status", cell: (r) => <ActivityStatusBadge status={r.status} overdue={r.overdue} /> },
  { key: "outcome", label: "Outcome", sort: "outcome", hideBelow: "md", cell: (r) => <Dash v={r.outcome} /> },
  { key: "duration", label: "Duration", sort: "durationMin", hideBelow: "lg", className: "text-right", cell: (r) => (r.durationMin ? `${r.durationMin} min` : <Dash v={null} />) },
  { key: "contact", label: "Contact", hideBelow: "lg", cell: (r) => <Dash v={r.contactName} /> },
  { key: "related", label: "Related to", hideBelow: "xl", cell: (r) => (r.related && r.relatedLabel ? <RecordLink href={`/${r.related.module}/${r.related.id}`}>{r.relatedLabel}</RecordLink> : <Dash v={null} />) },
  { key: "owner", label: "Owner", sort: "ownerId", hideBelow: "lg", cell: (r) => <OwnerCell name={r.ownerName} /> },
];
export const CallsList = () => (
  <ModuleList<CallRow> module="calls" title="Calls" singular="Call" description="Calls you have logged or planned" columns={callCols} rowHref={(r) => `/calls/${r.id}`}
    defaultSort={[{ field: "scheduledAt", dir: "desc" }]} bulkAssign={false}
    tabs={{ param: "status", label: "Call status", options: [{ value: "All", label: "All" }, { value: "Scheduled", label: "Scheduled" }, { value: "Completed", label: "Completed" }, { value: "Cancelled", label: "Cancelled" }] }}
    kpis={[{ label: "Overdue", quick: { due: "overdue" }, tone: "error", definition: "Calls still Scheduled after their time." }, { label: "Upcoming", quick: { due: "upcoming" } }, { label: "Inbound", quick: { direction: "Inbound" } }, { label: "Outbound", quick: { direction: "Outbound" } }]}
  />
);

/* ───────── Meetings ───────── */
const meetingCols: ColumnDef<MeetingRow>[] = [
  { key: "title", label: "Meeting", sort: "title", locked: true, cell: (r) => <Name href={`/meetings/${r.id}`} title={r.title} sub={r.location} /> },
  { key: "start", label: "Date and time", sort: "startAt", cell: (r) => dateTime(r.startAt) },
  { key: "status", label: "Status", sort: "status", cell: (r) => <ActivityStatusBadge status={r.status} overdue={r.overdue} /> },
  { key: "participants", label: "Participants", hideBelow: "md", cell: (r) => <span className="line-clamp-1 max-w-[220px]"><Dash v={r.participantNames} /></span> },
  { key: "related", label: "Related to", hideBelow: "lg", cell: (r) => (r.related && r.relatedLabel ? <RecordLink href={`/${r.related.module}/${r.related.id}`}>{r.relatedLabel}</RecordLink> : <Dash v={null} />) },
  { key: "owner", label: "Owner", sort: "ownerId", hideBelow: "lg", cell: (r) => <OwnerCell name={r.ownerName} /> },
];
export const MeetingsList = () => (
  <ModuleList<MeetingRow> module="meetings" title="Meetings" singular="Meeting" description="What is scheduled and what happened" columns={meetingCols} rowHref={(r) => `/meetings/${r.id}`}
    defaultSort={[{ field: "startAt", dir: "desc" }]} bulkAssign={false}
    tabs={{ param: "status", label: "Meeting status", options: [{ value: "All", label: "All" }, { value: "Scheduled", label: "Scheduled" }, { value: "Completed", label: "Completed" }, { value: "Cancelled", label: "Cancelled" }] }}
    kpis={[{ label: "Overdue", quick: { due: "overdue" }, tone: "error", definition: "Meetings still Scheduled after they ended." }, { label: "Upcoming", quick: { due: "upcoming" } }, { label: "Open", quick: { due: "open" } }]}
  />
);
