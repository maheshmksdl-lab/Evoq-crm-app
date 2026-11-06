"use client";

import Link from "next/link";
import {
  CalendarCheckIcon, CheckSquareIcon, DotsThreeIcon, EnvelopeSimpleIcon, NotePencilIcon, PhoneIcon, PhoneCallIcon, WarningIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/badges";
import { useForms } from "@/components/forms/create-context";
import { useSession } from "@/lib/query/hooks";
import type { Attention, NextAction } from "@/lib/domain/intelligence";
import { relative } from "@/lib/domain/format";
import type { RecordRef } from "@/lib/schemas";

export function NextActionCell({ next, empty = "None planned" }: { next: NextAction | null; empty?: string }) {
  if (!next) return <span className="inline-flex items-center gap-1 text-caption text-warning-fg"><WarningIcon className="size-3.5" weight="fill" />{empty}</span>;
  return (
    <div className="min-w-0">
      <p className="truncate text-body text-ink">{next.title}</p>
      <p className={next.overdue ? "text-caption font-medium text-error-fg" : "text-caption text-ink-muted"}>
        {next.overdue ? "Overdue · " : next.dueAt ? "Due " : ""}{next.dueAt ? relative(next.dueAt) : next.source === "manual" ? "Next step (no date)" : "No due date"}
      </p>
    </div>
  );
}

export function LastInteractionCell({ at, label }: { at: number | null; label: string | null }) {
  if (!at) return <span className="text-caption text-ink-faint">No interaction yet</span>;
  return <div className="min-w-0"><p className="truncate text-body text-ink">{label}</p><p className="text-caption text-ink-muted">{relative(at)}</p></div>;
}

export function AttentionChips({ items, max = 2 }: { items: Attention[]; max?: number }) {
  if (!items.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {items.slice(0, max).map((a) => (
        <Tooltip key={a.code}><TooltipTrigger asChild><span><StatusBadge tone={a.severity === "high" ? "error" : "warning"} icon={WarningIcon}>{a.label}</StatusBadge></span></TooltipTrigger>
          <TooltipContent className="max-w-64">{a.reason}. Fix: {a.action.toLowerCase()}.</TooltipContent></Tooltip>
      ))}
      {items.length > max && <Tooltip><TooltipTrigger asChild><span><StatusBadge tone="neutral">+{items.length - max}</StatusBadge></span></TooltipTrigger><TooltipContent>{items.slice(max).map((a) => a.label).join(", ")}</TooltipContent></Tooltip>}
    </span>
  );
}

/** One compact badge instead of a stack of chips; the full reasons are in the tooltip and on the record. */
export function AttentionSummary({ items }: { items: Attention[] }) {
  if (!items.length) return null;
  const high = items.some((a) => a.severity === "high");
  const text = items.map((a) => `${a.label}: ${a.reason}`).join(". ");
  return (
    <Tooltip><TooltipTrigger asChild>
      <button type="button" aria-label={`${items.length} attention flag${items.length > 1 ? "s" : ""}. ${text}`} onClick={stop} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <StatusBadge tone={high ? "error" : "warning"} icon={WarningIcon}>{items.length} flag{items.length > 1 ? "s" : ""}</StatusBadge>
      </button>
    </TooltipTrigger><TooltipContent className="max-w-72"><ul className="space-y-1">{items.map((a) => <li key={a.code}><strong>{a.label}</strong> — {a.reason}</li>)}</ul></TooltipContent></Tooltip>
  );
}

/** Row/quick actions. Call and email open the device's phone/mail app (no telephony or email integration exists); logging is explicit. */
const stop = (e: React.MouseEvent) => e.stopPropagation();

/** Icon button that is a real link when the data exists, and an explained disabled state when it does not. */
function ActionLink({ href, label, missing, children }: { href?: string; label: string; missing: string; children: React.ReactNode }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      {href ? <Button asChild variant="ghost" size="icon-xs"><a href={href} aria-label={label} onClick={stop}>{children}</a></Button>
        : <Button variant="ghost" size="icon-xs" aria-disabled="true" aria-label={`${label} unavailable: ${missing}`} className="cursor-not-allowed opacity-40 hover:bg-transparent" onClick={(e) => e.preventDefault()}>{children}</Button>}
    </TooltipTrigger><TooltipContent>{href ? label : missing}</TooltipContent></Tooltip>
  );
}

export function QuickActions({ related, phone, email }: { related: RecordRef; phone?: string; email?: string }) {
  const { open } = useForms();
  const perms = useSession().data?.permissions ?? {};
  const ok = (p: string) => perms[p]?.create !== false;
  return (
    <div className="flex items-center justify-end gap-0.5" onClick={stop}>
      <ActionLink href={phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined} label="Call" missing="No phone number"><PhoneIcon /></ActionLink>
      <ActionLink href={email ? `mailto:${email}` : undefined} label="Email" missing="No email address"><EnvelopeSimpleIcon /></ActionLink>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs" aria-label="More actions"><DotsThreeIcon weight="bold" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" onClick={stop}>
          <DropdownMenuLabel>Log activity</DropdownMenuLabel>
          {ok("Calls") && <DropdownMenuItem onSelect={() => open({ kind: "call", related, defaults: { phone: phone ?? "" } })}><PhoneCallIcon />Log a call</DropdownMenuItem>}
          <DropdownMenuItem onSelect={() => open({ kind: "email", related })}><EnvelopeSimpleIcon />Log an email</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => open({ kind: "note", related })}><NotePencilIcon />Add a note</DropdownMenuItem>
          <DropdownMenuSeparator />
          {ok("Tasks") && <DropdownMenuItem onSelect={() => open({ kind: "task", related })}><CheckSquareIcon />Create task</DropdownMenuItem>}
          {ok("Meetings") && <DropdownMenuItem onSelect={() => open({ kind: "meeting", related })}><CalendarCheckIcon />Schedule meeting</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RecordLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} onClick={(e) => e.stopPropagation()} className="font-medium text-crm-primary hover:underline">{children}</Link>;
}
