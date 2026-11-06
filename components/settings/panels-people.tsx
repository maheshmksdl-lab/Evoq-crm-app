"use client";

import { useEffect, useState } from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoonIcon, PlusIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/providers";
import { FieldInput, SelectField } from "@/components/forms/field-input";
import { Avatar, Field, SectionCard } from "@/components/shared/primitives";
import { StatusBadge } from "@/components/shared/badges";
import { CardSkeleton, ErrorState } from "@/components/shared/states";
import { useAdmin, useRoles, useSession, useSettings, useUsers } from "@/lib/query/hooks";
import { EmailSettings, OrgSettings } from "@/lib/schemas";
import { UserInput } from "@/lib/schemas/inputs";
import { COUNTRIES } from "@/lib/schemas/options";
import { ValidationError } from "@/lib/services";
import { dateTime } from "@/lib/domain/format";

function useDirtyGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}

function SaveBar({ dirty, saving, onReset }: { dirty: boolean; saving: boolean; onReset: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
      {dirty && <span role="status" className="mr-auto text-caption text-warning-fg">You have unsaved changes</span>}
      <Button type="button" variant="outline" onClick={onReset} disabled={!dirty || saving}>Discard</Button>
      <Button type="submit" disabled={!dirty || saving}>{saving ? "Saving…" : "Save changes"}</Button>
    </div>
  );
}

/* ═════════════ Personal ═════════════ */
export function PersonalPanel() {
  const user = useSession().data?.user;
  const admin = useAdmin();
  const { theme, toggle } = useTheme();
  const [err, setErr] = useState<string | null>(null);
  const form = useForm({ values: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phone: user?.phone ?? "" } });
  const { register, handleSubmit, reset, formState: { isDirty } } = form;
  useDirtyGuard(isDirty);
  if (!user) return <CardSkeleton />;
  return (
    <div className="space-y-4">
      <SectionCard title="Profile" description="Your name and phone. Role and email are managed by an administrator.">
        <div className="mb-4 flex items-center gap-3"><Avatar name={user.name} size={52} /><div><p className="text-card-title text-heading">{user.name}</p><p className="text-body text-ink-muted">{user.email} · {user.role}</p></div></div>
        <form className="space-y-4" noValidate onSubmit={handleSubmit(async (v) => { setErr(null); try { await admin.updateProfile.mutateAsync([v]); reset(v); } catch (e) { setErr(e instanceof Error ? e.message : "Could not save."); } })}>
          {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name" htmlFor="pf-fn"><Input id="pf-fn" {...register("firstName")} /></Field>
            <Field label="Last name" htmlFor="pf-ln"><Input id="pf-ln" {...register("lastName")} /></Field>
            <Field label="Phone" htmlFor="pf-ph"><Input id="pf-ph" type="tel" {...register("phone")} /></Field>
          </div>
          <SaveBar dirty={isDirty} saving={admin.updateProfile.isPending} onReset={() => reset()} />
        </form>
      </SectionCard>
      <SectionCard title="Appearance"><div className="flex items-center justify-between gap-3"><div><p className="text-body font-medium text-ink">Dark mode</p><p className="text-caption text-ink-muted">Saved in this browser.</p></div>
        <Button variant="outline" size="sm" onClick={toggle} aria-pressed={theme === "dark"}>{theme === "dark" ? <SunIcon /> : <MoonIcon />}{theme === "dark" ? "Switch to light" : "Switch to dark"}</Button></div></SectionCard>
    </div>
  );
}

/* ═════════════ Users ═════════════ */
export function UsersPanel() {
  const q = useUsers();
  const admin = useAdmin();
  const me = useSession().data?.user;
  const [edit, setEdit] = useState<"new" | string | null>(null);
  if (q.isPending) return <CardSkeleton lines={6} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const pending = q.data.filter((u) => !u.active);
  return (
    <SectionCard flush title="Users" description={`${q.data.filter((u) => u.active).length} active${pending.length ? ` · ${pending.length} inactive or awaiting approval` : ""}`}
      actions={<Button size="sm" onClick={() => setEdit("new")}><PlusIcon weight="bold" />New user</Button>}>
      <Table aria-label="Users">
        <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="hidden md:table-cell">Email</TableHead><TableHead>Status</TableHead><TableHead className="w-20" /></TableRow></TableHeader>
        <TableBody>{q.data.map((u) => (
          <TableRow key={u.id}>
            <TableCell><span className="flex items-center gap-2"><Avatar name={u.name} size={28} /><span className="font-medium text-ink">{u.name}</span>{u.id === me?.id && <StatusBadge tone="brand">You</StatusBadge>}</span></TableCell>
            <TableCell>{u.role}</TableCell><TableCell className="hidden md:table-cell">{u.email}</TableCell>
            <TableCell>{u.active ? <StatusBadge tone="success">Active</StatusBadge> : <StatusBadge tone="warning">Inactive</StatusBadge>}</TableCell>
            <TableCell><Button variant="ghost" size="sm" onClick={() => setEdit(u.id)}>Edit</Button></TableCell>
          </TableRow>))}</TableBody>
      </Table>
      {edit && <UserDialog key={edit} id={edit === "new" ? undefined : edit} onClose={() => setEdit(null)} />}
      <p className="border-t border-line px-5 py-3 text-caption text-ink-muted">Creating a user records them in the CRM. Issuing a sign-in password needs the authentication service, which is not connected yet.</p>
      {admin && null}
    </SectionCard>
  );
}

function UserDialog({ id, onClose }: { id?: string; onClose: () => void }) {
  const roles = useRoles();
  const users = useUsers();
  const admin = useAdmin();
  const cur = id ? users.data?.find((u) => u.id === id) : null;
  const [err, setErr] = useState<string | null>(null);
  const form = useForm<FieldValues>({ resolver: zodResolver(UserInput) as unknown as Resolver<FieldValues>, defaultValues: cur ?? { firstName: "", lastName: "", email: "", phone: "", role: "Support Executive", active: true, managerId: null } });
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } = form;
  const m = (k: string) => (errors as Record<string, { message?: string }>)[k]?.message;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{id ? "Edit user" : "New user"}</DialogTitle><DialogDescription>Role decides what this person can see and do. Change what each role may do under Permissions.</DialogDescription></DialogHeader>
        <form id="user-form" noValidate className="space-y-3" onSubmit={handleSubmit(async (v) => {
          setErr(null);
          try { await (id ? admin.updateUser.mutateAsync([id, v]) : admin.createUser.mutateAsync([v])); onClose(); }
          catch (e) { if (e instanceof ValidationError && e.issues[0]?.path) setError(e.issues[0].path as never, { message: e.issues[0].message }); else setErr(e instanceof Error ? e.message : "Could not save."); }
        })}>
          {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" htmlFor="u-fn" error={m("firstName")}><Input id="u-fn" {...register("firstName")} /></Field>
            <Field label="Last name" htmlFor="u-ln" error={m("lastName")}><Input id="u-ln" {...register("lastName")} /></Field>
          </div>
          <Field label="Email" htmlFor="u-em" error={m("email")} required><Input id="u-em" type="email" {...register("email")} aria-invalid={!!m("email")} /></Field>
          <Field label="Phone" htmlFor="u-ph" error={m("phone")}><Input id="u-ph" type="tel" {...register("phone")} /></Field>
          <FieldInput def={{ type: "select", label: "Role" }} options={(roles.data ?? []).map((r) => ({ value: r.name, label: r.name }))} name="role" control={control} required />
          <label className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5"><span><span className="block text-body font-medium text-ink">Active</span><span className="block text-caption text-ink-muted">Inactive users can&apos;t be assigned records or sign in.</span></span>
            <Switch checked={form.watch("active") !== false} onCheckedChange={(c) => form.setValue("active", c, { shouldDirty: true })} aria-label="Active" /></label>
        </form>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="user-form" disabled={isSubmitting}>{id ? "Save user" : "Create user"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═════════════ Organization ═════════════ */
export function OrganizationPanel() {
  const q = useSettings();
  const admin = useAdmin();
  const [err, setErr] = useState<string | null>(null);
  const form = useForm<FieldValues>({ resolver: zodResolver(OrgSettings) as unknown as Resolver<FieldValues>, values: q.data?.org as FieldValues | undefined });
  const { control, register, handleSubmit, reset, formState: { errors, isDirty } } = form;
  useDirtyGuard(isDirty);
  if (q.isPending) return <CardSkeleton lines={8} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const m = (k: string) => (errors as Record<string, { message?: string }>)[k]?.message;
  return (
    <form noValidate onSubmit={handleSubmit(async (v) => { setErr(null); try { await admin.updateOrg.mutateAsync([v]); reset(v); } catch (e) { setErr(e instanceof Error ? e.message : "Could not save."); } })}>
      <SectionCard title="Organization" description="Company details and regional defaults" bodyClassName="space-y-4">
        {err && <p role="alert" className="text-body text-error-fg">{err}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company name" htmlFor="o-name" error={m("name")} required><Input id="o-name" {...register("name")} /></Field>
          <Field label="Website" htmlFor="o-web" error={m("website")}><Input id="o-web" {...register("website")} /></Field>
          <Field label="Phone" htmlFor="o-ph" error={m("phone")}><Input id="o-ph" type="tel" {...register("phone")} /></Field>
          <Field label="Email" htmlFor="o-em" error={m("email")}><Input id="o-em" type="email" {...register("email")} /></Field>
          <FieldInput def={{ type: "select", label: "Default currency", options: ["INR", "USD", "EUR", "GBP", "AED", "SGD"] }} name="currency" control={control} required />
          <Field label="Time zone" htmlFor="o-tz"><Input id="o-tz" {...register("timezone")} /></Field>
          <FieldInput def={{ type: "select", label: "Country", options: COUNTRIES }} name="address.country" control={control} />
        </div>
        <SaveBar dirty={isDirty} saving={admin.updateOrg.isPending} onReset={() => reset()} />
      </SectionCard>
    </form>
  );
}

/* ═════════════ Email ═════════════ */
export function EmailPanel() {
  const q = useSettings();
  const admin = useAdmin();
  const form = useForm<FieldValues>({ resolver: zodResolver(EmailSettings) as unknown as Resolver<FieldValues>, values: q.data?.email as FieldValues | undefined });
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = form;
  useDirtyGuard(isDirty);
  if (q.isPending) return <CardSkeleton />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  return (
    <form noValidate onSubmit={handleSubmit(async (v) => { await admin.updateEmail.mutateAsync([v]); reset(v); })}>
      <SectionCard title="Email" description="Used when you log or prepare emails." bodyClassName="space-y-4">
        <p className="rounded-lg bg-info-bg px-3 py-2 text-caption text-info-fg">Sending email from the CRM isn&apos;t connected yet. These settings are stored for when it is; today emails are logged, not sent.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="From name" htmlFor="e-fn"><Input id="e-fn" {...register("fromName")} /></Field>
          <Field label="Reply-to" htmlFor="e-rt" error={(errors.replyTo as { message?: string } | undefined)?.message}><Input id="e-rt" type="email" {...register("replyTo")} /></Field>
        </div>
        <Field label="Signature" htmlFor="e-sig"><Textarea id="e-sig" rows={4} {...register("signature")} /></Field>
        <label className="flex items-center gap-3"><Switch checked={!!watch("bccSelf")} onCheckedChange={(c) => setValue("bccSelf", c, { shouldDirty: true })} aria-label="BCC myself" /><span className="text-body">BCC myself on logged emails</span></label>
        <SaveBar dirty={isDirty} saving={admin.updateEmail.isPending} onReset={() => reset()} />
      </SectionCard>
    </form>
  );
}
export { dateTime, SelectField };
