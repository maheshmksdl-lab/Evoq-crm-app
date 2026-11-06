"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CaretRightIcon, HouseIcon, InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/domain/names";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1 flex min-w-0 items-center gap-1 text-caption text-ink-muted">
      <Link href="/" aria-label="Dashboard" className="shrink-0 hover:text-crm-primary"><HouseIcon className="size-3.5" /></Link>
      {items.map((it, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1">
          <CaretRightIcon className="size-3 shrink-0 text-ink-faint" />
          {it.href && i < items.length - 1 ? <Link href={it.href} className="truncate hover:text-crm-primary">{it.label}</Link> : <span aria-current="page" className="truncate font-medium text-ink">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: {
  title: ReactNode; description?: ReactNode; breadcrumbs?: { label: string; href?: string }[]; actions?: ReactNode; className?: string;
}) {
  return (
    <header className={cn("mb-5 flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="text-page-title text-heading">{title}</h1>
        {description && <p className="mt-0.5 text-body text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionCard({ title, description, actions, children, className, bodyClassName, flush }: {
  title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; flush?: boolean;
}) {
  return (
    <Card className={cn("gap-3 bg-card/95 shadow-card", flush && "p-0 gap-0 overflow-hidden", className)}>
      {(title || actions) && (
        <CardHeader className={cn(flush && "px-5 pt-4 pb-3")}>
          <div className="min-w-0">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <p className="mt-0.5 text-caption text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </CardHeader>
      )}
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </Card>
  );
}

const AV = ["bg-crm-tint text-crm-depth", "bg-success-bg text-success-fg", "bg-warning-bg text-warning-fg", "bg-info-bg text-info-fg", "bg-error-bg text-error-fg"];
export function Avatar({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length;
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-full font-semibold", AV[h], className)} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}>
      {initials(name)}
    </span>
  );
}
export function OwnerCell({ name }: { name: string }) {
  if (name === "Unassigned") return <span className="text-warning-fg">Unassigned</span>;
  return <span className="flex max-w-[140px] items-center gap-2" title={name}><Avatar name={name} size={24} /><span className="truncate">{name}</span></span>;
}

export function Stat({ label, value, hint, href, tone = "default", definition, loading }: {
  label: string; value: ReactNode; hint?: ReactNode; href?: string; tone?: "default" | "warning" | "error"; definition?: string; loading?: boolean;
}) {
  const body = (
    <div className={cn("flex h-full flex-col gap-1 rounded-xl border border-line bg-card/95 p-4 shadow-card transition-colors", href && "hover:border-crm-hover")}>
      <div className="flex items-center gap-1 text-label text-ink-muted">
        {label}
        {definition && (
          <Tooltip><TooltipTrigger asChild><button type="button" aria-label={`How ${label} is calculated`} className="relative z-10 rounded text-ink-faint hover:text-crm-primary"><InfoIcon className="size-3.5" /></button></TooltipTrigger>
            <TooltipContent className="max-w-64">{definition}</TooltipContent></Tooltip>
        )}
      </div>
      <div className={cn("tabular text-kpi text-heading", tone === "warning" && "text-warning-fg", tone === "error" && "text-error-fg")}>{loading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" /> : value}</div>
      {hint && <div className="text-caption text-ink-muted">{hint}</div>}
    </div>
  );
  return href ? <Link href={href} className="block rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50">{body}</Link> : body;
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", destructive, onConfirm, children, busy }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: ReactNode; confirmLabel?: string;
  destructive?: boolean; onConfirm: () => void | Promise<void>; children?: ReactNode; busy?: boolean;
}) {
  const [running, setRunning] = useState(false);
  const run = async () => {
    setRunning(true);
    try { await onConfirm(); onOpenChange(false); } finally { setRunning(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={running || busy}>Cancel</Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={run} disabled={running || busy}>{running ? "Working…" : confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, htmlFor, error, hint, required, children, className }: {
  label: string; htmlFor?: string; error?: string; hint?: string; required?: boolean; children: ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-label font-medium text-ink">{label}{required && <span className="ml-0.5 text-error" aria-hidden>*</span>}</label>
      {children}
      {error ? <p id={htmlFor ? `${htmlFor}-err` : undefined} role="alert" className="text-caption font-medium text-error-fg">{error}</p> : hint ? <p className="text-caption text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-body text-ink">{children || <span className="text-ink-faint">—</span>}</dd>
    </div>
  );
}
