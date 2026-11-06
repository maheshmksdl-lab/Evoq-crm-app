"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { QueryProvider } from "@/lib/query/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

/** The <html> class is the source of truth (set before paint by the inline script in app/layout.tsx). */
const subscribeTheme = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
};
const themeSnapshot = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, themeSnapshot, () => "light" as Theme);
  const toggle = useCallback(() => {
    const next = themeSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("crm-theme", next); } catch { /* storage unavailable: theme still applies for this session */ }
  }, []);
  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
      <Toaster theme={theme} position="bottom-right" richColors closeButton />
    </ThemeCtx.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={200}>
        <ThemeProvider>{children}</ThemeProvider>
      </TooltipProvider>
    </QueryProvider>
  );
}
