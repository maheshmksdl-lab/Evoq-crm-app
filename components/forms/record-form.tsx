"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { AccountInput, ContactInput, DealInput, LeadInput } from "@/lib/schemas/inputs";
import { STAGE_PROBABILITY } from "@/lib/schemas/options";
import { FIELDS, type FieldDef } from "@/lib/domain/fields";
import { useCreateRecord, useRecord, useSession, useSettings, useUpdateRecord } from "@/lib/query/hooks";
import { ValidationError } from "@/lib/services";
import { CardSkeleton } from "@/components/shared/states";
import { FieldInput } from "./field-input";
import { FormDrawer } from "./form-drawer";

type Mod = "leads" | "contacts" | "accounts" | "deals";
const SCHEMA = { leads: LeadInput, contacts: ContactInput, accounts: AccountInput, deals: DealInput } as const;
const TITLE: Record<Mod, string> = { leads: "lead", contacts: "contact", accounts: "account", deals: "deal" };

function emptyDefaults(m: Mod, ownerId: string): FieldValues {
  const addr = { street: "", city: "", state: "", zip: "", country: "" };
  const base = { ownerId, description: "", custom: {} };
  switch (m) {
    case "leads": return { ...base, salutation: "", firstName: "", lastName: "", company: "", title: "", email: "", phone: "", mobile: "", fax: "", website: "", status: "New", leadSource: "", industry: "", rating: "", priority: "", noOfEmployees: "", annualRevenue: null, emailOptOut: false, twitter: "", address: addr };
    case "contacts": return { ...base, salutation: "", firstName: "", lastName: "", accountId: null, email: "", secondaryEmail: "", phone: "", mobile: "", otherPhone: "", homePhone: "", fax: "", title: "", department: "", leadSource: "", assistant: "", asstPhone: "", dateOfBirth: "", emailOptOut: false, skypeId: "", twitter: "", reportingToId: null, mailing: addr, other: addr };
    case "accounts": return { ...base, name: "", phone: "", website: "", accountType: "", rating: "", accountSite: "", fax: "", parentAccountId: null, tickerSymbol: "", ownership: "", industry: "", employees: "", sicCode: "", annualRevenue: null, billing: addr, shipping: addr };
    case "deals": return { ...base, name: "", amount: null, accountId: null, contactId: null, stage: "Qualification", type: "", nextStep: "", probability: STAGE_PROBABILITY.Qualification, leadSource: "", closingDate: "" };
  }
}

const CUSTOM_TYPE: Record<string, FieldDef["type"]> = { text: "text", number: "number", date: "date", select: "select", checkbox: "boolean" };

/** Create/edit drawer for Leads, Contacts, Accounts and Deals — generated from the field registry. */
export function RecordForm({ module, id, defaults, onClose }: { module: Mod; id?: string; defaults?: Record<string, unknown>; onClose: () => void }) {
  const router = useRouter();
  const session = useSession();
  const settings = useSettings();
  const existing = useRecord(module, id ?? "");
  const create = useCreateRecord(module);
  const update = useUpdateRecord(module);
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const editing = Boolean(id);
  const userId = session.data?.user?.id ?? "";

  const form = useForm<FieldValues>({
    resolver: zodResolver(SCHEMA[module]) as unknown as Resolver<FieldValues>,
    defaultValues: { ...emptyDefaults(module, userId), ...defaults },
    mode: "onTouched",
  });
  const { control, handleSubmit, reset, setError, setValue, formState: { errors, dirtyFields, isDirty, isSubmitting } } = form;

  useEffect(() => { if (editing && existing.data) reset(existing.data as unknown as FieldValues); }, [editing, existing.data, reset]);

  // New deals: probability follows the stage until the user types their own value.
  const stage = useWatch({ control, name: "stage" });
  useEffect(() => {
    if (module === "deals" && !editing && !dirtyFields.probability && typeof stage === "string") setValue("probability", STAGE_PROBABILITY[stage as keyof typeof STAGE_PROBABILITY] ?? 0);
  }, [module, editing, stage, dirtyFields.probability, setValue]);

  const groups = useMemo(() => {
    const map = new Map<string, { def: FieldDef; name: string; custom?: boolean; required?: boolean; options?: { value: string; label: string }[] }[]>();
    for (const f of FIELDS[module]) {
      if (f.derived || !f.group || f.group === "System") continue;
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group)!.push({ def: f, name: f.key, required: f.required });
    }
    const custom = (settings.data?.customFields ?? []).filter((c) => c.module === module);
    if (custom.length) {
      map.set("Custom fields", custom.map((c) => ({
        def: { key: c.key, label: c.label, type: CUSTOM_TYPE[c.type], options: c.options } as FieldDef, name: `custom.${c.key}`, custom: true, required: c.required,
      })));
    }
    // Description reads best last, full width.
    return [...map.entries()];
  }, [module, settings.data?.customFields]);

  const errorAt = (name: string) => {
    const parts = name.split(".");
    let e: unknown = errors;
    for (const p of parts) e = (e as Record<string, unknown> | undefined)?.[p];
    return (e as { message?: string } | undefined)?.message;
  };
  const groupHasError = (names: string[]) => names.some((n) => errorAt(n));

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (editing) { await update.mutateAsync([id!, values]); onClose(); }
      else {
        const created = (await create.mutateAsync([values])) as { id: string };
        onClose();
        router.push(`/${module}/${created.id}`);
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        let placed = false;
        e.issues.forEach((i) => { if (i.path) { setError(i.path as never, { message: i.message }); placed = true; } });
        if (!placed) setFormError(e.message);
      } else setFormError(e instanceof Error ? e.message : "Could not save.");
    }
  }, () => {
    setOpen(new Set(groups.filter(([, fs]) => groupHasError(fs.map((f) => f.name))).map(([g]) => g)));
    setFormError("Fix the highlighted fields to continue.");
  });

  const loading = editing && existing.isPending;
  return (
    <FormDrawer
      open onClose={onClose} dirty={isDirty} submitting={isSubmitting} submitLabel={editing ? "Save changes" : `Create ${TITLE[module]}`} formId="record-form"
      title={editing ? `Edit ${TITLE[module]}` : `New ${TITLE[module]}`}
      description={editing ? undefined : "Fields marked * are required."}
    >
      {loading ? <CardSkeleton lines={8} /> : editing && existing.isError ? <p role="alert" className="text-body text-error-fg">{existing.error.message}</p> : (
        <form id="record-form" onSubmit={submit} noValidate className="space-y-3">
          {formError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg"><WarningCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" />{formError}</div>}
          {groups.map(([group, fields], i) => (
            <details key={group} open={i === 0 || open.has(group) || undefined} onToggle={(e) => {
              const isOpen = (e.currentTarget as HTMLDetailsElement).open;
              setOpen((s) => { const n = new Set(s); if (isOpen) n.add(group); else n.delete(group); return n; });
            }} className="group rounded-xl border border-line bg-card open:bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-card-title text-heading [&::-webkit-details-marker]:hidden">
                {group}
                <span aria-hidden className="text-caption font-normal text-ink-muted group-open:hidden">{groupHasError(fields.map((f) => f.name)) ? "Has errors" : "Optional"}</span>
              </summary>
              <div className="grid gap-3 border-t border-line-soft p-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.name} className={f.def.type === "textarea" ? "sm:col-span-2" : undefined}>
                    <FieldInput def={f.def} name={f.name} control={control} error={errorAt(f.name)} required={f.required} />
                  </div>
                ))}
              </div>
            </details>
          ))}
        </form>
      )}
    </FormDrawer>
  );
}
