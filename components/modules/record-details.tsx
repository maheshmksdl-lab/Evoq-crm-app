"use client";

import Link from "next/link";
import {
  ArrowsClockwiseIcon, CalendarCheckIcon, CheckSquareIcon, EnvelopeSimpleIcon, NotePencilIcon, PencilSimpleIcon, PhoneIcon, TrophyIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DEAL_STAGES, LEAD_PIPELINE } from "@/lib/schemas/options";
import { useListAll, useRecord, useRelated, useSession, useSetLeadStatus, useSetStage } from "@/lib/query/hooks";
import type { RecordModule, RecordRef } from "@/lib/schemas";
import { date, dateTime, money, pct, relative } from "@/lib/domain/format";
import { MODULE_PERM } from "@/lib/domain/permissions";
import { DealStageBadge, LeadStatusBadge, PriorityBadge, RatingBadge, StatusBadge } from "@/components/shared/badges";
import { ErrorState, CardSkeleton } from "@/components/shared/states";
import { SectionCard } from "@/components/shared/primitives";
import { useForms } from "@/components/forms/create-context";
import { ActivityTimeline } from "@/components/records/activity-timeline";
import { RecordMoreMenu, RecordPage } from "@/components/records/record-page";
import { AttentionCard, DetailsPanel, HealthCard, NextActionCard, RelatedList, StageBar, SummaryList } from "@/components/records/record-parts";

function usePerms(module: RecordModule) {
  const p = useSession().data?.permissions ?? {};
  const g = (m: string, a: string) => p[m]?.[a] !== false;
  return {
    update: g(MODULE_PERM[module], "update"), del: g(MODULE_PERM[module], "delete"),
    task: g("Tasks", "create"), call: g("Calls", "create"), meeting: g("Meetings", "create"),
  };
}

/** Call / Email / Meeting / Task / Note — the same five actions on every record (handoff §5). */
function ActionBar({ related, phone, email, perms, hide }: { related: RecordRef; phone?: string; email?: string; perms: ReturnType<typeof usePerms>; hide?: boolean }) {
  const { open } = useForms();
  if (hide) return null;
  return (
    <>
      {perms.call && (
        <span className="inline-flex">
          <Button size="sm" onClick={() => open({ kind: "call", related, defaults: { phone: phone ?? "" } })}><PhoneIcon />Call</Button>
          {phone && <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon-sm" className="ml-1"><a href={`tel:${phone.replace(/[^\d+]/g, "")}`} aria-label={`Dial ${phone}`}><PhoneIcon /></a></Button></TooltipTrigger><TooltipContent>Dial {phone}</TooltipContent></Tooltip>}
        </span>
      )}
      <span className="inline-flex">
        <Button size="sm" variant="outline" onClick={() => open({ kind: "email", related })}><EnvelopeSimpleIcon />Email</Button>
        {email && <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon-sm" className="ml-1"><a href={`mailto:${email}`} aria-label={`Write to ${email}`}><EnvelopeSimpleIcon /></a></Button></TooltipTrigger><TooltipContent>Open mail app</TooltipContent></Tooltip>}
      </span>
      {perms.meeting && <Button size="sm" variant="outline" onClick={() => open({ kind: "meeting", related })}><CalendarCheckIcon />Meeting</Button>}
      {perms.task && <Button size="sm" variant="outline" onClick={() => open({ kind: "task", related })}><CheckSquareIcon />Task</Button>}
      <Button size="sm" variant="outline" onClick={() => open({ kind: "note", related })}><NotePencilIcon />Note</Button>
    </>
  );
}

function Loading({ q, back, label }: { q: { isPending: boolean; isError: boolean; error: unknown; refetch: () => void }; back: string; label: string }) {
  if (q.isPending) return <CardSkeleton lines={10} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} backHref={back} backLabel={label} />;
  return null;
}

const Who = ({ id, label }: { id: string | null; label: string | null }) => (id ? <Link href={id} className="text-crm-primary hover:underline">{label}</Link> : <>—</>);

/* ═════════════ LEAD ═════════════ */
export function LeadDetail({ id }: { id: string }) {
  const q = useRecord("leads", id);
  const accounts = useListAll("accounts");
  const rel = useRelated({ module: "leads", id });
  const setStatus = useSetLeadStatus();
  const { open } = useForms();
  const perms = usePerms("leads");
  const l = q.data;
  const state = Loading({ q, back: "/leads", label: "Back to leads" });
  if (state || !l) return state;
  const ref: RecordRef = { module: "leads", id };
  const conv = l.converted;
  const matching = !conv && l.company ? accounts.data?.find((a) => a.name.trim().toLowerCase() === l.company.trim().toLowerCase()) : null;
  const edit = () => open({ kind: "record", module: "leads", id });
  return (
    <RecordPage
      crumbs={[{ label: "Leads", href: "/leads" }, { label: l.name }]} avatarName={l.name} title={l.name}
      subtitle={[l.title, l.company].filter(Boolean).join(" · ") || undefined}
      badges={<><LeadStatusBadge status={l.status} /><PriorityBadge priority={l.priority} />{l.rating && <RatingBadge rating={l.rating} />}<span className="text-caption text-ink-muted">Lead #{l.id} · Owner {l.ownerName}</span></>}
      actions={<>
        <ActionBar related={ref} phone={l.mobile || l.phone} email={l.email} perms={perms} hide={!!conv} />
        {!conv && perms.update && <Button size="sm" onClick={() => open({ kind: "convert", leadId: id })}><ArrowsClockwiseIcon />Convert to deal</Button>}
        {!conv && perms.update && <Button size="icon-sm" variant="outline" aria-label="Edit lead" onClick={edit}><PencilSimpleIcon /></Button>}
        <RecordMoreMenu module="leads" id={id} name={l.name} canEdit={false} canDelete={perms.del} />
      </>}
      banner={conv && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-success/30 bg-success-bg px-3 py-2 text-body text-success-fg">
          <StatusBadge tone="success" icon={TrophyIcon}>Converted</StatusBadge> on {dateTime(conv.at)}. Continue the relationship here:
          <Link className="font-medium underline" href={`/accounts/${conv.accountId}`}>Account</Link>
          <Link className="font-medium underline" href={`/contacts/${conv.contactId}`}>Contact</Link>
          {conv.dealId && <Link className="font-medium underline" href={`/deals/${conv.dealId}`}>Deal</Link>}
        </div>
      )}
      stage={<StageBar steps={LEAD_PIPELINE} current={l.status} disabled={!!conv || !perms.update} onSelect={(s) => setStatus.mutate([id, s as typeof l.status])} terminal={[{ label: "Lost", value: "Lost" }, { label: "Unqualified", value: "Unqualified" }]} />}
      summary={<>
        {!conv && <NextActionCard next={l.nextAction} related={ref} canPlan={perms.task} />}
        <AttentionCard items={l.attention} related={ref} onEdit={edit} />
        <HealthCard leadId={id} health={l.health} canEdit={perms.update && !conv} />
        <SectionCard title="Lead summary">
          <SummaryList rows={[
            { label: "Owner", value: l.ownerName }, { label: "Source", value: l.leadSource }, { label: "Status", value: l.status }, { label: "Priority", value: l.priority },
            { label: "Last interaction", value: l.lastInteractionAt ? `${relative(l.lastInteractionAt)}` : "None yet" },
            { label: "Email", value: l.email ? <a className="text-crm-primary hover:underline" href={`mailto:${l.email}`}>{l.email}</a> : null },
            { label: "Phone", value: l.mobile || l.phone }, { label: "Created", value: date(l.createdAt) }, { label: "Updated", value: date(l.updatedAt) },
          ]} />
        </SectionCard>
      </>}
      activity={<ActivityTimeline anchor={ref} readOnly={!!conv} note={conv ? "This lead is converted. History is read-only here; log new activity on the contact or deal." : undefined} />}
      details={<DetailsPanel module="leads" record={l} onEdit={edit} canEdit={perms.update && !conv} />}
      related={<div className="space-y-5">
        {matching && <div className="rounded-lg border border-line bg-crm-surface px-3 py-2 text-body dark:bg-info-bg">An account named <Link className="font-medium text-crm-primary hover:underline" href={`/accounts/${matching.id}`}>{matching.name}</Link> already exists. Choose &ldquo;Link existing account&rdquo; when converting to avoid a duplicate.</div>}
        <RelatedList title="Deals from this lead" empty="No deal has been created from this lead." items={(rel.data?.deals ?? []).map((d) => ({ key: d.id, href: `/deals/${d.id}`, title: d.name, sub: money(d.amount), right: <DealStageBadge stage={d.stage} /> }))} />
        {conv && <RelatedList title="Created on conversion" empty="" items={[
          { key: "a", href: `/accounts/${conv.accountId}`, title: "Account", sub: accounts.data?.find((a) => a.id === conv.accountId)?.name },
          { key: "c", href: `/contacts/${conv.contactId}`, title: "Contact", sub: [l.firstName, l.lastName].filter(Boolean).join(" ") },
        ]} />}
      </div>}
    />
  );
}

/* ═════════════ CONTACT ═════════════ */
export function ContactDetail({ id }: { id: string }) {
  const q = useRecord("contacts", id);
  const rel = useRelated({ module: "contacts", id });
  const { open } = useForms();
  const perms = usePerms("contacts");
  const c = q.data;
  const state = Loading({ q, back: "/contacts", label: "Back to contacts" });
  if (state || !c) return state;
  const ref: RecordRef = { module: "contacts", id };
  const edit = () => open({ kind: "record", module: "contacts", id });
  return (
    <RecordPage
      crumbs={[{ label: "Contacts", href: "/contacts" }, { label: c.name }]} avatarName={c.name} title={c.name}
      subtitle={[c.title, c.accountName].filter(Boolean).join(" · ") || undefined}
      badges={<span className="text-caption text-ink-muted">Owner {c.ownerName}{c.emailOptOut && " · Email opt-out"}</span>}
      actions={<><ActionBar related={ref} phone={c.mobile || c.phone} email={c.emailOptOut ? undefined : c.email} perms={perms} />
        {perms.update && <Button size="icon-sm" variant="outline" aria-label="Edit contact" onClick={edit}><PencilSimpleIcon /></Button>}
        <RecordMoreMenu module="contacts" id={id} name={c.name} canEdit={false} canDelete={perms.del} /></>}
      summary={<>
        <NextActionCard next={c.nextAction} related={ref} canPlan={perms.task} />
        <SectionCard title="Contact summary"><SummaryList rows={[
          { label: "Owner", value: c.ownerName }, { label: "Account", value: c.accountId ? <Who id={`/accounts/${c.accountId}`} label={c.accountName} /> : null },
          { label: "Email", value: c.email ? <a className="text-crm-primary hover:underline" href={`mailto:${c.email}`}>{c.email}</a> : null }, { label: "Phone", value: c.mobile || c.phone },
          { label: "Last interaction", value: c.lastInteractionAt ? relative(c.lastInteractionAt) : "None yet" }, { label: "Source", value: c.leadSource },
          { label: "Created", value: date(c.createdAt) }, { label: "Updated", value: date(c.updatedAt) },
        ]} /></SectionCard>
      </>}
      activity={<ActivityTimeline anchor={ref} note="Includes activity on this contact's deals." />}
      details={<DetailsPanel module="contacts" record={c} onEdit={edit} canEdit={perms.update} />}
      related={<div className="space-y-5">
        <RelatedList title="Account" empty="Not linked to an account." items={c.accountId ? [{ key: c.accountId, href: `/accounts/${c.accountId}`, title: c.accountName ?? "Account" }] : []} />
        <RelatedList title="Deals" empty="No deals with this contact." items={(rel.data?.deals ?? []).map((d) => ({ key: d.id, href: `/deals/${d.id}`, title: d.name, sub: `${money(d.amount)} · closes ${date(d.closingDate)}`, right: <DealStageBadge stage={d.stage} /> }))} />
      </div>}
    />
  );
}

/* ═════════════ ACCOUNT ═════════════ */
export function AccountDetail({ id }: { id: string }) {
  const q = useRecord("accounts", id);
  const rel = useRelated({ module: "accounts", id });
  const all = useListAll("accounts");
  const { open } = useForms();
  const perms = usePerms("accounts");
  const a = q.data;
  const state = Loading({ q, back: "/accounts", label: "Back to accounts" });
  if (state || !a) return state;
  const ref: RecordRef = { module: "accounts", id };
  const edit = () => open({ kind: "record", module: "accounts", id });
  const parent = a.parentAccountId ? all.data?.find((x) => x.id === a.parentAccountId) : null;
  return (
    <RecordPage
      crumbs={[{ label: "Accounts", href: "/accounts" }, { label: a.name }]} avatarName={a.name} title={a.name}
      subtitle={[a.accountType, a.industry, a.website].filter(Boolean).join(" · ") || undefined}
      badges={<span className="text-caption text-ink-muted">Owner {a.ownerName}</span>}
      actions={<><ActionBar related={ref} phone={a.phone} perms={perms} />
        {perms.update && <Button size="icon-sm" variant="outline" aria-label="Edit account" onClick={edit}><PencilSimpleIcon /></Button>}
        <RecordMoreMenu module="accounts" id={id} name={a.name} canEdit={false} canDelete={perms.del} /></>}
      summary={<>
        <NextActionCard next={a.nextAction} related={ref} canPlan={perms.task} />
        <SectionCard title="Account summary"><SummaryList rows={[
          { label: "Owner", value: a.ownerName }, { label: "Type", value: a.accountType }, { label: "Industry", value: a.industry },
          { label: "Primary contact", value: a.primaryContactId ? <Who id={`/contacts/${a.primaryContactId}`} label={a.primaryContactName} /> : null },
          { label: "Open deals", value: a.openDeals ? `${a.openDeals} · ${money(a.openDealValue)}` : "None" }, { label: "Parent", value: parent ? <Who id={`/accounts/${parent.id}`} label={parent.name} /> : null },
          { label: "Last activity", value: a.lastInteractionAt ? relative(a.lastInteractionAt) : "None yet" }, { label: "Created", value: date(a.createdAt) },
        ]} /></SectionCard>
      </>}
      activity={<ActivityTimeline anchor={ref} note="Includes activity on this account's contacts and deals." />}
      details={<DetailsPanel module="accounts" record={a} onEdit={edit} canEdit={perms.update} />}
      related={<div className="space-y-5">
        <RelatedList title="Contacts" empty="No contacts at this account yet." items={(rel.data?.contacts ?? []).map((c) => ({ key: c.id, href: `/contacts/${c.id}`, title: c.name, sub: [c.title, c.email].filter(Boolean).join(" · ") }))}
          action={<Button size="xs" variant="outline" onClick={() => open({ kind: "record", module: "contacts", defaults: { accountId: id } })}>Add contact</Button>} />
        <RelatedList title="Deals" empty="No deals with this account." items={(rel.data?.deals ?? []).map((d) => ({ key: d.id, href: `/deals/${d.id}`, title: d.name, sub: `${money(d.amount)} · closes ${date(d.closingDate)}`, right: <DealStageBadge stage={d.stage} /> }))}
          action={<Button size="xs" variant="outline" onClick={() => open({ kind: "record", module: "deals", defaults: { accountId: id } })}>Add deal</Button>} />
        {(rel.data?.childAccounts.length ?? 0) > 0 && <RelatedList title="Child accounts" empty="" items={(rel.data?.childAccounts ?? []).map((x) => ({ key: x.id, href: `/accounts/${x.id}`, title: x.name }))} />}
      </div>}
    />
  );
}

/* ═════════════ DEAL ═════════════ */
export function DealDetail({ id }: { id: string }) {
  const q = useRecord("deals", id);
  const setStage = useSetStage();
  const { open } = useForms();
  const perms = usePerms("deals");
  const d = q.data;
  const state = Loading({ q, back: "/deals", label: "Back to deals" });
  if (state || !d) return state;
  const ref: RecordRef = { module: "deals", id };
  const edit = () => open({ kind: "record", module: "deals", id });
  const tiles = [
    { label: "Amount", value: money(d.amount) }, { label: "Probability", value: pct(d.probability) },
    { label: "Expected revenue", value: money(d.expectedRevenue) }, { label: "Closing date", value: date(d.closingDate) },
  ];
  return (
    <RecordPage
      crumbs={[{ label: "Deals", href: "/deals" }, { label: d.name }]} avatarName={d.name} title={d.name}
      subtitle={[d.accountName, d.contactName].filter(Boolean).join(" · ") || undefined}
      badges={<><DealStageBadge stage={d.stage} /><span className="text-caption text-ink-muted">{d.refId} · Owner {d.ownerName}</span></>}
      actions={<><ActionBar related={ref} perms={perms} />
        {perms.update && <Button size="icon-sm" variant="outline" aria-label="Edit deal" onClick={edit}><PencilSimpleIcon /></Button>}
        <RecordMoreMenu module="deals" id={id} name={d.name} canEdit={false} canDelete={perms.del} /></>}
      stage={<StageBar steps={DEAL_STAGES} current={d.stage} disabled={!perms.update} onSelect={(s) => setStage.mutate([id, s as typeof d.stage])} />}
      summary={<>
        <SectionCard title="Commercials"><dl className="grid grid-cols-2 gap-3">{tiles.map((t) => <div key={t.label}><dt className="text-caption text-ink-muted">{t.label}</dt><dd className="tabular text-card-title font-semibold text-heading">{t.value}</dd></div>)}</dl></SectionCard>
        <NextActionCard next={d.nextAction} related={ref} canPlan={perms.task} />
        {d.nextStep && <SectionCard title="Next step (note)"><p className="text-body text-ink">{d.nextStep}</p></SectionCard>}
        <AttentionCard items={d.attention} related={ref} onEdit={edit} />
        <SectionCard title="Deal summary"><SummaryList rows={[
          { label: "Owner", value: d.ownerName }, { label: "Account", value: d.accountId ? <Who id={`/accounts/${d.accountId}`} label={d.accountName} /> : null },
          { label: "Contact", value: d.contactId ? <Who id={`/contacts/${d.contactId}`} label={d.contactName} /> : null }, { label: "Type", value: d.type }, { label: "Source", value: d.leadSource },
          { label: "In stage", value: `${d.stageAgeDays} day${d.stageAgeDays === 1 ? "" : "s"}` }, { label: "Last activity", value: d.lastInteractionAt ? relative(d.lastInteractionAt) : "None yet" },
        ]} /></SectionCard>
      </>}
      activity={<ActivityTimeline anchor={ref} />}
      details={<DetailsPanel module="deals" record={d} onEdit={edit} canEdit={perms.update} />}
      related={<div className="space-y-5">
        <RelatedList title="Account" empty="No account linked." items={d.accountId ? [{ key: "a", href: `/accounts/${d.accountId}`, title: d.accountName ?? "Account" }] : []} />
        <RelatedList title="Contact" empty="No contact linked." items={d.contactId ? [{ key: "c", href: `/contacts/${d.contactId}`, title: d.contactName ?? "Contact" }] : []} />
        {d.fromLeadId && <RelatedList title="Origin" empty="" items={[{ key: "l", href: `/leads/${d.fromLeadId}`, title: "Converted from lead", sub: `Lead #${d.fromLeadId}` }]} />}
        <section><h3 className="mb-2 text-label font-semibold text-heading">Stage history</h3>
          <ol className="space-y-1.5 border-l-2 border-line pl-3">{[...d.stageHistory].reverse().map((s, i) => (
            <li key={i} className="text-body text-ink-body"><span className="font-medium text-ink">{s.from ? `${s.from} → ${s.to}` : `Created at ${s.to}`}</span><span className="text-caption text-ink-muted"> · {s.probabilityFrom ?? 0}% → {s.probabilityTo}% · {dateTime(s.at)}</span></li>
          ))}</ol></section>
      </div>}
    />
  );
}
