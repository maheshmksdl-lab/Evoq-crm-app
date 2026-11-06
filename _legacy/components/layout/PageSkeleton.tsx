"use client";
import Sidebar from "@/components/layout/Sidebar";

export default function PageSkeleton() {
  return (
    <div className="flex h-screen font-sans">
      <Sidebar />
      <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">
        {/* TopBar skeleton */}
        <div className="h-[60px] flex items-center px-4 md:px-8 border-b border-[#E3ECFC] dark:border-[#27272A] bg-white dark:bg-[#0A0A0A] shrink-0">
          <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-[#18181B] animate-pulse" />
          <div className="ml-auto flex gap-3">
            <div className="h-8 w-56 rounded-xl bg-slate-100 dark:bg-[#27272A] animate-pulse hidden md:block" />
            <div className="h-8 w-24 rounded-xl bg-[#1D4ED8]/20 animate-pulse" />
          </div>
        </div>

        <main className="flex-1 px-4 md:px-8 py-4 md:py-6 space-y-5">
          {/* Breadcrumb + heading */}
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-slate-100 dark:bg-[#27272A] animate-pulse" />
            <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-[#18181B] animate-pulse" />
          </div>

          {/* Toolbar */}
          <div className="flex gap-2.5">
            <div className="h-9 w-28 rounded-xl bg-slate-100 dark:bg-[#27272A] animate-pulse" />
            <div className="h-9 w-64 rounded-xl bg-slate-100 dark:bg-[#27272A] animate-pulse" />
            <div className="h-9 w-24 rounded-xl bg-slate-100 dark:bg-[#27272A] animate-pulse ml-auto" />
          </div>

          {/* Table card */}
          <div className="rounded-2xl border border-[#E3ECFC] dark:border-[#27272A] overflow-hidden">
            {/* Header row */}
            <div className="flex gap-4 px-4 py-2.5 bg-[#E3ECFC] dark:bg-[#27272A]">
              {[36, 180, 130, 110, 100, 90].map((w, i) => (
                <div key={i} className="h-3 rounded animate-pulse bg-[#C5D8F7]/60 dark:bg-[#18181B]" style={{ width: w }} />
              ))}
            </div>
            {/* Body rows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center px-4 py-3.5 border-t border-[#EFF6FF] dark:border-[#27272A]">
                <div className="h-3.5 w-[36px] rounded bg-slate-100 dark:bg-[#27272A] animate-pulse" />
                <div className="h-3.5 w-[180px] rounded bg-slate-200 dark:bg-[#18181B] animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
                <div className="h-3.5 w-[130px] rounded bg-slate-100 dark:bg-[#27272A] animate-pulse" style={{ animationDelay: `${i * 40 + 20}ms` }} />
                <div className="h-3.5 w-[110px] rounded bg-slate-100 dark:bg-[#27272A] animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                <div className="h-3.5 w-[100px] rounded bg-slate-100 dark:bg-[#27272A] animate-pulse" />
                <div className="h-3.5 w-[90px] rounded bg-slate-100 dark:bg-[#27272A] animate-pulse" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

