"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellIcon, BuildingsIcon, CalendarCheckIcon, CheckSquareIcon, HandshakeIcon, LightningIcon, ListIcon, MoonIcon,
  PhoneIcon, PlusIcon, SignOutIcon, SunIcon, SwapIcon, UserCircleIcon, UsersIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/components/providers";
import { useAdmin, useAttention, useSession, useUsers } from "@/lib/query/hooks";
import { session as sessionSvc } from "@/lib/services";
import { useQueryClient } from "@tanstack/react-query";
import { useForms } from "@/components/forms/create-context";
import { Avatar } from "@/components/shared/primitives";
import { recordHref } from "@/lib/domain/names";
import { SearchTrigger } from "./global-search";

const CREATE = [
  { m: "leads", label: "Lead", icon: LightningIcon, perm: "Leads" },
  { m: "contacts", label: "Contact", icon: UsersIcon, perm: "Contacts" },
  { m: "accounts", label: "Account", icon: BuildingsIcon, perm: "Accounts" },
  { m: "deals", label: "Deal", icon: HandshakeIcon, perm: "Deals" },
  { m: "tasks", label: "Task", icon: CheckSquareIcon, perm: "Tasks" },
  { m: "calls", label: "Call", icon: PhoneIcon, perm: "Calls" },
  { m: "meetings", label: "Meeting", icon: CalendarCheckIcon, perm: "Meetings" },
] as const;

function QuickCreate() {
  const { create } = useForms();
  const perms = useSession().data?.permissions ?? {};
  const items = CREATE.filter((c) => perms[c.perm]?.create !== false);
  if (!items.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" aria-label="Create new"><PlusIcon weight="bold" /><span className="hidden sm:inline">Create</span></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Create new</DropdownMenuLabel>
        {items.map((c) => (
          <DropdownMenuItem key={c.m} onSelect={() => create(c.m)}><c.icon />{c.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Notifications are the user's own attention items — real rules, no invented alerts. */
function Notifications() {
  const s = useSession();
  const uid = s.data?.user?.id;
  const q = useAttention(uid ? [uid] : null);
  const items = (q.data ?? []).slice(0, 8);
  const count = (q.data ?? []).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={count ? `Notifications, ${count} need attention` : "Notifications"} className="relative">
          <BellIcon className="size-5" />
          {count > 0 && <span aria-hidden className="absolute right-0.5 top-0.5 size-2 rounded-full bg-error" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] max-w-[calc(100vw-2rem)] p-0">
        <div className="border-b border-line px-4 py-3"><p className="text-card-title text-heading">Needs your attention</p><p className="text-caption text-ink-muted">Records you own that match an attention rule</p></div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? <p className="px-4 py-8 text-center text-body text-ink-muted">You&apos;re all caught up.</p> : items.map((r) => (
            <Link key={`${r.ref.module}-${r.ref.id}`} href={recordHref(r.ref.module, r.ref.id)} className="block border-b border-line-soft px-4 py-2.5 last:border-0 hover:bg-hover">
              <span className="block truncate text-body font-medium text-ink">{r.title}</span>
              <span className="block truncate text-caption text-ink-muted">{r.attention.map((a) => a.label).join(" · ")}</span>
            </Link>
          ))}
        </div>
        {count > items.length && <p className="border-t border-line px-4 py-2 text-caption text-ink-muted">+{count - items.length} more on your dashboard</p>}
      </PopoverContent>
    </Popover>
  );
}

function ProfileMenu() {
  const router = useRouter();
  const qc = useQueryClient();
  const { theme, toggle } = useTheme();
  const s = useSession();
  const user = s.data?.user;
  const users = useUsers();
  const admin = useAdmin();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Account menu" className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><Avatar name={user.name} size={32} /></button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
          <Avatar name={user.name} size={36} />
          <span className="min-w-0"><span className="block truncate text-body font-semibold text-ink">{user.name}</span><span className="block truncate text-caption font-normal text-ink-muted">{user.role} · {user.email}</span></span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/settings?tab=personal")}><UserCircleIcon />Personal settings</DropdownMenuItem>
        <DropdownMenuItem onSelect={toggle}>{theme === "dark" ? <SunIcon /> : <MoonIcon />}{theme === "dark" ? "Light mode" : "Dark mode"}</DropdownMenuItem>
        {user.role === "Super Admin" && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger><SwapIcon />View as another user</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-72 w-60 overflow-y-auto">
              {(users.data ?? []).filter((u) => u.active && u.id !== user.id).map((u) => (
                <DropdownMenuItem key={u.id} onSelect={() => admin.switchUser.mutate([u.id])}><span className="truncate">{u.name}</span><span className="ml-auto text-caption text-ink-muted">{u.role}</span></DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={async () => { await sessionSvc.signOut(); qc.clear(); router.replace("/login"); }}><SignOutIcon />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Topbar({ onMenu, onSearch, onEvi, eviOpen }: { onMenu: () => void; onSearch: () => void; onEvi: () => void; eviOpen: boolean }) {
  return (
    <header data-print="hide" className="fixed right-0 top-0 z-20 flex h-[var(--header-h)] items-center gap-2 border-b border-line bg-sidebar px-3 backdrop-blur-md sm:px-5 left-0 lg:left-[var(--sidebar-current)]" style={{ transition: "left 160ms ease" }}>
      <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={onMenu} aria-label="Open navigation"><ListIcon className="size-5" /></Button>
      <SearchTrigger onOpen={onSearch} />
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant={eviOpen ? "secondary" : "outline"} size="sm" onClick={onEvi} aria-pressed={eviOpen} aria-label="Open EVI assistant">
          <span aria-hidden className="size-2 rounded-full bg-crm-action" />EVI
        </Button>
        <QuickCreate />
        <Notifications />
        <ProfileMenu />
      </div>
    </header>
  );
}
