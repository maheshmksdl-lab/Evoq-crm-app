"use client";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  fill: string;   // soft pastel background
  accent: string; // deeper coordinating shade for icon/text accents
  isDark?: boolean;
  footer?: ReactNode;
}

/**
 * Soft-pastel KPI-style metric card matching the Dashboard's KPICard.
 * Used for compact stat summaries in Reports and Home Customization.
 */
export default function MetricCard({ title, value, icon, fill, accent, isDark = false, footer }: MetricCardProps) {
  return (
    <div
      className="rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      style={{
        backgroundColor: isDark ? "#18181B" : fill,
        borderColor: isDark ? "#27272A" : "rgba(255,255,255,0.5)",
        boxShadow: "0 6px 24px rgba(15,23,42,0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`font-heading text-[10px] sm:text-[11.5px] font-semibold uppercase tracking-[0.1em] mb-2 truncate ${isDark ? "text-[#94A3B8]" : "text-[#4A5675]"}`}>
            {title}
          </p>
          <p className={`text-lg sm:text-[22px] font-extrabold tracking-tight leading-none ${isDark ? "text-[#FFFFFF]" : "text-[#0C2472]"}`}>
            {value}
          </p>
          {footer && <div className="mt-2 sm:mt-3">{footer}</div>}
        </div>
        {icon && (
          <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 text-sm sm:text-base ${isDark ? "bg-black/30" : "bg-[#f9fbff]/70"}`} style={{ color: accent }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
