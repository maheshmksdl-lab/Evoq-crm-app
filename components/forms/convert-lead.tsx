"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { ConvertLeadInput } from "@/lib/schemas/inputs";
import { DEAL_STAGES } from "@/lib/schemas/options";
import { useConvertLead, useListAll, useRecord, useUsers } from "@/lib/query/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/primitives";
import { CardSkeleton } from "@/components/shared/states";
import { SelectField } from "./field-input";
import { FormDrawer } from "./form-drawer";

/**
 * Convert lead → account + contact (+ optional deal).
 * Rules preserved from the original drawer: a deal needs a name and a closing date; stage defaults to Qualification;
 * account name defaults to the company (else the person); deal name defaults to the last name.
 */
export function ConvertLeadForm({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const router = useRouter();
  const lead = useRecord("leads", leadId);
  const accounts = useListAll("accounts");
  const users = useUsers();
  const convert = useConvertLead();
  const l = lead.data;

  const [mode, setMode] = useState<"new" | "existing">("new");
  const [accName, setAccName] = useState<string | null>(null);
  const [accId, setAccId] = useState("");
  const [first, setFirst] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const [createDeal, setCreateDeal] = useState(false);
  const [dealName, setDealName] = useState<string | null>(null);
  const [amount, setAmount] = useState("0");
  const [close, setClose] = useState("");
  const [stage, setStage] = useState<(typeof DEAL_STAGES)[number]>("Qualification");
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  const vals = useMemo(() => ({
    accName: accName ?? (l ? l.company || [l.firstName, l.lastName].filter(Boolean).join(" ") : ""),
    first: first ?? l?.firstName ?? "", last: last ?? l?.lastName ?? "", dealName: dealName ?? l?.lastName ?? "",
    owner: owner === undefined ? l?.ownerId ?? null : owner,
  }), [accName, first, last, dealName, owner, l]);

  const submit = async () => {
    const payload = {
      account: mode === "new" ? { mode, name: vals.accName } : { mode, accountId: accId },
      contact: { firstName: vals.first, lastName: vals.last },
      deal: createDeal ? { create: true, name: vals.dealName, amount: amount === "" ? undefined : Number(amount), closingDate: close, stage } : { create: false },
      ownerId: vals.owner, notifyOwner: false,
    };
    const parsed = ConvertLeadInput.safeParse(payload);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { const k = i.path.join("."); e[k] ??= i.message; });
      setErrors(e);
      return;
    }
    setErrors({}); setBusy(true);
    try {
      const r = await convert.mutateAsync([leadId, payload]);
      onClose();
      router.push(r.dealId ? `/deals/${r.dealId}` : `/contacts/${r.contactId}`);
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : "Could not convert." });
    } finally { setBusy(false); }
  };

  return (
    <FormDrawer open onClose={onClose} dirty={touched} submitting={busy} onSubmit={submit} submitLabel="Convert lead" title="Convert lead" description={l ? `${[l.firstName, l.lastName].filter(Boolean).join(" ")}${l.company ? ` · ${l.company}` : ""}` : undefined}>
      {!l ? <CardSkeleton lines={8} /> : (
        <div className="space-y-4" onChange={() => setTouched(true)}>
          {errors.form && <div role="alert" className="rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg">{errors.form}</div>}
          <div className="flex gap-2 rounded-lg bg-crm-surface px-3 py-2 text-caption text-crm-depth dark:bg-info-bg dark:text-info-fg"><InfoIcon className="mt-0.5 size-4 shrink-0" />The lead becomes read-only. Open tasks, calls and meetings move to the new {createDeal ? "deal" : "contact"}; notes and history stay on the lead.</div>

          <section className="space-y-3 rounded-xl border border-line p-4">
            <h3 className="text-card-title text-heading">Account</h3>
            <div role="radiogroup" aria-label="Account" className="flex gap-4 text-body">
              {(["new", "existing"] as const).map((m) => (
                <label key={m} className="flex items-center gap-2"><input type="radio" name="acc-mode" checked={mode === m} onChange={() => { setMode(m); setTouched(true); }} className="accent-[var(--crm-primary)]" />{m === "new" ? "Create new account" : "Link existing account"}</label>
              ))}
            </div>
            {mode === "new"
              ? <Field label="Account name" htmlFor="cv-acc" error={errors["account.name"]} required><Input id="cv-acc" value={vals.accName} onChange={(e) => setAccName(e.target.value)} aria-invalid={!!errors["account.name"]} /></Field>
              : <Field label="Account" htmlFor="cv-acc-ex" error={errors["account.accountId"]} required><SelectField id="cv-acc-ex" value={accId} onChange={(v) => { setAccId(v); setTouched(true); }} options={(accounts.data ?? []).map((a) => ({ value: a.id, label: a.name }))} placeholder="Choose account" /></Field>}
          </section>

          <section className="space-y-3 rounded-xl border border-line p-4">
            <h3 className="text-card-title text-heading">Contact</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" htmlFor="cv-first"><Input id="cv-first" value={vals.first} onChange={(e) => setFirst(e.target.value)} /></Field>
              <Field label="Last name" htmlFor="cv-last" error={errors["contact.lastName"]} required><Input id="cv-last" value={vals.last} onChange={(e) => setLast(e.target.value)} aria-invalid={!!errors["contact.lastName"]} /></Field>
            </div>
            <Field label="Owner" htmlFor="cv-owner"><SelectField id="cv-owner" value={vals.owner ?? ""} onChange={(v) => { setOwner(v || null); setTouched(true); }} options={(users.data ?? []).filter((u) => u.active).map((u) => ({ value: u.id, label: u.name }))} placeholder="Unassigned" /></Field>
          </section>

          <section className="rounded-xl border border-line p-4">
            <label className="flex items-center gap-2.5"><Checkbox checked={createDeal} onCheckedChange={(c) => { setCreateDeal(c === true); setTouched(true); }} /><span className="text-card-title text-heading">Also create a deal</span></label>
            {createDeal && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Deal name" htmlFor="cv-deal" error={errors["deal.name"]} required className="sm:col-span-2"><Input id="cv-deal" value={vals.dealName} onChange={(e) => setDealName(e.target.value)} aria-invalid={!!errors["deal.name"]} /></Field>
                <Field label="Amount" htmlFor="cv-amt" error={errors["deal.amount"]}><Input id="cv-amt" type="number" min={0} step="any" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
                <Field label="Closing date" htmlFor="cv-close" error={errors["deal.closingDate"]} required><Input id="cv-close" type="date" value={close} onChange={(e) => setClose(e.target.value)} aria-invalid={!!errors["deal.closingDate"]} /></Field>
                <Field label="Stage" htmlFor="cv-stage"><SelectField id="cv-stage" value={stage} onChange={(v) => setStage(v as typeof stage)} options={DEAL_STAGES} allowEmpty={false} /></Field>
              </div>
            )}
          </section>
        </div>
      )}
    </FormDrawer>
  );
}
