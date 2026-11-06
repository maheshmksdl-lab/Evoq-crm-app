"use client";

import { useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon, TrashIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectField } from "@/components/forms/field-input";
import { ConfirmDialog, Field, SectionCard } from "@/components/shared/primitives";
import { CardSkeleton, ErrorState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/badges";
import { useAdmin, useSettings } from "@/lib/query/hooks";
import { FIELDS } from "@/lib/domain/fields";
import type { CustomFieldInput } from "@/lib/schemas/inputs";
import type { ModuleKey, RecordModule } from "@/lib/schemas";

const RECORD: RecordModule[] = ["leads", "contacts", "accounts", "deals"];

export function ModulesPanel() {
  const q = useSettings();
  const admin = useAdmin();
  const [mod, setMod] = useState<ModuleKey | null>(null);
  if (q.isPending) return <CardSkeleton lines={6} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const modules = q.data.modules;
  if (mod) return <ModuleDetail module={mod} onBack={() => setMod(null)} />;
  return (
    <SectionCard title="Modules, fields & layouts" description="Rename modules, add custom fields and arrange the detail view. Existing data is never removed.">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <li key={m.key} className="rounded-xl border border-line p-4">
            <div className="flex items-start justify-between gap-2"><button type="button" onClick={() => setMod(m.key)} className="text-left"><p className="text-card-title text-heading hover:text-crm-primary">{m.plural}</p>
              <p className="text-caption text-ink-muted">{FIELDS[m.key].filter((f) => !f.derived).length} fields · {q.data.customFields.filter((c) => c.module === m.key).length} custom</p></button>
              <Switch checked={m.enabled} onCheckedChange={(on) => admin.updateModules.mutate([modules.map((x) => (x.key === m.key ? { ...x, enabled: on } : x))])} aria-label={`${m.enabled ? "Disable" : "Enable"} ${m.plural}`} /></div>
            {!m.enabled && <StatusBadge tone="neutral" className="mt-2">Hidden from navigation</StatusBadge>}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function ModuleDetail({ module, onBack }: { module: ModuleKey; onBack: () => void }) {
  const q = useSettings();
  const admin = useAdmin();
  const [dlg, setDlg] = useState(false);
  const [rm, setRm] = useState<string | null>(null);
  const [naming, setNaming] = useState<{ singular: string; plural: string } | null>(null);
  const cfg = q.data!.modules.find((m) => m.key === module)!;
  const custom = q.data!.customFields.filter((c) => c.module === module);
  const n = naming ?? { singular: cfg.singular, plural: cfg.plural };
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeftIcon />All modules</Button>
      <Tabs defaultValue="fields">
        <TabsList variant="line"><TabsTrigger value="fields">Fields</TabsTrigger>{RECORD.includes(module as RecordModule) && <TabsTrigger value="layout">Detail layout</TabsTrigger>}<TabsTrigger value="naming">Naming</TabsTrigger></TabsList>
        <TabsContent value="fields" className="mt-4">
          <SectionCard title={`${cfg.plural} fields`} actions={RECORD.includes(module as RecordModule) && <Button size="sm" onClick={() => setDlg(true)}><PlusIcon weight="bold" />Add custom field</Button>}>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {FIELDS[module].filter((f) => !f.derived).map((f) => <p key={f.key} className="flex items-center justify-between border-b border-line-soft py-2 text-body"><span>{f.label}{f.required && <span className="text-error"> *</span>}</span><span className="text-caption text-ink-muted">{f.type}</span></p>)}
            </div>
            {custom.length > 0 && <><h3 className="mb-1 mt-4 text-label font-semibold text-heading">Custom fields</h3>
              <ul>{custom.map((c) => <li key={c.id} className="flex items-center justify-between border-b border-line-soft py-2 text-body"><span>{c.label}{c.required && <span className="text-error"> *</span>}<span className="ml-2 text-caption text-ink-muted">{c.type}{c.type === "select" ? ` · ${c.options.join(", ")}` : ""}</span></span>
                <Button variant="ghost" size="icon-xs" aria-label={`Remove ${c.label}`} onClick={() => setRm(c.id)}><TrashIcon /></Button></li>)}</ul></>}
            {!RECORD.includes(module as RecordModule) && <p className="mt-3 text-caption text-ink-muted">Custom fields are available for Leads, Contacts, Accounts and Deals.</p>}
          </SectionCard>
        </TabsContent>
        {RECORD.includes(module as RecordModule) && <TabsContent value="layout" className="mt-4"><LayoutEditor module={module as RecordModule} /></TabsContent>}
        <TabsContent value="naming" className="mt-4">
          <SectionCard title="Naming" bodyClassName="space-y-3 max-w-md">
            <Field label="Singular" htmlFor="n-s"><Input id="n-s" value={n.singular} onChange={(e) => setNaming({ ...n, singular: e.target.value })} /></Field>
            <Field label="Plural" htmlFor="n-p"><Input id="n-p" value={n.plural} onChange={(e) => setNaming({ ...n, plural: e.target.value })} /></Field>
            <p className="text-caption text-ink-muted">Used in settings and reports. Navigation and page titles keep the standard names.</p>
            <Button disabled={!naming || !n.singular.trim() || !n.plural.trim()} onClick={() => admin.updateModules.mutate([q.data!.modules.map((m) => (m.key === module ? { ...m, ...n } : m))], { onSuccess: () => setNaming(null) })}>Save naming</Button>
          </SectionCard>
        </TabsContent>
      </Tabs>
      {dlg && <CustomFieldDialog module={module as RecordModule} onClose={() => setDlg(false)} />}
      <ConfirmDialog open={!!rm} onOpenChange={(o) => !o && setRm(null)} destructive confirmLabel="Remove field" title="Remove this custom field?" description="The field disappears from forms and details. Values already saved on records are kept in the data but no longer shown."
        onConfirm={async () => { if (rm) await admin.removeField.mutateAsync([rm]); }} />
    </div>
  );
}

function CustomFieldDialog({ module, onClose }: { module: RecordModule; onClose: () => void }) {
  const admin = useAdmin();
  const [label, setLabel] = useState("");
  const [type, setType] = useState<CustomFieldInput["type"]>("text");
  const [opts, setOpts] = useState("");
  const [required, setRequired] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const key = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/^(\d)/, "f_$1");
  const save = async () => {
    setErr(null);
    if (!label.trim()) { setErr("Label is required"); return; }
    try { await admin.addField.mutateAsync([{ module, key, label: label.trim(), type, options: type === "select" ? opts.split(",").map((s) => s.trim()).filter(Boolean) : [], required }]); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not add the field."); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add custom field</DialogTitle><DialogDescription>It appears in the create/edit form and on the Details tab.</DialogDescription></DialogHeader>
        {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
        <Field label="Label" htmlFor="cf-l" required hint={key ? `Stored as “${key}”` : undefined}><Input id="cf-l" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus /></Field>
        <Field label="Type" htmlFor="cf-t"><SelectField id="cf-t" value={type} allowEmpty={false} onChange={(v) => setType(v as typeof type)} options={[{ value: "text", label: "Text" }, { value: "number", label: "Number" }, { value: "date", label: "Date" }, { value: "select", label: "Pick list" }, { value: "checkbox", label: "Checkbox" }]} /></Field>
        {type === "select" && <Field label="Options" htmlFor="cf-o" hint="Separate with commas"><Input id="cf-o" value={opts} onChange={(e) => setOpts(e.target.value)} /></Field>}
        <label className="flex items-center gap-2 text-body"><Checkbox checked={required} onCheckedChange={(c) => setRequired(c === true)} />Required on create and edit</label>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={admin.addField.isPending}>Add field</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═════════════ detail layout editor ═════════════ */
interface Sec { id: string; title: string; fields: string[] }
function LayoutEditor({ module }: { module: RecordModule }) {
  const q = useSettings();
  const admin = useAdmin();
  const defaults = useMemo<Sec[]>(() => {
    const defs = FIELDS[module].filter((f) => f.group && !f.derived);
    const custom = (q.data?.customFields ?? []).filter((c) => c.module === module);
    const secs = [...new Set(defs.map((d) => d.group!))].map((g, i) => ({ id: `s${i}`, title: g, fields: defs.filter((d) => d.group === g).map((d) => d.key) }));
    if (custom.length) secs.push({ id: "custom", title: "Custom fields", fields: custom.map((c) => `custom.${c.key}`) });
    return secs;
  }, [module, q.data?.customFields]);
  const saved = q.data?.layouts.find((l) => l.module === module);
  const [secs, setSecs] = useState<Sec[] | null>(null);
  const cur = secs ?? saved?.sections ?? defaults;
  const dirty = secs !== null;
  const label = (k: string) => FIELDS[module].find((f) => f.key === k)?.label ?? q.data?.customFields.find((c) => `custom.${c.key}` === k)?.label ?? k;
  const all = [...FIELDS[module].filter((f) => f.group && !f.derived).map((f) => f.key), ...(q.data?.customFields ?? []).filter((c) => c.module === module).map((c) => `custom.${c.key}`)];
  const hidden = all.filter((k) => !cur.some((s) => s.fields.includes(k)));
  const upd = (fn: (s: Sec[]) => Sec[]) => setSecs(fn(structuredClone(cur)));
  const move = (si: number, fi: number, d: -1 | 1) => upd((s) => { const f = s[si].fields; const j = fi + d; if (j < 0 || j >= f.length) return s; [f[fi], f[j]] = [f[j], f[fi]]; return s; });
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <SectionCard title="Detail view layout" description="Controls the sections and fields shown on the Details tab. Hiding a field never deletes its data."
        actions={<><Button size="xs" variant="outline" onClick={() => upd((s) => [...s, { id: `n${Date.now()}`, title: "New section", fields: [] }])}><PlusIcon />Section</Button></>}>
        {err && <p role="alert" className="mb-2 text-body text-error-fg">{err}</p>}
        <div className="space-y-3">{cur.map((s, si) => (
          <div key={s.id} className="rounded-xl border border-line p-3">
            <div className="mb-2 flex items-center gap-2"><Input aria-label="Section title" value={s.title} onChange={(e) => upd((x) => { x[si].title = e.target.value; return x; })} className="h-8 font-medium" />
              <Button variant="ghost" size="icon-xs" aria-label="Delete section" onClick={() => upd((x) => x.filter((_, i) => i !== si))}><TrashIcon /></Button></div>
            {s.fields.length === 0 && <p className="text-caption text-ink-muted">No fields in this section.</p>}
            <ul className="space-y-1">{s.fields.map((f, fi) => (
              <li key={f} className="flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1">
                <span className="flex-1 truncate text-body">{label(f)}</span>
                <Button variant="ghost" size="icon-xs" aria-label={`Move ${label(f)} up`} disabled={fi === 0} onClick={() => move(si, fi, -1)}><ArrowUpIcon /></Button>
                <Button variant="ghost" size="icon-xs" aria-label={`Move ${label(f)} down`} disabled={fi === s.fields.length - 1} onClick={() => move(si, fi, 1)}><ArrowDownIcon /></Button>
                <div className="w-32"><SelectField ariaLabel={`Move ${label(f)} to another section`} value="" placeholder="Move to…" onChange={(to) => { if (to) upd((x) => { x[si].fields = x[si].fields.filter((k) => k !== f); x.find((y) => y.id === to)?.fields.push(f); return x; }); }} options={cur.filter((y) => y.id !== s.id).map((y) => ({ value: y.id, label: y.title }))} /></div>
                <Button variant="ghost" size="icon-xs" aria-label={`Hide ${label(f)}`} onClick={() => upd((x) => { x[si].fields = x[si].fields.filter((k) => k !== f); return x; })}><XIcon /></Button>
              </li>))}</ul>
          </div>))}</div>
        {hidden.length > 0 && <div className="mt-4"><p className="mb-1 text-label font-medium text-ink">Hidden fields</p><div className="flex flex-wrap gap-1.5">{hidden.map((k) => <Button key={k} size="xs" variant="outline" disabled={!cur.length} onClick={() => upd((x) => { x[0].fields.push(k); return x; })}><PlusIcon />{label(k)}</Button>)}</div></div>}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-3">
          {dirty && <span role="status" className="mr-auto text-caption text-warning-fg">Unsaved layout changes</span>}
          {saved && <Button variant="ghost" onClick={() => admin.resetLayout.mutate([module], { onSuccess: () => setSecs(null) })}>Reset to default</Button>}
          <Button variant="outline" disabled={!dirty} onClick={() => setSecs(null)}>Discard</Button>
          <Button disabled={!dirty || admin.saveLayout.isPending} onClick={() => { setErr(null); if (cur.some((s) => !s.title.trim())) { setErr("Every section needs a title."); return; } admin.saveLayout.mutate([{ module, sections: cur }], { onSuccess: () => setSecs(null) }); }}>Save layout</Button>
        </div>
      </SectionCard>
      <SectionCard title="Preview" description="How the Details tab will be organized">
        <div className="space-y-3">{cur.map((s) => <div key={s.id}><p className="text-label font-semibold text-heading">{s.title || "Untitled"}</p><p className="text-caption text-ink-muted">{s.fields.map(label).join(" · ") || "—"}</p></div>)}</div>
      </SectionCard>
    </div>
  );
}
