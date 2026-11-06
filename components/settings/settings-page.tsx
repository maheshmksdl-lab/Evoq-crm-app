"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  BuildingsIcon, CubeIcon, DownloadSimpleIcon, EnvelopeSimpleIcon, GearSixIcon, HardDrivesIcon, HouseIcon, LockKeyIcon, ShieldCheckIcon,
  UploadSimpleIcon, UserCircleIcon, UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/primitives";
import { EmptyState } from "@/components/shared/states";
import { useSession } from "@/lib/query/hooks";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonalPanel, UsersPanel, OrganizationPanel, EmailPanel } from "./panels-people";
import { RolesPanel, PermissionsPanel } from "./panels-security";
import { ModulesPanel } from "./panels-modules";
import { DashboardsPanel } from "./panels-dashboards";
import { ImportPanel, ExportPanel, BackupPanel } from "./panels-data";

/** Same information architecture as before (General / Security / Channels / Customization / Data), grouped by who needs it. */
interface Item { key: string; label: string; icon: React.ComponentType<{ className?: string }>; perm: string | null }
const GROUPS: { label: string; items: Item[] }[] = [
  { label: "General", items: [{ key: "personal", label: "Personal settings", icon: UserCircleIcon, perm: null }, { key: "users", label: "Users", icon: UsersThreeIcon, perm: "Users" }, { key: "organization", label: "Organization", icon: BuildingsIcon, perm: "Organizations" }] },
  { label: "Security control", items: [{ key: "roles", label: "Roles", icon: ShieldCheckIcon, perm: "Roles" }, { key: "permissions", label: "Permissions", icon: LockKeyIcon, perm: "Permissions" }] },
  { label: "Channels", items: [{ key: "email", label: "Email", icon: EnvelopeSimpleIcon, perm: "Organizations" }] },
  { label: "Customization", items: [{ key: "modules", label: "Modules, fields & layouts", icon: CubeIcon, perm: "Modules and Fields" }, { key: "dashboards", label: "Dashboard customization", icon: HouseIcon, perm: "Dashboard Customization" }] },
  { label: "Data administration", items: [{ key: "import", label: "Import", icon: UploadSimpleIcon, perm: "Import" }, { key: "export", label: "Export", icon: DownloadSimpleIcon, perm: "Export" }, { key: "backup", label: "Data backup", icon: HardDrivesIcon, perm: "Data Backup" }] },
];

export function SettingsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const perms = useSession().data?.permissions ?? {};
  const allowed = (p: string | null) => !p || Object.values(perms[p] ?? {}).some(Boolean) || perms[p]?.read === true;
  const tab = sp.get("tab") ?? "personal";
  const set = (k: string) => router.replace(`/settings?tab=${k}`, { scroll: false });
  const items = GROUPS.flatMap((g) => g.items);
  const cur = items.find((i) => i.key === tab) ?? items[0];
  const ok = allowed(cur.perm);

  const panel = {
    personal: <PersonalPanel />, users: <UsersPanel />, organization: <OrganizationPanel />, roles: <RolesPanel />, permissions: <PermissionsPanel />,
    email: <EmailPanel />, modules: <ModulesPanel />, dashboards: <DashboardsPanel />, import: <ImportPanel />, export: <ExportPanel />, backup: <BackupPanel />,
  }[cur.key];

  return (
    <>
      <PageHeader title="Settings" description="Personal preferences, administration and customization" />
      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <div className="lg:hidden">
          <Select value={cur.key} onValueChange={set}>
            <SelectTrigger className="w-full" aria-label="Settings section"><SelectValue /></SelectTrigger>
            <SelectContent>{GROUPS.map((g) => <SelectGroup key={g.label}><SelectLabel>{g.label}</SelectLabel>{g.items.filter((i) => allowed(i.perm)).map((i) => <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>)}</SelectGroup>)}</SelectContent>
          </Select>
        </div>
        <nav aria-label="Settings" className="hidden self-start rounded-xl border border-line bg-card/95 p-2 shadow-card lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:block">
          {GROUPS.map((g) => (
            <div key={g.label} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-micro font-semibold uppercase tracking-wider text-ink-faint">{g.label}</p>
              {g.items.filter((i) => allowed(i.perm)).map((i) => (
                <button key={i.key} type="button" aria-current={cur.key === i.key ? "page" : undefined} onClick={() => set(i.key)}
                  className={cn("flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-body outline-none focus-visible:ring-3 focus-visible:ring-ring/50", cur.key === i.key ? "bg-crm-tint font-medium text-crm-depth dark:bg-info-bg dark:text-info-fg" : "text-ink-body hover:bg-hover")}>
                  <i.icon className="size-4 shrink-0" />{i.label}</button>
              ))}
            </div>
          ))}
        </nav>
        <div className="min-w-0">{ok ? panel : <EmptyState icon={GearSixIcon} title="You don't have access to this section" description="Ask an administrator to update your role's permissions." />}</div>
      </div>
    </>
  );
}
