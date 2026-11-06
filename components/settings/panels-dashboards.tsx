"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MultiPick } from "@/components/forms/activity-forms";
import { SelectField } from "@/components/forms/field-input";
import { ConfirmDialog, Field, SectionCard } from "@/components/shared/primitives";
import { StatusBadge } from "@/components/shared/badges";
import { CardSkeleton, ErrorState } from "@/components/shared/states";
import { useAdmin, useDashboards, useRoles, useSettings } from "@/lib/query/hooks";
import { relative } from "@/lib/domain/format";

export function DashboardsPanel() {
  const q = useDashboards();
  const settings = useSettings();
  const admin = useAdmin();
  const [dlg, setDlg] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  if (q.isPending) return <CardSkeleton lines={5} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const activeId = settings.data?.activeDashboardId;
  return (
    <SectionCard flush title="Dashboard customization" description="Choose what each dashboard shows and who can see it."
      actions={<Button size="sm" onClick={() => setDlg(true)}><PlusIcon weight="bold" />New dashboard</Button>}>
      <Table aria-label="Dashboards">
        <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Name</TableHead><TableHead>Visibility</TableHead><TableHead className="hidden md:table-cell">Widgets</TableHead><TableHead className="hidden md:table-cell">Updated</TableHead><TableHead className="w-52" /></TableRow></TableHeader>
        <TableBody>{q.data.map((d) => (
          <TableRow key={d.id}>
            <TableCell><span className="font-medium text-ink">{d.name}</span>{d.id === activeId && <StatusBadge tone="success" icon={CheckCircleIcon} className="ml-2">Active</StatusBadge>}{d.locked && <StatusBadge tone="neutral" className="ml-2">Locked</StatusBadge>}{d.description && <p className="text-caption text-ink-muted">{d.description}</p>}</TableCell>
            <TableCell className="capitalize">{d.visibility === "roles" ? `Roles: ${d.roles.join(", ") || "none"}` : d.visibility === "all" ? "Everyone" : "Only me"}</TableCell>
            <TableCell className="hidden md:table-cell">{d.widgets.length}</TableCell><TableCell className="hidden md:table-cell text-ink-muted">{relative(d.updatedAt)}</TableCell>
            <TableCell><div className="flex justify-end gap-1">
              {d.id !== activeId && <Button size="xs" variant="outline" onClick={() => admin.setActiveDashboard.mutate([d.id])}>Make active</Button>}
              <Button asChild size="xs" variant="outline"><Link href={`/home/${d.id}/edit`}>Edit</Link></Button>
              <Button size="icon-xs" variant="ghost" aria-label={`Delete ${d.name}`} disabled={q.data.length <= 1} onClick={() => setDel(d.id)}><TrashIcon /></Button>
            </div></TableCell>
          </TableRow>))}</TableBody>
      </Table>
      {dlg && <NewDashboardDialog onClose={() => setDlg(false)} />}
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} destructive confirmLabel="Delete dashboard" title="Delete this dashboard?" description="Its widget layout is lost. Reports and data are not affected." onConfirm={async () => { if (del) await admin.removeDashboard.mutateAsync([del]); }} />
    </SectionCard>
  );
}

function NewDashboardDialog({ onClose }: { onClose: () => void }) {
  const admin = useAdmin();
  const roles = useRoles();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "all" | "roles">("all");
  const [roleSel, setRoleSel] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setErr(null);
    if (!name.trim()) { setErr("Name the dashboard"); return; }
    if (visibility === "roles" && !roleSel.length) { setErr("Choose at least one role"); return; }
    try { await admin.saveDashboard.mutateAsync([{ name, description, visibility, roles: roleSel, locked: false, widgets: [] }]); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not create."); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New dashboard</DialogTitle><DialogDescription>Create it, then add widgets with the editor.</DialogDescription></DialogHeader>
        {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
        <Field label="Name" htmlFor="nd-n" required><Input id="nd-n" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus /></Field>
        <Field label="Description" htmlFor="nd-d"><Textarea id="nd-d" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <Field label="Who can see it" htmlFor="nd-v"><SelectField id="nd-v" value={visibility} allowEmpty={false} onChange={(v) => setVisibility(v as typeof visibility)} options={[{ value: "private", label: "Only me" }, { value: "all", label: "Everyone" }, { value: "roles", label: "Specific roles" }]} /></Field>
        {visibility === "roles" && <MultiPick label="Roles" options={(roles.data ?? []).map((r) => ({ value: r.name, label: r.name }))} value={roleSel} onChange={setRoleSel} />}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={admin.saveDashboard.isPending}>Create dashboard</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
