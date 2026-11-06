import type { Db, Deal, HealthBand, Lead, RecordRef } from "@/lib/schemas";
import { LEAD_CLOSED_STATUSES } from "@/lib/schemas/options";
import { activitiesFor, lastInteraction, type ActivityItem } from "./activity";
import { DAY_MS, RULES } from "./rules-config";
import { now } from "./clock";

/* ════════════════════════ NEXT ACTION ════════════════════════
 * Canonical next action for a lead/deal/contact/account.
 * Precedence (documented product rule):
 *   1. Open dated items on this record — tasks (by due date, end of day), scheduled calls
 *      (by scheduled time), scheduled meetings (by start) — the EARLIEST wins. Overdue items
 *      are earliest by definition, so an overdue follow-up always surfaces first.
 *   2. Open undated tasks — oldest first.
 *   3. Deals only: the manual "Next step" text field (no date, so never overdue).
 * Items aggregated from related records (an account's contacts/deals) are NOT used —
 * a next action must belong to the record itself so ownership is unambiguous.
 */
export interface NextAction {
  source: "task" | "call" | "meeting" | "manual";
  sourceId: string | null;
  title: string;
  dueAt: number | null;
  ownerId: string | null;
  overdue: boolean;
  href: string | null;
}

export function nextActionFrom(items: ActivityItem[], deal?: Deal | null): NextAction | null {
  const own = items.filter((i) => i.open && !i.via && (i.kind === "task" || i.kind === "call" || i.kind === "meeting"));
  const dated = own.filter((i) => i.dueAt !== null).sort((a, b) => a.dueAt! - b.dueAt!);
  const undated = own.filter((i) => i.dueAt === null).sort((a, b) => a.at - b.at);
  const pick = dated[0] ?? undated[0];
  if (pick) {
    return {
      source: pick.kind as NextAction["source"], sourceId: pick.sourceId, title: pick.title, dueAt: pick.dueAt,
      ownerId: pick.ownerId, overdue: pick.overdue, href: `/${pick.kind}s/${pick.sourceId}`,
    };
  }
  if (deal?.nextStep) {
    return { source: "manual", sourceId: null, title: deal.nextStep, dueAt: null, ownerId: deal.ownerId, overdue: false, href: null };
  }
  return null;
}

/* ════════════════════════ LEAD HEALTH ════════════════════════
 * Explainable 0–100 score. Inputs, points and thresholds live in RULES.health.
 * Refresh: recomputed on every read, so it is always as fresh as the data (computedAt).
 * Not scored: Lost/Unqualified/converted leads ("Closed"), or fewer than RULES.health.minSignals
 * of {rating, any interaction, a contact channel} ("Insufficient data").
 * Manual override: a user may set the band with a reason; score and factors stay visible
 * beside the override and the change is written to the record history.
 */
export interface HealthFactor { label: string; points: number; max: number; detail: string }
export type HealthState = "scored" | "insufficient" | "closed";
export interface LeadHealth {
  state: HealthState;
  score: number | null;
  band: HealthBand | null;
  computedBand: HealthBand | null;
  overridden: boolean;
  factors: HealthFactor[];
  computedAt: number;
  summary: string;
}

export function bandFor(score: number): HealthBand {
  if (score >= RULES.health.bands.healthy) return "Healthy";
  if (score >= RULES.health.bands.watch) return "Watch";
  return "At risk";
}

export function leadHealth(lead: Lead, items: ActivityItem[]): LeadHealth {
  const computedAt = now();
  if (lead.converted || (LEAD_CLOSED_STATUSES as readonly string[]).includes(lead.status)) {
    return { state: "closed", score: null, band: null, computedBand: null, overridden: false, factors: [], computedAt, summary: lead.converted ? "Converted — health no longer tracked" : `${lead.status} — health not tracked` };
  }
  const H = RULES.health;
  const last = lastInteraction(items);
  const next = nextActionFrom(items);
  const reachable = Boolean(lead.email || lead.phone || lead.mobile);
  const signals = [Boolean(lead.rating), Boolean(last), reachable].filter(Boolean).length;
  if (signals < H.minSignals) {
    return {
      state: "insufficient", score: null, band: lead.healthOverride?.band ?? null, computedBand: null, overridden: Boolean(lead.healthOverride),
      factors: [], computedAt, summary: `Not enough information to score — needs at least ${H.minSignals} of: rating, a logged interaction, an email or phone number.`,
    };
  }

  const factors: HealthFactor[] = [];
  const ratingPts = H.rating[lead.rating] ?? 0;
  factors.push({ label: "Rating", points: ratingPts, max: 25, detail: lead.rating ? `Rated ${lead.rating}` : "No rating set" });

  let recencyPts = 0;
  let recencyDetail = "No interaction logged";
  if (last) {
    const days = Math.floor((computedAt - last.at) / DAY_MS);
    recencyPts = H.recency.find((r) => days <= r.withinDays)?.points ?? 0;
    recencyDetail = `Last interaction ${days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} ago`} (${last.kind})`;
  }
  factors.push({ label: "Recent interaction", points: recencyPts, max: 25, detail: recencyDetail });

  const nextPts = next && !next.overdue ? H.nextActionScheduled : 0;
  factors.push({ label: "Next action", points: nextPts, max: H.nextActionScheduled, detail: !next ? "No next action planned" : next.overdue ? `Overdue: ${next.title}` : `Planned: ${next.title}` });

  const pipePts = H.pipeline[lead.status] ?? 0;
  factors.push({ label: "Progress", points: pipePts, max: 15, detail: `Status ${lead.status}` });

  factors.push({ label: "Reachable", points: reachable ? H.reachable : 0, max: H.reachable, detail: reachable ? "Email or phone on file" : "No email or phone" });

  const complete = Boolean(lead.company && lead.title);
  factors.push({ label: "Profile", points: complete ? H.profileComplete : 0, max: H.profileComplete, detail: complete ? "Company and title known" : "Company or title missing" });

  const score = factors.reduce((s, f) => s + f.points, 0);
  const computedBand = bandFor(score);
  const band = lead.healthOverride?.band ?? computedBand;
  const weakest = [...factors].sort((a, b) => (a.points / a.max) - (b.points / b.max))[0];
  return {
    state: "scored", score, band, computedBand, overridden: Boolean(lead.healthOverride), factors, computedAt,
    summary: `${score}/100 · ${computedBand}${weakest && weakest.points < weakest.max ? ` · weakest: ${weakest.label.toLowerCase()} (${weakest.detail.toLowerCase()})` : ""}`,
  };
}

/* ════════════════════════ ATTENTION DETECTION ════════════════════════
 * Each rule has a stable code, a plain-language reason and a corrective action.
 * Only evaluated for OPEN records (leads not Lost/Unqualified/converted; deals not Closed Won).
 */
export type AttentionCode = "overdue_follow_up" | "no_owner" | "no_next_action" | "no_recent_activity" | "stalled";
export interface Attention {
  code: AttentionCode;
  label: string;
  reason: string;
  action: string;
  /** what the corrective action should open */
  fix: "open_next_action" | "assign_owner" | "plan_next_action" | "log_activity" | "advance_stage";
  href: string | null;
  severity: "high" | "medium";
}

export const ATTENTION_RULES: Record<AttentionCode, string> = {
  overdue_follow_up: "The next action's due time has passed and it is not complete.",
  no_owner: "The record has no owner.",
  no_next_action: "The record is open but has no open task, scheduled call/meeting (or, for deals, Next step).",
  no_recent_activity: `No completed call, meeting, logged email or completed task in the last ${RULES.staleAfterDays} days (records younger than ${RULES.graceDaysForNewRecords} days are exempt).`,
  stalled: `Lead status / deal stage unchanged for more than ${RULES.stalledAfterDays} days.`,
};

export function attentionFor(
  kind: "lead" | "deal",
  rec: { ownerId: string | null; createdAt: string; changedAt: string; stageLabel: string },
  items: ActivityItem[],
  next: NextAction | null,
): Attention[] {
  const t = now();
  const out: Attention[] = [];
  if (next?.overdue) {
    out.push({ code: "overdue_follow_up", label: "Overdue follow-up", reason: `"${next.title}" was due ${relDays(t - (next.dueAt ?? t))}`, action: "Complete or reschedule", fix: "open_next_action", href: next.href, severity: "high" });
  }
  if (!rec.ownerId) out.push({ code: "no_owner", label: "No owner", reason: "Nobody is responsible for this record", action: "Assign an owner", fix: "assign_owner", href: null, severity: "high" });
  if (!next) out.push({ code: "no_next_action", label: "No next action", reason: "Nothing is planned for this record", action: "Plan the next step", fix: "plan_next_action", href: null, severity: "medium" });
  const age = t - Date.parse(rec.createdAt);
  if (age > RULES.graceDaysForNewRecords * DAY_MS) {
    const last = lastInteraction(items);
    const since = last ? t - last.at : age;
    if (since > RULES.staleAfterDays * DAY_MS) {
      out.push({ code: "no_recent_activity", label: "No recent activity", reason: last ? `Last interaction ${relDays(since)}` : "No interaction has ever been logged", action: "Log a call, email or meeting", fix: "log_activity", href: null, severity: "medium" });
    }
  }
  const unchanged = t - Date.parse(rec.changedAt);
  if (unchanged > RULES.stalledAfterDays * DAY_MS) {
    out.push({ code: "stalled", label: kind === "deal" ? "Stalled deal" : "Stalled lead", reason: `In ${rec.stageLabel} for ${Math.floor(unchanged / DAY_MS)} days`, action: kind === "deal" ? "Review the stage" : "Review the status", fix: "advance_stage", href: null, severity: "medium" });
  }
  return out;
}

function relDays(ms: number) {
  const d = Math.floor(ms / DAY_MS);
  if (d <= 0) return "today";
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/* ════════════════════════ per-record bundle ════════════════════════ */
export interface Intelligence {
  items: ActivityItem[];
  lastInteraction: ActivityItem | null;
  nextAction: NextAction | null;
  attention: Attention[];
  health: LeadHealth | null;
}

export function isLeadOpen(l: Lead) {
  return !l.converted && !(LEAD_CLOSED_STATUSES as readonly string[]).includes(l.status);
}
export function isDealOpen(d: Deal) {
  return d.stage !== "Closed Won";
}

export function intelligenceFor(db: Db, ref: RecordRef): Intelligence {
  const items = activitiesFor(db, ref);
  const last = lastInteraction(items);
  if (ref.module === "leads") {
    const lead = db.leads.find((l) => l.id === ref.id);
    const next = nextActionFrom(items);
    const health = lead ? leadHealth(lead, items) : null;
    const attention = lead && isLeadOpen(lead)
      ? attentionFor("lead", { ownerId: lead.ownerId, createdAt: lead.createdAt, changedAt: lead.statusChangedAt, stageLabel: lead.status }, items, next)
      : [];
    return { items, lastInteraction: last, nextAction: next, attention, health };
  }
  if (ref.module === "deals") {
    const deal = db.deals.find((d) => d.id === ref.id);
    const next = nextActionFrom(items, deal);
    const attention = deal && isDealOpen(deal)
      ? attentionFor("deal", { ownerId: deal.ownerId, createdAt: deal.createdAt, changedAt: deal.stageChangedAt, stageLabel: deal.stage }, items, next)
      : [];
    return { items, lastInteraction: last, nextAction: next, attention, health: null };
  }
  return { items, lastInteraction: last, nextAction: nextActionFrom(items), attention: [], health: null };
}
