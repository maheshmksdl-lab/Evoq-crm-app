import type { ComponentType } from "react";
import {
  ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, CircleDashedIcon, ClockIcon, FlameIcon, HeartbeatIcon, MinusIcon,
  ProhibitIcon, QuestionIcon, SnowflakeIcon, SunIcon, TrophyIcon, WarningIcon, XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { LeadHealth } from "@/lib/domain/intelligence";

export type Tone = "neutral" | "info" | "success" | "warning" | "error" | "brand";
const TONE: Record<Tone, string> = {
  neutral: "bg-neutral-bg text-neutral-fg",
  info: "bg-info-bg text-info-fg",
  brand: "bg-crm-tint text-crm-depth dark:bg-info-bg dark:text-info-fg",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  error: "bg-error-bg text-error-fg",
};
type Icon = ComponentType<{ className?: string; weight?: "fill" | "regular" | "bold" }>;

export function StatusBadge({ tone = "neutral", icon: I, children, className, title }: {
  tone?: Tone; icon?: Icon; children: React.ReactNode; className?: string; title?: string;
}) {
  return (
    <span title={title} className={cn("inline-flex h-6 max-w-full items-center gap-1 whitespace-nowrap rounded-full px-2 text-caption font-medium", TONE[tone], className)}>
      {I && <I className="size-3.5 shrink-0" weight="fill" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

const LEAD: Record<string, [Tone, Icon]> = {
  New: ["neutral", CircleDashedIcon], Contacted: ["info", ClockIcon], "In Progress": ["brand", ClockIcon],
  Qualified: ["success", CheckCircleIcon], Lost: ["error", XCircleIcon], Unqualified: ["neutral", ProhibitIcon],
};
export const LeadStatusBadge = ({ status }: { status: string }) => {
  const [t, i] = LEAD[status] ?? ["neutral", CircleDashedIcon];
  return <StatusBadge tone={t} icon={i}>{status}</StatusBadge>;
};

const STAGE_TONE: Record<string, Tone> = {
  Qualification: "neutral", "Needs Analysis": "info", "Value Proposition": "info", "Identify Decision Makers": "brand",
  "Proposal/Price Quote": "brand", "Negotiation/Review": "warning", "Closed Won": "success",
};
export const DealStageBadge = ({ stage }: { stage: string }) => (
  <StatusBadge tone={STAGE_TONE[stage] ?? "neutral"} icon={stage === "Closed Won" ? TrophyIcon : CircleDashedIcon}>{stage}</StatusBadge>
);

const TASK: Record<string, [Tone, Icon]> = {
  "To-Do": ["info", CircleDashedIcon], "In Progress": ["warning", ClockIcon], Backlog: ["neutral", MinusIcon], Completed: ["success", CheckCircleIcon],
  Scheduled: ["info", ClockIcon], Cancelled: ["neutral", ProhibitIcon],
};
export const ActivityStatusBadge = ({ status, overdue }: { status: string | null; overdue?: boolean }) => {
  if (overdue) return <StatusBadge tone="error" icon={WarningIcon}>Overdue</StatusBadge>;
  if (!status) return <span className="text-ink-faint">—</span>;
  const [t, i] = TASK[status] ?? ["neutral", CircleDashedIcon];
  return <StatusBadge tone={t} icon={i}>{status}</StatusBadge>;
};

const PRIO: Record<string, [Tone, Icon]> = { High: ["error", ArrowUpIcon], Medium: ["warning", MinusIcon], Low: ["neutral", ArrowDownIcon] };
export const PriorityBadge = ({ priority }: { priority: string | null | undefined }) => {
  if (!priority) return <span className="text-ink-faint">—</span>;
  const [t, i] = PRIO[priority] ?? ["neutral", MinusIcon];
  return <StatusBadge tone={t} icon={i}>{priority}</StatusBadge>;
};

const RATING: Record<string, [Tone, Icon]> = { Hot: ["error", FlameIcon], Warm: ["warning", SunIcon], Cold: ["info", SnowflakeIcon] };
export const RatingBadge = ({ rating }: { rating: string }) => {
  if (!rating) return <span className="text-ink-faint">—</span>;
  const [t, i] = RATING[rating] ?? ["neutral", MinusIcon];
  return <StatusBadge tone={t} icon={i}>{rating}</StatusBadge>;
};

const BAND: Record<string, [Tone, Icon]> = { Healthy: ["success", HeartbeatIcon], Watch: ["warning", HeartbeatIcon], "At risk": ["error", WarningIcon] };
/** Health is always shown as band + score; unknown/closed states say so in words. */
export function HealthIndicator({ health, compact }: { health: LeadHealth | null; compact?: boolean }) {
  if (!health) return <span className="text-ink-faint">—</span>;
  if (health.state === "closed") return <span className="text-caption text-ink-faint">Not tracked</span>;
  if (!health.band) return <StatusBadge tone="neutral" icon={QuestionIcon} title={health.summary}>Not enough data</StatusBadge>;
  const [t, i] = BAND[health.band];
  return (
    <StatusBadge tone={t} icon={i} title={health.summary}>
      {health.band}{health.score !== null && !compact ? ` · ${health.score}` : ""}{health.overridden ? " (set manually)" : ""}
    </StatusBadge>
  );
}
