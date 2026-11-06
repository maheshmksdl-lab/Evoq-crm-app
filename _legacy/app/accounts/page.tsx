"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewAccountDrawer from "@/components/accounts/NewAccountDrawer";
import AccountGridView from "@/components/accounts/AccountGridView";
import FiltersDrawer, { type FilterRow } from "@/components/leads/FiltersDrawer";
import ColumnsDrawer from "@/components/leads/ColumnsDrawer";
import SortPopover, { type SortRow } from "@/components/leads/SortPopover";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { getDataGridSx, ROWS_PER_PAGE_OPTIONS } from "@/lib/dataGridStyles";
import {
  Plus, MagnifyingGlass, SlidersHorizontal, SortAscending, Columns,
  ArrowsDownUp, List, GridFour, House, CaretRight, Trash,
  DotsThreeVertical, Phone, FunnelSimple, CaretDown, Buildings,
  UserCircle, Briefcase, PencilSimple, CalendarBlank,
} from "@phosphor-icons/react";
import type { ElementType } from "react";
import { OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

// ---------------------------------------------
//  Data — exact from screenshot
// ---------------------------------------------
interface Account {
  id: number; name: string;
  ownerName: string; ownerEmail: string; ownerInitials: string;
  phone: string; accountType: string;
  modifiedByName: string; modifiedByEmail: string;
  creation: string; modified: string;
}

const ALL_ACCOUNTS: Account[] = [
  { id:1,  name:"XYZ",          ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"01111111111", accountType:"",           modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"27 May 2026, 03:14 PM", modified:"27 May 2026, 03:14 PM" },
  { id:2,  name:"Sweany Inc",   ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"6663636",     accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"27 May 2026, 02:38 PM", modified:"27 May 2026, 02:45 PM" },
  { id:3,  name:"Lee Industries",ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",   ownerInitials:"PM", phone:"",           accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"15 May 2026, 09:31 AM", modified:"15 May 2026, 09:31 AM" },
  { id:4,  name:"SDL LEAD1",    ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"",           accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"15 Apr 2026, 11:13 AM", modified:"15 Apr 2026, 11:13 AM" },
  { id:5,  name:"RMVT",         ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"",           accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"14 Apr 2026, 06:38 PM", modified:"14 Apr 2026, 06:43 PM" },
  { id:6,  name:"test",         ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"9977887788", accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"13 Apr 2026, 06:00 PM", modified:"13 Apr 2026, 06:17 PM" },
  { id:7,  name:"Speedy Motors", ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",   ownerInitials:"PM", phone:"",           accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"13 Apr 2026, 05:56 PM", modified:"13 Apr 2026, 05:56 PM" },
  { id:8,  name:"SDL Test",     ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"",           accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"16 Mar 2026, 07:25 PM", modified:"08 Apr 2026, 04:47 PM" },
  { id:9,  name:"Test 1233333", ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"",           accountType:"Individual",  modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"23 Mar 2026, 05:16 PM", modified:"23 Mar 2026, 05:16 PM" },
  { id:10, name:"SDL",          ownerName:"PM SDL", ownerEmail:"pm@socialdnalabs.com",    ownerInitials:"PM", phone:"",           accountType:"",            modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"26 Jun 2025, 04:11 PM", modified:"16 Mar 2026, 07:45 PM" },
  { id:11, name:"Sears Homelife",ownerName:"Admin", ownerEmail:"admin@mailinator.com",    ownerInitials:"AD", phone:"",           accountType:"",            modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"08 Jul 2025, 11:15 AM", modified:"16 Mar 2026, 07:45 PM" },
  { id:12, name:"dfgdfg",       ownerName:"Admin",  ownerEmail:"admin@mailinator.com",    ownerInitials:"AD", phone:"",           accountType:"",            modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"25 Jul 2025, 05:16 PM", modified:"16 Mar 2026, 07:45 PM" },
  { id:13, name:"I&T",          ownerName:"Admin",  ownerEmail:"admin@mailinator.com",    ownerInitials:"AD", phone:"",           accountType:"",            modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"28 Jul 2025, 10:13 AM", modified:"16 Mar 2026, 07:45 PM" },
  { id:14, name:"dd",           ownerName:"Admin",  ownerEmail:"admin@mailinator.com",    ownerInitials:"AD", phone:"",           accountType:"",            modifiedByName:"PM SDL", modifiedByEmail:"pm@socialdnalabs.com", creation:"28 Jul 2025, 10:14 AM", modified:"16 Mar 2026, 07:45 PM" },
];

// ---------------------------------------------
//  Account type config
// ---------------------------------------------
const TYPE_CFG: Record<string, { bg: string; text: string; dot: string; bgDark: string; textDark: string }> = {
  "Individual": { bg: "#EFF6FF", text: "#0C2472", dot: "#94A3B8", bgDark: "rgba(96, 165, 250, 0.15)", textDark: "#60A5FA" },
  "Customer":   { bg: "#DCFCE7", text: "#166534", dot: "#10B981", bgDark: "rgba(16, 185, 129, 0.15)", textDark: "#10B981" },
  "Partner":    { bg: "#E3ECFC", text: "#0C2472", dot: "#3B82F6", bgDark: "rgba(52, 211, 153, 0.15)", textDark: "#34D399" },
  "Prospect":   { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", bgDark: "rgba(251, 191, 36, 0.15)", textDark: "#FBBF24" },
  "Vendor":     { bg: "#E3ECFC", text: "#0C2472", dot: "#DB5E8C", bgDark: "rgba(244, 114, 182, 0.15)", textDark: "#F472B6" },
  "Analyst":    { bg: "#EFF6FF", text: "#475569", dot: "#94A3B8", bgDark: "rgba(167, 139, 250, 0.15)", textDark: "#A78BFA" },
  "Competitor": { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", bgDark: "rgba(244, 63, 94, 0.15)", textDark: "#F43F5E" },
};

// ---------------------------------------------
//  Column defs — all fixed px (horizontal scroll)
// ---------------------------------------------
const COL_DEFS = [
  { key: "accountName", label: "Account Name",  width: "200px" },
  { key: "accountOwner",label: "Account Owner", width: "175px" },
  { key: "phone",       label: "Phone",         width: "130px" },
  { key: "accountType", label: "Account Type",  width: "130px" },
  { key: "modifiedBy",  label: "Modified by",   width: "175px" },
  { key: "creation",    label: "Creation",      width: "165px" },
  { key: "modified",    label: "Modified",      width: "165px" },
];
const DEFAULT_VISIBLE = new Set(["accountName", "accountOwner", "phone", "accountType", "modifiedBy", "creation", "modified"]);

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PAL.length];

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
export default function AccountsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selected, setSelected]       = useState<number[]>([]);
  const [search, setSearch]           = useState("");
  const [view, setView]               = useState<"list" | "grid">("list");
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [sortAnchor, setSortAnchor]   = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterRow[]>([]);
  const [activeSorts,   setActiveSorts]   = useState<SortRow[]>([]);
  const [visibleCols, setVisibleCols]     = useState<Set<string>>(new Set(DEFAULT_VISIBLE));

  const filtered = ALL_ACCOUNTS.filter(a => {
    const q = search.toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.ownerName.toLowerCase().includes(q);
  });

  const sorted = filtered;

  // -- DataGrid column builders, keyed by COL_DEFS.key
  const COLUMN_BUILDERS: Record<string, GridColDef<Account>> = {
    accountName: {
      field: "accountName", headerName: "Account Name", flex: 1.8, minWidth: 180, sortable: false,
      renderHeader: () => <ColHeader label="Account Name" icon={Buildings} />,
      renderCell: (params) => {
        const acc = params.row;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0"
              style={{ backgroundColor: avatarColor(acc.name) }}>
              {acc.name.substring(0, 2).toUpperCase()}
            </div>
            <p className={`m-0 font-heading text-[15px]/[20px] font-medium truncate hover:underline cursor-pointer ${isDark ? "text-[#FFFFFF]" : "text-slate-800"}`}>{acc.name}</p>
          </div>
        );
      },
    },
    accountOwner: {
      field: "accountOwner", headerName: "Account Owner", flex: 1.5, minWidth: 150, sortable: false,
      renderHeader: () => <ColHeader label="Account Owner" icon={UserCircle} />,
      renderCell: (params) => {
        const acc = params.row;
        return (
          <Tooltip title={`${acc.ownerName} · ${acc.ownerEmail}`} placement="top">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar src={OWNER_AVATARS[acc.ownerName]} sx={{ width: 20, height: 20, bgcolor: avatarColor(acc.ownerName), fontSize: "0.48rem", fontWeight: 800, flexShrink: 0 }}>{acc.ownerInitials}</Avatar>
              <span className={`text-[15px]/[20px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>{acc.ownerEmail}</span>
            </div>
          </Tooltip>
        );
      },
    },
    phone: {
      field: "phone", headerName: "Phone", flex: 1.1, minWidth: 110, sortable: false,
      renderHeader: () => <ColHeader label="Phone" icon={Phone} />,
      renderCell: (params) => (
        <div className={`text-[15px]/[20px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.phone
            ? <span className="flex items-center gap-1"><Phone size={11} color="#94A3B8" weight="duotone" />{params.row.phone}</span>
            : <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </div>
      ),
    },
    accountType: {
      field: "accountType", headerName: "Account Type", flex: 1.1, minWidth: 110, sortable: false,
      renderHeader: () => <ColHeader label="Account Type" icon={Briefcase} />,
      renderCell: (params) => {
        const typCfg = TYPE_CFG[params.row.accountType];
        if (!typCfg) return <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>;
        return (
          <span className="self-center inline-flex items-center gap-1.5 text-[13px] px-2 py-[3px] rounded-full leading-none"
            style={{
              backgroundColor: isDark ? typCfg.bgDark : typCfg.bg,
              color: isDark ? typCfg.textDark : typCfg.text,
            }}>
            <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: isDark ? typCfg.textDark : typCfg.dot }} />
            {params.row.accountType}
          </span>
        );
      },
    },
    modifiedBy: {
      field: "modifiedBy", headerName: "Modified by", flex: 1.5, minWidth: 150, sortable: false,
      renderHeader: () => <ColHeader label="Modified by" icon={PencilSimple} />,
      renderCell: (params) => {
        const acc = params.row;
        return (
          <Tooltip title={`${acc.modifiedByName} · ${acc.modifiedByEmail}`} placement="top">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar src={OWNER_AVATARS[acc.modifiedByName]} sx={{ width: 20, height: 20, bgcolor: avatarColor(acc.modifiedByName), fontSize: "0.48rem", fontWeight: 800, flexShrink: 0 }}>{acc.modifiedByName.substring(0, 2).toUpperCase()}</Avatar>
              <span className={`text-[15px]/[20px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>{acc.modifiedByEmail}</span>
            </div>
          </Tooltip>
        );
      },
    },
    creation: {
      field: "creation", headerName: "Creation", flex: 1.4, minWidth: 140, sortable: false,
      renderHeader: () => <ColHeader label="Creation" icon={CalendarBlank} />,
      renderCell: (params) => <p className={`m-0 text-[13px]/[16px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{params.row.creation}</p>,
    },
    modified: {
      field: "modified", headerName: "Modified", flex: 1.4, minWidth: 140, sortable: false,
      renderHeader: () => <ColHeader label="Modified" icon={CalendarBlank} />,
      renderCell: (params) => <p className={`m-0 text-[13px]/[16px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{params.row.modified}</p>,
    },
  };

  const gridColumns: GridColDef<Account>[] = [
    ...COL_DEFS.filter(c => visibleCols.has(c.key)).map(c => COLUMN_BUILDERS[c.key]),
    {
      field: "actions", headerName: "", width: 50, sortable: false, disableColumnMenu: true,
      renderCell: () => (
        <div className="flex justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip title="Actions">
            <IconButton size="small" onClick={e => e.stopPropagation()} sx={{ borderRadius: "6px", p: 0.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#E3ECFC" } }}>
              <DotsThreeVertical size={15} color="#94A3B8" weight="duotone" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">

      <main className="flex-1 px-8 py-6 space-y-5 animate-fade-in">

          {/* -- Breadcrumb + Header -- */}
          <div className="flex items-start justify-between">
            <div>
              <div className={`flex items-center gap-1.5 text-[13.5px]/[18px] mb-1 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
                <House size={16} weight="duotone" />
                <CaretRight size={12} weight="duotone" />
                <Link href="/accounts" className={`transition-colors font-medium ${isDark ? "hover:text-[#D4D4D8]" : "hover:text-[#1D4ED8]"}`}>Accounts</Link>
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading text-[22px]/[28px] font-semibold text-slate-900 tracking-tight m-0">Accounts</h1>
                <span className={`text-[13px]/[16px] font-medium border px-2.5 py-1 rounded-full shadow-sm flex items-center ${isDark ? "bg-[#0A0A0A] border-[#27272A] text-[#E4E4E7]" : "bg-[#f9fbff] border-[#E3ECFC] text-slate-400"}`}>
                  {ALL_ACCOUNTS.length} total
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* View toggle */}
              <div className={`flex items-center rounded-xl p-0.5 gap-0.5 shadow-sm border ${isDark ? "bg-[#000000] border-[#27272A]" : "bg-white border-slate-100"}`}>
                {[
                  { k: "list", Icon: List,     label: "List" },
                  { k: "grid", Icon: GridFour, label: "Grid" },
                ].map(({ k, Icon, label }) => (
                  <button key={k} onClick={() => setView(k as typeof view)}
                    className={`flex items-center gap-1.5 px-2.5 py-[7px] rounded-lg text-[14px]/[18px] font-medium transition-all ${
                      view === k
                        ? isDark ? "bg-[#18181B] text-[#D4D4D8]" : "bg-[#f9fbff] text-[#1D4ED8]"
                        : isDark ? "text-[#E4E4E7] hover:bg-[#27272A] hover:text-[#D4D4D8]" : "bg-[#f9fbff] text-slate-400 hover:bg-[#E3ECFC]"
                    }`}>
                    <Icon size={14} weight="duotone" />{label}
                  </button>
                ))}
              </div>

              <Button variant="contained"
                startIcon={<Plus size={16} weight="bold" />}
                onClick={() => setDrawerOpen(true)}
                sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: "15px", px: 2, py: 0.85, boxShadow: isDark ? "none" : "0 1px 8px 0 #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "#2563EB", boxShadow: isDark ? "none" : "0 2px 14px 0 #60A5FA55" }, "&:active": { bgcolor: isDark ? "#52525B" : "#0C2472" } }}>
                New Account
              </Button>
            </div>
          </div>

          {/* -- Toolbar -- */}
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 w-72 focus-within:border-[#60A5FA] focus-within:border-2 focus-within:shadow-[0_0_0_2px_#60A5FA] transition-all ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <MagnifyingGlass size={15} color="#94A3B8" weight="duotone" />
              <InputBase placeholder="Search accounts…" value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flex: 1, fontSize: "0.86rem", color: isDark ? "#D4D4D8" : "#334155", "& input::placeholder": { color: "#94A3B8", opacity: 1 } }}
              />
              {search && <button onClick={() => setSearch("")} className={`text-sm transition-colors ${isDark ? "text-[#52525B] hover:text-[#A1A1AA]" : "text-slate-300 hover:text-slate-500"}`}>✕</button>}
            </div>

            <Button variant="outlined" size="small"
              startIcon={activeFilters.length > 0
                ? <Badge badgeContent={activeFilters.length} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.55rem", height: 14, minWidth: 14 } }}>
                    <FunnelSimple size={14} weight="duotone" />
                  </Badge>
                : <FunnelSimple size={14} weight="duotone" />
              }
              onClick={e => setFiltersAnchor(e.currentTarget)}
              sx={{
                borderColor: activeFilters.length > 0 ? "#1D4ED8" : isDark ? "#27272A" : "#E3ECFC",
                color: activeFilters.length > 0 ? "#fff" : isDark ? "#E4E4E7" : "#0C2472",
                bgcolor: activeFilters.length > 0 ? "#1D4ED8" : isDark ? "#0F0F0F" : "#E3ECFC",
                borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: "14px",
                "&:hover": {
                  borderColor: activeFilters.length > 0 ? "#1640B8" : "#1D4ED8",
                  color: activeFilters.length > 0 ? "#fff" : "#0C2472",
                  bgcolor: activeFilters.length > 0 ? "#1640B8" : isDark ? "#0A0A0A" : "#DCE6FB",
                },
              }}>
              Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
            </Button>

            <Button variant="outlined" size="small"
              startIcon={<Columns size={14} weight="duotone" />}
              onClick={() => setColumnsOpen(true)}
              sx={{
                borderColor: isDark ? "#27272A" : "#E3ECFC",
                color: isDark ? "#E4E4E7" : "#0C2472",
                bgcolor: isDark ? "#0F0F0F" : "#E3ECFC",
                borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: "14px",
                "&:hover": { borderColor: "#1D4ED8", color: "#0C2472", bgcolor: isDark ? "#0A0A0A" : "#DCE6FB" },
              }}>
              Columns
            </Button>

            <Button variant="outlined" size="small"
              startIcon={<SortAscending size={14} weight="duotone" />}
              endIcon={<CaretDown size={11} weight="duotone" />}
              onClick={e => setSortAnchor(e.currentTarget)}
              sx={{
                borderColor: isDark ? "#27272A" : "#E3ECFC",
                color: isDark ? "#E4E4E7" : "#0C2472",
                bgcolor: isDark ? "#0F0F0F" : "#E3ECFC",
                borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: "14px",
                "&:hover": { borderColor: "#1D4ED8", color: "#0C2472", bgcolor: isDark ? "#0A0A0A" : "#DCE6FB" },
              }}>
              Sort{activeSorts.length > 0 ? ` (${activeSorts.length})` : ""}
            </Button>

            <span className={`ml-auto text-[13px]/[16px] px-3 py-1.5 rounded-lg ${isDark ? "text-[#E4E4E7] bg-[#0A0A0A]" : "text-slate-400 bg-[#f9fbff]"}`}>
              {sorted.length} of {ALL_ACCOUNTS.length} records
            </span>
          </div>

          {/* -- Bulk action bar -- */}
          {selected.length > 0 && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border animate-slide-up shadow-sm ${isDark ? "bg-[#18181B] border-[#27272A]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1D4ED8] text-white flex items-center justify-center text-[12px]">{selected.length}</span>
                <span className={`text-[14px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>selected</span>
              </div>
              <div className={`w-px h-4 ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
              <button className={`text-[14px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>Assign Owner</button>
              <button className={`text-[14px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>Update Type</button>
              <button onClick={() => setSelected([])} className={`ml-auto text-[14px] font-medium transition-colors ${isDark ? "text-[#9CA3AF] hover:text-[#A1A1AA]" : "text-slate-400 hover:text-slate-600"}`}>Clear</button>
              <button className={`flex items-center gap-1.5 text-[14px] font-medium transition-colors ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"}`}>
                <Trash size={14} weight="duotone" /> Delete
              </button>
            </div>
          )}

          {/* -- GRID VIEW -- */}
          {view === "grid" && (
            <AccountGridView accounts={filtered.map(a => ({
              id: a.id, name: a.name, ownerName: a.ownerName, ownerInitials: a.ownerInitials,
              phone: a.phone, accountType: a.accountType, creation: a.creation,
            }))} />
          )}

          {/* -- LIST VIEW (MUI DataGrid) -- */}
          {view === "list" && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`} style={{ height: 600 }}>
              <DataGrid<Account>
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
                onRowClick={params => router.push(`/accounts/${params.id}`)}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                pageSizeOptions={ROWS_PER_PAGE_OPTIONS}
                slots={{
                  noRowsOverlay: () => (
                    <div className="py-16 text-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f9fbff]"}`}>
                        <Buildings size={22} color="#94A3B8" weight="duotone" />
                      </div>
                      <p className={`font-heading text-sm font-semibold ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>No accounts found</p>
                      <p className={`text-xs mt-1 ${isDark ? "text-[#52525B]" : "text-slate-300"}`}>Try adjusting your search or filters</p>
                    </div>
                  ),
                }}
                sx={getDataGridSx(isDark)}
              />
            </div>
          )}
        </main>
  

      {/* -- Panels -- */}
      <NewAccountDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

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
