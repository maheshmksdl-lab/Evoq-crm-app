# EVOQ CRM — Stage 1 audit, migration plan and implementation checklist

Baseline: `CRM-V1-Staging` @ 2a08268. Audit date: 6 Nov 2026.

> **Version control:** the local `.git` directory disappeared during this session (cause unknown). Per the product owner's instruction, all git files were removed and development continues **locally only** — no repository, branches or commits until the finished work is approved. Changed files are tracked manually in `docs/IMPLEMENTATION_REPORT.md`.

## 1. Current-state audit (what the repository actually contains)

| Area | Finding | Consequence |
| --- | --- | --- |
| Framework | Next `^15.0.3`, React 19, App Router, every page `"use client"` | Upgrade to Next 16.3.8 (same pin as `Evoq-AI-app`). `middleware.ts` → `proxy.ts` (Next 16 rename). |
| UI | MUI 6 + MUI X DataGrid + Emotion, Tailwind 3 used alongside, per-page hex colours with `isDark ?` ternaries | Replace with shadcn/ui (radix-nova, as in `Evoq-AI-app`) + Tailwind 4 tokens. Remove MUI/Emotion entirely. |
| Data | **No backend, no `fetch`, no API routes, no env vars.** Records are hardcoded arrays inside page components; list and detail copies of the same record disagree (e.g. deal 3 probability 0 vs 10). | Introduce one normalized, Zod-validated dataset seeded from the existing records, behind a typed service interface. Mark every module as "local adapter — awaiting backend". |
| Persistence | `localStorage` for dashboards, report charts, homepage configs, sidebar state, theme | Single versioned, schema-validated store (`evoq-crm:db:v1`) with reset. |
| Auth | `/login` sets `crm_auth=true` cookie client-side; `middleware.ts` redirects on it. No users/session model. | Keep the gate behaviour; add a session record (current user + role) so permissions can be enforced in the service layer. Real auth is a backend dependency. |
| Business actions | Convert-to-deal only sets `converted=true`; create drawers mostly don't persist; stage changes are local state | Implement for real against the store: conversion creates Account/Contact/(optional) Deal and marks lead converted, preserving the existing drawer rules (deal requires name + close date; default stage Qualification). |
| Modules | Dashboard, Leads, Deals, Contacts, Accounts, Tasks, Reports (+ ReactFlow graph builder), Settings (single 4,121-line file), dashboard builder, Customer Comms (stub) | Calls and Meetings **do not exist** — add as new modules (spec §7.7). Customer Comms stays a labelled stub. |
| Tests | None | Vitest + Testing Library (matches `Evoq-AI-app`). |

Preserved business vocabulary (from the existing code): lead statuses `New, Contacted, In Progress, Qualified, Lost, Unqualified`; lead pipeline `New → Contacted → In Progress → Qualified`; ratings `Hot/Warm/Cold`; deal stages `Qualification → … → Closed Won` (7, from `DealDetail`/`ConvertToDealDrawer`); task statuses `To-Do, In Progress, Backlog, Completed`; priorities `High/Medium/Low`; roles `Super Admin, Administrator, VP of Operations, Operations Manager, Team Leader, Support Executive`; permission matrix modules × actions from Settings.

## 2. Target architecture

```
app/(auth)/…                 login, register, forgot-password
app/(crm)/layout.tsx         AppShell (sidebar, topbar, search, quick create, EVI)
app/(crm)/<module>/…         server pages await params → client views
components/ui/               shadcn primitives (single source)
components/shared/           PageHeader, ListToolbar, DataTable, badges, states…
components/records/          RecordHeader, ActionBar, SummaryPanel, ActivityTimeline, RelatedPanel
components/activities/       Log call / schedule meeting / task / note / email-log forms
components/evi/              EVI panel + agent proposal cards
lib/schemas/                 Zod — source of all domain types
lib/domain/                  pure rules: health, next action, attention, permissions, metrics
lib/services/                service interfaces + bindings; local adapter in lib/services/local
lib/query/                   query keys + hooks (TanStack Query) with shared invalidation
```

Swapping a module to a real API = re-binding its service in `lib/services/index.ts`; components never touch storage.

## 3. Checklist

- [x] Stage 1 — repository and product audit (this document)
- [ ] Stage 2 — dependencies: Next 16.3.8, React 19.2, Tailwind 4, radix-ui, TanStack Query 5, Zod 4, RHF 7, sonner, Vitest; `proxy.ts`
- [ ] Stage 3 — design tokens (CRM palette §5.1, gradient canvas, type scale, radii), shadcn primitives
- [ ] Stage 4 — AppShell: collapsible sidebar, mobile drawer, global search, quick create, profile, notifications (attention-derived)
- [ ] Stage 5 — modules: Dashboard, Leads, Lead detail, Contacts, Accounts, Deals, Tasks, Calls, Meetings, Reports, Settings, dashboard builder
- [ ] Stage 6 — CX flow: dashboard → queue → record → action → timeline → next action → conversion
- [ ] Stage 7 — lead health, next action, attention rules, manager view, EVI + agent approvals
- [ ] Stage 8 — tests, typecheck, lint, production build
- [ ] Stage 9 — acceptance review and implementation report (`docs/IMPLEMENTATION_REPORT.md`)
