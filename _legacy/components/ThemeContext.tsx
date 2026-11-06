"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

// These pages are light-only by design (no isDark awareness in their
// markup) and render before the user is authenticated, so the app-wide
// dark mode preference must never leak into them via the global
// html.dark CSS overrides.
const FORCE_LIGHT_ROUTES = ["/login", "/register", "/forgot-password"];

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("crm-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const forceLight = FORCE_LIGHT_ROUTES.includes(pathname);
    if (theme === "dark" && !forceLight) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("crm-theme", theme);
  }, [theme, pathname]);

  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
