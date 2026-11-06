"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, InfoIcon, PaperPlaneRightIcon, PlayIcon, SparkleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/badges";
import { useAgentActions, useEvi, useRecord } from "@/lib/query/hooks";
import { evi as eviSvc, type EviAnswer } from "@/lib/services";
import type { AgentAction, RecordRef } from "@/lib/schemas";
import { recordHref, personName } from "@/lib/domain/names";
import { relative } from "@/lib/domain/format";

const ROUTE_RE = /^\/(leads|contacts|accounts|deals)\/([^/]+)$/;
const PROMPTS = ["Summarize this record", "Why this health score?", "What information is missing?", "What should I do next?"];

function useContextRef(): RecordRef | null {
  const m = ROUTE_RE.exec(usePathname());
  return m ? { module: m[1] as RecordRef["module"], id: m[2] } : null;
}

const STATUS_TONE: Record<AgentAction["status"], "info" | "success" | "error" | "warning" | "neutral"> = {
  proposed: "info", approved: "warning", rejected: "neutral", running: "warning", succeeded: "success", failed: "error",
};

export function AgentActionCard({ a }: { a: AgentAction }) {
  const evi = useEvi();
  const [showLog, setShowLog] = useState(false);
  return (
    <li className="rounded-xl border border-line bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-body font-medium text-ink">{a.title}</p>
        <StatusBadge tone={STATUS_TONE[a.status]}>{a.status === "proposed" ? "Awaiting approval" : a.status[0].toUpperCase() + a.status.slice(1)}</StatusBadge>
      </div>
      <p className="mt-1 text-caption text-ink-muted">{a.rationale}</p>
      <p className="mt-1 text-caption text-ink-muted">Affects <Link className="text-crm-primary hover:underline" href={recordHref(a.related.module, a.related.id)}>{a.related.module.slice(0, -1)} #{a.related.id}</Link>{a.kind === "draft_email" && " · will not be sent"}</p>
      {a.kind === "draft_email" && <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-2 text-caption text-ink-body">{String(a.payload.subject)}{"\n\n"}{String(a.payload.body)}</pre>}
      {a.error && <p role="alert" className="mt-2 text-caption text-error-fg">{a.error}</p>}
      {a.result && <p className="mt-2 text-caption text-success-fg">{a.result}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {a.status === "proposed" && (<>
          <Button size="xs" onClick={() => evi.decide.mutate([a.id, "approve"])} disabled={evi.decide.isPending}><CheckIcon />Approve</Button>
          <Button size="xs" variant="outline" onClick={() => evi.decide.mutate([a.id, "reject"])} disabled={evi.decide.isPending}><XIcon />Reject</Button>
        </>)}
        {(a.status === "approved" || a.status === "failed") && <Button size="xs" onClick={() => evi.execute.mutate([a.id])} disabled={evi.execute.isPending}><PlayIcon />{a.status === "failed" ? "Retry" : "Run now"}</Button>}
        <button type="button" onClick={() => setShowLog((s) => !s)} className="ml-auto text-caption text-ink-muted hover:text-crm-primary" aria-expanded={showLog}>History ({a.history.length})</button>
      </div>
      {showLog && <ol className="mt-2 space-y-1 border-l-2 border-line pl-3">{a.history.map((h, i) => <li key={i} className="text-caption text-ink-muted"><span className="text-ink">{h.event}</span> · {h.by} · {relative(h.at)}</li>)}</ol>}
    </li>
  );
}

export function EviPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const ref = useContextRef();
  const rec = useRecord(ref?.module ?? "leads", ref?.id ?? "");
  const evi = useEvi();
  const actions = useAgentActions(ref ?? undefined);
  const [q, setQ] = useState("");
  const [thread, setThread] = useState<{ q: string; a?: EviAnswer; error?: string }[]>([]);
  const ask = useMutation({
    mutationFn: ({ r, question }: { r: RecordRef; question: string }) => eviSvc.ask(r, question),
    onSuccess: (a, v) => setThread((t) => t.map((x, i) => (i === t.length - 1 && x.q === v.question ? { ...x, a } : x))),
    onError: (e, v) => setThread((t) => t.map((x, i) => (i === t.length - 1 && x.q === v.question ? { ...x, error: e instanceof Error ? e.message : "Could not answer." } : x))),
  });
  const send = (question: string) => {
    if (!ref || !question.trim()) return;
    setThread((t) => [...t, { q: question }]);
    setQ("");
    ask.mutate({ r: ref, question });
  };
  const name = rec.data ? ("name" in rec.data && typeof rec.data.name === "string" ? rec.data.name : personName(rec.data as never)) : null;
  const pending = (actions.data ?? []).filter((a) => a.status === "proposed" || a.status === "approved" || a.status === "failed");

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <SheetHeader className="border-b border-line px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-section text-heading"><SparkleIcon weight="fill" className="size-4 text-crm-primary" />EVI</SheetTitle>
          <SheetDescription>{ref && name ? <>Looking at <strong className="text-ink">{name}</strong></> : "Open a lead, contact, account or deal to ask about it."}</SheetDescription>
        </SheetHeader>
        <div className="flex gap-2 border-b border-line bg-info-bg px-4 py-2 text-caption text-info-fg"><InfoIcon className="mt-0.5 size-3.5 shrink-0" />Answers come from this record&apos;s own data using the CRM&apos;s rules. No language model is connected yet, so EVI never invents facts. Suggestions only act after you approve them.</div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin" aria-live="polite">
          {!ref && <p className="text-body text-ink-muted">EVI works on the record you have open. Navigate to one to get started.</p>}
          {ref && !thread.length && (
            <div className="space-y-2"><p className="text-caption font-medium text-ink-muted">Try asking</p>
              <div className="flex flex-wrap gap-2">{PROMPTS.map((p) => <button key={p} type="button" onClick={() => send(p)} className="rounded-full border border-line px-3 py-1 text-caption text-ink-body hover:border-crm-hover hover:text-crm-primary">{p}</button>)}</div></div>
          )}
          {thread.map((t, i) => (
            <div key={i} className="space-y-2">
              <p className="ml-8 rounded-xl rounded-tr-sm bg-crm-tint px-3 py-2 text-body text-crm-depth dark:bg-info-bg dark:text-info-fg">{t.q}</p>
              {t.error ? <p role="alert" className="text-body text-error-fg">{t.error}</p> : t.a ? (
                <div className="space-y-2 rounded-xl border border-line bg-card px-3 py-2.5">
                  <p className="text-body text-ink">{t.a.text}</p>
                  {t.a.bullets.length > 0 && <ul className="list-disc space-y-1 pl-4 text-body text-ink-body">{t.a.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>}
                  <p className="text-caption text-ink-muted">Source: {t.a.sources.map((s) => s.label).join(", ")}</p>
                </div>
              ) : <p className="text-body text-ink-muted">Thinking…</p>}
            </div>
          ))}
          {ref && (
            <section aria-label="Proposed actions" className="space-y-2">
              <div className="flex items-center justify-between"><h3 className="text-card-title text-heading">Agent actions</h3>
                <Button size="xs" variant="outline" onClick={() => evi.propose.mutate([ref])} disabled={evi.propose.isPending}>Suggest actions</Button></div>
              {pending.length === 0 ? <p className="text-caption text-ink-muted">No pending actions for this record.</p> : <ul className="space-y-2">{pending.map((a) => <AgentActionCard key={a.id} a={a} />)}</ul>}
              {(actions.data ?? []).filter((a) => !pending.includes(a)).length > 0 && (
                <details className="text-caption"><summary className="cursor-pointer text-ink-muted">Completed and rejected ({(actions.data ?? []).filter((a) => !pending.includes(a)).length})</summary>
                  <ul className="mt-2 space-y-2">{(actions.data ?? []).filter((a) => !pending.includes(a)).map((a) => <AgentActionCard key={a.id} a={a} />)}</ul></details>
              )}
            </section>
          )}
        </div>
        <form className="flex gap-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); send(q); }}>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ref ? "Ask about this record…" : "Open a record to ask about it"} disabled={!ref} aria-label="Ask EVI" />
          <Button type="submit" size="icon" disabled={!ref || !q.trim() || ask.isPending} aria-label="Send"><PaperPlaneRightIcon /></Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
