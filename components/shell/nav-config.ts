import {
  BuildingsIcon, CalendarCheckIcon, ChartBarIcon, CheckSquareIcon, GearSixIcon, HandshakeIcon, LightningIcon,
  PhoneIcon, SquaresFourIcon, UsersIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";
import type { ModuleKey } from "@/lib/schemas";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; weight?: "duotone" | "regular" | "fill" }>;
  module?: ModuleKey;
  perm?: string;
}

/** Module map is unchanged from the pre-migration app plus Calls and Meetings (handoff §6). */
export const NAV_MAIN: NavItem[] = [
  { label: "Dashboard", href: "/", icon: SquaresFourIcon },
  { label: "Leads", href: "/leads", icon: LightningIcon, module: "leads", perm: "Leads" },
  { label: "Deals", href: "/deals", icon: HandshakeIcon, module: "deals", perm: "Deals" },
  { label: "Accounts", href: "/accounts", icon: BuildingsIcon, module: "accounts", perm: "Accounts" },
  { label: "Contacts", href: "/contacts", icon: UsersIcon, module: "contacts", perm: "Contacts" },
];
export const NAV_ACTIVITY: NavItem[] = [
  { label: "Tasks", href: "/tasks", icon: CheckSquareIcon, module: "tasks", perm: "Tasks" },
  { label: "Calls", href: "/calls", icon: PhoneIcon, module: "calls", perm: "Calls" },
  { label: "Meetings", href: "/meetings", icon: CalendarCheckIcon, module: "meetings", perm: "Meetings" },
];
export const NAV_INSIGHT: NavItem[] = [{ label: "Reports", href: "/reports", icon: ChartBarIcon, perm: "Reports" }];
export const NAV_SETTINGS: NavItem = { label: "Settings", href: "/settings", icon: GearSixIcon };

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}
