/**
 * Every threshold used by lead health, next action and attention detection.
 * Product owns these numbers; change them here only (they are rendered verbatim
 * in the "How is this calculated?" explanations, so the UI never drifts from the rule).
 */
export const RULES = {
  /** No meaningful interaction for this many days → "No recent activity". */
  staleAfterDays: 14,
  /** Lead status / deal stage unchanged this many days → "Stalled". */
  stalledAfterDays: 30,
  /** A record younger than this is not flagged as stale (it is new, not neglected). */
  graceDaysForNewRecords: 3,
  health: {
    rating: { Hot: 25, Warm: 15, Cold: 5 } as Record<string, number>,
    recency: [
      { withinDays: 7, points: 25 },
      { withinDays: 14, points: 15 },
      { withinDays: 30, points: 5 },
    ],
    nextActionScheduled: 20,
    pipeline: { New: 0, Contacted: 5, "In Progress": 10, Qualified: 15 } as Record<string, number>,
    reachable: 10,
    profileComplete: 5,
    bands: { healthy: 60, watch: 35 },
    /** Minimum number of these signals needed to score at all: rating, any interaction, a contact channel. */
    minSignals: 2,
  },
} as const;

export const DAY_MS = 24 * 60 * 60 * 1000;
