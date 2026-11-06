# EVOQ CRM — Implementation report

Date: 6 Nov 2026 · Scope: handoff "Product UI/UX Redesign & Developer Handoff" + migration brief · Status: **ready for product review, not production-ready** (see §3 — there is no backend).

> **Version control.** The project's `.git` folder disappeared mid-session (cause unknown). On the product owner's instruction all git files were removed and work stayed local: **no repository, branches or commits exist yet.** This report is the change record. Pre-migration source is preserved in `_legacy/`.

## 1. Headline

The frontend is migrated to Next.js 16 / Tailwind 4 / shadcn/ui / TanStack Query / Zod and every module in the brief is rebuilt on one design system and one data layer, with working create/edit/delete, conversion, activities, reporting, administration and an approval-gated assistant. All of it runs against a **browser-local adapter** because the original app never had an API or database (§3). Verified by 35 unit tests, 20 browser tests (incl. automated accessibility scan), a clean strict typecheck, lint and a production build.

## 2. Status by area

| Legend | |
| --- | --- |
| **FULL** | Works end to end in the current app |
| **LOCAL** | Works, but persists only in this browser until a backend exists |
| **UI-ONLY** | Frontend complete; needs a backend/integration to function |
| **PARTIAL** | Works with stated gaps |

| Area | Status | Notes |
| --- | --- | --- |
| Next.js 16, Tailwind 4, shadcn/ui, TanStack Query, Zod, RHF, `proxy.ts` | **FULL** | Production build passes on Turbopack |
| Design system (CRM palette, gradient canvas, type scale, dark mode) | **FULL** | Tokens only in `app/globals.css` |
| App shell: collapsible sidebar, mobile drawer, Ctrl K search, quick create, notifications, profile | **FULL** | Notifications = real attention items |
| Dashboard (KPIs, charts, work, attention, recent, team table) + widget builder | **LOCAL** | Every metric has a written definition (ⓘ). Role-aware scope |
| Leads: table/Kanban/grid, search, filters, saved views, sort, columns, paging, bulk, import/export | **LOCAL** | URL-state, so every view is deep-linkable. Cards on mobile |
| Lead detail (activity workspace, stage bar, health, next action, attention, details, conversion) | **LOCAL** | |
| Contacts, Accounts, Deals (incl. pipeline/Kanban, stage history) | **LOCAL** | |
| Tasks, Calls, Meetings | **LOCAL** | Calls/Meetings are new modules |
| Reports: library, templates, guided builder with live preview, viewer, CSV export | **LOCAL** | See deviation 2 in ARCHITECTURE.md |
| Settings: personal, users, organization, roles, permissions, email, modules/fields/layouts, dashboards, import/export/backup | **LOCAL** | Permissions are enforced in the service layer |
| Lead health, next action, attention detection | **FULL** (rules) / **LOCAL** (data) | Explainable, documented, tested. Thresholds editable in one file |
| Manager view (team overview, scope, coverage) | **LOCAL** | |
| Unified activity timeline | **LOCAL** | |
| EVI contextual answers | **PARTIAL** | Deterministic, source-cited, grounded in the record. **No language model is connected**; the panel says so |
| AI agents (propose → approve/reject → run → retry → history) | **LOCAL** | Real approval gates and audit history. "Draft email" only saves a note — **nothing is ever sent** |
| Sign-in / sessions | **UI-ONLY** | See blocker B1 |
| Email sending, calling | **UI-ONLY** | Call/Email open the device's phone/mail app; logging is explicit. No telephony/email integration exists |
| File attachments | **PARTIAL** | ≤ 512 KB stored inline in the browser; real storage needed |
| Customer Comms | **Not implemented** | Was a "coming soon" placeholder; still is |

## 3. Blockers and dependencies (what is NOT done, and why)

| # | Blocker | Impact | Needed |
| --- | --- | --- | --- |
| **B1** | **Authentication is a demo.** The one accepted credential (`tech@evoq.one`) is hardcoded in client code, exactly as before. Anyone who can read the bundle can read it. | **Must be replaced before any production use.** | Real auth service (httpOnly session, hashed passwords, rate-limit, reset email). Request-access records an inactive user; it cannot issue a password |
| **B2** | **No backend/database.** All data is browser-local; clearing site data erases it; no sharing between users/devices. | Multi-user use, real permissions, audit trail, large datasets | Implement the contract in ARCHITECTURE.md §6 and re-bind `lib/services` |
| **B3** | **No LLM / EVI backend** | EVI cannot answer free-form questions or draft rich content | Model/agent service honouring the same approval workflow |
| **B4** | No email/telephony/calendar integration | Email isn't sent; calls aren't dialed or recorded automatically | Provider integration |
| **B5** | No file storage | Attachments > 512 KB rejected | Object storage |
| **B6** | Server-side scoring | Health/attention are computed in the browser from all records; fine for sample scale, not for very large datasets | Compute server-side with `lib/domain` rules |

## 4. Decisions that need product sign-off

Calls/Meetings field vocabularies; health weights and band thresholds; attention windows (14/30/3 days); next-action precedence; dropping "Notify owner"; replacing the graph report builder; hover-colour contrast deviation; role names becoming data. All are listed with rationale in ARCHITECTURE.md §5.

## 5. QA results

| Check | Result |
| --- | --- |
| TypeScript strict (`tsc --noEmit`) | Pass, 0 errors |
| ESLint (Next + React-compiler rules) | 0 errors; 4 informational warnings (React Hook Form `watch()` is not compiler-memoizable) |
| Production build | Pass — 25 routes |
| Unit/integration (Vitest) | 35/35 — rules, conversion, partial-update safety, permissions enforced in service, agent approval, import, CSV |
| Browser (Playwright, real Chrome, production build) | 20/20 — sign in/out + redirect, validation, dashboard, lead search → note → task → complete, conversion (incl. validation + read-only after), deal stage, tasks, calls/meetings, global search, reports, all settings tabs, dashboard builder, manager view, EVI approval gate |
| Accessibility (axe, WCAG 2.0/2.1 A+AA) | 0 critical / 0 serious on 21 screens (see "found and fixed") |
| Responsive | 21 screens × 3 viewports (1440 / 820 / 390): no horizontal page scroll, no console errors. Screenshots in `docs/screenshots/` |

**Defects found by testing and fixed:** the create drawer queried record id `""` and showed "Lead was not found" (build/typecheck could not catch this); axe found disabled action icons with an invalid `aria-label`, KPI cards nesting a button inside a button, and unlabeled selects; the lead table was a compressed desktop table on mobile (now cards); dashboard "Recent activity" was dominated by internal history rows (now real interactions only); stacked attention chips made rows too tall (now one compact flag badge).

**Not tested / known gaps:** no tests of slow-network or very large lists (the local adapter makes them unrepresentative — test against the real API); no real-device or screen-reader (NVDA/VoiceOver) pass — axe catches only a subset of issues; Safari/Firefox not run; drag-and-drop Kanban is covered by the keyboard "Move to…" path in tests, not by a drag simulation; visual regression against the proposed wireframes was by eye, not pixel diff.

## 6. Major dependencies

Added: `next@16.3.8`, `react@19.2.8`, `tailwindcss@4`, `@tailwindcss/postcss`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@tanstack/react-query`, `zod@4`, `react-hook-form`, `@hookform/resolvers`, `sonner`, `recharts@3`, `react-is`. Dev: `vitest`, Testing Library, `@playwright/test`, `@axe-core/playwright`. **Removed:** `@mui/*`, `@emotion/*`, `reactflow`, Tailwind 3 config. `npm audit` reports advisories — review before release.

## 7. Changed files (summary; no git diff is available)

New: `app/(auth)`, `app/(crm)` (all routes), `proxy.ts` (replaces `middleware.ts`), `components/{ui,shell,lists,records,forms,modules,settings,evi,charts,shared,auth}`, `lib/{schemas,domain,services,query}`, `tests/`, `e2e/`, `docs/`. Rewritten: `app/layout.tsx`, `app/globals.css`, `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs`. Removed from the build and moved to `_legacy/`: every pre-migration page, component and lib file. Removed outright: `tailwind.config.ts` (Tailwind 4 is CSS-configured), `middleware.ts`.

## 8. Run it

```
npm install --legacy-peer-deps
npm run dev            # http://localhost:3000   (sign in: tech@evoq.one — demo credential, see B1)
npm run typecheck && npm run lint && npm test
npm run build && npm run start:e2e   # then, in another terminal: npm run e2e
```
Settings → Data backup → "Reset to sample data" restores the seeded dataset (built from the records that were hardcoded in the old pages).
