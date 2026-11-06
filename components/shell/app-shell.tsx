"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { FormsProvider } from "@/components/forms/create-context";
import { CreateHost } from "@/components/forms/create-host";
import { EviPanel } from "@/components/evi/evi-panel";
import { PageSkeleton } from "@/components/shared/states";
import { useSession } from "@/lib/query/hooks";
import { session as sessionSvc } from "@/lib/services";
import { setCurrency } from "@/lib/domain/format";
import { useSettings } from "@/lib/query/hooks";
import { GlobalSearch } from "./global-search";
import { Logo, Sidebar, SidebarBody } from "./sidebar";
import { Topbar } from "./topbar";

const COLLAPSE_KEY = "sidebar-collapsed"; // key kept from the pre-migration app

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const settings = useSettings();
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem(COLLAPSE_KEY) === "true"; } catch { return false; } });
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState(false);
  const [evi, setEvi] = useState(false);

  const toggle = () => setCollapsed((c) => {
    try { localStorage.setItem(COLLAPSE_KEY, String(!c)); } catch { /* ignore */ }
    return !c;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((s) => !s); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (settings.data) setCurrency(settings.data.org.currency); }, [settings.data]);

  // A session cookie that no longer maps to an active user must be cleared, or the proxy would bounce /login back here.
  const noUser = session.isSuccess && !session.data.user;
  useEffect(() => {
    if (noUser) { void sessionSvc.signOut().then(() => router.replace("/login")); }
  }, [noUser, router]);

  if (session.isPending || noUser) {
    return <div className="mx-auto max-w-6xl p-6"><PageSkeleton /></div>;
  }

  return (
    <FormsProvider>
      <div data-sidebar={collapsed ? "collapsed" : "expanded"}>
        <a href="#main" className="sr-only z-50 rounded-md bg-card px-3 py-2 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <Sheet open={mobileNav} onOpenChange={setMobileNav}>
          <SheetContent side="left" className="w-72 gap-0 p-0 sm:max-w-72" showCloseButton>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">Main navigation</SheetDescription>
            <Logo />
            <SidebarBody collapsed={false} onNavigate={() => setMobileNav(false)} />
          </SheetContent>
        </Sheet>
        <Topbar onMenu={() => setMobileNav(true)} onSearch={() => setSearch(true)} onEvi={() => setEvi((e) => !e)} eviOpen={evi} />
        <div className="app-content">
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1440px] px-4 py-5 outline-none sm:px-6 lg:px-8 lg:py-6">
            {session.data?.loadIssue && (
              <div role="status" className="mb-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-bg px-3 py-2 text-body text-warning-fg">
                <WarningIcon className="mt-0.5 size-4 shrink-0" weight="fill" />{session.data.loadIssue}
              </div>
            )}
            {children}
          </main>
        </div>
        <GlobalSearch open={search} onOpenChange={setSearch} />
        <EviPanel open={evi} onOpenChange={setEvi} />
        <CreateHost />
      </div>
    </FormsProvider>
  );
}
