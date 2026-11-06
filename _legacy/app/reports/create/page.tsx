"use client";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import KPICard from "@/components/dashboard/KPICard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealStageChart from "@/components/dashboard/DealStageChart";
import RecentDeals from "@/components/dashboard/RecentDeals";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { Users, Lightning, Handshake, Wallet, CalendarBlank, ClipboardText, TrendUp } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

/* ─────────── KPI card definitions ─────────── */
const kpis = [
  {
    title: "Total Contacts",
    value: "15,432",
    trend: 8.2,
    fill: "#D6E4F9",
    spark: "#2F6FED",
    icon: <Users size={18} weight="duotone" />,
    sparkData: [120, 145, 132, 155, 148, 168, 175, 180, 192, 210, 225, 234],
  },
  {
    title: "Active Leads",
    value: "12,983",
    trend: 4.7,
    fill: "#D0E5E0",
    spark: "#2E9E7B",
    icon: <Lightning size={18} weight="duotone" />,
    sparkData: [98, 105, 115, 108, 125, 130, 120, 138, 142, 155, 148, 160],
  },
  {
    title: "Open Deals",
    value: "1,283",
    trend: 12.1,
    fill: "#FAE3D0",
    spark: "#E0883F",
    icon: <Handshake size={18} weight="duotone" />,
    sparkData: [88, 92, 85, 98, 102, 95, 108, 115, 112, 118, 125, 130],
  },
  {
    title: "Booked Revenue",
    value: "₹234.8k",
    trend: 6.3,
    fill: "#F5D9E1",
    spark: "#DB5E8C",
    icon: <Wallet size={18} weight="duotone" />,
    sparkData: [180, 195, 188, 210, 205, 218, 222, 225, 228, 230, 232, 235],
  },
];

/* ─────────── Quick-stat pills for the banner ─────────── */
const quickStats = [
  { label: "Tasks due today",      value: "7",   icon: ClipboardText,  color: "bg-white/20 text-white"          },
  { label: "Deals to follow up",  value: "3",   icon: Handshake,      color: "bg-white/20 text-white"          },
  { label: "Meetings today",      value: "2",   icon: CalendarBlank,  color: "bg-white/20 text-white"          },
  { label: "New leads this week", value: "+84", icon: TrendUp,        color: "bg-white/20 text-white"          },
];

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${isDark ? "bg-[#000000]" : "bg-transparent"}`}>
      {/* <Sidebar /> */}
      <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">
        {/* <TopBar title="Dashboard" /> */}

        <main className="flex-1 px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6 animate-fade-in">

          {/* ── WELCOME BANNER ── */}
          <div className={`relative rounded-2xl overflow-hidden ${isDark ? "bg-[#18181B]" : "bg-[#0C2472]"}`}>
            <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute right-16 top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute right-48 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute left-1/2 -bottom-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10 px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4">
              <p className="text-[#C5D8F7] text-[12px] font-semibold tracking-wide mb-0.5">👋 Good morning</p>
              <h2 className="text-white text-[20px] font-extrabold tracking-tight mb-1">Welcome back, PM SDL</h2>
              <p className="text-[#C5D8F7] text-[12px] mb-4">
                Here&apos;s your CRM snapshot for{" "}
                <span className="text-white font-semibold">Saturday, 30 May 2026</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {quickStats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={`flex items-center gap-2 ${color} backdrop-blur-sm rounded-xl px-3 py-1.5 text-[12px] font-semibold`}>
                    <Icon size={14} weight="duotone" />
                    <span className="font-bold">{value}</span>
                    <span className="font-medium opacity-80">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {kpis.map((k) => <KPICard key={k.title} {...k} isDark={isDark} />)}
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2"><RevenueChart isDark={isDark} /></div>
            <div className="lg:col-span-1"><DealStageChart isDark={isDark} /></div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
            <div className="lg:col-span-2"><RecentDeals isDark={isDark} /></div>
            <div className="lg:col-span-1"><ActivityFeed isDark={isDark} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
