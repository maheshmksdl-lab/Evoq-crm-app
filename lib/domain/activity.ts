import type { Db, RecordRef } from "@/lib/schemas";
import { endOfDay, now } from "./clock";

/**
 * Unified activity model (handoff §5 "Unified activity").
 *
 * - Sources: tasks, calls, meetings, notes, comments, attachments, logged emails and
 *   audit events (record history). Each stays in its own collection/module; this layer
 *   only aggregates them for a record stream.
 * - Ordering: upcoming items (open tasks, scheduled calls/meetings) by due time ascending;
 *   history by occurrence time descending.
 * - Aggregation: Accounts include their contacts' and deals' activity; Contacts include
 *   activity on their deals and items that name them as contact/participant. Each item keeps
 *   `via` so the UI can say where it came from. Items are de-duplicated by source id.
 * - "Interaction" = a customer touchpoint: completed call, completed meeting, logged email,
 *   completed task. Notes/comments/attachments/history are internal and never count.
 */
export type ActivityKind = "task" | "call" | "meeting" | "note" | "comment" | "attachment" | "email" | "history";

export interface ActivityItem {
  key: string;
  kind: ActivityKind;
  sourceId: string;
  ref: RecordRef | null;
  /** Set when aggregated from a related record rather than this one. */
  via: RecordRef | null;
  at: number;
  title: string;
  summary: string;
  ownerId: string | null;
  status: string | null;
  open: boolean;
  dueAt: number | null;
  overdue: boolean;
  interaction: boolean;
}

const sameRef = (a: RecordRef | null | undefined, b: RecordRef) => !!a && a.module === b.module && a.id === b.id;

/** All refs whose activity belongs on `ref`'s stream, with the ref itself first. */
export function streamRefs(db: Db, ref: RecordRef): RecordRef[] {
  const refs: RecordRef[] = [ref];
  if (ref.module === "accounts") {
    db.contacts.filter((c) => c.accountId === ref.id).forEach((c) => refs.push({ module: "contacts", id: c.id }));
    db.deals.filter((d) => d.accountId === ref.id).forEach((d) => refs.push({ module: "deals", id: d.id }));
  }
  if (ref.module === "contacts") {
    db.deals.filter((d) => d.contactId === ref.id).forEach((d) => refs.push({ module: "deals", id: d.id }));
  }
  return refs;
}

/* Per-snapshot index: the store replaces the Db object on every write, so a WeakMap keyed
 * by the snapshot gives O(1) lookups per record without stale data. */
type Bucket = {
  tasks: Db["tasks"]; calls: Db["calls"]; meetings: Db["meetings"]; notes: Db["notes"];
  comments: Db["comments"]; attachments: Db["attachments"]; emails: Db["emails"]; audit: Db["audit"];
};
const newBucket = (): Bucket => ({ tasks: [], calls: [], meetings: [], notes: [], comments: [], attachments: [], emails: [], audit: [] });
const indexCache = new WeakMap<Db, Map<string, Bucket>>();
const rk = (r: RecordRef) => `${r.module}:${r.id}`;
function indexOf(db: Db) {
  const cached = indexCache.get(db);
  if (cached) return cached;
  const idx = new Map<string, Bucket>();
  const get = (key: string) => {
    let b = idx.get(key);
    if (!b) idx.set(key, (b = newBucket()));
    return b;
  };
  for (const x of db.tasks) { if (x.related) get(rk(x.related)).tasks.push(x); if (x.contactId) get(`contacts:${x.contactId}`).tasks.push(x); }
  for (const x of db.calls) { if (x.related) get(rk(x.related)).calls.push(x); if (x.contactId) get(`contacts:${x.contactId}`).calls.push(x); }
  for (const x of db.meetings) { if (x.related) get(rk(x.related)).meetings.push(x); x.participantContactIds.forEach((c) => get(`contacts:${c}`).meetings.push(x)); }
  for (const x of db.notes) get(rk(x.related)).notes.push(x);
  for (const x of db.comments) get(rk(x.related)).comments.push(x);
  for (const x of db.attachments) get(rk(x.related)).attachments.push(x);
  for (const x of db.emails) get(rk(x.related)).emails.push(x);
  for (const x of db.audit) get(rk(x.related)).audit.push(x);
  indexCache.set(db, idx);
  return idx;
}

export function activitiesFor(db: Db, ref: RecordRef): ActivityItem[] {
  const refs = streamRefs(db, ref);
  const idx = indexOf(db);
  const buckets = refs.map((r) => idx.get(rk(r)) ?? newBucket());
  function pool<K extends keyof Bucket>(k: K): Bucket[K] {
    return [...new Set(buckets.flatMap((b) => b[k] as unknown[]))] as Bucket[K];
  }
  const owner = (r: RecordRef | null) => refs.find((x) => sameRef(r, x)) ?? null;
  const viaOf = (r: RecordRef | null) => (r && !sameRef(r, ref) ? r : null);
  const t = now();
  const items = new Map<string, ActivityItem>();
  const add = (i: ActivityItem) => items.set(i.key, i);

  const contactLinked = (contactId: string | null) => ref.module === "contacts" && contactId === ref.id;

  for (const k of pool("tasks")) {
    const r = owner(k.related);
    if (!r && !contactLinked(k.contactId)) continue;
    const open = k.status !== "Completed";
    const dueAt = k.dueDate ? endOfDay(k.dueDate) : null;
    add({
      key: `task:${k.id}`, kind: "task", sourceId: k.id, ref: k.related, via: viaOf(r), title: k.subject,
      summary: [k.type !== "Task" ? k.type : null, k.priority ? `${k.priority} priority` : null, k.description || null].filter(Boolean).join(" · "),
      at: k.completedAt ? Date.parse(k.completedAt) : dueAt ?? Date.parse(k.createdAt), ownerId: k.assigneeId ?? k.ownerId,
      status: k.status ?? "No status", open, dueAt, overdue: open && dueAt !== null && dueAt < t, interaction: !open,
    });
  }
  for (const c of pool("calls")) {
    const r = owner(c.related);
    if (!r && !contactLinked(c.contactId)) continue;
    const open = c.status === "Scheduled";
    const at = c.completedAt ? Date.parse(c.completedAt) : Date.parse(c.scheduledAt);
    add({
      key: `call:${c.id}`, kind: "call", sourceId: c.id, ref: c.related, via: viaOf(r), title: c.subject,
      summary: [c.direction, c.outcome || null, c.durationMin ? `${c.durationMin} min` : null, c.description || null].filter(Boolean).join(" · "),
      at, ownerId: c.ownerId, status: c.status, open, dueAt: open ? Date.parse(c.scheduledAt) : null,
      overdue: open && Date.parse(c.scheduledAt) < t, interaction: c.status === "Completed",
    });
  }
  for (const m of pool("meetings")) {
    const r = owner(m.related);
    if (!r && !(ref.module === "contacts" && m.participantContactIds.includes(ref.id))) continue;
    const open = m.status === "Scheduled";
    add({
      key: `meeting:${m.id}`, kind: "meeting", sourceId: m.id, ref: m.related, via: viaOf(r), title: m.title,
      summary: [m.location || null, m.participantContactIds.length + m.participantUserIds.length ? `${m.participantContactIds.length + m.participantUserIds.length} participants` : null, m.outcome || m.description || null].filter(Boolean).join(" · "),
      at: Date.parse(m.startAt), ownerId: m.ownerId, status: m.status, open, dueAt: open ? Date.parse(m.startAt) : null,
      overdue: open && Date.parse(m.endAt) < t, interaction: m.status === "Completed",
    });
  }
  for (const n of pool("notes")) {
    const r = owner(n.related);
    if (!r) continue;
    add({ key: `note:${n.id}`, kind: "note", sourceId: n.id, ref: n.related, via: viaOf(r), title: "Note", summary: n.body, at: Date.parse(n.createdAt), ownerId: n.authorId, status: null, open: false, dueAt: null, overdue: false, interaction: false });
  }
  for (const c of pool("comments")) {
    const r = owner(c.related);
    if (!r) continue;
    add({ key: `comment:${c.id}`, kind: "comment", sourceId: c.id, ref: c.related, via: viaOf(r), title: "Comment", summary: c.body, at: Date.parse(c.createdAt), ownerId: c.authorId, status: null, open: false, dueAt: null, overdue: false, interaction: false });
  }
  for (const a of pool("attachments")) {
    const r = owner(a.related);
    if (!r) continue;
    add({ key: `attachment:${a.id}`, kind: "attachment", sourceId: a.id, ref: a.related, via: viaOf(r), title: a.name, summary: `${Math.max(1, Math.round(a.size / 1024))} KB`, at: Date.parse(a.createdAt), ownerId: a.uploadedBy, status: null, open: false, dueAt: null, overdue: false, interaction: false });
  }
  for (const e of pool("emails")) {
    const r = owner(e.related);
    if (!r) continue;
    add({ key: `email:${e.id}`, kind: "email", sourceId: e.id, ref: e.related, via: viaOf(r), title: e.subject, summary: `${e.direction === "Sent" ? "Sent to" : "Received from"} ${e.to || "—"}${e.body ? ` · ${e.body}` : ""}`, at: Date.parse(e.at), ownerId: e.ownerId, status: e.direction, open: false, dueAt: null, overdue: false, interaction: true });
  }
  for (const h of pool("audit")) {
    if (!sameRef(h.related, ref)) continue; // history is only shown for the record itself
    add({ key: `history:${h.id}`, kind: "history", sourceId: h.id, ref: h.related, via: null, title: historyTitle(h.action), summary: h.changes.map((c) => `${c.field}: ${c.from || "—"} → ${c.to || "—"}`).join(" · "), at: Date.parse(h.at), ownerId: h.by, status: null, open: false, dueAt: null, overdue: false, interaction: false });
  }
  if (ref.module === "deals") {
    const deal = db.deals.find((d) => d.id === ref.id);
    deal?.stageHistory.forEach((s, i) => add({
      key: `stage:${deal.id}:${i}`, kind: "history", sourceId: `${deal.id}:${i}`, ref, via: null,
      title: s.from ? "Stage changed" : "Deal created", summary: `${s.from ? `${s.from} → ` : ""}${s.to} · probability ${s.probabilityFrom ?? 0}% → ${s.probabilityTo}%`,
      at: Date.parse(s.at), ownerId: s.by, status: null, open: false, dueAt: null, overdue: false, interaction: false,
    }));
  }
  return [...items.values()];
}

function historyTitle(a: string) {
  return ({
    created: "Record created", updated: "Record updated", status_changed: "Status changed", stage_changed: "Stage changed",
    owner_changed: "Owner changed", converted: "Lead converted", health_override: "Health overridden", deleted_activity: "Activity removed",
  } as Record<string, string>)[a] ?? a;
}

export function splitStream(items: ActivityItem[]) {
  const upcoming = items.filter((i) => i.open).sort((a, b) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
  const history = items.filter((i) => !i.open).sort((a, b) => b.at - a.at);
  return { upcoming, history };
}

export function lastInteraction(items: ActivityItem[]): ActivityItem | null {
  return items.filter((i) => i.interaction && i.at <= now()).sort((a, b) => b.at - a.at)[0] ?? null;
}
