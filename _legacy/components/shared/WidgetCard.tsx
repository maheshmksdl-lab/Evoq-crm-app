"use client";
import { ReactNode } from "react";

interface WidgetCardProps {
  title?: string;
  subtitle?: string;
  badge?: ReactNode;
  headerRight?: ReactNode;
  isDark?: boolean;
  children: ReactNode;
  noPadding?: boolean;
  className?: string;
}

/**
 * Shared glass-morphic widget container matching the Dashboard's card style
 * (RevenueChart / DealStageChart / RecentDeals / ActivityFeed). Use this to
 * keep Reports and Home Customization widgets visually consistent with the
 * Dashboard.
 */
export default function WidgetCard({
  title,
  subtitle,
  badge,
  headerRight,
  isDark = false,
  children,
  noPadding = false,
  className = "",
}: WidgetCardProps) {
  return (
    <div
      className={`rounded-2xl border h-full backdrop-blur-xl transition-all duration-200 hover:shadow-lg ${noPadding ? "overflow-hidden" : "p-6"} ${className}`}
      style={{
        backgroundColor: isDark ? "#18181B" : "rgba(255, 255, 255, 0.6)",
        borderColor: isDark ? "#27272A" : "rgba(255,255,255,0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      {(title || headerRight) && (
        <div className={`flex items-start justify-between ${noPadding ? "px-6 py-3.5 border-b" : "mb-5"}`}
          style={noPadding ? { borderColor: isDark ? "#27272A" : "#E3ECFC" } : undefined}>
          <div>
            {title && <h3 className={`m-0 text-[14px] font-bold ${isDark ? "text-white" : "text-[#0C2472]"}`}>{title}</h3>}
            {subtitle && <p className="text-[12px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {badge}
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}
