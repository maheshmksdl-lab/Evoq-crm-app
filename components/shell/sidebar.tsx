"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDoubleLeftIcon, CaretDoubleRightIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMetrics, useSession } from "@/lib/query/hooks";
import { isActive, NAV_ACTIVITY, NAV_INSIGHT, NAV_MAIN, NAV_SETTINGS, type NavItem } from "./nav-config";

function Item({ item, collapsed, badge, onNavigate }: { item: NavItem; collapsed: boolean; badge?: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        active ? "bg-crm-tint text-crm-depth dark:bg-info-bg dark:text-info-fg" : "text-ink-body hover:bg-hover hover:text-heading",
        collapsed && "justify-center px-0",
      )}
    >
      {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-crm-primary" />}
      <Icon className="size-5 shrink-0" weight={active ? "fill" : "regular"} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!!badge && (
        <span className={cn("ml-auto grid min-w-5 place-items-center rounded-full bg-error px-1.5 text-micro font-semibold text-white", collapsed && "absolute right-1 top-0.5 ml-0 min-w-4 px-1")} aria-label={`${badge} overdue`}>{badge}</span>
      )}
    </Link>
  );
  return collapsed ? (
    <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip>
  ) : link;
}

function Group({ label, collapsed, children }: { label: string; collapsed: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      {!collapsed ? <p className="px-3 pb-1 pt-3 text-micro font-semibold uppercase tracking-wider text-ink-faint">{label}</p> : <div className="my-2 h-px bg-line" />}
      {children}
    </div>
  );
}

export function SidebarBody({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const session = useSession();
  const perms = session.data?.permissions ?? {};
  const visible = (i: NavItem) => !i.perm || perms[i.perm]?.read !== false;
  const overdue = useMetrics(["overdue_activities"], session.data?.user ? [session.data.user.id] : null);
  const overdueCount = overdue.data?.overdue_activities?.value ?? 0;
  const tasks = (i: NavItem) => (i.href === "/tasks" ? overdueCount : undefined);
  return (
    <nav aria-label="Primary" className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3 scrollbar-thin">
      {NAV_MAIN.filter(visible).map((i) => <Item key={i.href} item={i} collapsed={collapsed} onNavigate={onNavigate} />)}
      <Group label="Activities" collapsed={collapsed}>{NAV_ACTIVITY.filter(visible).map((i) => <Item key={i.href} item={i} collapsed={collapsed} badge={tasks(i)} onNavigate={onNavigate} />)}</Group>
      <Group label="Insight" collapsed={collapsed}>{NAV_INSIGHT.filter(visible).map((i) => <Item key={i.href} item={i} collapsed={collapsed} onNavigate={onNavigate} />)}</Group>
    </nav>
  );
}

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/" aria-label="EVOQ CRM home" className="flex h-[var(--header-h)] shrink-0 items-center px-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {/* Supplied EVOQ CRM logo asset (public/logo.png), unmodified. In the 68px rail the left mark is shown by clipping, not by re-drawing it. */}
      <span className={cn("relative block h-8 overflow-hidden dark:rounded-md dark:bg-white", collapsed ? "w-9" : "w-[132px]")}>
        <Image src="/logo.png" alt="EVOQ CRM" width={132} height={32} priority className="h-8 w-[132px] max-w-none object-contain object-left" />
      </span>
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside data-print="hide" className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-sidebar backdrop-blur-md lg:flex" style={{ width: "var(--sidebar-current)", transition: "width 160ms ease" }}>
      <Logo collapsed={collapsed} />
      <SidebarBody collapsed={collapsed} />
      <div className="space-y-1 border-t border-line p-3">
        <Item item={NAV_SETTINGS} collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className={cn("flex h-9 w-full items-center gap-3 rounded-lg px-3 text-label text-ink-muted outline-none hover:bg-hover hover:text-heading focus-visible:ring-3 focus-visible:ring-ring/50", collapsed && "justify-center px-0")}
        >
          {collapsed ? <CaretDoubleRightIcon className="size-4" /> : <><CaretDoubleLeftIcon className="size-4" />Collapse</>}
        </button>
      </div>
    </aside>
  );
}
