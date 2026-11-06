# EVOQ CRM — Technical architecture

Next.js 16.3.8 (App Router, Turbopack) · React 19.2 · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui (radix-nova, radix-ui) · TanStack Query 5 · Zod 4 · React Hook Form 7 · Recharts 3 · Phosphor icons · Vitest + Testing Library · Playwright + axe.

## 1. The most important fact

**There is no CRM backend.** The pre-migration app had no API, no database and no `fetch` call — every record was an array hardcoded inside a page component, and the "login" was a client-side cookie. The migration therefore introduces a **service boundary** with a **local adapter**:

```
UI components ─▶ lib/query (TanStack Query hooks) ─▶ lib/services (typed interface) ─▶ lib/services/local/* (browser store)
                                                                                       └── replace with fetch-based implementations
```

* Every record, setting, report and dashboard lives in **one Zod-validated snapshot in this browser's localStorage** (`evoq-crm:db:v1`). Clearing site data deletes it. Settings → Data backup downloads/restores it as JSON.
* Components never touch storage. They call hooks → services. To move a domain to a real API, re-export a `fetch` implementation with the same signatures from `lib/services/index.ts`. Nothing above that line changes.
* **Authorization is enforced in the service layer** (`assertCan` against the Settings ▸ Permissions matrix, every read and write), not only by hiding buttons. A real backend must re-enforce it (the browser can always be bypassed).

## 2. Folder map

| Path | Responsibility |
| --- | --- |
| `app/(auth)` | Sign in, request access, reset password |
| `app/(crm)` | Authenticated shell + every module route (server `page.tsx` awaits `params`, renders a client view) |
| `proxy.ts` | Next 16 rename of `middleware.ts`. Optimistic redirect only — **not authorization** |
| `components/ui` | shadcn primitives (single component system; MUI/Emotion/MUI-X/ReactFlow removed) |
| `components/shell` | Sidebar, topbar, global search (Ctrl K), quick create, notifications, profile |
| `components/lists` | Generic `ModuleList` (URL-state search/filter/sort/paging, saved views, column chooser, bulk actions, Table/Kanban/Grid, cards on mobile) |
| `components/records` | `RecordPage`, activity timeline, stage bar, health/attention/next-action cards, details panel |
| `components/forms` | Registry-driven create/edit drawers, activity forms, lead conversion |
| `components/modules` | Per-module screens composed from the above |
| `components/settings` | Admin panels |
| `components/evi` | Contextual assistant + agent approval cards |
| `lib/schemas` | **Zod = source of all domain types and of form/service validation** |
| `lib/domain` | Pure, tested rules: health, next action, attention, activity aggregation, permissions, metrics, field registry |
| `lib/services` | Service interface (`index.ts`) + local adapter (`local/`) |
| `lib/query` | Query keys, hooks, provider |
| `tests`, `e2e` | Vitest (35) and Playwright (20) |
| `_legacy` | Pre-migration MUI source, kept for reference. **Delete after sign-off.** |

Design tokens live only in `app/globals.css` (CRM palette, gradient canvas, type scale, radii, dark mode).

## 3. Data & query conventions

* One `qk` key factory. Every committed write notifies the store; `QueryProvider` invalidates `["crm"]`, so no mutation hand-picks keys (the usual source of stale UI). Cross-tab edits sync via the `storage` event.
* Updates validate the **merged** record (Zod 4 applies field defaults inside `.partial()`, which would silently blank untouched fields — covered by a test).
* Failures are never silent: validation errors show on fields; everything else toasts; storage-full surfaces as an explicit error; a corrupt snapshot is backed up (not overwritten) and the user is told.
* List filtering/sorting/paging run in the service (`runQuery`) with the shape a server API would have.

## 4. Business rules (all in `lib/domain`, all unit-tested)

**Next action.** Earliest open dated task/call/meeting *on the record itself*; else oldest undated task; else (deals) the *Next step* field. Items aggregated from related records never become a record's next action (ownership would be ambiguous). Overdue items win by definition.

**Lead health (0–100, explainable).** Rating 25 · recency of last interaction 25 · next action scheduled & not overdue 20 · progress 15 · reachable 10 · profile complete 5. Healthy ≥ 60, Watch ≥ 35, else At risk. *Not scored* (explicit state) if fewer than 2 of {rating, any interaction, a channel}; Lost/Unqualified/converted are "Not tracked". Recomputed on every read (always as fresh as the data). Manual override requires a reason and is written to history; the calculation stays visible. All numbers: `lib/domain/rules-config.ts`.

**Attention.** Overdue follow-up · no owner · no next action · no recent activity (>14 days; new records exempt 3 days) · stalled (status/stage unchanged >30 days). Each has a stated rule, a reason and a corrective action. Evaluated only for open leads/deals.

**Interactions** (what resets "recent activity"): completed calls/meetings, logged emails, completed tasks. Notes, comments, files and history never count.

**Unified activity.** Tasks, calls, meetings, notes, comments, files, logged emails and record history are aggregated per record. Accounts include their contacts' and deals' activity; contacts include their deals'. De-duplicated by source id; each item says where it came from.

**Lead conversion** (rules preserved from the original drawer, now persisted): creates/links an Account, creates a Contact, optionally a Deal (name + closing date required; stage default Qualification). The lead becomes read-only; open tasks/calls/meetings move to the deal (or contact); notes, emails and history stay on the lead.

**Manager scope.** A user's team = users whose role sits below theirs in Settings ▸ Roles. Admin tier sees everyone.

## 5. Deviations from the spec / source material (decisions to confirm)

1. **Hover colour.** The brand book hovers primary buttons to `#60A5FA` with white text (≈2.5:1, fails WCAG AA). Primary hover darkens toward Depth instead; `#60A5FA` is used for hover borders/outlines.
2. **ReactFlow report graph builder → guided builder.** The old graph UI had no engine behind it (no query execution). It is replaced by a source → filters → grouping → measure → chart stepper that actually runs. Cross-module *joins* are limited to related columns exposed by the field registry (e.g. account name on a deal).
3. **Calls and Meetings are new modules** (they did not exist). Their vocabularies (direction, outcome, statuses) are new and need product sign-off — see `lib/schemas/options.ts`.
4. **Lead priority** reuses the existing High/Medium/Low set; the seed data has none set, so the column honestly shows "—".
5. **"Notify owner" on conversion** was dropped: there is no notification/email service, so it could only have been a fake success.
6. **Customer Comms** remains the same "coming soon" placeholder.
7. **Roles are data**, not a fixed enum (so administrators can create roles and assign them).
8. **Seed reconciliation.** List and detail pages disagreed on some records (e.g. deal probability). Rules are in `lib/services/local/seed.ts` header.

## 6. Backend contract (what a real API must provide)

Same operations as `lib/services/index.ts`: session (sign-in/out, current user + permissions + team scope, request access, profile), generic `list/get` with `{search, filters, sort, page, pageSize, quick, ownerIds}`, record create/update/delete (+ `deleteImpact`, bulk), `leads.convert`, `deals.setStage`, activities CRUD (+ notes/comments/attachments/email log), `timeline`, `intelligence`, `related`, `search`, `workQueue`, `attentionQueue`, `recentActivity`, `metrics`, `teamOverview`, settings/users/roles/views/reports/dashboards, import/export/backup, EVI (`ask`, `propose`, `decide`, `execute`). Health, next action and attention are computed client-side today from `lib/domain`; a backend should compute them server-side with the same rules so list sorting/filtering scales.
