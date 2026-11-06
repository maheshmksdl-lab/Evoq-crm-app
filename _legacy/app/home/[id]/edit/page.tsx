"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useTheme } from "@/components/ThemeContext";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  CaretRight, CaretUp, CaretDown, House, MagnifyingGlass, X, Trash, PencilSimple,
  ChartBar, Table, Plus, Rows, ChartLine, ChartPie, ArrowUp, ArrowDown, ArrowCounterClockwise, Info,
  FileText, ArrowSquareOut, SquaresFour, ChartDonut, ChartBarHorizontal, ChartScatter, ChartLineUp,
  ArrowsLeftRight, GridFour, Trophy, Gauge, Funnel, MinusCircle, PlusCircle,
} from "@phosphor-icons/react";
import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, LineChart, Line,
} from "recharts";
import { buildSampleReportConfig } from "@/lib/sampleReportSeeds";

interface DashboardComponent {
  id: string;
  type: "kpi" | "chart" | "table" | "report";
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  category: "dashboard" | "report";
  sourceReportId: string;
  sourceReportName: string;
}

interface CanvasItem {
  id: string;
  componentId: string;
  title: string;
  type: string;
  icon: React.ElementType;
  color: string;
  chartType?: string;
  sourceReportId?: string;
  sourceReportName?: string;
}

// Sample data
const SAMPLE_DATA = {
  accounts: { count: 142, change: 12, changeType: "increase", spark: [14, 18, 16, 22, 20, 26, 28, 30, 34, 38, 40, 42] },
  contacts: { count: 356, change: 28, changeType: "increase", spark: [80, 95, 88, 102, 110, 118, 122, 130, 138, 145, 150, 160] },
  leads: { count: 89, change: 5, changeType: "increase", spark: [40, 42, 38, 45, 48, 44, 50, 52, 55, 58, 60, 62] },
  deals: { count: 34, change: 3, changeType: "decrease", spark: [40, 38, 42, 39, 36, 38, 35, 34, 32, 33, 30, 31] },
  dealsByStage: [
    { stage: "New", value: 12000, color: "#0C2472" },
    { stage: "Contacted", value: 28000, color: "#10B981" },
    { stage: "Qualified", value: 45000, color: "#3B82F6" },
    { stage: "Won", value: 95000, color: "#F59E0B" },
  ],
  leadsBySource: [
    { source: "Website", count: 34, color: "#0C2472" },
    { source: "Email", count: 28, color: "#3B82F6" },
    { source: "Referral", count: 18, color: "#10B981" },
    { source: "Direct", count: 9, color: "#F59E0B" },
  ],
  revenueTrend: [
    { month: "Jan", revenue: 145000 },
    { month: "Feb", revenue: 158000 },
    { month: "Mar", revenue: 151000 },
    { month: "Apr", revenue: 172000 },
    { month: "May", revenue: 181000 },
    { month: "Jun", revenue: 191000 },
  ],
  recentDeals: [
    { name: "Acme Corp Deal", amount: 29900, stage: "Qualified", owner: "John Smith", date: "Jun 28" },
    { name: "Tech Solutions", amount: 18500, stage: "Contacted", owner: "Sarah Lee", date: "Jun 26" },
    { name: "Global Industries", amount: 125000, stage: "Won", owner: "Mike Johnson", date: "Jun 25" },
  ],
  tasks: [
    { title: "Follow up with Acme Corp", dueDate: "Today", priority: "High", owner: "You" },
    { title: "Prepare proposal for TechCorp", dueDate: "Jun 30", priority: "High", owner: "Sarah Lee" },
    { title: "Schedule meeting with client", dueDate: "Jul 2", priority: "Medium", owner: "You" },
  ],
};

const AVAILABLE_COMPONENTS: DashboardComponent[] = [
  { id: "kpi-accounts", type: "kpi", title: "Accounts", icon: Rows, color: "#1D4ED8", description: "Total accounts count", category: "dashboard", sourceReportId: "r4", sourceReportName: "Account Wise Deal Summary" },
  { id: "kpi-contacts", type: "kpi", title: "Contacts", icon: Rows, color: "#10B981", description: "Total contacts", category: "dashboard", sourceReportId: "r3", sourceReportName: "Deal List" },
  { id: "kpi-leads", type: "kpi", title: "Leads", icon: Rows, color: "#F59E0B", description: "Total leads", category: "dashboard", sourceReportId: "r3", sourceReportName: "Deal List" },
  { id: "kpi-deals", type: "kpi", title: "Deals", icon: Rows, color: "#8B5CF6", description: "Total deals", category: "dashboard", sourceReportId: "r1", sourceReportName: "Deal 30" },
  { id: "chart-pie", type: "chart", title: "Stage Wise Deal Amount", icon: ChartPie, color: "#EC4899", description: "Deal distribution by stage", category: "dashboard", sourceReportId: "r2", sourceReportName: "Deal with Stage" },
  { id: "chart-bar", type: "chart", title: "Lead Source Wise", icon: ChartBar, color: "#06B6D4", description: "Leads by source", category: "dashboard", sourceReportId: "r3", sourceReportName: "Deal List" },
  { id: "chart-line", type: "chart", title: "Revenue Trend", icon: ChartLine, color: "#14B8A6", description: "Revenue over time", category: "dashboard", sourceReportId: "r4", sourceReportName: "Account Wise Deal Summary" },
  { id: "table-deals", type: "table", title: "Deal 30", icon: Table, color: "#6366F1", description: "Latest 30 deals", category: "dashboard", sourceReportId: "r1", sourceReportName: "Deal 30" },
  { id: "table-tasks", type: "table", title: "Tasks", icon: Table, color: "#A855F7", description: "Recent tasks", category: "dashboard", sourceReportId: "r3", sourceReportName: "Deal List" },
];

// Mirrors the reports listed under Reports (app/reports/page.tsx) — dropped directly onto the canvas as a
// record-count widget, reinforcing that dashboard widgets are just views over report data.
const REPORT_COMPONENTS: DashboardComponent[] = [
  { id: "report-r1", type: "report", title: "Deal 30", icon: Rows, color: "#6366F1", description: "Deal Reports · 14 records", category: "report", sourceReportId: "r1", sourceReportName: "Deal 30" },
  { id: "report-r2", type: "report", title: "Deal with Stage", icon: ChartBar, color: "#8B5CF6", description: "Deal Reports · 14 records", category: "report", sourceReportId: "r2", sourceReportName: "Deal with Stage" },
  { id: "report-r3", type: "report", title: "Deal List", icon: Rows, color: "#EC4899", description: "Deal Reports · 14 records", category: "report", sourceReportId: "r3", sourceReportName: "Deal List" },
  { id: "report-r4", type: "report", title: "Account Wise Deal Summary", icon: ChartBar, color: "#14B8A6", description: "Deal Reports · 14 records", category: "report", sourceReportId: "r4", sourceReportName: "Account Wise Deal Summary" },
  { id: "report-r5", type: "report", title: "Account List", icon: Rows, color: "#0EA5E9", description: "Account Reports · 5 records", category: "report", sourceReportId: "r5", sourceReportName: "Account List" },
];

const REPORT_RECORD_COUNTS: Record<string, number> = { r1: 14, r2: 14, r3: 14, r4: 14, r5: 5 };

const CHART_TYPES: { key: string; label: string; icon: React.ElementType; family: "column" | "bar" | "donut" | "pie" | "area" | "line" | "kpi" }[] = [
  { key: "column", label: "Column", icon: ChartBar, family: "column" },
  { key: "bar", label: "Bar", icon: ChartBarHorizontal, family: "bar" },
  { key: "donut", label: "Donut", icon: ChartDonut, family: "donut" },
  { key: "pie", label: "Pie", icon: ChartPie, family: "pie" },
  { key: "treemap", label: "Treemap", icon: GridFour, family: "column" },
  { key: "butterfly", label: "Butterfly", icon: ArrowsLeftRight, family: "bar" },
  { key: "live", label: "Live", icon: ChartLine, family: "line" },
  { key: "funnel", label: "Funnel", icon: Funnel, family: "bar" },
  { key: "area", label: "Area", icon: ChartLineUp, family: "area" },
  { key: "progress", label: "Progress", icon: Gauge, family: "kpi" },
  { key: "scatter", label: "Scatter", icon: ChartScatter, family: "column" },
  { key: "basic-kpi", label: "Basic KPI", icon: SquaresFour, family: "kpi" },
  { key: "growth", label: "Growth Ind...", icon: ChartLineUp, family: "kpi" },
  { key: "standard-kpi", label: "Standard K...", icon: ChartBar, family: "kpi" },
  { key: "scorecard", label: "Scorecard", icon: Trophy, family: "kpi" },
];

const MODULE_OPTIONS = ["Accounts", "Contacts", "Leads", "Deals"];
const MEASURE_OPTIONS = ["Count of Unique - Accounts", "Sum of Amount", "Average Probability", "Count of Records"];

// Mirrors the "collection" grouping shown on the Reports listing page.
const REPORT_COLLECTIONS = ["All", "Deal Reports", "Account Reports"];
const SORT_BY_OPTIONS = ["Default", "Highest to Lowest", "Lowest to Highest", "A → Z", "Z → A"];
const MAX_GROUPING_OPTIONS = ["10", "25", "50", "75", "100"];

// Human-readable label for a report field key, e.g. "closingDate" -> "Closing Date"
function formatFieldLabel(field: string): string {
  return field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

// Fields available on a report, sourced from the same seed data used to populate the report builder canvas.
function fieldsForReport(reportId: string): string[] {
  const config = buildSampleReportConfig(reportId);
  if (!config) return [];
  return config.selectedFields[config.primaryModule] ?? [];
}

const SAMPLE_CHART_DATA = [
  { name: "Group A", value: 2 },
  { name: "Group B", value: 4 },
  { name: "Group C", value: 3 },
];
const SAMPLE_CHART_COLORS = ["#F59E0B", "#F59E0B", "#3B82F6"];

const KPI_FILL: Record<string, { fill: string; accent: string }> = {
  "kpi-accounts": { fill: "#D6E4F9", accent: "#2F6FED" },
  "kpi-contacts": { fill: "#D0E5E0", accent: "#2E9E7B" },
  "kpi-leads": { fill: "#FAE3D0", accent: "#E0883F" },
  "kpi-deals": { fill: "#F5D9E1", accent: "#DB5E8C" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10">
      {label && <p className="text-slate-400 text-[11px] mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold text-[12px]" style={{ color: p.color || p.fill }}>{p.value.toLocaleString('en-US')}</p>
      ))}
    </div>
  );
};

// Component renderers — mirror Dashboard's KPICard / DealStageChart / RevenueChart / RecentDeals language
function KPICardPreview({ componentId, isDark }: { componentId: string; isDark: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataMap: Record<string, any> = {
    "kpi-accounts": SAMPLE_DATA.accounts,
    "kpi-contacts": SAMPLE_DATA.contacts,
    "kpi-leads": SAMPLE_DATA.leads,
    "kpi-deals": SAMPLE_DATA.deals,
  };
  const data = dataMap[componentId];
  if (!data) return null;
  const { fill, accent } = KPI_FILL[componentId];
  const isPositive = data.changeType === "increase";

  const W = 72, H = 26;
  const max = Math.max(...data.spark);
  const min = Math.min(...data.spark);
  const range = max - min || 1;
  const coords = data.spark.map((d: number, i: number) => ({
    x: (i / (data.spark.length - 1)) * W,
    y: H - ((d - min) / range) * (H - 4) - 2,
  }));
  const linePts = coords.map((c: { x: number; y: number }) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

  return (
    <div className="px-5 py-4" style={{ backgroundColor: isDark ? "#111111" : fill + "40" }}>
      <div className="flex items-end justify-between">
        <div>
          <div className={`text-[26px] font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-[#0C2472]"}`}>{data.count}</div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-2 px-2 py-0.5 rounded-full ${isDark ? "bg-black/40" : "bg-white/70"} ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />} {data.change}%
          </span>
        </div>
        <svg width={W} height={H}>
          <polyline points={linePts} fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={coords[coords.length - 1].x.toFixed(1)} cy={coords[coords.length - 1].y.toFixed(1)} r="2.4" fill={accent} />
        </svg>
      </div>
    </div>
  );
}

function LeadSourceBarChart({ isDark }: { isDark: boolean }) {
  const data = SAMPLE_DATA.leadsBySource;
  return (
    <div className="px-5 py-4">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }} barSize={10}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }} axisLine={false} tickLine={false} width={64} />
          <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: isDark ? "#18181B" : "#EFF6FF" }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            <LabelList dataKey="count" position="right" style={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} />
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StageWisePieChart({ isDark }: { isDark: boolean }) {
  const data = SAMPLE_DATA.dealsByStage;
  return (
    <div className="px-5 py-4">
      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={2} dataKey="value" nameKey="stage">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
          </Pie>
          <RechartsTooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
        {data.map(item => (
          <div key={item.stage} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className={`text-[11px] font-medium ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>{item.stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueTrendChart({ isDark }: { isDark: boolean }) {
  const stroke = isDark ? "#60A5FA" : "#0C2472";
  return (
    <div className="px-5 py-4">
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={SAMPLE_DATA.revenueTrend} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272A" : "#F0F2F5"} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <RechartsTooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke={stroke} strokeWidth={2} fill={stroke} fillOpacity={isDark ? 0.15 : 0.08} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DealsTable({ isDark }: { isDark: boolean }) {
  const data = SAMPLE_DATA.recentDeals;
  const stageStyle: Record<string, { bg: string; fg: string }> = {
    Won: { bg: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5", fg: isDark ? "#34D399" : "#047857" },
    Qualified: { bg: isDark ? "rgba(59,130,246,0.15)" : "#E3ECFC", fg: isDark ? "#60A5FA" : "#0C2472" },
    Contacted: { bg: isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7", fg: isDark ? "#FBBF24" : "#92400E" },
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr>
            {["Deal", "Amount", "Stage"].map(h => (
              <th key={h} className="px-5 py-2 text-left font-bold uppercase tracking-wider text-[10.5px]"
                style={{ backgroundColor: isDark ? "#111111" : "#EFF6FF", color: isDark ? "#9CA3AF" : "#0C2472" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((deal, i) => {
            const s = stageStyle[deal.stage] || { bg: "#F1F5F9", fg: "#475569" };
            return (
              <tr key={i} className="border-t" style={{ borderColor: isDark ? "#27272A" : "#E3ECFC" }}>
                <td className={`px-5 py-2.5 font-semibold ${isDark ? "text-[#E2E8F0]" : "text-slate-800"}`}>{deal.name}</td>
                <td className={`px-5 py-2.5 font-bold ${isDark ? "text-white" : "text-slate-800"}`}>${deal.amount.toLocaleString('en-US')}</td>
                <td className="px-5 py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold" style={{ backgroundColor: s.bg, color: s.fg }}>{deal.stage}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TasksTable({ isDark }: { isDark: boolean }) {
  const data = SAMPLE_DATA.tasks;
  const prioColor: Record<string, string> = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981" };
  return (
    <div className="px-5 py-4 space-y-3">
      {data.map((task, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: prioColor[task.priority] }} />
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] font-medium leading-snug ${isDark ? "text-[#E2E8F0]" : "text-slate-700"}`}>{task.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-400 font-medium">{task.dueDate}</span>
              <span className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-300"}`}>·</span>
              <span className="text-[11px] text-slate-400">{task.owner}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportMetricPreview({ item, isDark }: { item: CanvasItem; isDark: boolean }) {
  const count = (item.sourceReportId && REPORT_RECORD_COUNTS[item.sourceReportId]) ?? 0;
  return (
    <div className="px-5 py-4">
      <div className={`text-[26px] font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-[#0C2472]"}`}>{count}</div>
      <p className={`text-[11px] font-semibold mt-1.5 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Total Records</p>
    </div>
  );
}

function CustomChartPreview({ chartType, isDark }: { chartType: string; isDark: boolean }) {
  const family = CHART_TYPES.find(c => c.key === chartType)?.family ?? "column";
  const stroke = isDark ? "#60A5FA" : "#3B82F6";

  if (family === "kpi") {
    return (
      <div className="px-5 py-4">
        <div className={`text-[26px] font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-[#0C2472]"}`}>9</div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold mt-2 px-2.5 py-1 rounded-full text-emerald-500" style={{ backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5" }}>
          <ArrowUp size={10} weight="bold" /> 12%
        </span>
      </div>
    );
  }
  if (family === "donut" || family === "pie") {
    return (
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={SAMPLE_CHART_DATA} cx="50%" cy="50%" innerRadius={family === "donut" ? 38 : 0} outerRadius={62} paddingAngle={2} dataKey="value" nameKey="name">
              {SAMPLE_CHART_DATA.map((_, i) => <Cell key={i} fill={SAMPLE_CHART_COLORS[i]} stroke="none" />)}
            </Pie>
            <RechartsTooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (family === "area") {
    return (
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={SAMPLE_CHART_DATA} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272A" : "#F0F2F5"} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <RechartsTooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} fill={stroke} fillOpacity={isDark ? 0.15 : 0.08} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (family === "line") {
    return (
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={SAMPLE_CHART_DATA} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272A" : "#F0F2F5"} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <RechartsTooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} dot={{ r: 3, fill: stroke }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  if (family === "bar") {
    return (
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={SAMPLE_CHART_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }} barSize={14}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: isDark ? "#9CA3AF" : "#6B7280", fontWeight: 500 }} axisLine={false} tickLine={false} width={60} />
            <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: isDark ? "#18181B" : "#EFF6FF" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} />
              {SAMPLE_CHART_DATA.map((_, i) => <Cell key={i} fill={SAMPLE_CHART_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  // column (default)
  return (
    <div className="px-5 py-4">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={SAMPLE_CHART_DATA} margin={{ top: 6, right: 8, left: -20, bottom: 0 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272A" : "#F0F2F5"} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: isDark ? "#18181B" : "#EFF6FF" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {SAMPLE_CHART_DATA.map((_, i) => <Cell key={i} fill={SAMPLE_CHART_COLORS[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComponentPreview({ item, isDark }: { item: CanvasItem; isDark: boolean }) {
  switch (item.type) {
    case "kpi":
      return <KPICardPreview componentId={item.componentId} isDark={isDark} />;
    case "chart":
      if (item.chartType) return <CustomChartPreview chartType={item.chartType} isDark={isDark} />;
      if (item.componentId === "chart-pie") return <StageWisePieChart isDark={isDark} />;
      if (item.componentId === "chart-bar") return <LeadSourceBarChart isDark={isDark} />;
      if (item.componentId === "chart-line") return <RevenueTrendChart isDark={isDark} />;
      return <LeadSourceBarChart isDark={isDark} />;
    case "table":
      if (item.componentId === "table-deals") return <DealsTable isDark={isDark} />;
      if (item.componentId === "table-tasks") return <TasksTable isDark={isDark} />;
      return <DealsTable isDark={isDark} />;
    case "report":
      return <ReportMetricPreview item={item} isDark={isDark} />;
    default:
      return null;
  }
}

const DEFAULT_CANVAS_ITEMS: CanvasItem[] = [
  { id: "c1", componentId: "kpi-accounts", title: "Accounts", type: "kpi", icon: Rows, color: "#1D4ED8" },
  { id: "c2", componentId: "kpi-contacts", title: "Contacts", type: "kpi", icon: Rows, color: "#10B981" },
  { id: "c3", componentId: "kpi-leads", title: "Leads", type: "kpi", icon: Rows, color: "#F59E0B" },
  { id: "c4", componentId: "kpi-deals", title: "Deals", type: "kpi", icon: Rows, color: "#8B5CF6" },
  { id: "c5", componentId: "chart-pie", title: "Stage Wise Deal Amount", type: "chart", icon: ChartPie, color: "#EC4899" },
  { id: "c6", componentId: "chart-bar", title: "Lead Source Wise", type: "chart", icon: ChartBar, color: "#06B6D4" },
  { id: "c7", componentId: "table-deals", title: "Deal 30", type: "table", icon: Table, color: "#6366F1" },
  { id: "c8", componentId: "table-tasks", title: "Tasks", type: "table", icon: Table, color: "#A855F7" },
];

type SavedCanvasItem = { id: string; componentId: string; title: string; type: string; color: string; chartType?: string; sourceReportId?: string; sourceReportName?: string };

const storageKeyFor = (dashboardId: string) => `dashboard-widgets-${dashboardId}`;

const hydrateCanvasItems = (saved: SavedCanvasItem[]): CanvasItem[] =>
  saved.map(s => {
    const source = AVAILABLE_COMPONENTS.find(c => c.id === s.componentId) ?? REPORT_COMPONENTS.find(c => c.id === s.componentId);
    return { ...s, icon: source?.icon ?? (CHART_TYPES.find(c => c.key === s.chartType)?.icon ?? Rows) };
  });

export default function HomePageEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const dashboardId = params.id as string;
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "true";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(isNew ? [] : DEFAULT_CANVAS_ITEMS);
  const [draggedItem, setDraggedItem] = useState<DashboardComponent | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);

  // Add Component modal
  const [addComponentOpen, setAddComponentOpen] = useState(false);
  const [acTab, setAcTab] = useState<"chart" | "report">("chart");
  const [acType, setAcType] = useState("column");
  const [acName, setAcName] = useState("");
  const [acModule, setAcModule] = useState("Accounts");
  const [acRelatedModule, setAcRelatedModule] = useState("");
  const [acMeasure, setAcMeasure] = useState(MEASURE_OPTIONS[0]);
  const [acGrouping, setAcGrouping] = useState("");
  const [acReportId, setAcReportId] = useState("");
  const [acCollection, setAcCollection] = useState(REPORT_COLLECTIONS[0]);
  const [acMeasureField, setAcMeasureField] = useState("");
  const [acGroupingField, setAcGroupingField] = useState("");
  const [acSortBy, setAcSortBy] = useState(SORT_BY_OPTIONS[0]);
  const [acMaxGrouping, setAcMaxGrouping] = useState(MAX_GROUPING_OPTIONS[3]);
  const [acBenchmark, setAcBenchmark] = useState(false);
  const [acShortenedNumbers, setAcShortenedNumbers] = useState(false);
  const [acTotalSummary, setAcTotalSummary] = useState(false);
  const [acDisplayFilters, setAcDisplayFilters] = useState(false);

  const reportFields = acReportId ? fieldsForReport(acReportId) : [];
  const reportsInCollection = REPORT_COMPONENTS.filter(
    (r) => acCollection === "All" || r.description.startsWith(acCollection)
  );

  const resetAddComponentForm = () => {
    setAcTab("chart"); setAcType("column"); setAcName(""); setAcModule("Accounts");
    setAcRelatedModule(""); setAcMeasure(MEASURE_OPTIONS[0]); setAcGrouping("");
    setAcReportId(""); setAcCollection(REPORT_COLLECTIONS[0]);
    setAcMeasureField(""); setAcGroupingField(""); setAcSortBy(SORT_BY_OPTIONS[0]);
    setAcMaxGrouping(MAX_GROUPING_OPTIONS[3]); setAcBenchmark(false);
    setAcShortenedNumbers(false); setAcTotalSummary(false); setAcDisplayFilters(false);
  };

  const handleAddComponentDone = () => {
    const chartMeta = CHART_TYPES.find(c => c.key === acType) ?? CHART_TYPES[0];
    const reportMeta = REPORT_COMPONENTS.find(c => c.sourceReportId === acReportId);
    const newItem: CanvasItem = {
      id: `c${Date.now()}`,
      componentId: `custom-${acType}-${Date.now()}`,
      title: acName.trim() || `${chartMeta.label} Chart`,
      type: "chart",
      icon: chartMeta.icon,
      color: "#1D4ED8",
      chartType: acType,
      ...(acTab === "report" && reportMeta ? { sourceReportId: reportMeta.sourceReportId, sourceReportName: reportMeta.sourceReportName } : {}),
    };
    setCanvasItems(prev => [...prev, newItem]);
    setAddComponentOpen(false);
    resetAddComponentForm();
  };

  // Hydrate from any previously-saved layout for this specific dashboard
  useEffect(() => {
    const raw = localStorage.getItem(storageKeyFor(dashboardId));
    if (raw) {
      try {
        setCanvasItems(hydrateCanvasItems(JSON.parse(raw)));
      } catch {
        // ignore corrupt storage
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]);

  const handleSave = () => {
    const toSave: SavedCanvasItem[] = canvasItems.map(({ id, componentId, title, type, color, chartType, sourceReportId, sourceReportName }) => ({ id, componentId, title, type, color, chartType, sourceReportId, sourceReportName }));
    localStorage.setItem(storageKeyFor(dashboardId), JSON.stringify(toSave));
    router.push("/settings?tab=homepage");
  };

  const handleCancel = () => {
    router.push("/settings?tab=homepage");
  };

  const filtered = AVAILABLE_COMPONENTS.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredReports = REPORT_COMPONENTS.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  const dashboardComps = filtered.filter(c => c.category === "dashboard");

  const handleDragStart = (component: DashboardComponent) => {
    setDraggedItem(component);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addComponent = (component: DashboardComponent) => {
    const newItem: CanvasItem = {
      id: `c${Date.now()}`,
      componentId: component.id,
      title: component.title,
      type: component.type,
      icon: component.icon,
      color: component.color,
      sourceReportId: component.sourceReportId,
      sourceReportName: component.sourceReportName,
    };
    setCanvasItems(prev => [...prev, newItem]);
    setMobilePickerOpen(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      addComponent(draggedItem);
      setDraggedItem(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    setCanvasItems(canvasItems.filter(item => item.id !== id));
  };

  const handleEditStart = (item: CanvasItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setCustomizeOpen(true);
  };

  const handleEditSave = () => {
    if (editingId && editTitle.trim()) {
      setCanvasItems(canvasItems.map(item =>
        item.id === editingId ? { ...item, title: editTitle.trim() } : item
      ));
      setCustomizeOpen(false);
      setEditingId(null);
    }
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    const idx = canvasItems.findIndex(item => item.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === canvasItems.length - 1)) return;
    const newItems = [...canvasItems];
    if (direction === "up") {
      [newItems[idx], newItems[idx - 1]] = [newItems[idx - 1], newItems[idx]];
    } else {
      [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    }
    setCanvasItems(newItems);
  };

  const handleResetToDefault = () => {
    setCanvasItems(DEFAULT_CANVAS_ITEMS);
    setResetConfirmOpen(false);
  };

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-[#000000]" : "bg-[#EFF6FF]"}`}>
      <Sidebar />
      <div className={`sidebar-content flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? "bg-[#000000]" : "bg-transparent"}`}>
        {/* Header */}
        <div className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-3 text-[10px] sm:text-[12px]">
            <House size={14} weight="duotone" />
            <button onClick={() => router.push("/")} className={`font-medium ${isDark ? "text-[#9CA3AF] hover:text-[#D4D4D8]" : "text-slate-500 hover:text-slate-700"} hover:underline`}>Home</button>
            <CaretRight size={10} weight="duotone" />
            <button onClick={() => router.push("/settings?tab=homepage")} className={`font-medium truncate ${isDark ? "text-[#9CA3AF] hover:text-[#D4D4D8]" : "text-slate-500 hover:text-slate-700"} hover:underline`}>Dashboard Customization</button>
            <CaretRight size={10} weight="duotone" className="hidden sm:inline" />
            <button className={`font-medium cursor-default hidden sm:inline ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>Dashboard V1</button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className={`m-0 text-base sm:text-lg md:text-[20px] font-extrabold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-[#0C2472]"}`}>Dashboard Customization</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip title="Restore this dashboard's original widgets and layout">
                <Button variant="outlined" onClick={() => setResetConfirmOpen(true)} startIcon={<ArrowCounterClockwise size={14} weight="bold" />}
                  sx={{ color: isDark ? "#D4D4D8" : "#4A5675", borderColor: isDark ? "#3F3F46" : "#E3ECFC", textTransform: "none", fontWeight: 700, fontSize: "13px", borderRadius: "9px", px: 2.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF", borderColor: isDark ? "#3F3F46" : "#E3ECFC" } }}>
                  Reset to Default
                </Button>
              </Tooltip>
              <Button variant="text" onClick={handleCancel} sx={{ color: isDark ? "#A1A1AA" : "#64748B", textTransform: "none", fontWeight: 700, fontSize: "13px", borderRadius: "9px", px: 2.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} sx={{ bgcolor: "#1D4ED8", color: "white", textTransform: "none", fontWeight: 700, fontSize: "13px", borderRadius: "9px", px: 3, boxShadow: "0 1px 8px #1D4ED833", "&:hover": { bgcolor: "#2563EB" } }}>
                Save
              </Button>
            </div>
          </div>
          <div className={`flex items-center gap-2 mt-3 px-3 py-2 rounded-lg ${isDark ? "bg-[#111113] text-[#9CA3AF]" : "bg-[#EFF6FF] text-[#4A5675]"}`}>
            <FileText size={14} weight="duotone" className="flex-shrink-0" />
            <p className="text-[12px] leading-snug">
              Dashboard widgets are powered by underlying <strong className={isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}>Report</strong> data. Use each widget&apos;s <strong className={isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}>Source Report</strong> link to open the report it pulls from.
            </p>
          </div>
        </div>

        {/* Main editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - hidden on mobile, shown on md+ */}
          <div className={`hidden md:flex md:w-72 flex-shrink-0 border-r flex flex-col ${isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-white"}`}>
            <div className={`px-4 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                <MagnifyingGlass size={13} color="#94A3B8" weight="duotone" />
                <input placeholder="Search components" value={search} onChange={e => setSearch(e.target.value)}
                  className={`flex-1 text-[13px] outline-none bg-transparent ${isDark ? "text-[#D4D4D8] placeholder-[#52525B]" : "text-slate-700 placeholder-slate-400"}`} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>Dashboard Components</div>
                  <Tooltip title="Add custom component">
                    <IconButton size="small" onClick={() => setAddComponentOpen(true)}
                      sx={{ p: 0.3, borderRadius: "999px", bgcolor: "#1D4ED8", color: "white", "&:hover": { bgcolor: "#2563EB" } }}>
                      <Plus size={13} weight="bold" />
                    </IconButton>
                  </Tooltip>
                </div>
                {dashboardComps.length > 0 && (
                  <div className="space-y-1">
                    {dashboardComps.map(comp => (
                      <div key={comp.id} draggable onDragStart={() => handleDragStart(comp)} onClick={() => addComponent(comp)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border ${isDark ? "border-[#27272A] hover:bg-[#1C1C1E] hover:border-[#3F3F46]" : "border-[#E3ECFC] hover:bg-[#f9fbff]"}`}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: comp.color + "1F" }}>
                          <comp.icon size={13} color={comp.color} weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-semibold truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{comp.title}</div>
                          <div className={`text-[11px] truncate ${isDark ? "text-[#52525B]" : "text-slate-400"}`}>{comp.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {filteredReports.length > 0 && (
                <div>
                  <div className={`text-[11px] font-bold uppercase tracking-widest px-2 mb-2 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>Report Components</div>
                  <div className="space-y-1">
                    {filteredReports.map(comp => (
                      <div key={comp.id} draggable onDragStart={() => handleDragStart(comp)} onClick={() => addComponent(comp)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border ${isDark ? "border-[#27272A] hover:bg-[#1C1C1E] hover:border-[#3F3F46]" : "border-[#E3ECFC] hover:bg-[#f9fbff]"}`}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: comp.color + "1F" }}>
                          <comp.icon size={13} color={comp.color} weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-semibold truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{comp.title}</div>
                          <div className={`text-[11px] truncate ${isDark ? "text-[#52525B]" : "text-slate-400"}`}>{comp.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto relative" onDragOver={handleDragOver} onDrop={handleDrop}>
            {/* Mobile-only floating trigger for the component picker (sidebar is hidden below md:) */}
            <button
              onClick={() => setMobilePickerOpen(true)}
              className="md:hidden fixed bottom-5 right-5 z-20 w-14 h-14 rounded-full bg-[#1D4ED8] text-white shadow-lg flex items-center justify-center hover:bg-[#2563EB] transition-colors"
              aria-label="Add widget"
            >
              <Plus size={22} weight="bold" />
            </button>
            <div className={`p-3 sm:p-4 md:p-8 min-h-full ${isDark ? "bg-[#000000]" : "bg-transparent"}`}>
              {canvasItems.length === 0 ? (
                <div className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl sm:rounded-2xl min-h-[300px] sm:min-h-[420px] ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <div className={`w-10 sm:w-14 h-10 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 ${isDark ? "bg-[#18181B] text-[#3B82F6]" : "bg-[#EFF6FF] text-[#1D4ED8]"}`}>
                    <SquaresFour size={20} weight="duotone" />
                  </div>
                  <p className={`text-sm sm:text-base font-bold mb-1.5 ${isDark ? "text-[#F4F4F5]" : "text-[#0C2472]"}`}>Build your dashboard</p>
                  <p className={`text-[12px] sm:text-[13px] max-w-sm px-2 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
                    <span className="hidden md:inline">Drag widgets from the left sidebar onto this canvas, or click a widget to add it.</span>
                    <span className="md:hidden">Tap the + button to add a widget.</span>
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {canvasItems.map((item, idx) => (
                  <div key={item.id}
                    className="rounded-xl sm:rounded-2xl border overflow-hidden group backdrop-blur-xl transition-all duration-200 hover:shadow-lg"
                    style={{
                      backgroundColor: isDark ? "#0A0A0A" : "rgba(255, 255, 255, 0.6)",
                      borderColor: isDark ? "#27272A" : "rgba(255,255,255,0.3)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                    }}>
                    {/* Header */}
                    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + "1F" }}>
                        <item.icon size={14} color={item.color} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                        <Tooltip title={item.title}>
                          <p className={`text-[13px] font-bold truncate ${isDark ? "text-white" : "text-[#0C2472]"}`}>{item.title}</p>
                        </Tooltip>
                        <Tooltip title={AVAILABLE_COMPONENTS.find(c => c.id === item.componentId)?.description || REPORT_COMPONENTS.find(c => c.id === item.componentId)?.description || "Custom chart component"}>
                          <Info size={13} weight="bold" color={isDark ? "#52525B" : "#94A3B8"} className="flex-shrink-0 cursor-help" />
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <Tooltip title="Move up">
                          <span>
                            <IconButton size="small" disabled={idx === 0} onClick={() => moveItem(item.id, "up")}
                              sx={{ p: 0.4, borderRadius: "7px", color: isDark ? "#9CA3AF" : "#64748B", bgcolor: isDark ? "#18181B" : "#F1F5F9", "&:hover": { color: isDark ? "#D4D4D8" : "#334155", bgcolor: isDark ? "#27272A" : "#E2E8F0" }, "&.Mui-disabled": { color: isDark ? "#3F3F46" : "#CBD5E1", bgcolor: isDark ? "#111113" : "#F8FAFC" } }}>
                              <CaretUp size={11} weight="bold" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move down">
                          <span>
                            <IconButton size="small" disabled={idx === canvasItems.length - 1} onClick={() => moveItem(item.id, "down")}
                              sx={{ p: 0.4, borderRadius: "7px", color: isDark ? "#9CA3AF" : "#64748B", bgcolor: isDark ? "#18181B" : "#F1F5F9", "&:hover": { color: isDark ? "#D4D4D8" : "#334155", bgcolor: isDark ? "#27272A" : "#E2E8F0" }, "&.Mui-disabled": { color: isDark ? "#3F3F46" : "#CBD5E1", bgcolor: isDark ? "#111113" : "#F8FAFC" } }}>
                              <CaretDown size={11} weight="bold" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditStart(item)}
                            sx={{ p: 0.4, borderRadius: "7px", color: isDark ? "#9CA3AF" : "#64748B", bgcolor: isDark ? "#18181B" : "#F1F5F9", "&:hover": { color: isDark ? "#D4D4D8" : "#334155", bgcolor: isDark ? "#27272A" : "#E2E8F0" } }}>
                            <PencilSimple size={11} weight="bold" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteItem(item.id)}
                            sx={{ p: 0.4, borderRadius: "7px", color: isDark ? "#9CA3AF" : "#64748B", bgcolor: isDark ? "#18181B" : "#F1F5F9", "&:hover": { color: "#EF4444", bgcolor: isDark ? "#27272A" : "#FEE2E2" } }}>
                            <Trash size={11} weight="bold" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Component preview */}
                    <ComponentPreview item={item} isDark={isDark} />

                    {/* Source Report link */}
                    {(() => {
                      const legacy = AVAILABLE_COMPONENTS.find(c => c.id === item.componentId);
                      const reportId = item.sourceReportId ?? legacy?.sourceReportId;
                      const reportName = item.sourceReportName ?? legacy?.sourceReportName;
                      if (!reportId || !reportName) return null;
                      return (
                        <button onClick={() => router.push(`/reports/${reportId}`)}
                          className={`w-full flex items-center justify-center gap-1.5 px-5 py-2 border-t text-[11px] font-semibold transition-colors ${isDark ? "border-[#27272A] text-[#71717A] hover:text-[#93C5FD] hover:bg-[#111113]" : "border-[#E3ECFC] text-[#4A5675] hover:text-[#1D4ED8] hover:bg-[#f9fbff]"}`}>
                          <FileText size={12} weight="duotone" />
                          <span>Source Report: {reportName}</span>
                          <ArrowSquareOut size={11} weight="bold" />
                        </button>
                      );
                    })()}
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile component picker — same widget library as the desktop sidebar, in a modal */}
      <Dialog open={mobilePickerOpen} onClose={() => setMobilePickerOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", bgcolor: isDark ? "#1C1C1E" : "#fff", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)", maxHeight: "80vh" } }}>
        <div className={`flex items-center justify-between px-4 py-3.5 border-b flex-shrink-0 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <span className={`text-[15px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Add Widget</span>
          <IconButton size="small" onClick={() => setMobilePickerOpen(false)}>
            <X size={16} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </div>
        <div className={`px-4 py-3 border-b flex-shrink-0 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
            <MagnifyingGlass size={13} color="#94A3B8" weight="duotone" />
            <input placeholder="Search components" value={search} onChange={e => setSearch(e.target.value)}
              className={`flex-1 text-[13px] outline-none bg-transparent ${isDark ? "text-[#D4D4D8] placeholder-[#52525B]" : "text-slate-700 placeholder-slate-400"}`} />
          </div>
        </div>
        <DialogContent sx={{ p: 2, maxHeight: "55vh" }}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <div className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>Dashboard Components</div>
                <Tooltip title="Add custom component">
                  <IconButton size="small" onClick={() => { setMobilePickerOpen(false); setAddComponentOpen(true); }}
                    sx={{ p: 0.3, borderRadius: "999px", bgcolor: "#1D4ED8", color: "white", "&:hover": { bgcolor: "#2563EB" } }}>
                    <Plus size={13} weight="bold" />
                  </IconButton>
                </Tooltip>
              </div>
              {dashboardComps.length > 0 && (
                <div className="space-y-1">
                  {dashboardComps.map(comp => (
                    <div key={comp.id} onClick={() => addComponent(comp)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border ${isDark ? "border-[#27272A] hover:bg-[#1C1C1E] hover:border-[#3F3F46]" : "border-[#E3ECFC] hover:bg-[#f9fbff]"}`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: comp.color + "1F" }}>
                        <comp.icon size={13} color={comp.color} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-semibold truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{comp.title}</div>
                        <div className={`text-[11px] truncate ${isDark ? "text-[#52525B]" : "text-slate-400"}`}>{comp.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredReports.length > 0 && (
              <div>
                <div className={`text-[11px] font-bold uppercase tracking-widest px-1 mb-2 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>Report Components</div>
                <div className="space-y-1">
                  {filteredReports.map(comp => (
                    <div key={comp.id} onClick={() => addComponent(comp)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border ${isDark ? "border-[#27272A] hover:bg-[#1C1C1E] hover:border-[#3F3F46]" : "border-[#E3ECFC] hover:bg-[#f9fbff]"}`}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: comp.color + "1F" }}>
                        <comp.icon size={13} color={comp.color} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-semibold truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{comp.title}</div>
                        <div className={`text-[11px] truncate ${isDark ? "text-[#52525B]" : "text-slate-400"}`}>{comp.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize dialog */}
      <Dialog open={customizeOpen} onClose={() => setCustomizeOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", bgcolor: isDark ? "#1C1C1E" : "#fff", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)" } }}>
        <DialogTitle sx={{ color: isDark ? "#F4F4F5" : "#0C2472", fontWeight: 700 }}>Edit Component</DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <TextField label="Component Title" fullWidth value={editTitle} onChange={e => setEditTitle(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }), fontSize: "0.82rem",
                "& fieldset": { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
                "&:hover fieldset": { borderColor: isDark ? "#9CA3AF" : "#E3ECFC" },
                "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#E3ECFC", borderWidth: 2 },
                "&.Mui-focused": { boxShadow: isDark ? "none" : "0 0 0 2px #4A7AE8" },
                "& input": { padding: "10px 14px", color: isDark ? "#D4D4D8" : "#1F2937" },
              },
              "& .MuiInputLabel-root": { fontSize: "0.79rem", color: isDark ? "#A1A1AA" : "#6B7280" },
            }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCustomizeOpen(false)} sx={{ color: isDark ? "#A1A1AA" : "#64748B", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditSave}
            sx={{ bgcolor: "#1D4ED8", color: "white", textTransform: "none", fontWeight: 600, boxShadow: "0 1px 8px #1D4ED833", "&:hover": { bgcolor: "#2563EB" } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset to Default confirmation */}
      <Dialog open={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", bgcolor: isDark ? "#1C1C1E" : "#fff", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)" } }}>
        <DialogTitle sx={{ color: isDark ? "#F4F4F5" : "#0C2472", fontWeight: 700 }}>Reset to Default?</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <p className={`text-[13px] leading-relaxed ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
            This will discard your current widget layout and restore the original default widgets for this dashboard. This can&apos;t be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetConfirmOpen(false)} sx={{ color: isDark ? "#A1A1AA" : "#64748B", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleResetToDefault}
            sx={{ bgcolor: "#EF4444", color: "white", textTransform: "none", fontWeight: 600, boxShadow: "0 1px 8px #EF444433", "&:hover": { bgcolor: "#DC2626" } }}>
            Reset to Default
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Component */}
      <Dialog open={addComponentOpen} onClose={() => { setAddComponentOpen(false); resetAddComponentForm(); }} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", bgcolor: isDark ? "#1C1C1E" : "#fff", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)" } }}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <span className={`font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Add Component</span>
          <IconButton size="small" onClick={() => { setAddComponentOpen(false); resetAddComponentForm(); }}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={16} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </div>

        {/* Chart / Chart From Report tabs */}
        <div className={`px-6 pt-4 ${isDark ? "bg-[#111113]" : "bg-[#F8FAFF]"}`}>
          <div className={`inline-flex rounded-full p-1 ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
            {(["chart", "report"] as const).map(tab => (
              <button key={tab} onClick={() => setAcTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                  acTab === tab
                    ? isDark ? "bg-[#1D4ED8] text-white" : "bg-white text-[#1D4ED8] shadow-sm"
                    : isDark ? "text-[#9CA3AF]" : "text-slate-500"
                }`}>
                {tab === "chart" ? "Chart" : "Chart From Report"}
              </button>
            ))}
          </div>

          <div className={`text-[11px] font-bold uppercase tracking-widest mt-4 mb-2 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>Select Type</div>
          <div className="flex gap-2.5 overflow-x-auto pb-4">
            {CHART_TYPES.map(ct => (
              <button key={ct.key} onClick={() => setAcType(ct.key)}
                className={`flex-shrink-0 w-[76px] flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-colors ${
                  acType === ct.key
                    ? isDark ? "border-[#3B82F6] bg-[#1D4ED8]/10" : "border-[#1D4ED8] bg-[#EFF6FF]"
                    : isDark ? "border-[#27272A] hover:border-[#3F3F46]" : "border-[#E3ECFC] hover:border-[#93C5FD]"
                }`}>
                <ct.icon size={22} weight="duotone" color={acType === ct.key ? "#1D4ED8" : (isDark ? "#9CA3AF" : "#64748B")} />
                <span className={`text-[11px] font-semibold truncate w-full text-center ${acType === ct.key ? (isDark ? "text-[#93C5FD]" : "text-[#1D4ED8]") : (isDark ? "text-[#9CA3AF]" : "text-slate-500")}`}>{ct.label}</span>
              </button>
            ))}
          </div>
        </div>

        <DialogContent sx={{ p: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-0">
            {/* Configuration */}
            <div className="px-6 py-5 space-y-4">
              <div className={`text-[13px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Configuration</div>

              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Component Name</label>
                <input value={acName} onChange={e => setAcName(e.target.value)} placeholder="Untitled component"
                  className={`px-3 py-2 text-[13px] border rounded-lg outline-none ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8] placeholder-[#52525B]" : "bg-white border-[#E3ECFC] text-slate-700 placeholder-slate-400"}`} />
              </div>

              {acTab === "chart" ? (
                <>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Module(s)</label>
                    <select value={acModule} onChange={e => setAcModule(e.target.value)}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"}`}>
                      {MODULE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <div />
                    <select value={acRelatedModule} onChange={e => setAcRelatedModule(e.target.value)}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#71717A]" : "bg-white border-[#E3ECFC] text-slate-400"}`}>
                      <option value="">Select Related Module</option>
                      {MODULE_OPTIONS.filter(m => m !== acModule).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Measure (y-axis)</label>
                    <div className="flex items-center gap-2">
                      <select value={acMeasure} onChange={e => setAcMeasure(e.target.value)}
                        className={`flex-1 px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"}`}>
                        {MEASURE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <Tooltip title="Remove measure">
                        <IconButton size="small" sx={{ color: "#EF4444" }}><MinusCircle size={16} weight="fill" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Add another measure">
                        <IconButton size="small" sx={{ color: "#10B981" }}><PlusCircle size={16} weight="fill" /></IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Grouping</label>
                    <div className="flex items-center gap-2">
                      <select value={acGrouping} onChange={e => setAcGrouping(e.target.value)}
                        className={`flex-1 px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#71717A]" : "bg-white border-[#E3ECFC] text-slate-400"}`}>
                        <option value="">Select grouping</option>
                        {MODULE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <Tooltip title="Remove grouping">
                        <IconButton size="small" sx={{ color: "#EF4444" }}><MinusCircle size={16} weight="fill" /></IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  <button className="text-[12.5px] font-semibold text-[#1D4ED8] hover:underline">+ Criteria filter</button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Collection</label>
                    <select value={acCollection} onChange={e => { setAcCollection(e.target.value); setAcReportId(""); setAcMeasureField(""); setAcGroupingField(""); }}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"}`}>
                      {REPORT_COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Report</label>
                    <select value={acReportId} onChange={e => { setAcReportId(e.target.value); setAcMeasureField(""); setAcGroupingField(""); }}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"} ${!acReportId ? (isDark ? "text-[#71717A]" : "text-slate-400") : ""}`}>
                      <option value="">Select a report</option>
                      {reportsInCollection.map(r => <option key={r.sourceReportId} value={r.sourceReportId}>{r.sourceReportName}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Measure (Y-Axis)</label>
                    <select value={acMeasureField} onChange={e => setAcMeasureField(e.target.value)} disabled={!acReportId}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none ${acReportId ? "cursor-pointer" : "cursor-not-allowed"} ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"} ${!acReportId ? (isDark ? "text-[#71717A]" : "text-slate-400") : ""}`}>
                      <option value="">{acReportId ? "Select a measure" : "Select a report first"}</option>
                      {reportFields.map(f => <option key={f} value={f}>{formatFieldLabel(f)}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Grouping</label>
                    <select value={acGroupingField} onChange={e => setAcGroupingField(e.target.value)} disabled={!acReportId}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none ${acReportId ? "cursor-pointer" : "cursor-not-allowed"} ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"} ${!acReportId ? (isDark ? "text-[#71717A]" : "text-slate-400") : ""}`}>
                      <option value="">{acReportId ? "Select a grouping" : "Select a report first"}</option>
                      {reportFields.map(f => <option key={f} value={f}>{formatFieldLabel(f)}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Sort By</label>
                    <select value={acSortBy} onChange={e => setAcSortBy(e.target.value)}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"}`}>
                      {SORT_BY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Maximum Grouping</label>
                    <select value={acMaxGrouping} onChange={e => setAcMaxGrouping(e.target.value)}
                      className={`px-3 py-2 text-[13px] border rounded-lg outline-none cursor-pointer ${isDark ? "bg-[#0A0A0A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-700"}`}>
                      {MAX_GROUPING_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className={`pt-3 mt-1 border-t ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                    <div className={`text-[11px] font-bold uppercase tracking-widest mb-2.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>Display Options</div>
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={acBenchmark} onChange={e => setAcBenchmark(e.target.checked)} className="w-4 h-4 accent-[#1D4ED8]" />
                        <span className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>Benchmark for Y-Axis</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={acShortenedNumbers} onChange={e => setAcShortenedNumbers(e.target.checked)} className="w-4 h-4 accent-[#1D4ED8]" />
                        <span className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>Display as Shortened Numbers</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={acTotalSummary} onChange={e => setAcTotalSummary(e.target.checked)} className="w-4 h-4 accent-[#1D4ED8]" />
                        <span className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>Display Total Summary</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={acDisplayFilters} onChange={e => setAcDisplayFilters(e.target.checked)} className="w-4 h-4 accent-[#1D4ED8]" />
                        <span className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>Display Component Filters</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {acTab === "chart" && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={acDisplayFilters} onChange={e => setAcDisplayFilters(e.target.checked)} className="w-4 h-4 accent-[#1D4ED8]" />
                  <span className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>Display Component Filters</span>
                </label>
              )}
            </div>

            {/* Preview */}
            <div className={`px-5 py-5 border-t md:border-t-0 md:border-l ${isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#F8FAFF]"}`}>
              <div className={`text-[13px] font-bold mb-3 ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Preview</div>
              <div className={`rounded-xl border overflow-hidden ${isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-white"}`}>
                <CustomChartPreview chartType={acType} isDark={isDark} />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`, pt: 2 }}>
          <Button onClick={() => { setAddComponentOpen(false); resetAddComponentForm(); }} variant="outlined"
            sx={{ color: isDark ? "#D4D4D8" : "#4A5675", borderColor: isDark ? "#3F3F46" : "#E3ECFC", textTransform: "none", fontWeight: 600, borderRadius: "9px" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddComponentDone}
            sx={{ bgcolor: "#1D4ED8", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "9px", boxShadow: "0 1px 8px #1D4ED833", "&:hover": { bgcolor: "#2563EB" } }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
