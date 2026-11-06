"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  CalendarCheckIcon, ChatCircleTextIcon, CheckCircleIcon, CheckSquareIcon, ClockCounterClockwiseIcon, DotsThreeIcon, DownloadSimpleIcon,
  EnvelopeSimpleIcon, NotePencilIcon, PaperclipIcon, PhoneIcon, TrashIcon, UploadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/badges";
import { EmptyState, ErrorState, CardSkeleton } from "@/components/shared/states";
import { Avatar, ConfirmDialog } from "@/components/shared/primitives";
import { useForms } from "@/components/forms/create-context";
import { useActivityActions, useRelated, useTimeline, useUsers } from "@/lib/query/hooks";
import { ATTACHMENT_LIMIT } from "@/lib/services";
import type { ActivityItem, ActivityKind } from "@/lib/domain/activity";
import { bytes, dateTime, relative } from "@/lib/domain/format";
import { userName } from "@/lib/domain/names";
import type { RecordRef } from "@/lib/schemas";

const META: Record<ActivityKind, { icon: typeof PhoneIcon; label: string; tone: string }> = {
  call: { icon: PhoneIcon, label: "Call", tone: "bg-info-bg text-info-fg" },
  email: { icon: EnvelopeSimpleIcon, label: "Email", tone: "bg-crm-tint text-crm-depth dark:bg-info-bg dark:text-info-fg" },
  meeting: { icon: CalendarCheckIcon, label: "Meeting", tone: "bg-success-bg text-success-fg" },
  task: { icon: CheckSquareIcon, label: "Task", tone: "bg-warning-bg text-warning-fg" },
  note: { icon: NotePencilIcon, label: "Note", tone: "bg-neutral-bg text-neutral-fg" },
  comment: { icon: ChatCircleTextIcon, label: "Comment", tone: "bg-neutral-bg text-neutral-fg" },
  attachment: { icon: PaperclipIcon, label: "File", tone: "bg-neutral-bg text-neutral-fg" },
  history: { icon: ClockCounterClockwiseIcon, label: "History", tone: "bg-neutral-bg text-neutral-fg" },
};
const FILTERS: { key: "all" | ActivityKind; label: string }[] = [
  { key: "all", label: "All" }, { key: "call", label: "Calls" }, { key: "email", label: "Emails" }, { key: "meeting", label: "Meetings" },
  { key: "task", label: "Tasks" }, { key: "note", label: "Notes" }, { key: "comment", label: "Comments" }, { key: "attachment", label: "Files" }, { key: "history", label: "History" },
];

function Item({ i, anchor, readOnly }: { i: ActivityItem; anchor: RecordRef; readOnly: boolean }) {
  const { open } = useForms();
  const act = useActivityActions();
  const users = useUsers();
  const rel = useRelated(anchor);
  const [del, setDel] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(i.summary);
  const m = META[i.kind];
  const Icon = m.icon;
  const who = userName(users.data ?? [], i.ownerId);
  const att = i.kind === "attachment" ? rel.data?.attachments.find((a) => a.id === i.sourceId) : null;
  const canEdit = !readOnly && !i.via && (i.kind === "task" || i.kind === "call" || i.kind === "meeting" || i.kind === "note");
  const mod = i.kind === "task" ? "tasks" : i.kind === "call" ? "calls" : i.kind === "meeting" ? "meetings" : null;
  const onDelete = async () => {
    if (mod) await act.remove.mutateAsync([mod, i.sourceId]);
    if (i.kind === "note") await act.removeNote.mutateAsync([i.sourceId]);
    if (i.kind === "comment") await act.removeComment.mutateAsync([i.sourceId]);
    if (i.kind === "attachment") await act.removeAttachment.mutateAsync([i.sourceId]);
  };
  const deletable = !readOnly && !i.via && i.kind !== "email" && i.kind !== "history";

  return (
    <li className="relative flex gap-3 py-3">
      <span aria-hidden className={cn("z-[1] grid size-8 shrink-0 place-items-center rounded-full", m.tone)}><Icon className="size-4" weight="fill" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {i.kind === "task" && !readOnly && !i.via && (
            <Checkbox aria-label={i.open ? "Mark task done" : "Mark task not done"} checked={!i.open} onCheckedChange={(c) => act.completeTask.mutate([i.sourceId, c === true])} />
          )}
          <span className="text-body font-medium text-ink">{mod ? <Link href={`/${mod}/${i.sourceId}`} className="hover:text-crm-primary hover:underline">{i.title}</Link> : i.title}</span>
          <span className="text-caption text-ink-muted">{m.label}</span>
          {i.overdue ? <StatusBadge tone="error">Overdue</StatusBadge> : i.status && i.kind !== "email" && i.kind !== "history" ? <StatusBadge tone={i.open ? "info" : "success"}>{i.status}</StatusBadge> : null}
          {i.via && <Link href={`/${i.via.module}/${i.via.id}`} className="rounded-full bg-muted px-2 text-caption text-ink-muted hover:text-crm-primary">via {i.via.module.slice(0, -1)} #{i.via.id}</Link>}
        </div>
        {editing ? (
          <div className="mt-2 space-y-2">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Edit note" />
            <div className="flex gap-2">
              <Button size="xs" disabled={!text.trim() || act.updateNote.isPending} onClick={() => act.updateNote.mutate([i.sourceId, text], { onSuccess: () => setEditing(false) })}>Save</Button>
              <Button size="xs" variant="outline" onClick={() => { setEditing(false); setText(i.summary); }}>Cancel</Button>
            </div>
          </div>
        ) : i.summary ? <p className="mt-0.5 line-clamp-4 whitespace-pre-wrap break-words text-body text-ink-body">{i.summary}</p> : null}
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-caption text-ink-muted">
          {i.ownerId && <><Avatar name={who} size={16} />{who} ·</>}
          <time dateTime={new Date(i.open && i.dueAt ? i.dueAt : i.at).toISOString()} title={dateTime(i.open && i.dueAt ? i.dueAt : i.at)}>{i.open && i.dueAt ? `Due ${relative(i.dueAt)}` : relative(i.at)}</time>
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        {att?.dataUrl && <Button asChild variant="ghost" size="icon-xs"><a href={att.dataUrl} download={att.name} aria-label={`Download ${att.name}`}><DownloadSimpleIcon /></a></Button>}
        {(canEdit || deletable) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs" aria-label="Activity actions"><DotsThreeIcon weight="bold" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && i.kind !== "note" && <DropdownMenuItem onSelect={() => open({ kind: i.kind as "task", id: i.sourceId })}>Edit</DropdownMenuItem>}
              {canEdit && i.kind === "note" && <DropdownMenuItem onSelect={() => setEditing(true)}>Edit</DropdownMenuItem>}
              {i.kind === "call" && i.open && <DropdownMenuItem onSelect={() => open({ kind: "call", id: i.sourceId, defaults: { status: "Completed" } })}><CheckCircleIcon />Mark completed</DropdownMenuItem>}
              {i.kind === "meeting" && i.open && <DropdownMenuItem onSelect={() => act.updateMeeting.mutate([i.sourceId, { status: "Completed" }])}><CheckCircleIcon />Mark completed</DropdownMenuItem>}
              {deletable && <>{canEdit && <DropdownMenuSeparator />}<DropdownMenuItem variant="destructive" onSelect={() => setDel(true)}><TrashIcon />Delete</DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <ConfirmDialog open={del} onOpenChange={setDel} destructive confirmLabel="Delete" title={`Delete this ${m.label.toLowerCase()}?`} description="This can't be undone." onConfirm={onDelete} />
    </li>
  );
}

export function ActivityTimeline({ anchor, readOnly = false, note }: { anchor: RecordRef; readOnly?: boolean; note?: string }) {
  const tl = useTimeline(anchor);
  const act = useActivityActions();
  const [filter, setFilter] = useState<"all" | ActivityKind>("all");
  const [comment, setComment] = useState("");
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  if (tl.isPending) return <CardSkeleton lines={6} />;
  if (tl.isError) return <ErrorState error={tl.error} onRetry={() => tl.refetch()} />;
  const { upcoming, history } = tl.data;
  const match = (i: ActivityItem) => filter === "all" || i.kind === filter;
  const up = upcoming.filter(match);
  const hist = history.filter(match);
  const counts = (k: "all" | ActivityKind) => (k === "all" ? upcoming.length + history.length : [...upcoming, ...history].filter((i) => i.kind === k).length);

  const upload = (f: File | undefined) => {
    setUploadErr(null);
    if (!f) return;
    if (f.size > ATTACHMENT_LIMIT) { setUploadErr(`"${f.name}" is ${bytes(f.size)}. Files up to ${bytes(ATTACHMENT_LIMIT)} can be stored until file storage is connected.`); return; }
    const reader = new FileReader();
    reader.onload = () => act.addAttachment.mutate([anchor, { name: f.name, size: f.size, type: f.type, dataUrl: String(reader.result) }]);
    reader.onerror = () => setUploadErr("Could not read that file.");
    reader.readAsDataURL(f);
  };

  return (
    <div>
      {note && <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-caption text-ink-muted">{note}</p>}
      <div role="tablist" aria-label="Filter activity" className="mb-2 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button key={f.key} role="tab" aria-selected={filter === f.key} type="button" onClick={() => setFilter(f.key)}
            className={cn("rounded-full px-2.5 py-1 text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", filter === f.key ? "bg-crm-primary text-white" : "text-ink-body hover:bg-hover")}>
            {f.label}{counts(f.key) > 0 && <span className="ml-1 opacity-70">{counts(f.key)}</span>}
          </button>
        ))}
      </div>

      {!readOnly && filter === "comment" && (
        <form className="mb-3 space-y-2" onSubmit={(e) => { e.preventDefault(); if (!comment.trim()) return; act.addComment.mutate([{ related: anchor, body: comment }], { onSuccess: () => setComment("") }); }}>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Add a comment for your team…" aria-label="Comment" />
          <Button size="sm" type="submit" disabled={!comment.trim() || act.addComment.isPending}>Add comment</Button>
        </form>
      )}
      {!readOnly && filter === "attachment" && (
        <div className="mb-3">
          <input ref={file} type="file" className="sr-only" aria-label="Choose a file" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
          <Button size="sm" variant="outline" onClick={() => file.current?.click()}><UploadSimpleIcon />Attach a file</Button>
          {uploadErr && <p role="alert" className="mt-2 text-caption text-error-fg">{uploadErr}</p>}
        </div>
      )}

      {up.length + hist.length === 0 ? (
        <EmptyState icon={ClockCounterClockwiseIcon} title={filter === "all" ? "No activity yet" : `No ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} yet`} description={readOnly ? "Nothing has been recorded here." : "Log a call, email, meeting, task or note to start the history."} className="py-8" />
      ) : (
        <>
          {up.length > 0 && (<section aria-label="Upcoming"><h3 className="mb-0.5 text-caption font-semibold uppercase tracking-wide text-ink-muted">Upcoming · {up.length}</h3>
            <ul className="divide-y divide-line-soft">{up.map((i) => <Item key={i.key} i={i} anchor={anchor} readOnly={readOnly} />)}</ul></section>)}
          {hist.length > 0 && (<section aria-label="History" className={up.length ? "mt-4" : undefined}><h3 className="mb-0.5 text-caption font-semibold uppercase tracking-wide text-ink-muted">History</h3>
            <ul className="divide-y divide-line-soft">{hist.map((i) => <Item key={i.key} i={i} anchor={anchor} readOnly={readOnly} />)}</ul></section>)}
        </>
      )}
    </div>
  );
}
