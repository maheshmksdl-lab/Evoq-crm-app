"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretDownIcon, CaretRightIcon, InfoIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SelectField } from "@/components/forms/field-input";
import { ConfirmDialog, Field, SectionCard } from "@/components/shared/primitives";
import { CardSkeleton, ErrorState } from "@/components/shared/states";
import { useAdmin, useRoles, useSettings, useUsers } from "@/lib/query/hooks";
import { PERM_ACTIONS, PERM_ACTION_LABELS, PERM_MODULES } from "@/lib/schemas/options";
import type { PermissionMatrix, Role } from "@/lib/schemas";
import { date } from "@/lib/domain/format";

/* ═════════════ Roles ═════════════ */
export function RolesPanel() {
  const roles = useRoles();
  const users = useUsers();
  const admin = useAdmin();
  const [sel, setSel] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set(["admin", "vp", "ops"]));
  const [dlg, setDlg] = useState<{ mode: "new" | "edit"; parent?: string } | null>(null);
  const [del, setDel] = useState(false);
  if (roles.isPending) return <CardSkeleton lines={6} />;
  if (roles.isError) return <ErrorState error={roles.error} onRetry={() => roles.refetch()} />;
  const list = roles.data;
  const cur = list.find((r) => r.id === sel) ?? list[0];
  const members = (users.data ?? []).filter((u) => u.role === cur.name);
  const childrenOf = (id: string | null) => list.filter((r) => r.reportsTo === id);
  const Node = ({ r, depth }: { r: Role; depth: number }) => {
    const kids = childrenOf(r.id);
    const isOpen = open.has(r.id);
    return (
      <li>
        <div className={cn("flex items-center rounded-lg", cur.id === r.id && "bg-crm-tint dark:bg-info-bg")} style={{ paddingLeft: depth * 16 }}>
          <button type="button" aria-label={isOpen ? "Collapse" : "Expand"} disabled={!kids.length} onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} className="grid size-7 place-items-center text-ink-muted disabled:opacity-0">{isOpen ? <CaretDownIcon className="size-3.5" /> : <CaretRightIcon className="size-3.5" />}</button>
          <button type="button" aria-current={cur.id === r.id} onClick={() => setSel(r.id)} className="min-w-0 flex-1 truncate rounded-lg py-1.5 pr-2 text-left text-body font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring">{r.name}</button>
        </div>
        {isOpen && kids.length > 0 && <ul>{kids.map((k) => <Node key={k.id} r={k} depth={depth + 1} />)}</ul>}
      </li>
    );
  };
  return (
    <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
      <SectionCard title="Role hierarchy" actions={<Button size="xs" variant="outline" onClick={() => setDlg({ mode: "new" })}><PlusIcon />New</Button>}>
        <ul aria-label="Roles">{childrenOf(null).map((r) => <Node key={r.id} r={r} depth={0} />)}</ul>
      </SectionCard>
      <SectionCard title={cur.name} description={cur.description || "No description"}
        actions={<><Button size="xs" variant="outline" onClick={() => setDlg({ mode: "edit" })}>Edit</Button><Button size="xs" variant="outline" onClick={() => setDlg({ mode: "new", parent: cur.id })}>Add sub-role</Button><Button size="xs" variant="destructive" onClick={() => setDel(true)}><TrashIcon />Delete</Button></>}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div><dt className="text-caption text-ink-muted">Reports to</dt><dd className="text-body">{list.find((r) => r.id === cur.reportsTo)?.name ?? "—"}</dd></div>
          <div><dt className="text-caption text-ink-muted">Department</dt><dd className="text-body">{cur.department || "—"}</dd></div>
          <div><dt className="text-caption text-ink-muted">Created</dt><dd className="text-body">{date(cur.createdAt)}</dd></div>
          <div><dt className="text-caption text-ink-muted">Sub-roles</dt><dd className="text-body">{childrenOf(cur.id).length}</dd></div>
        </dl>
        <h3 className="mb-1.5 mt-4 text-label font-semibold text-heading">People in this role ({members.length})</h3>
        {members.length ? <ul className="flex flex-wrap gap-1.5">{members.map((u) => <li key={u.id} className="rounded-full bg-muted px-2.5 py-1 text-caption text-ink">{u.name}</li>)}</ul> : <p className="text-body text-ink-muted">Nobody has this role.</p>}
        <p className="mt-4 flex gap-2 text-caption text-ink-muted"><InfoIcon className="mt-0.5 size-3.5 shrink-0" />Managers see the records of every role below them in this hierarchy.</p>
      </SectionCard>
      {dlg && <RoleDialog key={dlg.mode + (dlg.parent ?? "")} role={dlg.mode === "edit" ? cur : null} parentId={dlg.mode === "new" ? dlg.parent ?? null : null} roles={list} onClose={() => setDlg(null)} />}
      <ConfirmDialog open={del} onOpenChange={setDel} destructive confirmLabel="Delete role" title={`Delete ${cur.name}?`} description="Roles assigned to users or that have sub-roles can't be deleted." onConfirm={async () => { await admin.removeRole.mutateAsync([cur.id]); setSel(null); }} />
    </div>
  );
}

function RoleDialog({ role, parentId, roles, onClose }: { role: Role | null; parentId: string | null; roles: Role[]; onClose: () => void }) {
  const admin = useAdmin();
  const [v, setV] = useState({ name: role?.name ?? "", description: role?.description ?? "", department: role?.department ?? "", reportsTo: role ? role.reportsTo : parentId ?? "admin" });
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    setErr(null);
    if (!v.name.trim()) { setErr("Role name is required"); return; }
    try { await (role ? admin.updateRole.mutateAsync([role.id, { ...v, reportsTo: v.reportsTo || null }]) : admin.createRole.mutateAsync([{ ...v, reportsTo: v.reportsTo || null }])); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not save."); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{role ? "Edit role" : "New role"}</DialogTitle><DialogDescription>New roles start with no permissions until you set them under Permissions.</DialogDescription></DialogHeader>
        {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
        <Field label="Name" htmlFor="r-name" required><Input id="r-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
        <Field label="Reports to" htmlFor="r-par"><SelectField id="r-par" value={v.reportsTo ?? ""} onChange={(x) => setV({ ...v, reportsTo: x })} options={roles.filter((r) => r.id !== role?.id).map((r) => ({ value: r.id, label: r.name }))} placeholder="Top level" /></Field>
        <Field label="Department" htmlFor="r-dep"><Input id="r-dep" value={v.department} onChange={(e) => setV({ ...v, department: e.target.value })} /></Field>
        <Field label="Description" htmlFor="r-desc"><Textarea id="r-desc" rows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>{role ? "Save role" : "Create role"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═════════════ Permissions ═════════════ */
export function PermissionsPanel() {
  const settings = useSettings();
  const roles = useRoles();
  const admin = useAdmin();
  const roleNames = useMemo(() => (roles.data ?? []).map((r) => r.name).filter((n) => n !== "Super Admin"), [roles.data]);
  const [roleSel, setRole] = useState<string | null>(null);
  const role = roleSel ?? roleNames[0] ?? "";
  // null = no local edits yet; edits are layered over whatever the server last returned
  const [edits, setDraft] = useState<PermissionMatrix | null>(null);
  const draft: PermissionMatrix | undefined = edits ?? settings.data?.permissions;
  const dirty = useMemo(() => !!edits && !!settings.data && JSON.stringify(edits) !== JSON.stringify(settings.data.permissions), [edits, settings.data]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  if (settings.isPending || roles.isPending || !draft || !role) return <CardSkeleton lines={8} />;
  if (settings.isError) return <ErrorState error={settings.error} onRetry={() => settings.refetch()} />;
  const cell = (mod: string, a: string) => Boolean(draft[mod]?.[role]?.[a]);
  const toggle = (mod: string, a: string, on: boolean) => setDraft(() => {
    const n = structuredClone(draft);
    n[mod] ??= {}; n[mod][role] ??= {};
    n[mod][role][a] = on;
    if (a === "fullAccess") (PERM_ACTIONS as readonly string[]).forEach((x) => { n[mod][role][x] = on; });
    else if (!on) n[mod][role].fullAccess = false;
    return n;
  });
  return (
    <SectionCard flush title="Permissions" description="What each role can do in each area. Applied on every action, not just by hiding buttons."
      actions={<div className="w-52"><SelectField ariaLabel="Role" value={role} onChange={setRole} options={roleNames} allowEmpty={false} /></div>}>
      <p className="mx-5 mb-3 flex gap-2 rounded-lg bg-info-bg px-3 py-2 text-caption text-info-fg"><InfoIcon className="mt-0.5 size-3.5 shrink-0" />Super Admin always has every permission so the organization can&apos;t be locked out. &ldquo;Read&rdquo; controls whether the module appears and loads at all.</p>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[820px] text-body">
          <thead><tr className="border-y border-line bg-surface-subtle text-left text-caption text-ink-muted"><th className="px-5 py-2 font-medium">Area</th>{PERM_ACTIONS.map((a) => <th key={a} className="px-2 py-2 text-center font-medium">{PERM_ACTION_LABELS[a]}</th>)}</tr></thead>
          <tbody>{PERM_MODULES.map((m) => (
            <tr key={m} className="border-b border-line-soft last:border-0 hover:bg-surface-subtle/60">
              <td className="px-5 py-2 font-medium text-ink">{m}</td>
              {PERM_ACTIONS.map((a) => <td key={a} className="px-2 py-2 text-center"><Checkbox aria-label={`${role}: ${PERM_ACTION_LABELS[a]} ${m}`} checked={cell(m, a)} onCheckedChange={(c) => toggle(m, a, c === true)} /></td>)}
            </tr>))}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
        {dirty && <span role="status" className="mr-auto text-caption text-warning-fg">Unsaved permission changes</span>}
        <Button variant="outline" disabled={!dirty} onClick={() => setDraft(null)}>Discard</Button>
        <Button disabled={!dirty || admin.savePermissions.isPending} onClick={() => admin.savePermissions.mutate([draft], { onSuccess: () => setDraft(null) })}>Save permissions</Button>
      </div>
    </SectionCard>
  );
}
