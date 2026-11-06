"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterRule, SortRule } from "@/lib/schemas";

export type ViewMode = "table" | "kanban" | "grid";
export type Scope = "mine" | "team" | "all";

/** Keys that act as one-click filters (tabs, KPI cards, dashboard deep links). */
export const QUICK_KEYS = ["status", "stage", "due", "attention", "priority", "rating", "converted", "type", "direction"] as const;

export interface ListState {
  q: string;
  page: number;
  pageSize: number;
  sort: SortRule[];
  filters: FilterRule[];
  view: ViewMode;
  scope: Scope | null;
  quick: Record<string, string>;
  viewId: string | null;
}

function parseJson<T>(v: string | null, fallback: T): T {
  if (!v) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}

/** All list state lives in the URL: shareable, bookmarkable, and the back button behaves. */
export function useListState(defaults: { sort: SortRule[]; view?: ViewMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = useMemo<ListState>(() => {
    const quick: Record<string, string> = {};
    QUICK_KEYS.forEach((k) => { const v = sp.get(k); if (v) quick[k] = v; });
    const sortParam = sp.get("sort");
    return {
      q: sp.get("q") ?? "",
      page: Math.max(1, Number(sp.get("page")) || 1),
      pageSize: [10, 20, 50, 100].includes(Number(sp.get("size"))) ? Number(sp.get("size")) : 20,
      sort: sortParam ? sortParam.split(",").map((s) => { const [field, dir] = s.split(":"); return { field, dir: dir === "asc" ? "asc" : "desc" } as SortRule; }) : defaults.sort,
      filters: parseJson<FilterRule[]>(sp.get("f"), []),
      view: (sp.get("view") as ViewMode) || defaults.view || "table",
      scope: (sp.get("scope") as Scope) || null,
      quick,
      viewId: sp.get("sv"),
    };
  }, [sp, defaults.sort, defaults.view]);

  const patch = useCallback((p: Partial<Record<string, string | null>>, resetPage = true) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(p).forEach(([k, v]) => { if (v === null || v === "" || v === undefined) next.delete(k); else next.set(k, v); });
    if (resetPage && !("page" in p)) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [sp, router, pathname]);

  return {
    state,
    setSearch: (q: string) => patch({ q }),
    setPage: (page: number) => patch({ page: page > 1 ? String(page) : null }, false),
    setPageSize: (n: number) => patch({ size: n === 20 ? null : String(n) }),
    setSort: (sort: SortRule[]) => patch({ sort: sort.map((s) => `${s.field}:${s.dir}`).join(",") }),
    setFilters: (f: FilterRule[]) => patch({ f: f.length ? JSON.stringify(f) : null, sv: null }),
    setView: (view: ViewMode) => patch({ view: view === "table" ? null : view }, false),
    setScope: (scope: Scope) => patch({ scope }),
    setQuick: (key: string, value: string | null) => patch({ [key]: value && value !== "All" ? value : null }),
    clearQuick: () => patch(Object.fromEntries(QUICK_KEYS.map((k) => [k, null]))),
    applyView: (v: { id: string; search: string; filters: FilterRule[]; sort: SortRule[] }) =>
      patch({ q: v.search || null, f: v.filters.length ? JSON.stringify(v.filters) : null, sort: v.sort.length ? v.sort.map((s) => `${s.field}:${s.dir}`).join(",") : null, sv: v.id }),
    clearAll: () => patch({ q: null, f: null, sv: null, ...Object.fromEntries(QUICK_KEYS.map((k) => [k, null])) }),
  };
}
