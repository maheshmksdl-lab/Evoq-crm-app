"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, Breadcrumbs, ConfirmDialog, SectionCard } from "@/components/shared/primitives";
import { PageSkeleton } from "@/components/shared/states";
import { useRemoveRecord } from "@/lib/query/hooks";
import { deleteImpact } from "@/lib/services";
import type { RecordModule } from "@/lib/schemas";

export function RecordMoreMenu({ module, id, name, onEdit, canEdit, canDelete, extra }: {
  module: RecordModule; id: string; name: string; onEdit?: () => void; canEdit: boolean; canDelete: boolean; extra?: ReactNode;
}) {
  const router = useRouter();
  const [del, setDel] = useState(false);
  const remove = useRemoveRecord();
  const impact = useQuery({ queryKey: ["crm", "impact", module, id], queryFn: () => deleteImpact(module, id), enabled: del });
  const i = impact.data;
  const lines = i ? [
    i.notes ? `${i.notes} note${i.notes === 1 ? "" : "s"} and comments` : null, i.attachments ? `${i.attachments} attachment${i.attachments === 1 ? "" : "s"}` : null,
  ].filter(Boolean) : [];
  const kept = i ? [
    i.activitiesUnlinked ? `${i.activitiesUnlinked} task/call/meeting${i.activitiesUnlinked === 1 ? "" : "s"} will be kept but unlinked` : null,
    i.contactsUnlinked ? `${i.contactsUnlinked} contact${i.contactsUnlinked === 1 ? "" : "s"} will lose their account` : null,
    i.dealsUnlinked ? `${i.dealsUnlinked} deal${i.dealsUnlinked === 1 ? "" : "s"} will lose this link` : null,
  ].filter(Boolean) : [];
  if (!canEdit && !canDelete && !extra) return null;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" size="icon-sm" aria-label="More actions"><DotsThreeIcon weight="bold" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {canEdit && onEdit && <DropdownMenuItem onSelect={onEdit}><PencilSimpleIcon />Edit</DropdownMenuItem>}
          {extra}
          {canDelete && <>{(canEdit || extra) && <DropdownMenuSeparator />}<DropdownMenuItem variant="destructive" onSelect={() => setDel(true)}><TrashIcon />Delete</DropdownMenuItem></>}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog open={del} onOpenChange={setDel} destructive confirmLabel="Delete" title={`Delete ${name}?`} description="This can't be undone."
        onConfirm={async () => { await remove.mutateAsync([module, id]); router.replace(`/${module}`); }}>
        <div className="space-y-1.5 text-body text-ink-body">
          {impact.isPending ? <p className="text-ink-muted">Checking what this affects…</p> : (<>
            {lines.length > 0 && <p><strong>Also deleted:</strong> {lines.join(", ")}.</p>}
            {kept.length > 0 && <p><strong>Kept:</strong> {kept.join("; ")}.</p>}
            {!lines.length && !kept.length && <p>Nothing else is linked to this record.</p>}
          </>)}
        </div>
      </ConfirmDialog>
    </>
  );
}

export function RecordPage({ loading, crumbs, avatarName, title, subtitle, badges, actions, banner, stage, summary, activity, details, related, detailsCount }: {
  loading?: boolean; crumbs: { label: string; href?: string }[]; avatarName: string; title: string; subtitle?: ReactNode; badges?: ReactNode;
  actions: ReactNode; banner?: ReactNode; stage?: ReactNode; summary: ReactNode; activity: ReactNode; details: ReactNode; related: ReactNode; detailsCount?: number;
}) {
  const [tab, setTab] = useState("activity");
  if (loading) return <PageSkeleton />;
  return (
    <div>
      <Breadcrumbs items={crumbs} />
      <header className="mb-4 mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={avatarName} size={48} />
          <div className="min-w-0">
            <h1 className="truncate text-page-title text-heading">{title}</h1>
            {subtitle && <p className="truncate text-body text-ink-muted">{subtitle}</p>}
            {badges && <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{badges}</div>}
          </div>
        </div>
        <div role="toolbar" aria-label="Record actions" className="flex flex-wrap items-center gap-2">{actions}</div>
      </header>
      {banner && <div className="mb-4">{banner}</div>}
      {stage && <SectionCard className="mb-4 p-3.5">{stage}</SectionCard>}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard className="min-w-0" bodyClassName="pt-1">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList variant="line" className="mb-3">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="details">Details{detailsCount ? <span className="ml-1 text-ink-muted">{detailsCount}</span> : null}</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">{activity}</TabsContent>
            <TabsContent value="details">{details}</TabsContent>
            <TabsContent value="related">{related}</TabsContent>
          </Tabs>
        </SectionCard>
        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1rem)]" aria-label="Summary">{summary}</aside>
      </div>
    </div>
  );
}
