"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, InfoIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/primitives";
import { SelectField } from "@/components/forms/field-input";
import { SignInInput } from "@/lib/schemas/inputs";
import { session, ValidationError } from "@/lib/services";
import { useQueryClient } from "@tanstack/react-query";

const H = ({ title, sub }: { title: string; sub: string }) => (<div className="mb-6"><h1 className="text-page-title text-heading">{title}</h1><p className="mt-1 text-body text-ink-muted">{sub}</p></div>);

export function LoginForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const next = useSearchParams().get("next");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.input<typeof SignInInput>>({ resolver: zodResolver(SignInInput), defaultValues: { email: "", password: "" } });
  const submit = handleSubmit(async (v) => {
    setError(null);
    try {
      await session.signIn(v);
      qc.clear();
      // only same-site relative paths, never an arbitrary redirect target
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not sign in."); }
  });
  return (
    <>
      <H title="Welcome back" sub="Sign in to your EVOQ CRM workspace." />
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg"><WarningCircleIcon className="mt-0.5 size-4 shrink-0" weight="fill" />{error}</div>}
        <Field label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" autoComplete="username" autoFocus aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" aria-invalid={!!errors.password} className="pr-10" {...register("password")} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-heading">{show ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}</button>
          </div>
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</Button>
        <div className="flex justify-between text-body"><Link href="/forgot-password" className="text-crm-primary hover:underline">Forgot password?</Link><Link href="/register" className="text-crm-primary hover:underline">Request access</Link></div>
      </form>
    </>
  );
}

const RegisterSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"), lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"), phone: z.string().trim().max(20).default(""),
  role: z.enum(["Sales Executive", "Support Executive", "Operations Manager", "Team Leader", "VP of Operations"], { error: "Choose your role" }),
});
export function RegisterForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<z.input<typeof RegisterSchema>>({ resolver: zodResolver(RegisterSchema), defaultValues: { firstName: "", lastName: "", email: "", phone: "" } });
  const submit = handleSubmit(async (v) => {
    setError(null);
    try { await session.requestAccess(v); setDone(true); }
    catch (e) {
      if (e instanceof ValidationError && e.issues[0]?.path === "email") setFieldError("email", { message: e.issues[0].message });
      else setError(e instanceof Error ? e.message : "Could not send the request.");
    }
  });
  if (done) {
    return (
      <div className="space-y-3 text-center">
        <CheckCircleIcon className="mx-auto size-10 text-success" weight="fill" /><h1 className="text-page-title text-heading">Request recorded</h1>
        <p className="text-body text-ink-muted">An administrator will see your request under Settings → Users. You can&apos;t sign in until they activate your access and credentials are issued.</p>
        <Button asChild variant="outline" className="mt-2"><Link href="/login">Back to sign in</Link></Button>
      </div>
    );
  }
  return (
    <>
      <H title="Request access" sub="Tell us who you are. An administrator reviews every request." />
      <form onSubmit={submit} noValidate className="space-y-4">
        {error && <div role="alert" className="rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-body text-error-fg">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="fn" error={errors.firstName?.message} required><Input id="fn" autoComplete="given-name" aria-invalid={!!errors.firstName} {...register("firstName")} /></Field>
          <Field label="Last name" htmlFor="ln" error={errors.lastName?.message} required><Input id="ln" autoComplete="family-name" aria-invalid={!!errors.lastName} {...register("lastName")} /></Field>
        </div>
        <Field label="Work email" htmlFor="em" error={errors.email?.message} required><Input id="em" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Field label="Phone" htmlFor="ph" error={errors.phone?.message}><Input id="ph" type="tel" autoComplete="tel" {...register("phone")} /></Field>
        <Field label="Your role" htmlFor="role" error={errors.role?.message} required>
          <SelectField id="role" value={watch("role")} onChange={(v) => setValue("role", v as never, { shouldValidate: true })} options={["Sales Executive", "Support Executive", "Team Leader", "Operations Manager", "VP of Operations"]} placeholder="Choose role" invalid={!!errors.role} />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send request"}</Button>
        <p className="text-center text-body"><Link href="/login" className="text-crm-primary hover:underline">Back to sign in</Link></p>
      </form>
    </>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const valid = z.email().safeParse(email).success;
  return (
    <>
      <H title="Reset your password" sub="Password reset needs the email service." />
      <div className="mb-4 flex gap-2 rounded-lg bg-info-bg px-3 py-2.5 text-body text-info-fg"><InfoIcon className="mt-0.5 size-4 shrink-0" />Automatic reset emails aren&apos;t connected yet, so nothing is sent from this page. Ask your CRM administrator to reset your password.</div>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (valid) setSent(true); }} noValidate>
        <Field label="Email" htmlFor="fe" error={email && !valid ? "Enter a valid email address" : undefined}><Input id="fe" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSent(false); }} /></Field>
        <Button type="submit" className="w-full" size="lg" variant="outline" disabled={!valid}>Show administrator instructions</Button>
        {sent && <p role="status" className="text-body text-ink-body">Tell your administrator the account email is <strong>{email}</strong> and ask them to reset it from Settings → Users.</p>}
        <p className="text-center text-body"><Link href="/login" className="text-crm-primary hover:underline">Back to sign in</Link></p>
      </form>
    </>
  );
}
