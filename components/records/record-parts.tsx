"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CaretDownIcon, CheckIcon, InfoIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { HealthIndicator } from "@/components/shared/badges";
import { Field, KeyValue, SectionCard, ConfirmDialog } from "@/components/shared/primitives";
import { SelectField } from "@/components/forms/field-input";
import { useForms } from "@/components/forms/create-context";
import { NextActionCell } from "./cells";
import { useClearHealthOverride, useListAll, useOverrideHealth, useSettings, useUsers } from "@/lib/query/hooks";
import { FIELDS, getPath, type FieldDef } from "@/lib/domain/fields";
import { ATTENTION_RULES, type Attention, type LeadHealth, type NextAction } from "@/lib/domain/intelligence";
import { RULES } from "@/lib/domain/rules-config";
import { date, dateTime, money, pct, relative } from "@/lib/domain/format";
import { personName } from "@/lib/domain/names";
import type { HealthBand, RecordModule, RecordRef } from "@/lib/schemas";

/* ───────── stage bar ───────── */
export function StageBar({ steps, current, onSelect, disabled, terminal }: {
  steps: readonly string[]; current: string; onSelect: (s: string) => void; disabled?: boolean; terminal?: { label: string; value: string }[];
}) {
  const idx = steps.indexOf(current);
  const [confirm, setConfirm] = useState<string | null>(null);
  const isTerminal = terminal?.some((t) => t.value === current);
  return (
    <div id="stage-bar" className="scroll-mt-20">
      <ol className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin" aria-label="Progress">
        {steps.map((s, i) => {
          const done = !isTerminal && idx > i;
          const cur = s === current;
          return (
            <li key={s} className="min-w-[112px] flex-1">
              <button type="button" disabled={disabled || cur} aria-current={cur ? "step" : undefined}
                onClick={() => (s === "Closed Won" ? setConfirm(s) : onSelect(s))}
                className={cn("flex h-9 w-full items-center justify-center gap-1 rounded-lg px-2 text-label font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default",
                  cur ? "bg-crm-primary text-white" : done ? "bg-crm-tint text-crm-depth dark:bg-info-bg dark:text-info-fg" : "bg-muted text-ink-muted hover:bg-hover hover:text-heading")}>
                {done && <CheckIcon className="size-3.5" weight="bold" />}<span className="truncate">{s}</span>
              </button>
            </li>
          );
        })}
        {terminal?.map((t) => (
          <li key={t.value} className="min-w-[96px]">
            <button type="button" disabled={disabled || current === t.value} aria-current={current === t.value ? "step" : undefined} onClick={() => onSelect(t.value)}
              className={cn("h-9 w-full rounded-lg px-2 text-label font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50", current === t.value ? "bg-error text-white" : "border border-line text-ink-muted hover:bg-hover")}>{t.label}</button>
          </li>
        ))}
      </ol>
      <ConfirmDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} title="Mark this deal as Closed Won?" description="The deal leaves the open pipeline and its probability becomes 100%. You can move it back from the stage bar." confirmLabel="Mark Closed Won" onConfirm={async () => { if (confirm) onSelect(confirm); }} />
    </div>
  );
}

/* ───────── next action + attention ───────── */
export function NextActionCard({ next, related, canPlan }: { next: NextAction | null; related: RecordRef; canPlan: boolean }) {
  const { open } = useForms();
  return (
    <SectionCard title="Next action" actions={canPlan && <Button size="xs" variant="outline" onClick={() => open({ kind: "task", related })}>{next ? "Add another" : "Plan next step"}</Button>}>
      {next ? (
        <div className="space-y-1">
          <NextActionCell next={next} />
          <p className="text-caption text-ink-muted">Source: {next.source === "manual" ? "Next step field" : next.source}{next.href && <> · <Link className="text-crm-primary hover:underline" href={next.href}>Open</Link></>}</p>
        </div>
      ) : <p className="text-body text-warning-fg">Nothing is planned. Plan the next step so this doesn&apos;t go quiet.</p>}
    </SectionCard>
  );
}

export function AttentionCard({ items, related, onEdit }: { items: Attention[]; related: RecordRef; onEdit: () => void }) {
  const { open } = useForms();
  const [rules, setRules] = useState(false);
  if (!items.length) return null;
  const fix = (a: Attention) => {
    if (a.fix === "assign_owner") return <Button size="xs" variant="outline" onClick={onEdit}>{a.action}</Button>;
    if (a.fix === "plan_next_action") return <Button size="xs" variant="outline" onClick={() => open({ kind: "task", related })}>{a.action}</Button>;
    if (a.fix === "log_activity") return <Button size="xs" variant="outline" onClick={() => open({ kind: "call", related })}>{a.action}</Button>;
    if (a.fix === "open_next_action" && a.href) return <Button asChild size="xs" variant="outline"><Link href={a.href}>{a.action}</Link></Button>;
    return <Button size="xs" variant="outline" onClick={() => document.getElementById("stage-bar")?.scrollIntoView({ behavior: "smooth", block: "center" })}>{a.action}</Button>;
  };
  return (
    <SectionCard title={<span className="flex items-center gap-1.5"><WarningIcon className="size-4 text-warning" weight="fill" />Needs attention</span>} className="border-warning/40">
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.code} className="space-y-1.5">
            <p className="text-body font-medium text-ink">{a.label}</p><p className="text-caption text-ink-muted">{a.reason}.</p>{fix(a)}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setRules((r) => !r)} aria-expanded={rules} className="mt-3 flex items-center gap-1 text-caption text-ink-muted hover:text-crm-primary"><InfoIcon className="size-3.5" />How these are detected<CaretDownIcon className={cn("size-3 transition-transform", rules && "rotate-180")} /></button>
      {rules && <ul className="mt-2 space-y-1 text-caption text-ink-muted">{items.map((a) => <li key={a.code}><strong className="text-ink">{a.label}:</strong> {ATTENTION_RULES[a.code]}</li>)}</ul>}
    </SectionCard>
  );
}

/* ───────── lead health ───────── */
export function HealthCard({ leadId, health, canEdit }: { leadId: string; health: LeadHealth | null; canEdit: boolean }) {
  const [open, setOpen] = useState(false);
  const [band, setBand] = useState<HealthBand>("Watch");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const override = useOverrideHealth();
  const clear = useClearHealthOverride();
  if (!health) return null;
  const save = async () => {
    setErr(null);
    try { await override.mutateAsync([leadId, { band, reason }]); setOpen(false); setReason(""); } catch (e) { setErr(e instanceof Error ? e.message : "Could not save."); }
  };
  return (
    <SectionCard title="Lead health" actions={<HealthIndicator health={health} />}>
      {health.state === "closed" ? <p className="text-body text-ink-muted">{health.summary}.</p>
        : health.state === "insufficient" ? <p className="text-body text-ink-muted">{health.summary}</p> : (
        <ul className="space-y-2.5">
          {health.factors.map((f) => (
            <li key={f.label}>
              <div className="flex items-baseline justify-between gap-2"><span className="text-label text-ink">{f.label}</span><span className="tabular text-caption text-ink-muted">{f.points}/{f.max}</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden><div className={cn("h-full rounded-full", f.points / f.max >= 0.66 ? "bg-success" : f.points / f.max >= 0.33 ? "bg-warning" : "bg-error")} style={{ width: `${(f.points / f.max) * 100}%` }} /></div>
              <p className="mt-0.5 text-caption text-ink-muted">{f.detail}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-caption text-ink-muted">Calculated {relative(health.computedAt)} from the lead&apos;s current data. Healthy ≥ {RULES.health.bands.healthy}, Watch ≥ {RULES.health.bands.watch}, otherwise At risk.</p>
      {health.overridden && <p className="mt-1 text-caption text-warning-fg">Set manually{health.computedBand ? ` (calculated: ${health.computedBand})` : ""}.</p>}
      {canEdit && health.state !== "closed" && (
        <div className="mt-3 flex gap-2">
          <Button size="xs" variant="outline" onClick={() => setOpen(true)}>Override</Button>
          {health.overridden && <Button size="xs" variant="ghost" onClick={() => clear.mutate([leadId])}>Use calculated</Button>}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Override lead health</DialogTitle><DialogDescription>Use this when you know something the data doesn&apos;t. The reason is saved in the lead&apos;s history.</DialogDescription></DialogHeader>
          <Field label="Health" htmlFor="ho-band"><SelectField id="ho-band" value={band} onChange={(v) => setBand(v as HealthBand)} options={["Healthy", "Watch", "At risk"]} allowEmpty={false} /></Field>
          <Field label="Reason" htmlFor="ho-reason" error={err ?? undefined} required><Textarea id="ho-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={override.isPending}>Save override</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

/* ───────── additional details (layout-aware) ───────── */
function fieldValue(def: FieldDef, v: unknown, lookup: (type: string, id: string) => string): ReactNode {
  if (v === null || v === undefined || v === "") return null;
  switch (def.type) {
    case "money": return money(Number(v));
    case "percent": return pct(Number(v));
    case "date": return date(String(v));
    case "datetime": return dateTime(String(v));
    case "boolean": return v ? "Yes" : "No";
    case "user": return lookup("user", String(v));
    case "ref": return lookup(def.ref!, String(v));
    case "email": return <a className="text-crm-primary hover:underline" href={`mailto:${v}`}>{String(v)}</a>;
    case "phone": return <a className="text-crm-primary hover:underline" href={`tel:${String(v).replace(/[^\d+]/g, "")}`}>{String(v)}</a>;
    case "url": return <a className="text-crm-primary hover:underline" href={/^https?:/.test(String(v)) ? String(v) : `https://${v}`} target="_blank" rel="noreferrer noopener">{String(v)}</a>;
    default: return String(v);
  }
}

export function DetailsPanel({ module, record, onEdit, canEdit, skip = [] }: { module: RecordModule; record: object; onEdit: () => void; canEdit: boolean; skip?: string[] }) {
  const settings = useSettings();
  const users = useUsers();
  const accounts = useListAll("accounts");
  const contacts = useListAll("contacts");
  const lookup = (type: string, id: string) => {
    if (type === "user") return users.data?.find((u) => u.id === id)?.name ?? "Unknown user";
    if (type === "accounts") return accounts.data?.find((a) => a.id === id)?.name ?? "Deleted account";
    if (type === "contacts") { const c = contacts.data?.find((x) => x.id === id); return c ? personName(c) : "Deleted contact"; }
    return id;
  };
  const defs = FIELDS[module];
  const custom = (settings.data?.customFields ?? []).filter((c) => c.module === module);
  const layout = settings.data?.layouts.find((l) => l.module === module);
  const sections: { title: string; fields: { def: FieldDef; path: string }[] }[] = layout
    ? layout.sections.map((s) => ({ title: s.title, fields: s.fields.map((k) => ({ def: defs.find((d) => d.key === k) ?? ({ key: k, label: custom.find((c) => `custom.${c.key}` === k)?.label ?? k, type: "text" } as FieldDef), path: k })) }))
    : [...new Set(defs.filter((d) => d.group && !d.derived).map((d) => d.group!))].map((g) => ({ title: g, fields: defs.filter((d) => d.group === g && !d.derived).map((d) => ({ def: d, path: d.key })) }));
  if (!layout && custom.length) sections.push({ title: "Custom fields", fields: custom.map((c) => ({ def: { key: c.key, label: c.label, type: c.type === "checkbox" ? "boolean" : c.type === "select" ? "text" : (c.type as FieldDef["type"]) } as FieldDef, path: `custom.${c.key}` })) });
  return (
    <div className="space-y-5">
      {canEdit && <div className="flex justify-end"><Button size="sm" variant="outline" onClick={onEdit}>Edit details</Button></div>}
      {sections.map((s) => {
        const fields = s.fields.filter((f) => !skip.includes(f.path));
        if (!fields.length) return null;
        return (
          <section key={s.title}>
            <h3 className="mb-2 text-label font-semibold text-heading">{s.title}</h3>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {fields.map((f) => <KeyValue key={f.path} label={f.def.label}>{fieldValue(f.def, getPath(record, f.path), lookup)}</KeyValue>)}
            </dl>
          </section>
        );
      })}
    </div>
  );
}

export function RelatedList({ title, items, empty, action }: {
  title: string; items: { key: string; href: string; title: string; sub?: ReactNode; right?: ReactNode }[]; empty: string; action?: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between"><h3 className="text-label font-semibold text-heading">{title} <span className="font-normal text-ink-muted">({items.length})</span></h3>{action}</div>
      {items.length === 0 ? <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-body text-ink-muted">{empty}</p> : (
        <ul className="divide-y divide-line-soft rounded-lg border border-line">
          {items.map((i) => (
            <li key={i.key}><Link href={i.href} className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-hover"><span className="min-w-0"><span className="block truncate text-body font-medium text-ink">{i.title}</span>{i.sub && <span className="block truncate text-caption text-ink-muted">{i.sub}</span>}</span>{i.right}</Link></li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SummaryList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return <dl className="space-y-2.5">{rows.map((r) => <div key={r.label} className="flex items-baseline justify-between gap-3"><dt className="text-caption text-ink-muted">{r.label}</dt><dd className="min-w-0 break-words text-right text-body text-ink">{r.value || <span className="text-ink-faint">—</span>}</dd></div>)}</dl>;
}
