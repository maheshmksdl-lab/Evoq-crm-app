"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KPICard from "@/components/dashboard/KPICard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DealStageChart from "@/components/dashboard/DealStageChart";
import RecentDeals from "@/components/dashboard/RecentDeals";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { Users, Lightning, Handshake, Wallet, CalendarBlank, ClipboardText, TrendUp, CaretDown, Check, SquaresFour, GearSix } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

/* ─────────── Dashboards available to switch between (mirrors Settings ▸ Dashboard Customization) ─────────── */
interface DashboardOption { id: string; name: string; isActive: boolean; }
const DASHBOARDS_STORAGE_KEY = "dashboards-list";
const ACTIVE_DASHBOARD_KEY = "active-dashboard-id";
const DEFAULT_DASHBOARDS: DashboardOption[] = [{ id: "hp1", name: "Dashboard V1", isActive: true }];

function loadDashboardOptions(): DashboardOption[] {
  if (typeof window === "undefined") return DEFAULT_DASHBOARDS;
  try {
    const raw = localStorage.getItem(DASHBOARDS_STORAGE_KEY);
    const parsed: DashboardOption[] = raw ? JSON.parse(raw) : DEFAULT_DASHBOARDS;
    return parsed.length ? parsed : DEFAULT_DASHBOARDS;
  } catch {
    return DEFAULT_DASHBOARDS;
  }
}

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
    sourceReportId: "r3",
    sourceReportName: "Deal List",
  },
  {
    title: "Active Leads",
    value: "12,983",
    trend: 4.7,
    fill: "#D0E5E0",
    spark: "#2E9E7B",
    icon: <Lightning size={18} weight="duotone" />,
    sparkData: [98, 105, 115, 108, 125, 130, 120, 138, 142, 155, 148, 160],
    sourceReportId: "r3",
    sourceReportName: "Deal List",
  },
  {
    title: "Open Deals",
    value: "1,283",
    trend: 12.1,
    fill: "#FAE3D0",
    spark: "#E0883F",
    icon: <Handshake size={18} weight="duotone" />,
    sparkData: [88, 92, 85, 98, 102, 95, 108, 115, 112, 118, 125, 130],
    sourceReportId: "r1",
    sourceReportName: "Deal 30",
  },
  {
    title: "Booked Revenue",
    value: "₹234.8k",
    trend: 6.3,
    fill: "#F5D9E1",
    spark: "#DB5E8C",
    icon: <Wallet size={18} weight="duotone" />,
    sparkData: [180, 195, 188, 210, 205, 218, 222, 225, 228, 230, 232, 235],
    sourceReportId: "r4",
    sourceReportName: "Account Wise Deal Summary",
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
  const router = useRouter();

  const [dashboards, setDashboards] = useState<DashboardOption[]>(DEFAULT_DASHBOARDS);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_DASHBOARDS[0].id);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const options = loadDashboardOptions();
    const available = options.filter((d) => d.isActive);
    const list = available.length ? available : options;
    setDashboards(list);

    const savedId = localStorage.getItem(ACTIVE_DASHBOARD_KEY);
    const initial = list.find((d) => d.id === savedId) ?? list[0];
    if (initial) setSelectedId(initial.id);
  }, []);

  const selectedDashboard = dashboards.find((d) => d.id === selectedId) ?? dashboards[0];

  const handleSelectDashboard = (dashboardId: string) => {
    setSelectedId(dashboardId);
    localStorage.setItem(ACTIVE_DASHBOARD_KEY, dashboardId);
    setMenuAnchor(null);
  };

  return (
    <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
          {/* ═══════════════════════════════════════
              HEADER — dashboard switcher
          ═══════════════════════════════════════ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-[#1D4ED8]/15" : "bg-[#EFF6FF]"}`}>
                <SquaresFour size={18} weight="duotone" color="#1D4ED8" />
              </div>
              <div>
                <h1 className={`m-0 text-[20px] font-extrabold leading-tight tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-[#0C2472]"}`}>Dashboard</h1>
                <p className={`m-0 text-[12px] leading-tight mt-0.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{selectedDashboard?.name ?? "Dashboard V1"}</p>
              </div>
            </div>

            <Button
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              variant="outlined"
              endIcon={<CaretDown size={13} weight="bold" />}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "13px", borderRadius: "9px", color: isDark ? "#D4D4D8" : "#0C2472", borderColor: isDark ? "#27272A" : "#E3ECFC", bgcolor: isDark ? "#18181B" : "#fff", "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF", borderColor: isDark ? "#27272A" : "#E3ECFC" }, width: { xs: "100%", sm: "auto" } }}>
              {selectedDashboard?.name ?? "Select Dashboard"}
            </Button>

            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: { mt: 0.75, borderRadius: "12px", minWidth: 220, py: 0.5, bgcolor: isDark ? "#18181B" : "#fff", border: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`, boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.45)" : "0 8px 24px rgba(15,23,42,0.12)" } }}>
              {dashboards.map((d) => (
                <MenuItem key={d.id} onClick={() => handleSelectDashboard(d.id)} selected={d.id === selectedId}
                  sx={{ py: 1, px: 1.75, mx: 0.5, borderRadius: "8px", "&.Mui-selected": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
                  <ListItemText primaryTypographyProps={{ fontSize: 13.5, fontWeight: d.id === selectedId ? 700 : 500, color: d.id === selectedId ? "#1D4ED8" : undefined }}>{d.name}</ListItemText>
                  {d.id === selectedId && <Check size={15} weight="bold" color="#1D4ED8" />}
                </MenuItem>
              ))}
              <Divider sx={{ my: 0.5, borderColor: isDark ? "#27272A" : "#E3ECFC" }} />
              <MenuItem onClick={() => { setMenuAnchor(null); router.push("/settings?tab=homepage"); }}
                sx={{ py: 1, px: 1.75, mx: 0.5, borderRadius: "8px" }}>
                <GearSix size={16} weight="duotone" className="mr-2.5" />
                <ListItemText primaryTypographyProps={{ fontSize: 13.5 }}>Manage Dashboards</ListItemText>
              </MenuItem>
            </Menu>
          </div>

          {/* ═══════════════════════════════════════
              WELCOME BANNER
          ═══════════════════════════════════════ */}
          <div className="relative bg-[#0C2472] rounded-xl sm:rounded-2xl overflow-hidden">
            {/* Decorative blobs - hidden on mobile */}
            <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none hidden sm:block" />
            <div className="absolute right-16 top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none hidden md:block" />
            <div className="absolute right-48 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none hidden lg:block" />
            <div className="absolute left-1/2 -bottom-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none hidden md:block" />
            <div className="relative z-10 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pb-3 md:pb-4">
              <p className="text-[#C5D8F7] text-[11px] sm:text-[12px] font-semibold tracking-wide mb-0.5">👋 Good morning</p>
              <h2 className="text-white text-base sm:text-lg md:text-[20px] font-extrabold tracking-tight mb-1">Welcome back, PM SDL</h2>
              <p className="text-[#C5D8F7] text-[11px] sm:text-[12px] mb-3 sm:mb-4">
                Here&apos;s your CRM snapshot for{" "}
                <span className="text-white font-semibold">Saturday, 30 May 2026</span>
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {quickStats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={`flex items-center gap-1.5 sm:gap-2 ${color} backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[12px] font-semibold`}>
                    <Icon size={12} weight="duotone" />
                    <span className="font-bold">{value}</span>
                    <span className="font-medium opacity-80 hidden xs:inline">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {kpis.map((k) => <KPICard key={k.title} {...k} isDark={isDark} />)}
          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="lg:col-span-2"><RevenueChart isDark={isDark} /></div>
            <div className="lg:col-span-1"><DealStageChart isDark={isDark} /></div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pb-8">
            <div className="lg:col-span-2"><RecentDeals isDark={isDark} /></div>
            <div className="lg:col-span-1"><ActivityFeed isDark={isDark} /></div>
          </div>
      </main>
    </div>
  );
}

