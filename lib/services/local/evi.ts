import type { AgentAction, RecordRef } from "@/lib/schemas";
import { PermissionError, can, type PermModule } from "@/lib/domain/permissions";
import { intelligenceFor } from "@/lib/domain/intelligence";
import { personName, recordTitle } from "@/lib/domain/names";
import { nowIso } from "@/lib/domain/clock";
import { date, money, relative } from "@/lib/domain/format";
import { commit, getDb, nextId } from "./store";
import { activities, me, NotFoundError, ValidationError } from "./api";

/**
 * EVI (contextual assistant) — LOCAL ADAPTER.
 *
 * HONEST STATUS: no language model is connected. Everything here is deterministic and grounded
 * in the record's own data (same rules as health / next action / attention). Every answer lists
 * its sources. Replace `ask()` and `propose()` with the EVI backend; the approval workflow,
 * audit history and permission checks below stay in place.
 *
 * Agent safety rules enforced here (not just in the UI):
 *  - proposals are inert until a user with the right permission approves them;
 *  - nothing is sent: "draft_email" only prepares text and, on approval, LOGS a draft note — no outbound email;
 *  - every transition is appended to the action's history; failures are retryable;
 *  - proposals cannot be approved by someone without permission on the affected module.
 */
const PERM: Record<string, PermModule> = { leads: "Leads", contacts: "Contacts", accounts: "Accounts", deals: "Deals" };

export interface EviAnswer {
  text: string;
  bullets: string[];
  sources: { label: string; ref: RecordRef | null }[];
  missing: string[];
}

function ctx(ref: RecordRef) {
  const db = getDb();
  const user = me(db);
  if (!can(db, user, PERM[ref.module], "read")) throw new PermissionError(PERM[ref.module], "read");
  const rec = (db[ref.module] as { id: string }[]).find((r) => r.id === ref.id);
  if (!rec) throw new NotFoundError("Record");
  return { db, user, rec, intel: intelligenceFor(db, ref), title: recordTitle(ref.module, rec as never) };
}

export const evi = {
  async ask(ref: RecordRef, question: string): Promise<EviAnswer> {
    const { db, rec, intel, title } = ctx(ref);
    const q = question.toLowerCase();
    const src = (label: string): EviAnswer["sources"][number] => ({ label, ref });
    const history = intel.items.filter((i) => !i.open && i.kind !== "history").slice(0, 5);
    const missing: string[] = [];
    const r = rec as Record<string, unknown>;
    if (ref.module === "leads") {
      if (!r.email && !r.phone && !r.mobile) missing.push("No email or phone number");
      if (!r.company) missing.push("Company");
      if (!r.title) missing.push("Job title");
      if (!r.rating) missing.push("Rating");
      if (!r.leadSource) missing.push("Lead source");
    }
    if (ref.module === "deals") {
      if (!r.contactId) missing.push("No contact linked");
      if (!r.nextStep && !intel.nextAction) missing.push("Next step");
    }
    if (!intel.nextAction) missing.push("No next action planned");

    if (/why|health|score|rating/.test(q) && intel.health) {
      const h = intel.health;
      return {
        text: h.state === "scored" ? `${title} is scored ${h.score}/100 (${h.band}${h.overridden ? `, overridden — calculated ${h.computedBand}` : ""}).` : h.summary,
        bullets: h.factors.map((f) => `${f.label}: ${f.points}/${f.max} — ${f.detail}`),
        sources: [src(`${title} · health rules`)], missing,
      };
    }
    if (/missing|incomplete|gap|information/.test(q)) {
      return { text: missing.length ? `${title} is missing ${missing.length} thing${missing.length > 1 ? "s" : ""}.` : `${title} has the key details filled in.`, bullets: missing, sources: [src(`${title} · record fields`)], missing };
    }
    if (/next|follow|do|action|suggest/.test(q)) {
      const props = await propose(ref);
      return {
        text: props.length ? `Here is what I would suggest for ${title}. Nothing happens until you approve it.` : `Nothing needs doing on ${title} right now.`,
        bullets: props.map((p) => p.title + " — " + p.rationale), sources: [src(`${title} · attention rules`)], missing,
      };
    }
    // default: summary
    const bullets: string[] = [];
    if (ref.module === "leads") bullets.push(`Status ${r.status}${r.rating ? `, rated ${r.rating}` : ""}${r.company ? `, at ${r.company}` : ""}.`);
    if (ref.module === "deals") bullets.push(`${money(r.amount as number)} at ${r.stage} (${r.probability}%), closing ${date(r.closingDate as string)}.`);
    bullets.push(intel.lastInteraction ? `Last interaction: ${intel.lastInteraction.kind} "${intel.lastInteraction.title}" ${relative(intel.lastInteraction.at)}.` : "No interaction has been logged yet.");
    bullets.push(intel.nextAction ? `Next action: ${intel.nextAction.title}${intel.nextAction.dueAt ? ` (${intel.nextAction.overdue ? "overdue, was due" : "due"} ${relative(intel.nextAction.dueAt)})` : ""}.` : "There is no next action.");
    intel.attention.forEach((a) => bullets.push(`Needs attention — ${a.label}: ${a.reason}.`));
    history.forEach((h) => bullets.push(`${h.kind}: ${h.title}${h.summary ? ` — ${h.summary.slice(0, 120)}` : ""}`));
    void db;
    return { text: `Summary of ${title}, from the data in this record.`, bullets, sources: [src(`${title} · record and activity`)], missing };
  },

  async propose(ref: RecordRef) { return propose(ref); },

  async list(ref?: RecordRef) {
    const db = getDb();
    me(db);
    return db.agentActions.filter((a) => !ref || (a.related.module === ref.module && a.related.id === ref.id)).sort((a, b) => b.proposedAt.localeCompare(a.proposedAt));
  },

  async decide(id: string, decision: "approve" | "reject") {
    return commit((d) => {
      const user = me(d);
      const cur = d.agentActions.find((a) => a.id === id);
      if (!cur) throw new NotFoundError("Proposal");
      if (cur.status !== "proposed") throw new ValidationError(`This proposal is already ${cur.status}.`);
      if (!can(d, user, PERM[cur.related.module], "update")) throw new PermissionError(PERM[cur.related.module], "update");
      const ts = nowIso();
      const next: AgentAction = { ...cur, status: decision === "approve" ? "approved" : "rejected", decidedBy: user.id, decidedAt: ts, history: [...cur.history, { at: ts, by: user.name, event: decision === "approve" ? "Approved" : "Rejected" }] };
      d.agentActions = d.agentActions.map((a) => (a.id === id ? next : a));
      return next;
    });
  },

  /** Run an approved (or failed, for retry) action. Executes through the same service layer as manual work. */
  async execute(id: string) {
    const db = getDb();
    const cur = db.agentActions.find((a) => a.id === id);
    if (!cur) throw new NotFoundError("Proposal");
    if (cur.status !== "approved" && cur.status !== "failed") throw new ValidationError("Only approved actions can run.");
    const mark = (patch: Partial<AgentAction>, event: string) => commit((d) => {
      d.agentActions = d.agentActions.map((a) => (a.id === id ? { ...a, ...patch, history: [...a.history, { at: nowIso(), by: "EVI agent", event }] } : a));
    });
    mark({ status: "running", attempts: cur.attempts + 1, error: null }, `Started (attempt ${cur.attempts + 1})`);
    try {
      const p = cur.payload as Record<string, unknown>;
      let result = "";
      if (cur.kind === "create_task") {
        const t = await activities.createTask({ subject: p.subject, type: "Task", dueDate: p.dueDate ?? null, status: "To-Do", priority: p.priority ?? null, ownerId: me(getDb()).id, assigneeId: p.assigneeId ?? me(getDb()).id, contactId: null, related: cur.related, description: `Created by EVI agent after approval. ${cur.rationale}` });
        result = `Task #${t.id} created`;
      } else if (cur.kind === "set_priority") {
        if (cur.related.module !== "leads") throw new ValidationError("Priority applies to leads only.");
        const { leads } = await import("./api");
        await leads.update(cur.related.id, { priority: p.priority });
        result = `Priority set to ${String(p.priority)}`;
      } else if (cur.kind === "draft_email") {
        // Draft only — deliberately NOT sent. Saved as a note so the rep can copy it into their mail client.
        await activities.addNote({ related: cur.related, body: `EMAIL DRAFT (not sent)\nSubject: ${String(p.subject)}\n\n${String(p.body)}` });
        result = "Draft saved as a note. Nothing was sent.";
      } else if (cur.kind === "schedule_meeting") {
        const start = new Date(String(p.startAt));
        const m = await activities.createMeeting({ title: p.title, startAt: start.toISOString(), endAt: new Date(start.getTime() + 30 * 60_000).toISOString(), location: "", status: "Scheduled", ownerId: me(getDb()).id, participantContactIds: [], participantUserIds: [], related: cur.related, description: cur.rationale, outcome: "" });
        result = `Meeting #${m.id} scheduled`;
      }
      mark({ status: "succeeded", result }, result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      mark({ status: "failed", error: msg }, `Failed: ${msg}`);
    }
    return getDb().agentActions.find((a) => a.id === id)!;
  },
};

async function propose(ref: RecordRef): Promise<AgentAction[]> {
  const { db, user, rec, intel, title } = ctx(ref);
  if (!can(db, user, PERM[ref.module], "update")) return [];
  const drafts: Omit<AgentAction, "id" | "proposedAt" | "requestedBy" | "status" | "decidedBy" | "decidedAt" | "attempts" | "result" | "error" | "history">[] = [];
  const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const has = (code: string) => intel.attention.some((a) => a.code === code);
  const r = rec as Record<string, unknown>;
  if (has("no_next_action") || has("no_recent_activity")) {
    drafts.push({ kind: "create_task", related: ref, title: `Create follow-up task for ${title}`, rationale: has("no_recent_activity") ? "No recent interaction and nothing planned." : "Nothing is planned for this record.", payload: { subject: `Follow up with ${title}`, dueDate: addDays(2), priority: "Medium" } });
  }
  if (has("overdue_follow_up")) {
    drafts.push({ kind: "create_task", related: ref, title: `Reschedule overdue follow-up for ${title}`, rationale: `"${intel.nextAction?.title}" is overdue.`, payload: { subject: `Re-engage ${title}`, dueDate: addDays(1), priority: "High" } });
  }
  if (ref.module === "leads" && !r.priority && intel.health?.band === "At risk") {
    drafts.push({ kind: "set_priority", related: ref, title: `Set ${title} to High priority`, rationale: `Health is At risk (${intel.health.score}/100).`, payload: { priority: "High" } });
  }
  if ((ref.module === "leads" || ref.module === "contacts") && r.email && !r.emailOptOut && (has("no_recent_activity") || has("overdue_follow_up"))) {
    const first = (r.firstName as string) || personName(rec as never);
    drafts.push({ kind: "draft_email", related: ref, title: `Draft a check-in email to ${title}`, rationale: "Contact has an email address and has gone quiet. The draft is saved as a note; it is never sent automatically.", payload: { subject: "Checking in", body: `Hi ${first},\n\nI wanted to follow up and see whether you had any questions. Happy to find a time to talk.\n\nBest regards,\n${user.name}` } });
  }
  if (!drafts.length) return [];
  return commit((d) => {
    const existing = d.agentActions.filter((a) => a.status === "proposed" && a.related.module === ref.module && a.related.id === ref.id);
    const created: AgentAction[] = [];
    for (const x of drafts) {
      if (existing.some((e) => e.kind === x.kind && e.title === x.title)) continue; // no duplicate proposals
      const ts = nowIso();
      created.push({ ...x, id: nextId(d, "agentActions"), status: "proposed", proposedAt: ts, requestedBy: user.id, decidedBy: null, decidedAt: null, attempts: 0, result: null, error: null, history: [{ at: ts, by: "EVI agent", event: "Proposed" }] });
    }
    d.agentActions = [...d.agentActions, ...created];
    return [...existing, ...created];
  });
}
