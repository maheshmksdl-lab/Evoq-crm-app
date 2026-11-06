"use client";

import { useRef, useState } from "react";
import { DownloadSimpleIcon, UploadSimpleIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/forms/field-input";
import { ConfirmDialog, Field, SectionCard } from "@/components/shared/primitives";
import { StatusBadge } from "@/components/shared/badges";
import { useAdmin } from "@/lib/query/hooks";
import { dataAdmin, importableFields, type ImportModule } from "@/lib/services";
import { download, parseCsv, toCsv } from "@/lib/domain/csv";
import { nowIso } from "@/lib/domain/clock";
import type { ModuleKey } from "@/lib/schemas";

const MODS: { value: ImportModule; label: string }[] = [
  { value: "leads", label: "Leads" }, { value: "contacts", label: "Contacts" }, { value: "accounts", label: "Accounts" }, { value: "deals", label: "Deals" }, { value: "tasks", label: "Tasks" },
];
const MAX_BYTES = 2 * 1024 * 1024;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/* ═════════════ Import ═════════════ */
export function ImportPanel() {
  const admin = useAdmin();
  const file = useRef<HTMLInputElement>(null);
  const [mod, setMod] = useState<ImportModule>("leads");
  const [csv, setCsv] = useState<string[][] | null>(null);
  const [name, setName] = useState("");
  const [map, setMap] = useState<Record<number, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof dataAdmin.preview>> | null>(null);
  const [result, setResult] = useState<{ created: number; failed: { row: number; error: string }[] } | null>(null);
  const fields = importableFields(mod);

  const automap = (header: string[], m: ImportModule) => {
    const fs = importableFields(m);
    return Object.fromEntries(header.map((h, i) => [i, fs.find((f) => norm(f.label) === norm(h) || norm(f.key) === norm(h))?.key ?? ""]));
  };
  const onFile = async (f: File | undefined) => {
    setErr(null); setPreview(null); setResult(null);
    if (!f) return;
    if (!/\.csv$/i.test(f.name) && f.type !== "text/csv") { setErr("Choose a .csv file."); return; }
    if (f.size > MAX_BYTES) { setErr(`That file is ${(f.size / 1024 / 1024).toFixed(1)} MB. The limit is 2 MB — split it into smaller files.`); return; }
    const rows = parseCsv(await f.text());
    if (rows.length < 2) { setErr("The file needs a header row and at least one data row."); return; }
    setCsv(rows); setName(f.name); setMap(automap(rows[0], mod));
  };
  const toRecords = () => csv!.slice(1).map((r) => Object.fromEntries(Object.entries(map).filter(([, k]) => k).map(([i, k]) => [k, r[Number(i)] ?? ""])));
  const runPreview = async () => {
    setErr(null);
    try { setPreview(await dataAdmin.preview(mod, toRecords())); } catch (e) { setErr(e instanceof Error ? e.message : "Could not check the file."); }
  };
  const ok = preview?.filter((p) => p.ok).length ?? 0;
  const bad = (preview ?? []).filter((p) => !p.ok) as { row: number; ok: false; error: string }[];

  return (
    <SectionCard title="Import" description="Add records from a CSV file. Rows are checked first; nothing is imported until you confirm." bodyClassName="space-y-4">
      {err && <p role="alert" className="rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg">{err}</p>}
      {result ? (
        <div className="space-y-2">
          <p role="status" className="text-body"><StatusBadge tone="success">Done</StatusBadge> Imported <strong>{result.created}</strong> record{result.created === 1 ? "" : "s"}{result.failed.length ? `; ${result.failed.length} skipped` : ""}.</p>
          {result.failed.length > 0 && <ul className="max-h-40 overflow-auto rounded-lg bg-muted p-2 text-caption">{result.failed.map((f) => <li key={f.row}>Row {f.row}: {f.error}</li>)}</ul>}
          <Button variant="outline" onClick={() => { setResult(null); setCsv(null); setPreview(null); }}>Import another file</Button>
        </div>
      ) : (<>
        <div className="grid gap-3 sm:grid-cols-[220px_1fr] sm:items-end">
          <Field label="Import into" htmlFor="im-mod"><SelectField id="im-mod" value={mod} allowEmpty={false} onChange={(v) => { setMod(v as ImportModule); setPreview(null); if (csv) setMap(automap(csv[0], v as ImportModule)); }} options={MODS} /></Field>
          <div><input ref={file} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Choose CSV file" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
            <Button variant="outline" onClick={() => file.current?.click()}><UploadSimpleIcon />{csv ? `Change file (${name})` : "Choose CSV file"}</Button>
            <Button variant="link" size="sm" onClick={() => download(`${mod}-template.csv`, toCsv([fields.map((f) => f.label)]))}>Download a template</Button></div>
        </div>
        {csv && (<>
          <div><h3 className="mb-1.5 text-label font-semibold text-heading">Match columns ({csv.length - 1} rows)</h3>
            <ul className="grid gap-2 sm:grid-cols-2">{csv[0].map((h, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2"><span className="w-2/5 truncate text-body font-medium text-ink" title={h}>{h || `Column ${i + 1}`}</span><span aria-hidden className="text-ink-faint">→</span>
                <div className="flex-1"><SelectField ariaLabel={`Field for column ${h || i + 1}`} value={map[i] ?? ""} onChange={(v) => { setMap({ ...map, [i]: v }); setPreview(null); }} options={fields.map((f) => ({ value: f.key, label: f.label }))} placeholder="Skip this column" /></div></li>))}</ul></div>
          <Button onClick={runPreview} disabled={!Object.values(map).some(Boolean)}>Check rows</Button>
        </>)}
        {preview && (
          <div className="space-y-2 rounded-xl border border-line p-3">
            <p className="text-body"><StatusBadge tone="success">{ok} ready</StatusBadge> <StatusBadge tone={bad.length ? "error" : "neutral"}>{bad.length} with problems</StatusBadge></p>
            {bad.length > 0 && <ul className="max-h-40 overflow-auto text-caption text-error-fg">{bad.slice(0, 50).map((b) => <li key={b.row}>Row {b.row}: {b.error}</li>)}{bad.length > 50 && <li>…and {bad.length - 50} more</li>}</ul>}
            <Button disabled={!ok || admin.importRows.isPending} onClick={async () => setResult(await admin.importRows.mutateAsync([mod, toRecords()]))}>{bad.length ? `Import ${ok} valid rows, skip ${bad.length}` : `Import ${ok} rows`}</Button>
          </div>
        )}
      </>)}
    </SectionCard>
  );
}

/* ═════════════ Export ═════════════ */
export function ExportPanel() {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const mods: { value: ModuleKey; label: string }[] = [...MODS, { value: "calls", label: "Calls" }, { value: "meetings", label: "Meetings" }];
  return (
    <SectionCard title="Export" description="Download every record of a module as CSV (opens in Excel or Google Sheets)." bodyClassName="space-y-3">
      {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{mods.map((m) => (
        <li key={m.value}><Button variant="outline" className="w-full justify-between" disabled={busy === m.value} onClick={async () => { setErr(null); setBusy(m.value); try { download(`${m.value}-${nowIso().slice(0, 10)}.csv`, toCsv(await dataAdmin.exportRows(m.value))); } catch (e) { setErr(e instanceof Error ? e.message : "Export failed."); } finally { setBusy(null); } }}>{m.label}<DownloadSimpleIcon /></Button></li>))}</ul>
    </SectionCard>
  );
}

/* ═════════════ Backup ═════════════ */
export function BackupPanel() {
  const admin = useAdmin();
  const file = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <SectionCard title="Where is my data?" bodyClassName="space-y-2">
        <p className="flex gap-2 rounded-lg bg-warning-bg px-3 py-2 text-body text-warning-fg"><WarningIcon className="mt-0.5 size-4 shrink-0" weight="fill" />The CRM backend isn&apos;t connected yet. All records live in <strong>this browser only</strong>. Clearing site data deletes them — download a backup regularly.</p>
      </SectionCard>
      <SectionCard title="Data backup" description="A full copy of every record, setting and report as one JSON file." bodyClassName="space-y-3">
        {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={async () => { setErr(null); try { download(`evoq-crm-backup-${nowIso().slice(0, 10)}.json`, await dataAdmin.backup(), "application/json"); } catch (e) { setErr(e instanceof Error ? e.message : "Backup failed."); } }}><DownloadSimpleIcon />Download backup</Button>
          <input ref={file} type="file" accept="application/json,.json" className="sr-only" aria-label="Choose backup file" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; if (f.size > 20 * 1024 * 1024) { setErr("That file is larger than 20 MB."); return; } setErr(null); setPending(await f.text()); }} />
          <Button variant="outline" onClick={() => file.current?.click()}><UploadSimpleIcon />Restore from file…</Button>
          <Button variant="outline" onClick={() => setReset(true)}>Reset to sample data</Button>
        </div>
      </SectionCard>
      <ConfirmDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)} destructive confirmLabel="Replace all data" title="Restore this backup?" description="Everything currently in the CRM is replaced by the file's contents. Download a backup first if you may need the current data."
        onConfirm={async () => { try { await admin.restore.mutateAsync([pending!]); } catch (e) { setErr(e instanceof Error ? e.message : "Restore failed."); } }} />
      <ConfirmDialog open={reset} onOpenChange={setReset} destructive confirmLabel="Reset" title="Reset to sample data?" description="All records, settings, reports and dashboards you changed are replaced by the original sample data." onConfirm={async () => { await admin.resetSample.mutateAsync([]); }} />
    </div>
  );
}
