"use client";

import { Controller, type Control, type FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/primitives";
import { useListAll, useUsers } from "@/lib/query/hooks";
import { personName } from "@/lib/domain/names";
import type { FieldDef } from "@/lib/domain/fields";

const NONE = "__none";

export interface Option { value: string; label: string }

export function useRefOptions(ref: "accounts" | "contacts" | "deals" | "leads"): Option[] {
  const q = useListAll(ref);
  return (q.data ?? []).map((r) => ({ value: r.id, label: "name" in r && typeof r.name === "string" ? r.name : personName(r as never) }));
}

export function SelectField({ id, value, onChange, options, placeholder = "Select…", allowEmpty = true, invalid, disabled, ariaLabel }: {
  id?: string; ariaLabel?: string; value: string | null | undefined; onChange: (v: string) => void; options: readonly (string | Option)[]; placeholder?: string; allowEmpty?: boolean; invalid?: boolean; disabled?: boolean;
}) {
  const opts: Option[] = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <Select value={value || (allowEmpty ? NONE : "")} onValueChange={(v) => onChange(v === NONE ? "" : v)} disabled={disabled}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid} aria-label={ariaLabel}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {allowEmpty && <SelectItem value={NONE}><span className="text-ink-muted">{placeholder === "Select…" ? "None" : placeholder}</span></SelectItem>}
        {opts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/** One input for one registry field, wired to React Hook Form. `name` may be a dotted path. */
export function FieldInput({ def, name, control, error, label, options, required }: {
  def: Pick<FieldDef, "type" | "options" | "ref" | "label"> & { key?: string };
  name: string; control: Control<FieldValues>; error?: string; label?: string; options?: Option[]; required?: boolean;
}) {
  const users = useUsers();
  const refOpts = useRefOptions((def.ref ?? "accounts") as "accounts");
  const id = `f-${name.replace(/\./g, "-")}`;
  const text = label ?? def.label;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const v = field.value;
        let input: React.ReactNode;
        switch (def.type) {
          case "boolean":
            return (
              <div className="flex items-center gap-2 pt-6">
                <Checkbox id={id} checked={Boolean(v)} onCheckedChange={(c) => field.onChange(c === true)} />
                <label htmlFor={id} className="text-label text-ink">{text}</label>
              </div>
            );
          case "select":
            input = <SelectField id={id} value={v as string} onChange={field.onChange} options={options ?? def.options ?? []} invalid={!!error} allowEmpty={!required} />;
            break;
          case "user":
            input = <SelectField id={id} value={(v as string | null) ?? ""} onChange={(x) => field.onChange(x || null)} options={(users.data ?? []).filter((u) => u.active).map((u) => ({ value: u.id, label: u.name }))} placeholder="Unassigned" invalid={!!error} />;
            break;
          case "ref":
            input = <SelectField id={id} value={(v as string | null) ?? ""} onChange={(x) => field.onChange(x || null)} options={options ?? refOpts} invalid={!!error} />;
            break;
          case "textarea":
            input = <Textarea id={id} rows={3} value={(v as string) ?? ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />;
            break;
          case "number": case "money": case "percent":
            input = (
              <Input id={id} type="number" inputMode="decimal" min={0} step="any" value={v === null || v === undefined ? "" : String(v)}
                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} onBlur={field.onBlur} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
            );
            break;
          case "date":
            input = <Input id={id} type="date" value={(v as string) ?? ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />;
            break;
          case "datetime":
            input = <Input id={id} type="datetime-local" value={(v as string) ?? ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />;
            break;
          default:
            input = (
              <Input id={id} type={def.type === "email" ? "email" : def.type === "phone" ? "tel" : "text"} autoComplete="off" value={(v as string) ?? ""}
                onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
            );
        }
        return <Field label={text} htmlFor={id} error={error} required={required}>{input}</Field>;
      }}
    />
  );
}
