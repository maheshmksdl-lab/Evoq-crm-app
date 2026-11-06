"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Control, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { CallInput, EmailLogInput, MeetingInput, NoteInput, TaskInput } from "@/lib/schemas/inputs";
import type { RecordRef } from "@/lib/schemas";
import {
  CALL_DIRECTIONS, CALL_OUTCOMES, CALL_STATUSES, MEETING_STATUSES, PRIORITIES, TASK_STATUSES, TASK_TYPES,
} from "@/lib/schemas/options";
import { useActivityActions, useListAll, useRecord, useSession, useUsers } from "@/lib/query/hooks";
import { ValidationError } from "@/lib/services";
import { fromLocalInput, toLocalInput } from "@/lib/domain/format";
import { personName } from "@/lib/domain/names";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/primitives";
import { CardSkeleton } from "@/components/shared/states";
import { FieldInput, SelectField, useRefOptions } from "./field-input";
import { FormDrawer } from "./form-drawer";

const MODS = [
  { value: "leads", label: "Lead" }, { value: "contacts", label: "Contact" }, { value: "accounts", label: "Account" }, { value: "deals", label: "Deal" },
] as const;

/** Module + record picker producing a RecordRef (or null). */
export function RelatedPicker({ control, name = "related", error }: { control: Control<FieldValues>; name?: string; error?: string }) {
  return (
    <Controller control={control} name={name} render={({ field }) => {
      const v = field.value as RecordRef | null;
      return <RelatedInner value={v} onChange={field.onChange} error={error} />;
    }} />
  );
}
function RelatedInner({ value, onChange, error }: { value: RecordRef | null; onChange: (v: RecordRef | null) => void; error?: string }) {
  const [picked, setMod] = useState<string>("");
  const mod = value?.module ?? picked;
  const opts = useRefOptions((mod || "accounts") as "accounts");
  return (
    <Field label="Related to" htmlFor="f-related-id" error={error}>
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <SelectField id="f-related-mod" value={mod} onChange={(m) => { setMod(m); onChange(null); }} options={MODS as unknown as { value: string; label: string }[]} placeholder="Type" />
        <SelectField id="f-related-id" value={value?.id ?? ""} disabled={!mod} onChange={(id) => onChange(id ? { module: mod as RecordRef["module"], id } : null)} options={mod ? opts : []} placeholder={mod ? "Choose record" : "Choose a type first"} />
      </div>
    </Field>
  );
}

export function MultiPick({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  const chosen = options.filter((o) => value.includes(o.value));
  return (
    <Field label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="h-8 w-full justify-start font-normal">
            {chosen.length ? <span className="truncate">{chosen.map((c) => c.label).join(", ")}</span> : <span className="text-ink-muted">None selected</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-h-64 w-72 overflow-y-auto p-1.5">
          {options.length === 0 && <p className="p-3 text-body text-ink-muted">Nothing to choose from.</p>}
          {options.map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-hover">
              <Checkbox checked={value.includes(o.value)} onCheckedChange={(c) => onChange(c === true ? [...value, o.value] : value.filter((x) => x !== o.value))} />
              <span className="truncate text-body">{o.label}</span>
            </label>
          ))}
        </PopoverContent>
      </Popover>
    </Field>
  );
}

type Kind = "task" | "call" | "meeting";
const COLL = { task: "tasks", call: "calls", meeting: "meetings" } as const;
const SCHEMA = { task: TaskInput, call: CallInput, meeting: MeetingInput } as const;
const LABEL = { task: "task", call: "call", meeting: "meeting" } as const;

function nowLocal(plusMin = 0) {
  const d = new Date(Date.now() + plusMin * 60_000);
  d.setSeconds(0, 0);
  return toLocalInput(d.getTime());
}

export function ActivityForm({ kind, id, related, defaults, onClose }: { kind: Kind; id?: string; related?: RecordRef | null; defaults?: Record<string, unknown>; onClose: () => void }) {
  const session = useSession();
  const users = useUsers();
  const contacts = useListAll("contacts");
  const act = useActivityActions();
  const existing = useRecord(COLL[kind], id ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const editing = Boolean(id);
  const uid = session.data?.user?.id ?? "";

  const base = useMemo<FieldValues>(() => {
    if (kind === "task") return { subject: "", type: "Task", dueDate: null, status: "To-Do", priority: null, ownerId: uid, assigneeId: uid, contactId: null, related: related ?? null, reminder: "", description: "" };
    if (kind === "call") return { subject: "", direction: "Outbound", status: "Scheduled", scheduledAt: nowLocal(60), durationMin: null, outcome: "", phone: "", ownerId: uid, contactId: null, related: related ?? null, description: "" };
    return { title: "", startAt: nowLocal(60), endAt: nowLocal(90), location: "", status: "Scheduled", ownerId: uid, participantContactIds: [], participantUserIds: [], related: related ?? null, description: "", outcome: "" };
  }, [kind, uid, related]);

  const form = useForm<FieldValues>({ resolver: zodResolver(SCHEMA[kind]) as unknown as Resolver<FieldValues>, defaultValues: { ...base, ...defaults }, mode: "onTouched" });
  const { control, handleSubmit, reset, setError, watch, formState: { errors, isDirty, isSubmitting } } = form;

  useEffect(() => {
    if (!editing || !existing.data) return;
    const r = { ...(existing.data as unknown as Record<string, unknown>) };
    for (const k of ["scheduledAt", "startAt", "endAt"]) if (typeof r[k] === "string") r[k] = toLocalInput(r[k] as string);
    reset(r as FieldValues);
  }, [editing, existing.data, reset]);

  const err = (n: string) => (errors as Record<string, { message?: string }>)[n]?.message;
  const status = watch("status");
  const contactOptions = (contacts.data ?? []).map((c) => ({ value: c.id, label: personName(c) }));
  const userOptions = (users.data ?? []).filter((u) => u.active).map((u) => ({ value: u.id, label: u.name }));

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    const v: Record<string, unknown> = { ...values };
    for (const k of ["scheduledAt", "startAt", "endAt"]) if (typeof v[k] === "string" && v[k]) v[k] = fromLocalInput(v[k] as string);
    if (kind === "task" && !v.assigneeId) v.assigneeId = v.ownerId;
    try {
      if (kind === "task") await (editing ? act.updateTask.mutateAsync([id!, v]) : act.createTask.mutateAsync([v]));
      if (kind === "call") await (editing ? act.updateCall.mutateAsync([id!, v]) : act.createCall.mutateAsync([v]));
      if (kind === "meeting") await (editing ? act.updateMeeting.mutateAsync([id!, v]) : act.createMeeting.mutateAsync([v]));
      onClose();
    } catch (e) {
      if (e instanceof ValidationError) {
        let placed = false;
        e.issues.forEach((i) => { if (i.path) { setError(i.path as never, { message: i.message }); placed = true; } });
        if (!placed) setFormError(e.message);
      } else setFormError(e instanceof Error ? e.message : "Could not save.");
    }
  });

  const fi = (name: string, type: Parameters<typeof FieldInput>[0]["def"]["type"], label: string, extra: { options?: readonly string[]; required?: boolean } = {}) => (
    <FieldInput def={{ type, label, options: extra.options }} name={name} control={control} error={err(name)} required={extra.required} />
  );

  return (
    <FormDrawer open onClose={onClose} dirty={isDirty} submitting={isSubmitting} formId="activity-form" submitLabel={editing ? "Save changes" : kind === "call" ? "Log call" : `Create ${LABEL[kind]}`} title={`${editing ? "Edit" : "New"} ${LABEL[kind]}`}>
      {editing && existing.isPending ? <CardSkeleton lines={7} /> : (
        <form id="activity-form" onSubmit={submit} noValidate className="space-y-3">
          {formError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg"><WarningCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" />{formError}</div>}
          {kind === "task" && (<>
            {fi("subject", "text", "Title", { required: true })}
            <div className="grid gap-3 sm:grid-cols-2">
              {fi("type", "select", "Type", { options: TASK_TYPES, required: true })}
              {fi("dueDate", "date", "Due date")}
              {fi("priority", "select", "Priority", { options: PRIORITIES })}
              {fi("status", "select", "Status", { options: TASK_STATUSES, required: true })}
              {fi("assigneeId", "user", "Assigned to")}
              {fi("contactId", "ref", "Contact")}
            </div>
          </>)}
          {kind === "call" && (<>
            {fi("subject", "text", "Subject", { required: true })}
            <div className="grid gap-3 sm:grid-cols-2">
              {fi("direction", "select", "Direction", { options: CALL_DIRECTIONS, required: true })}
              {fi("status", "select", "Status", { options: CALL_STATUSES, required: true })}
              {fi("scheduledAt", "datetime", status === "Completed" ? "Call time" : "Scheduled for", { required: true })}
              {fi("durationMin", "number", "Duration (min)")}
              {fi("outcome", "select", "Outcome", { options: CALL_OUTCOMES, required: status === "Completed" })}
              {fi("phone", "phone", "Phone number")}
              {fi("contactId", "ref", "Contact")}
              {fi("ownerId", "user", "Owner")}
            </div>
          </>)}
          {kind === "meeting" && (<>
            {fi("title", "text", "Title", { required: true })}
            <div className="grid gap-3 sm:grid-cols-2">
              {fi("startAt", "datetime", "Starts", { required: true })}
              {fi("endAt", "datetime", "Ends", { required: true })}
              {fi("status", "select", "Status", { options: MEETING_STATUSES, required: true })}
              {fi("location", "text", "Location or link")}
              {fi("ownerId", "user", "Owner")}
            </div>
            <Controller control={control} name="participantContactIds" render={({ field }) => <MultiPick label="Contact participants" options={contactOptions} value={field.value ?? []} onChange={field.onChange} />} />
            <Controller control={control} name="participantUserIds" render={({ field }) => <MultiPick label="Team participants" options={userOptions} value={field.value ?? []} onChange={field.onChange} />} />
          </>)}
          <RelatedPicker control={control} error={err("related")} />
          {fi("description", "textarea", kind === "meeting" ? "Agenda" : kind === "call" ? "Notes" : "Description")}
          {kind === "meeting" && status === "Completed" && fi("outcome", "textarea", "Outcome")}
        </form>
      )}
    </FormDrawer>
  );
}

/* ───────── log an email (no email integration: this records an email sent/received elsewhere) ───────── */
export function EmailLogForm({ related, onClose }: { related: RecordRef; onClose: () => void }) {
  const act = useActivityActions();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FieldValues>({
    resolver: zodResolver(EmailLogInput) as unknown as Resolver<FieldValues>, mode: "onTouched",
    defaultValues: { related, direction: "Sent", to: "", subject: "", body: "", at: nowLocal() },
  });
  const { control, handleSubmit, formState: { errors, isDirty, isSubmitting } } = form;
  const err = (n: string) => (errors as Record<string, { message?: string }>)[n]?.message;
  const submit = handleSubmit(async (v) => {
    setFormError(null);
    try { await act.logEmail.mutateAsync([{ ...v, at: fromLocalInput(v.at) }]); onClose(); }
    catch (e) { setFormError(e instanceof Error ? e.message : "Could not save."); }
  });
  return (
    <FormDrawer open onClose={onClose} dirty={isDirty} submitting={isSubmitting} formId="email-form" submitLabel="Log email" title="Log an email" description="EVOQ CRM does not send email yet. Record an email you sent or received so it appears in the history.">
      <form id="email-form" onSubmit={submit} noValidate className="space-y-3">
        {formError && <div role="alert" className="rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg">{formError}</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldInput def={{ type: "select", label: "Direction", options: ["Sent", "Received"] }} name="direction" control={control} required />
          <FieldInput def={{ type: "datetime", label: "Date and time" }} name="at" control={control} error={err("at")} required />
        </div>
        <FieldInput def={{ type: "text", label: "To / from" }} name="to" control={control} error={err("to")} />
        <FieldInput def={{ type: "text", label: "Subject" }} name="subject" control={control} error={err("subject")} required />
        <FieldInput def={{ type: "textarea", label: "Message (optional)" }} name="body" control={control} error={err("body")} />
      </form>
    </FormDrawer>
  );
}

/* ───────── add note (quick) ───────── */
export function NoteForm({ related, onClose }: { related: RecordRef; onClose: () => void }) {
  const act = useActivityActions();
  const form = useForm<{ body: string }>({ resolver: zodResolver(NoteInput.pick({ body: true })) as unknown as Resolver<{ body: string }>, defaultValues: { body: "" } });
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = form;
  const submit = handleSubmit(async (v) => { await act.addNote.mutateAsync([{ related, body: v.body }]); onClose(); });
  return (
    <FormDrawer open onClose={onClose} dirty={isDirty} submitting={isSubmitting} formId="note-form" submitLabel="Add note" title="Add a note" width="sm:max-w-md">
      <form id="note-form" onSubmit={submit} noValidate>
        <Field label="Note" htmlFor="note-body" error={errors.body?.message}>
          <Textarea id="note-body" rows={8} autoFocus aria-invalid={!!errors.body} {...register("body")} />
        </Field>
      </form>
    </FormDrawer>
  );
}
