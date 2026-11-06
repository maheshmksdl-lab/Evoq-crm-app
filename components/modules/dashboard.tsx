"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GearSixIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/shared/primitives";
import { ErrorState, PageSkeleton } from "@/components/shared/states";
import { useAdmin, useDashboards, useMetrics, useSession, useSettings } from "@/lib/query/hooks";
import { useForms } from "@/components/forms/create-context";
import type { Widget } from "@/lib/schemas";
import { TeamTable, WidgetView } from "./dashboard-widgets";

const SPAN: Record<number, string> = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4" };
type Scope = "mine" | "team" | "all";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function Dashboard() {
  const session = useSession();
  const dashboards = useDashboards();
  const settings = useSettings();
  const admin = useAdmin();
  const { create } = useForms();
  const user = session.data?.user;
  const tier = session.data?.tier ?? "rep";
  const [scopeSel, setScopeSel] = useState<Scope | null>(null);
  const scope: Scope = scopeSel ?? (tier === "admin" ? "all" : tier === "manager" ? "team" : "mine");
  const ids = scope === "all" ? null : scope === "mine" ? (user ? [user.id] : []) : session.data?.teamUserIds ?? [];

  const list = useMemo(() => dashboards.data ?? [], [dashboards.data]);
  const activeId = settings.data?.activeDashboardId;
  const active = useMemo(() => list.find((d) => d.id === activeId) ?? list[0], [list, activeId]);

  // Overdue count drives the "start here" prompt for reps.
  const overdue = useMetrics(["overdue_activities", "tasks_due"], user ? [user.id] : null);
  const od = overdue.data?.overdue_activities?.value ?? 0;
  const due = overdue.data?.tasks_due?.value ?? 0;

  if (dashboards.isPending || session.isPending) return <PageSkeleton />;
  if (dashboards.isError) return <ErrorState error={dashboards.error} onRetry={() => dashboards.refetch()} />;
  if (!active) return <ErrorState error={new Error("No dashboard is available for your role. Ask an administrator to share one.")} />;

  const widgets: Widget[] = active.widgets;
  // Managers/admins get the team table even if the saved dashboard predates it.
  const showTeam = tier !== "rep" && !widgets.some((w) => w.key === "team");

  return (
    <>
      <PageHeader
        title={`${greeting()}${user ? `, ${user.firstName || user.name}` : ""}`}
        description={od || due ? `You have ${due} task${due === 1 ? "" : "s"} due today${od ? ` and ${od} overdue` : ""}.` : "Here is your sales activity and pipeline at a glance."}
        actions={<>
          {tier !== "rep" && (
            <Select value={scope} onValueChange={(v) => setScopeSel(v as Scope)}>
              <SelectTrigger size="sm" className="w-[140px]" aria-label="Whose numbers"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="mine">My numbers</SelectItem><SelectItem value="team">My team</SelectItem>{tier === "admin" && <SelectItem value="all">Everyone</SelectItem>}</SelectContent>
            </Select>
          )}
          {list.length > 1 && (
            <Select value={active.id} onValueChange={(v) => admin.setActiveDashboard.mutate([v])}>
              <SelectTrigger size="sm" className="w-[170px]" aria-label="Dashboard"><SelectValue /></SelectTrigger>
              <SelectContent>{list.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button asChild variant="outline" size="sm"><Link href={`/home/${active.id}/edit`}><GearSixIcon />Customize</Link></Button>
          <Button size="sm" onClick={() => create("leads")}><PlusIcon weight="bold" />New lead</Button>
        </>}
      />
      {widgets.length === 0 ? (
        <SectionCard><div className="py-10 text-center"><p className="text-card-title text-heading">This dashboard is empty</p><p className="mt-1 text-body text-ink-muted">Add widgets to see your pipeline, work and activity here.</p><Button asChild className="mt-3" size="sm"><Link href={`/home/${active.id}/edit`}>Add widgets</Link></Button></div></SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {widgets.map((w) => <div key={w.id} className={`min-w-0 ${w.span >= 2 ? "sm:col-span-2" : ""} ${SPAN[w.span]}`}><WidgetView w={w} scope={ids} /></div>)}
          {showTeam && <div className="min-w-0 sm:col-span-2 lg:col-span-4"><SectionCard title="Team overview" description="Workload and follow-up coverage across your team"><TeamTable /></SectionCard></div>}
        </div>
      )}
      <p className="mt-4 text-caption text-ink-faint">Metric definitions: hover the <span aria-hidden>ⓘ</span> on any number. Data is stored in this browser until the CRM backend is connected.</p>
    </>
  );
}
