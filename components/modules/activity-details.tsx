"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircleIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { ActivityStatusBadge, PriorityBadge } from "@/components/shared/badges";
import { ConfirmDialog, Breadcrumbs, KeyValue, OwnerCell, SectionCard } from "@/components/shared/primitives";
import { CardSkeleton, ErrorState } from "@/components/shared/states";
import { useForms } from "@/components/forms/create-context";
import { useActivityActions, useRecord, useSession } from "@/lib/query/hooks";
import { date, dateTime } from "@/lib/domain/format";
import { MODULE_PERM } from "@/lib/domain/permissions";

type Kind = "tasks" | "calls" | "meetings";
const LABEL = { tasks: "Task", calls: "Call", meetings: "Meeting" } as const;
const FORM = { tasks: "task", calls: "call", meetings: "meeting" } as const;

/** Detail page for a Task, Call or Meeting — same hierarchy as the record pages. */
export function ActivityDetail({ kind, id }: { kind: Kind; id: string }) {
  const router = useRouter();
  const q = useRecord(kind, id);
  const act = useActivityActions();
  const { open } = useForms();
  const perms = useSession().data?.permissions[MODULE_PERM[kind]] ?? {};
  const [del, setDel] = useState(false);
  if (q.isPending) return <CardSkeleton lines={8} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} backHref={`/${kind}`} backLabel={`Back to ${kind}`} />;
  const r = q.data as unknown as Record<string, unknown> & { id: string; ownerName: string; relatedLabel: string | null; related: { module: string; id: string } | null; overdue: boolean; status: string | null; description: string };
  const title = String(r.subject ?? r.title);
  const done = r.status === "Completed";
  const complete = () => {
    if (kind === "tasks") act.completeTask.mutate([id, !done]);
    else if (kind === "meetings") act.updateMeeting.mutate([id, { status: done ? "Scheduled" : "Completed" }]);
    else open({ kind: "call", id, defaults: { status: "Completed" } });
  };
  return (
    <div>
      <Breadcrumbs items={[{ label: LABEL[kind] + "s", href: `/${kind}` }, { label: title }]} />
      <header className="mb-4 mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-page-title text-heading">{title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2"><ActivityStatusBadge status={r.status ?? "No status"} overdue={r.overdue} />{kind === "tasks" && <PriorityBadge priority={r.priority as string | null} />}</div></div>
        <div className="flex flex-wrap gap-2">
          {perms.update !== false && <Button size="sm" onClick={complete}><CheckCircleIcon />{done ? "Reopen" : kind === "calls" ? "Mark completed" : "Mark done"}</Button>}
          {perms.update !== false && <Button size="sm" variant="outline" onClick={() => open({ kind: FORM[kind], id })}><PencilSimpleIcon />Edit</Button>}
          {perms.delete !== false && <Button size="sm" variant="destructive" onClick={() => setDel(true)}><TrashIcon />Delete</Button>}
        </div>
      </header>
      <SectionCard title={`${LABEL[kind]} details`}>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {kind === "tasks" && <><KeyValue label="Type">{String(r.type)}</KeyValue><KeyValue label="Due date">{r.dueDate ? date(String(r.dueDate)) : null}</KeyValue><KeyValue label="Assigned to">{String(r.assigneeName)}</KeyValue><KeyValue label="Contact">{r.contactName as string | null}</KeyValue></>}
          {kind === "calls" && <><KeyValue label="Direction">{String(r.direction)}</KeyValue><KeyValue label="Call time">{dateTime(String(r.scheduledAt))}</KeyValue><KeyValue label="Duration">{r.durationMin ? `${r.durationMin} min` : null}</KeyValue><KeyValue label="Outcome">{String(r.outcome)}</KeyValue><KeyValue label="Phone">{String(r.phone)}</KeyValue><KeyValue label="Contact">{r.contactName as string | null}</KeyValue></>}
          {kind === "meetings" && <><KeyValue label="Starts">{dateTime(String(r.startAt))}</KeyValue><KeyValue label="Ends">{dateTime(String(r.endAt))}</KeyValue><KeyValue label="Location">{String(r.location)}</KeyValue><KeyValue label="Participants">{String(r.participantNames)}</KeyValue></>}
          <KeyValue label="Owner"><OwnerCell name={r.ownerName} /></KeyValue>
          <KeyValue label="Related to">{r.related && r.relatedLabel ? <Link className="text-crm-primary hover:underline" href={`/${r.related.module}/${r.related.id}`}>{r.relatedLabel}</Link> : null}</KeyValue>
          <KeyValue label="Created">{dateTime(String(r.createdAt))}</KeyValue><KeyValue label="Modified">{dateTime(String(r.updatedAt))}</KeyValue>
          {r.completedAt ? <KeyValue label="Completed">{dateTime(String(r.completedAt))}</KeyValue> : null}
          <div className="sm:col-span-2 lg:col-span-3"><KeyValue label={kind === "meetings" ? "Agenda" : "Description"}>{r.description}</KeyValue></div>
          {kind === "meetings" && r.outcome ? <div className="sm:col-span-2 lg:col-span-3"><KeyValue label="Outcome">{String(r.outcome)}</KeyValue></div> : null}
        </dl>
      </SectionCard>
      <ConfirmDialog open={del} onOpenChange={setDel} destructive confirmLabel="Delete" title={`Delete this ${LABEL[kind].toLowerCase()}?`} description="This can't be undone." onConfirm={async () => { await act.remove.mutateAsync([kind, id]); router.replace(`/${kind}`); }} />
    </div>
  );
}
