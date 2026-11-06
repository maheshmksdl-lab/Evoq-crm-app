"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ModuleKey, RecordRef } from "@/lib/schemas";

/** What the create/edit drawer is currently showing. Any screen can open it with `useForms()`. */
export type FormRequest =
  | { kind: "record"; module: "leads" | "contacts" | "accounts" | "deals"; id?: string; defaults?: Record<string, unknown> }
  | { kind: "task"; id?: string; related?: RecordRef | null; defaults?: Record<string, unknown> }
  | { kind: "call"; id?: string; related?: RecordRef | null; defaults?: Record<string, unknown> }
  | { kind: "meeting"; id?: string; related?: RecordRef | null; defaults?: Record<string, unknown> }
  | { kind: "email"; related: RecordRef }
  | { kind: "note"; related: RecordRef }
  | { kind: "convert"; leadId: string };

interface Ctx {
  request: FormRequest | null;
  open: (r: FormRequest) => void;
  close: () => void;
  create: (m: ModuleKey, related?: RecordRef | null, defaults?: Record<string, unknown>) => void;
}
const FormsCtx = createContext<Ctx | null>(null);

export function FormsProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<FormRequest | null>(null);
  const open = useCallback((r: FormRequest) => setRequest(r), []);
  const close = useCallback(() => setRequest(null), []);
  const create = useCallback((m: ModuleKey, related?: RecordRef | null, defaults?: Record<string, unknown>) => {
    if (m === "tasks") setRequest({ kind: "task", related, defaults });
    else if (m === "calls") setRequest({ kind: "call", related, defaults });
    else if (m === "meetings") setRequest({ kind: "meeting", related, defaults });
    else setRequest({ kind: "record", module: m, defaults });
  }, []);
  const value = useMemo(() => ({ request, open, close, create }), [request, open, close, create]);
  return <FormsCtx.Provider value={value}>{children}</FormsCtx.Provider>;
}

export function useForms() {
  const c = useContext(FormsCtx);
  if (!c) throw new Error("useForms must be used inside <FormsProvider>");
  return c;
}
