"use client";

import { useForms } from "./create-context";
import { RecordForm } from "./record-form";
import { ActivityForm, EmailLogForm, NoteForm } from "./activity-forms";
import { ConvertLeadForm } from "./convert-lead";

/** Renders whichever drawer was requested via useForms(). Mounted once in the app shell. */
export function CreateHost() {
  const { request: r, close } = useForms();
  if (!r) return null;
  // key = request identity so each open starts with fresh form state
  const key = JSON.stringify(r);
  switch (r.kind) {
    case "record": return <RecordForm key={key} module={r.module} id={r.id} defaults={r.defaults} onClose={close} />;
    case "task": return <ActivityForm key={key} kind="task" id={r.id} related={r.related} defaults={r.defaults} onClose={close} />;
    case "call": return <ActivityForm key={key} kind="call" id={r.id} related={r.related} defaults={r.defaults} onClose={close} />;
    case "meeting": return <ActivityForm key={key} kind="meeting" id={r.id} related={r.related} defaults={r.defaults} onClose={close} />;
    case "email": return <EmailLogForm key={key} related={r.related} onClose={close} />;
    case "note": return <NoteForm key={key} related={r.related} onClose={close} />;
    case "convert": return <ConvertLeadForm key={key} leadId={r.leadId} onClose={close} />;
  }
}
