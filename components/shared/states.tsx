"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ArrowClockwiseIcon, LockKeyIcon, MagnifyingGlassIcon, TrayIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Icon = ComponentType<{ className?: string; weight?: "duotone" }>;

export function EmptyState({ icon: I = TrayIcon, title, description, action, className }: {
  icon?: Icon; title: string; description?: ReactNode; action?: ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      <span className="grid size-11 place-items-center rounded-2xl bg-crm-surface text-crm-primary dark:bg-info-bg dark:text-info-fg"><I className="size-5" weight="duotone" /></span>
      <h3 className="text-card-title text-heading">{title}</h3>
      {description && <p className="max-w-sm text-body text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export const NoResults = ({ onClear }: { onClear?: () => void }) => (
  <EmptyState icon={MagnifyingGlassIcon} title="No matches" description="Nothing fits the current search and filters."
    action={onClear && <Button variant="outline" size="sm" onClick={onClear}>Clear search and filters</Button>} />
);

/** Distinguishes permission, missing-record and failure — they need different next steps. */
export function ErrorState({ error, onRetry, backHref, backLabel }: { error: unknown; onRetry?: () => void; backHref?: string; backLabel?: string }) {
  const name = error instanceof Error ? error.name : "";
  const msg = error instanceof Error ? error.message : "Something went wrong.";
  if (name === "PermissionError") {
    return <EmptyState icon={LockKeyIcon} title="You don't have access" description={msg} action={backHref && <Button asChild variant="outline" size="sm"><Link href={backHref}>{backLabel ?? "Go back"}</Link></Button>} />;
  }
  if (name === "NotFoundError") {
    return <EmptyState icon={MagnifyingGlassIcon} title="Not found" description={msg} action={backHref && <Button asChild variant="outline" size="sm"><Link href={backHref}>{backLabel ?? "Go back"}</Link></Button>} />;
  }
  return (
    <div role="alert">
      <EmptyState icon={WarningCircleIcon} title="Couldn't load this" description={msg}
        action={onRetry && <Button variant="outline" size="sm" onClick={onRetry}><ArrowClockwiseIcon />Try again</Button>} />
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0 px-5 py-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-line-soft py-3.5 last:border-0">
          {Array.from({ length: cols }).map((__, c) => <Skeleton key={c} className={cn("h-4", c === 0 ? "w-40" : "w-24")} />)}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} className={cn("h-4", i % 2 ? "w-2/3" : "w-full")} />)}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
