"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewDealDrawer from "@/components/deals/NewDealDrawer";
import DealGridView from "@/components/deals/DealGridView";
import DealKanbanView from "@/components/deals/DealKanbanView";
import FiltersDrawer, { type FilterRow } from "@/components/leads/FiltersDrawer";
import ColumnsDrawer from "@/components/leads/ColumnsDrawer";
import SortPopover, { type SortRow } from "@/components/leads/SortPopover";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { getDataGridSx, ROWS_PER_PAGE_OPTIONS } from "@/lib/dataGridStyles";
import {
  Plus, MagnifyingGlass, SlidersHorizontal, SortAscending, Columns,
  ArrowsDownUp, List, GridFour, Kanban, CaretDown, House, CaretRight,
  Trash, DotsThreeVertical, FunnelSimple, TrendUp,
  Handshake, CurrencyCircleDollar, Buildings, Pulse, ChartLineUp, User,
  UserCircle, CalendarBlank,
} from "@phosphor-icons/react";
import type { ElementType } from "react";
import { useTheme } from "@/components/ThemeContext";

// ---------------------------------------------
//  Types
// ---------------------------------------------
type DealStage = "Qualification" | "Needs Analysis" | "Value Proposition" |
  "Identify Decision Makers" | "Proposal/Price Quote" | "Negotiation/Review" | "Closed Won";

interface Deal {
  id: number; name: string; amount: number; account: string;
  stage: DealStage; probability: number; contactName: string;
  createdBy: string; modifiedBy: string; creation: string; modified: string;
  owner: string; ownerInitials: string;
}

// ---------------------------------------------
//  Data — exact from screenshot
// ---------------------------------------------
const ALL_DEALS: Deal[] = [
  { id:1,  name:"New",                         amount:29999,  account:"Sweany Inc",    stage:"Proposal/Price Quote",      probability:75, contactName:"",                 createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"27 May 2026, 03:14 PM", modified:"30 May 2026, 02:10 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:2,  name:"Deal SDL 11",                 amount:500000, account:"SDL LEAD1",     stage:"Identify Decision Makers",  probability:60, contactName:"Lead SDL 11",      createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"15 Apr 2026, 11:13 AM", modified:"05 May 2026, 04:55 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:3,  name:"test deal john smith",        amount:200000, account:"Sears Homelife",stage:"Qualification",             probability:0,  contactName:"John Smith",       createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"14 Apr 2026, 07:45 PM", modified:"14 Apr 2026, 07:45 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:4,  name:"testing",                     amount:500000, account:"RMVT",          stage:"Needs Analysis",            probability:20, contactName:"Raja rajan",       createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"14 Apr 2026, 07:30 PM", modified:"14 Apr 2026, 07:34 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:5,  name:"fsm enterprise application",  amount:800000, account:"RMVT",          stage:"Needs Analysis",            probability:20, contactName:"mmmm mmmm",        createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"14 Apr 2026, 06:53 PM", modified:"14 Apr 2026, 07:07 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:6,  name:"CRM Application",             amount:200000, account:"SDL",           stage:"Qualification",             probability:10, contactName:"SDL Test Test-SDL", createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"14 Apr 2026, 07:04 PM", modified:"14 Apr 2026, 07:04 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:7,  name:"fsm single user application", amount:200000, account:"RMVT",          stage:"Qualification",             probability:0,  contactName:"Raja rajan",       createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"14 Apr 2026, 06:40 PM", modified:"14 Apr 2026, 06:40 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:8,  name:"CRM Application",             amount:500000, account:"RMVT",          stage:"Qualification",             probability:0,  contactName:"Vishnutharan R",   createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"14 Apr 2026, 06:38 PM", modified:"14 Apr 2026, 06:38 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:9,  name:"Deal test",                   amount:150000, account:"test",          stage:"Qualification",             probability:10, contactName:"test test",        createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"13 Apr 2026, 06:35 PM", modified:"13 Apr 2026, 06:35 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:10, name:"test",                        amount:50000,  account:"test",          stage:"Needs Analysis",            probability:20, contactName:"test test",        createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"13 Apr 2026, 06:17 PM", modified:"13 Apr 2026, 06:34 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:11, name:"Smith",                       amount:100000, account:"test",          stage:"Value Proposition",         probability:40, contactName:"John Smith",       createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"13 Apr 2026, 06:00 PM", modified:"13 Apr 2026, 06:02 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:12, name:"Mike",                        amount:0,      account:"Speedy Motors", stage:"Qualification",             probability:0,  contactName:"Speedy Mike",      createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"13 Apr 2026, 05:56 PM", modified:"13 Apr 2026, 05:56 PM", owner:"PM SDL",    ownerInitials:"PM" },
  { id:13, name:"Test",                        amount:10000,  account:"SDL",           stage:"Proposal/Price Quote",      probability:75, contactName:"",                 createdBy:"PM SDL", modifiedBy:"PM SDL", creation:"25 Mar 2026, 08:10 PM", modified:"07 Apr 2026, 04:53 PM", owner:"PM SDL",    ownerInitials:"PM" },
];

// ---------------------------------------------
//  Stage config
// ---------------------------------------------
const STAGE_CFG: Record<DealStage, { bg: string; text: string; dot: string; bgDark: string; textDark: string }> = {
  "Qualification":            { bg: "#EFF6FF", text: "#0C2472", dot: "#94A3B8", bgDark: "rgba(96, 165, 250, 0.15)", textDark: "#60A5FA" },
  "Needs Analysis":           { bg: "#E3ECFC", text: "#0C2472", dot: "#3B82F6", bgDark: "rgba(52, 211, 153, 0.15)", textDark: "#34D399" },
  "Value Proposition":        { bg: "#E3ECFC", text: "#0C2472", dot: "#7C3AED", bgDark: "rgba(251, 191, 36, 0.15)", textDark: "#FBBF24" },
  "Identify Decision Makers": { bg: "#E3ECFC", text: "#0C2472", dot: "#0C2472", bgDark: "rgba(244, 114, 182, 0.15)", textDark: "#F472B6" },
  "Proposal/Price Quote":     { bg: "#EFF6FF", text: "#0C2472", dot: "#0C2472", bgDark: "rgba(167, 139, 250, 0.15)", textDark: "#A78BFA" },
  "Negotiation/Review":       { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", bgDark: "rgba(56, 189, 248, 0.15)", textDark: "#38BDF8" },
  "Closed Won":               { bg: "#DCFCE7", text: "#166534", dot: "#10B981", bgDark: "rgba(16, 185, 129, 0.15)", textDark: "#10B981" },
};

// ---------------------------------------------
//  Stage tabs
// ---------------------------------------------
const STAGE_TABS = [
  "All", "Qualification", "Needs Analysis", "Value Proposition",
  "Identify Decision Makers", "Proposal/Price Quote", "Negotiation/Review", "Closed Won",
];

// ---------------------------------------------
//  Column definitions
// ---------------------------------------------
const COL_DEFS: { key: string; label: string; width: string }[] = [
  { key: "dealName",    label: "Deal Name",       width: "1fr"   },
  { key: "amount",      label: "Amount",          width: "110px" },
  { key: "accountName", label: "Account Name",    width: "140px" },
  { key: "stage",       label: "Stage",           width: "180px" },
  { key: "probability", label: "Probability (%)", width: "110px" },
  { key: "contactName", label: "Contact Name",    width: "140px" },
  { key: "createdBy",   label: "Created By",      width: "130px" },
  { key: "modifiedBy",  label: "Modified By",     width: "130px" },
  { key: "creation",    label: "Creation",        width: "175px" },
  { key: "modified",    label: "Modified",        width: "175px" },
];

const DEFAULT_VISIBLE_COLS = new Set([
  "dealName", "amount", "accountName", "stage", "probability",
  "contactName", "creation", "modified",
]);

// ---------------------------------------------
//  Helpers
// ---------------------------------------------
const fmt = (n: number) => n === 0 ? "₹0" : `₹${n.toLocaleString("en-IN")}`;

function ColHeader({ label, icon: Icon }: { label: string; icon?: ElementType }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`flex items-center gap-1.5 font-heading text-[14px]/[18px] font-semibold uppercase tracking-wide select-none ${isDark ? "text-[#E4E4E7]" : "text-[#737373]"}`}>
      {Icon && <Icon size={13} weight="duotone" />}
      {label}
    </div>
  );
}

// ---------------------------------------------
//  Page
// ---------------------------------------------
export default function DealsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selected, setSelected]       = useState<number[]>([]);
  const [activeStage, setActiveStage] = useState("All");
  const [search, setSearch]           = useState("");
  const [view, setView]               = useState<"list" | "grid" | "kanban">("list");
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [sortAnchor, setSortAnchor]   = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterRow[]>([]);
  const [activeSorts,   setActiveSorts]   = useState<SortRow[]>([]);
  const [visibleCols, setVisibleCols]     = useState<Set<string>>(new Set(DEFAULT_VISIBLE_COLS));

  // Stage counts
  const stageCounts: Record<string, number> = { All: ALL_DEALS.length };
  ALL_DEALS.forEach(d => { stageCounts[d.stage] = (stageCounts[d.stage] ?? 0) + 1; });

  // Filtered deals
  const filtered = ALL_DEALS.filter(d => {
    const matchStage  = activeStage === "All" || d.stage === activeStage;
    const q           = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.account.toLowerCase().includes(q) || d.contactName.toLowerCase().includes(q);
    return matchStage && matchSearch;
  });

  const totalValue = filtered.reduce((s, d) => s + d.amount, 0);

  // -- DataGrid column builders, keyed by COL_DEFS.key
  const COLUMN_BUILDERS: Record<string, GridColDef<Deal>> = {
    dealName: {
      field: "dealName", headerName: "Deal Name", flex: 1.8, minWidth: 160, sortable: false,
      renderHeader: () => <ColHeader label="Deal Name" icon={Handshake} />,
      renderCell: (params) => (
        <p className={`m-0 font-heading text-[15px]/[20px] font-medium truncate ${isDark ? "text-[#FFFFFF]" : "text-slate-800"}`}>{params.row.name}</p>
      ),
    },
    amount: {
      field: "amount", headerName: "Amount", flex: 1, minWidth: 100, sortable: false,
      renderHeader: () => <ColHeader label="Amount" icon={CurrencyCircleDollar} />,
      renderCell: (params) => <p className={`m-0 text-[15px]/[20px] font-medium truncate ${isDark ? "text-[#FFFFFF]" : "text-slate-800"}`}>{fmt(params.row.amount)}</p>,
    },
    accountName: {
      field: "accountName", headerName: "Account Name", flex: 1.3, minWidth: 120, sortable: false,
      renderHeader: () => <ColHeader label="Account Name" icon={Buildings} />,
      renderCell: (params) => (
        <p className={`m-0 text-[15px]/[20px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.account || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </p>
      ),
    },
    stage: {
      field: "stage", headerName: "Stage", flex: 1.7, minWidth: 160, sortable: false,
      renderHeader: () => <ColHeader label="Stage" icon={Pulse} />,
      renderCell: (params) => {
        const cfg = STAGE_CFG[params.row.stage] ?? STAGE_CFG["Qualification"];
        return (
          <span className="self-center inline-flex items-center gap-1.5 text-[13px] font-medium px-2 py-[3px] rounded-full leading-none"
            style={{ backgroundColor: isDark ? cfg.bgDark : cfg.bg, color: isDark ? cfg.textDark : cfg.text }}>
            <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? cfg.textDark : cfg.dot }} />
            {params.row.stage}
          </span>
        );
      },
    },
    probability: {
      field: "probability", headerName: "Probability (%)", flex: 1, minWidth: 100, sortable: false,
      renderHeader: () => <ColHeader label="Probability (%)" icon={ChartLineUp} />,
      renderCell: (params) => {
        const cfg = STAGE_CFG[params.row.stage] ?? STAGE_CFG["Qualification"];
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-14 h-1 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`}>
              <div className="h-full rounded-full" style={{ width: `${params.row.probability}%`, backgroundColor: isDark ? cfg.textDark : cfg.dot }} />
            </div>
            <span className={`text-[13px]/[16px] font-medium ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>{params.row.probability}%</span>
          </div>
        );
      },
    },
    contactName: {
      field: "contactName", headerName: "Contact Name", flex: 1.3, minWidth: 120, sortable: false,
      renderHeader: () => <ColHeader label="Contact Name" icon={User} />,
      renderCell: (params) => (
        <p className={`m-0 text-[15px]/[20px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.contactName || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </p>
      ),
    },
    createdBy: {
      field: "createdBy", headerName: "Created By", flex: 1.2, minWidth: 110, sortable: false,
      renderHeader: () => <ColHeader label="Created By" icon={UserCircle} />,
      renderCell: (params) => <p className={`m-0 text-[13px]/[16px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{params.row.createdBy}</p>,
    },
    modifiedBy: {
      field: "modifiedBy", headerName: "Modified By", flex: 1.2, minWidth: 110, sortable: false,
      renderHeader: () => <ColHeader label="Modified By" icon={UserCircle} />,
      renderCell: (params) => <p className={`m-0 text-[13px]/[16px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{params.row.modifiedBy}</p>,
    },
    creation: {
      field: "creation", headerName: "Creation", flex: 1.5, minWidth: 150, sortable: false,
      renderHeader: () => <ColHeader label="Creation" icon={CalendarBlank} />,
      renderCell: (params) => <p className={`m-0 text-[13px]/[16px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{params.row.creation}</p>,
    },
    modified: {
      field: "modified", headerName: "Modified", flex: 1.5, minWidth: 150, sortable: false,
      renderHeader: () => <ColHeader label="Modified" icon={CalendarBlank} />,
      renderCell: (params) => <p className={`m-0 text-[13px]/[16px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{params.row.modified}</p>,
    },
  };

  const gridColumns: GridColDef<Deal>[] = [
    ...COL_DEFS.filter(c => visibleCols.has(c.key)).map(c => COLUMN_BUILDERS[c.key]),
    {
      field: "actions", headerName: "", width: 50, sortable: false, disableColumnMenu: true,
      renderCell: () => (
        <div className="flex justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip title="Actions">
            <IconButton size="small" onClick={e => e.stopPropagation()} sx={{ borderRadius: "6px", p: 0.5, "&:hover": { bgcolor: "#E3ECFC" } }}>
              <DotsThreeVertical size={15} color="#94A3B8" weight="duotone" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-3 sm:space-y-5 animate-fade-in">

          {/* -- Breadcrumb + Header -- */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className={`flex items-center gap-1.5 text-[13.5px]/[18px] mb-1 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
                <House size={16} weight="duotone" />
                <CaretRight size={12} weight="duotone" />
                <Link href="/deals" className={`transition-colors font-medium ${isDark ? "hover:text-[#D4D4D8]" : "hover:text-[#1D4ED8]"}`}>Deals</Link>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="font-heading text-lg sm:text-[22px]/[28px] font-semibold text-slate-900 tracking-tight m-0">Deals</h1>
                <span className={`text-[12px] sm:text-[13px]/[16px] font-medium border px-2 sm:px-2.5 py-1 rounded-full shadow-sm flex items-center whitespace-nowrap ${isDark ? "bg-[#0A0A0A] border-[#27272A] text-[#E4E4E7]" : "bg-[#f9fbff] border-[#E3ECFC] text-slate-400"}`}>
                  {ALL_DEALS.length} total
                </span>
                {/* Total pipeline value */}
                <span className={`flex items-center gap-1 text-[12px] sm:text-[13px]/[16px] font-medium px-2 sm:px-2.5 py-1 rounded-full border whitespace-nowrap ${isDark ? "text-[#34D399] bg-[#064E3B] border-[#047857]" : "text-[#059669] bg-emerald-50 border-emerald-100"}`}>
                  <TrendUp size={10} weight="duotone" />
                  Pipeline: ₹{(ALL_DEALS.reduce((s, d) => s + d.amount, 0) / 100000).toFixed(1)}L
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* View toggle */}
              <div className={`flex items-center rounded-xl p-0.5 gap-0.5 shadow-sm border ${isDark ? "bg-[#000000] border-[#27272A]" : "bg-white border-slate-100"}`}>
                {[
                  { k: "list",   Icon: List,     label: "List"   },
                  { k: "grid",   Icon: GridFour, label: "Grid"   },
                  { k: "kanban", Icon: Kanban,   label: "Kanban" },
                ].map(({ k, Icon, label }) => (
                  <button key={k} onClick={() => setView(k as typeof view)}
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-[6px] sm:py-[7px] rounded-lg text-[13px] sm:text-[14px]/[18px] font-medium transition-all ${
                      view === k
                        ? isDark ? "bg-[#18181B] text-[#D4D4D8]" : "bg-[#f9fbff] text-[#1D4ED8]"
                        : isDark ? "text-[#E4E4E7] hover:bg-[#27272A] hover:text-[#D4D4D8]" : "bg-[#f9fbff] text-slate-400 hover:bg-[#E3ECFC]"
                    }`}>
                    <Icon size={14} weight="duotone" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <Button variant="contained"
                startIcon={<Plus size={16} weight="bold" />}
                onClick={() => setDrawerOpen(true)}
                sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: { xs: "13px", sm: "15px" }, px: { xs: 1.5, sm: 2 }, py: 0.75, flex: { xs: 1, sm: "unset" }, boxShadow: isDark ? "none" : "0 1px 8px 0 #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "#2563EB", boxShadow: isDark ? "none" : "0 2px 14px 0 #60A5FA55" }, "&:active": { bgcolor: isDark ? "#52525B" : "#0C2472" } }}>
                <span className="hidden sm:inline">New Deal</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* -- Stage filter tabs -- */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {STAGE_TABS.map(stage => {
              const cnt    = stageCounts[stage] ?? 0;
              const active = activeStage === stage;
              if (stage !== "All" && cnt === 0) return null;
              return (
                <button key={stage} onClick={() => setActiveStage(stage)}
                  className={`flex items-center gap-1.5 px-3 py-[7px] rounded-xl text-[14px]/[18px] font-medium whitespace-nowrap transition-all border ${
                    active
                      ? isDark ? "bg-[#18181B] text-white shadow-sm shadow-[#27272A]/10 border-[#27272A]" : "bg-[#1D4ED8] text-white shadow-sm shadow-[#1D4ED8]/25 border-[#1D4ED8]"
                      : isDark ? "bg-[#0A0A0A] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A] hover:text-[#FFFFFF]" : "bg-[#f9fbff] text-[#0C2472] border-[#E3ECFC] hover:bg-[#E3ECFC]"
                  }`}>
                  {stage}
                  {cnt > 0 && <span className={`text-[13px]/[16px] font-medium px-1.5 py-0.5 rounded-full leading-none ${
                    active ? "bg-white/20 text-white" : "bg-[#1D4ED8]/10 text-[#0C2472]"
                  }`}>{cnt}</span>}
                </button>
              );
            })}
          </div>

          {/* -- Toolbar -- */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 sm:w-72 focus-within:border-[#60A5FA] focus-within:border-2 focus-within:shadow-[0_0_0_2px_#60A5FA] transition-all ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <MagnifyingGlass size={15} color="#94A3B8" weight="duotone" />
              <InputBase placeholder="Search deals…" value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flex: 1, fontSize: "0.86rem", color: isDark ? "#D4D4D8" : "#334155", "& input::placeholder": { color: "#94A3B8", opacity: 1 } }}
              />
              {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 text-sm">✕</button>}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filters */}
            <Button variant="outlined" size="small"
              startIcon={activeFilters.length > 0
                ? <Badge badgeContent={activeFilters.length} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 14, minWidth: 14 } }}>
                    <FunnelSimple size={14} weight="duotone" />
                  </Badge>
                : <FunnelSimple size={14} weight="duotone" />
              }
              onClick={e => setFiltersAnchor(e.currentTarget)}
              sx={{
                borderColor: activeFilters.length > 0 ? "#1D4ED8" : isDark ? "#27272A" : "#E3ECFC",
                color: activeFilters.length > 0 ? "#fff" : isDark ? "#E4E4E7" : "#0C2472",
                bgcolor: activeFilters.length > 0 ? "#1D4ED8" : isDark ? "#0F0F0F" : "#E3ECFC",
                borderRadius:"9px", textTransform:"none", fontWeight:500, fontSize:"14px",
                "&:hover":{
                  borderColor: activeFilters.length > 0 ? "#1640B8" : "#1D4ED8",
                  color: activeFilters.length > 0 ? "#fff" : "#0C2472",
                  bgcolor: activeFilters.length > 0 ? "#1640B8" : isDark ? "#0A0A0A" : "#DCE6FB",
                },
              }}>
              Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
            </Button>

            {/* Columns */}
            <Button variant="outlined" size="small"
              startIcon={<Columns size={14} weight="duotone" />}
              onClick={() => setColumnsOpen(true)}
              sx={{
                borderColor: isDark ? "#27272A" : "#E3ECFC",
                color: isDark ? "#E4E4E7" : "#0C2472",
                bgcolor: isDark ? "#0F0F0F" : "#E3ECFC",
                borderRadius:"9px", textTransform:"none", fontWeight:500, fontSize:"14px",
                "&:hover":{ borderColor:"#1D4ED8", color:"#0C2472", bgcolor: isDark ? "#0A0A0A" : "#DCE6FB" },
              }}>
              Columns
            </Button>

            {/* Sort */}
            <Button variant="outlined" size="small"
              startIcon={<SortAscending size={14} weight="duotone" />}
              endIcon={<CaretDown size={11} weight="duotone" />}
              onClick={e => setSortAnchor(e.currentTarget)}
              sx={{
                borderColor: isDark ? "#27272A" : "#E3ECFC",
                color: isDark ? "#E4E4E7" : "#0C2472",
                bgcolor: isDark ? "#0F0F0F" : "#E3ECFC",
                borderRadius:"9px", textTransform:"none", fontWeight:500, fontSize:"14px",
                "&:hover":{ borderColor:"#1D4ED8", color:"#0C2472", bgcolor: isDark ? "#0A0A0A" : "#DCE6FB" },
              }}>
              Sort{activeSorts.length > 0 ? ` (${activeSorts.length})` : ""}
            </Button>
            </div>

            {/* Filtered value + Records count */}
            <div className="sm:ml-auto flex items-center gap-3 flex-wrap">
              {filtered.length !== ALL_DEALS.length && (
                <span className={`text-[13px]/[16px] font-medium px-2.5 py-1 rounded-full border ${isDark ? "text-[#34D399] bg-[#064E3B] border-[#047857]" : "text-emerald-600 bg-emerald-50 border-emerald-100"}`}>
                  ₹{(totalValue / 100000).toFixed(1)}L filtered
                </span>
              )}
              <span className={`sm:ml-auto text-[13px]/[16px] px-3 py-1.5 rounded-lg ${isDark ? "text-[#E4E4E7] bg-[#0A0A0A]" : "text-slate-400 bg-[#f9fbff]"}`}>
                {filtered.length} of {ALL_DEALS.length} records
              </span>
            </div>
          </div>

          {/* -- Bulk action bar -- */}
          {selected.length > 0 && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border animate-slide-up shadow-sm flex-wrap ${isDark ? "bg-[#18181B] border-[#27272A]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1D4ED8] text-white flex items-center justify-center text-[13px]">{selected.length}</span>
                <span className={`text-[14px]/[18px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>selected</span>
              </div>
              <div className={`w-px h-4 hidden sm:block ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
              <button className={`text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>Update Stage</button>
              <button className={`text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>Assign Owner</button>
              <button onClick={() => setSelected([])} className={`sm:ml-auto text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-[#9CA3AF] hover:text-[#A1A1AA]" : "text-slate-400 hover:text-slate-600"}`}>Clear</button>
              <button className={`flex items-center gap-1.5 text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"}`}>
                <Trash size={14} weight="duotone" /> Delete
              </button>
            </div>
          )}

          {/* -- GRID -- */}
          {view === "grid" && <DealGridView deals={filtered} />}

          {/* -- KANBAN -- */}
          {view === "kanban" && <DealKanbanView deals={filtered} />}

          {/* -- LIST (MUI DataGrid) -- */}
          {view === "list" && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`} style={{ height: 600 }}>
              <DataGrid<Deal>
                rows={filtered}
                columns={gridColumns}
                getRowId={row => row.id}
                checkboxSelection
                disableRowSelectionOnClick
                disableColumnMenu
                rowHeight={44}
                columnHeaderHeight={40}
                rowSelectionModel={selected}
                onRowSelectionModelChange={model => setSelected(model as number[])}
                onRowClick={params => router.push(`/deals/${params.id}`)}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                pageSizeOptions={ROWS_PER_PAGE_OPTIONS}
                slots={{
                  noRowsOverlay: () => (
                    <div className="py-16 text-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
                        <MagnifyingGlass size={22} color={isDark ? "#E4E4E7" : "#94A3B8"} weight="duotone" />
                      </div>
                      <p className={`font-heading text-sm font-semibold ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>No deals found</p>
                      <p className={`text-xs mt-1 ${isDark ? "text-[#E4E4E7]" : "text-slate-300"}`}>Try adjusting your search or stage filter</p>
                    </div>
                  ),
                }}
                sx={getDataGridSx(isDark)}
              />
            </div>
          )}
        </main>

      {/* -- Panels -- */}
      <NewDealDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <FiltersDrawer
        anchor={filtersAnchor} onClose={() => setFiltersAnchor(null)}
        filters={activeFilters} onChange={setActiveFilters}
      />

      <ColumnsDrawer
        open={columnsOpen} onClose={() => setColumnsOpen(false)}
        selected={visibleCols} onChange={setVisibleCols}
      />

      <SortPopover
        anchor={sortAnchor} onClose={() => setSortAnchor(null)}
        sorts={activeSorts} onChange={setActiveSorts}
      />
    </div>
  );
}
