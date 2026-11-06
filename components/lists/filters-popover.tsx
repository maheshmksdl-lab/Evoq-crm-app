"use client";

import { useState } from "react";
import { FunnelSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUsers } from "@/lib/query/hooks";
import { FIELDS, type FieldDef } from "@/lib/domain/fields";
import type { FilterOp, FilterRule, ModuleKey } from "@/lib/schemas";
import { SelectField } from "@/components/forms/field-input";

const OPS: Record<string, { value: FilterOp; label: string }[]> = {
  text: [{ value: "contains", label: "contains" }, { value: "not_contains", label: "doesn't contain" }, { value: "is", label: "is" }, { value: "is_not", label: "is not" }, { value: "is_empty", label: "is empty" }, { value: "is_not_empty", label: "is not empty" }],
  choice: [{ value: "is", label: "is" }, { value: "is_not", label: "is not" }, { value: "is_empty", label: "is empty" }, { value: "is_not_empty", label: "is not empty" }],
  number: [{ value: "is", label: "equals" }, { value: "gt", label: "greater than" }, { value: "lt", label: "less than" }, { value: "is_empty", label: "is empty" }, { value: "is_not_empty", label: "is not empty" }],
  date: [{ value: "before", label: "before" }, { value: "after", label: "after" }, { value: "is_empty", label: "is empty" }, { value: "is_not_empty", label: "is not empty" }],
};
const opKind = (f: FieldDef) => (["select", "user"].includes(f.type) ? "choice" : ["number", "money", "percent"].includes(f.type) ? "number" : ["date", "datetime"].includes(f.type) ? "date" : "text");
const DERIVED_OK = new Set(["healthBand", "nextActionDue", "lastInteractionAt", "attentionCount", "stageAgeDays", "openDeals"]);

export function filterable(module: ModuleKey) {
  return FIELDS[module].filter((f) => (!f.derived || DERIVED_OK.has(f.key)) && f.type !== "textarea" && f.type !== "boolean");
}

export function FiltersPopover({ module, filters, onChange }: { module: ModuleKey; filters: FilterRule[]; onChange: (f: FilterRule[]) => void }) {
  const users = useUsers();
  const fields = filterable(module);
  const [draft, setDraft] = useState<FilterRule[]>(filters);
  const [open, setOpen] = useState(false);
  const def = (k: string) => fields.find((f) => f.key === k);

  const set = (i: number, p: Partial<FilterRule>) => setDraft((d) => d.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const apply = () => { onChange(draft.filter((r) => r.field && (r.op === "is_empty" || r.op === "is_not_empty" || r.value.trim() !== ""))); setOpen(false); };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(filters.length ? filters : []); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm"><FunnelSimpleIcon />Filters{filters.length > 0 && <span className="ml-0.5 grid size-5 place-items-center rounded-full bg-crm-primary text-micro text-white">{filters.length}</span>}</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(560px,calc(100vw-2rem))] space-y-3 p-4">
        <p className="text-card-title text-heading">Filter records</p>
        {draft.length === 0 && <p className="text-body text-ink-muted">No filters yet. Records matching <em>all</em> rules are shown.</p>}
        <ul className="space-y-2">
          {draft.map((r, i) => {
            const f = def(r.field);
            const kind = f ? opKind(f) : "text";
            const noValue = r.op === "is_empty" || r.op === "is_not_empty";
            return (
              <li key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 max-sm:grid-cols-2">
                <SelectField ariaLabel="Field" value={r.field} allowEmpty={false} onChange={(v) => { const nf = def(v); set(i, { field: v, op: OPS[nf ? opKind(nf) : "text"][0].value, value: "" }); }} options={fields.map((x) => ({ value: x.key, label: x.label }))} placeholder="Field" />
                <SelectField ariaLabel="Condition" value={r.op} allowEmpty={false} onChange={(v) => set(i, { op: v as FilterOp })} options={OPS[kind]} />
                {noValue ? <span /> : f?.type === "select" ? <SelectField ariaLabel="Value" value={r.value} onChange={(v) => set(i, { value: v })} options={f.options ?? []} placeholder="Value" />
                  : f?.type === "user" ? <SelectField ariaLabel="Person" value={r.value} onChange={(v) => set(i, { value: v })} options={(users.data ?? []).map((u) => ({ value: u.id, label: u.name }))} placeholder="Person" />
                  : <Input aria-label="Value" type={kind === "number" ? "number" : kind === "date" ? "date" : "text"} value={r.value} onChange={(e) => set(i, { value: e.target.value })} className="h-8" />}
                <Button variant="ghost" size="icon-sm" aria-label="Remove filter" onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}><TrashIcon /></Button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={() => setDraft((d) => [...d, { field: fields[0].key, op: OPS[opKind(fields[0])][0].value, value: "" }])}><PlusIcon />Add filter</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { onChange([]); setDraft([]); setOpen(false); }}>Clear</Button>
            <Button size="sm" onClick={apply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
