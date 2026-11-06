"use client";
import { useState } from "react";
import Link from "next/link";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { getDataGridSx, ROWS_PER_PAGE_OPTIONS } from "@/lib/dataGridStyles";
import { useRouter } from "next/navigation";
import {
  House, CaretRight, Plus, MagnifyingGlass, FunnelSimple,
  DotsThreeVertical, Trash, List, GridFour, Columns, SortAscending, CaretDown,
  ClipboardText, CheckCircle, PencilSimple, Copy,
  Tag, CalendarBlank, Pulse, Flag, User, LinkSimple, UserCircle,
} from "@phosphor-icons/react";
import type { ElementType } from "react";
import NewTaskDrawer from "@/components/tasks/NewTaskDrawer";
import TaskGridView from "@/components/tasks/TaskGridView";
import FiltersDrawer, { type FilterRow } from "@/components/leads/FiltersDrawer";
import SortPopover, { type SortRow } from "@/components/leads/SortPopover";
import { useTheme } from "@/components/ThemeContext";

// ---------------------------------------------
//  Types & Data
// ---------------------------------------------
type TaskStatus   = "To-Do" | "In Progress" | "Backlog" | "Completed" | "";
type TaskPriority = "High" | "Medium" | "Low" | "";
type TaskType     = "Task" | "Quote" | "Call" | "Email" | "";

interface TaskRecord {
  id: number;
  type: TaskType;
  subject: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  contact: string;
  relatedTo: string;
  taskOwner: string;
}

const ALL_TASKS: TaskRecord[] = [
  { id: 1, type: "Task",  subject: "New",                        dueDate: "",           status: "",           priority: "",       contact: "",                   relatedTo: "",            taskOwner: "pm@socialdnalabs.com" },
  { id: 2, type: "Task",  subject: "New",                        dueDate: "07/05/2026", status: "To-Do",      priority: "",       contact: "",                   relatedTo: "",            taskOwner: "pm@socialdnalabs.com" },
  { id: 3, type: "Task",  subject: "Schedule Demo",              dueDate: "17/04/2026", status: "Backlog",    priority: "High",   contact: "SDL Test Test-SDL",  relatedTo: "SDL - Account", taskOwner: "pm@socialdnalabs.com" },
  { id: 4, type: "Task",  subject: "Prepare quote sent to email",dueDate: "16/04/2026", status: "Backlog",    priority: "Medium", contact: "SDL Test Test-SDL",  relatedTo: "SDL - Account", taskOwner: "pm@socialdnalabs.com" },
  { id: 5, type: "Quote", subject: "Quote",                      dueDate: "24/03/2026", status: "In Progress",priority: "Low",    contact: "",                   relatedTo: "",            taskOwner: "pm@socialdnalabs.com" },
];

// ---------------------------------------------
//  Config
// ---------------------------------------------
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  "To-Do":       { bg: "#EFF6FF",  text: "#0C2472", dot: "#3B82F6" },
  "In Progress": { bg: "#FEF3C7",  text: "#92400E", dot: "#F59E0B" },
  "Backlog":     { bg: "#F1F5F9",  text: "#475569", dot: "#94A3B8" },
  "Completed":   { bg: "#DCFCE7",  text: "#166534", dot: "#10B981" },
};

const STATUS_CFG_DARK: Record<string, { bg: string; text: string; dot: string }> = {
  "To-Do":       { bg: "rgba(113,113,122,0.15)", text: "#A1A1AA", dot: "#71717A" },
  "In Progress": { bg: "rgba(245,158,11,0.15)",  text: "#FCD34D", dot: "#F59E0B" },
  "Backlog":     { bg: "rgba(148,163,184,0.15)", text: "#94A3B8", dot: "#64748B" },
  "Completed":   { bg: "rgba(16,185,129,0.15)",  text: "#34D399", dot: "#10B981" },
};

const PRIORITY_CFG: Record<string, { bg: string; text: string }> = {
  "High":   { bg: "#FEF2F2", text: "#DC2626" },
  "Medium": { bg: "#FEF3C7", text: "#D97706" },
  "Low":    { bg: "#F0FDF4", text: "#16A34A" },
};

// ---------------------------------------------
//  Helpers
// ---------------------------------------------
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
export default function TasksPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selected, setSelected]           = useState<number[]>([]);
  const [search, setSearch]               = useState("");
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterRow[]>([]);
  const [moreAnchor, setMoreAnchor]       = useState<HTMLElement | null>(null);
  const [activeFilter, setActiveFilter]   = useState<TaskStatus | "All">("All");
  const [view, setView]                   = useState<"list" | "grid">("list");
  const [sortAnchor,    setSortAnchor]    = useState<HTMLElement | null>(null);
  const [activeSorts,   setActiveSorts]   = useState<SortRow[]>([]);
  const [columnsAnchor, setColumnsAnchor] = useState<HTMLElement | null>(null);

  const TASK_FILTER_COLUMNS = [
    { value: "subject",   label: "Task · Subject"    },
    { value: "type",      label: "Task · Type"       },
    { value: "status",    label: "Task · Status"     },
    { value: "priority",  label: "Task · Priority"   },
    { value: "dueDate",   label: "Task · Due Date"   },
    { value: "contact",   label: "Task · Contact"    },
    { value: "relatedTo", label: "Task · Related To" },
    { value: "taskOwner", label: "Task · Task Owner" },
  ];

  const TASK_SORT_COLUMNS = [
    { value: "subject",   label: "Subject"    },
    { value: "type",      label: "Type"       },
    { value: "dueDate",   label: "Due Date"   },
    { value: "status",    label: "Status"     },
    { value: "priority",  label: "Priority"   },
    { value: "contact",   label: "Contact"    },
    { value: "relatedTo", label: "Related To" },
    { value: "taskOwner", label: "Task Owner" },
  ];

  const TASK_COLUMN_TOGGLES: { key: keyof TaskRecord; label: string }[] = [
    { key: "type",      label: "Type"       },
    { key: "subject",   label: "Subject"    },
    { key: "dueDate",   label: "Due Date"   },
    { key: "status",    label: "Status"     },
    { key: "priority",  label: "Priority"   },
    { key: "contact",   label: "Contact"    },
    { key: "relatedTo", label: "Related To" },
    { key: "taskOwner", label: "Task Owner" },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(TASK_COLUMN_TOGGLES.map(c => c.key as string))
  );
  const toggleColumn = (key: string) => setVisibleColumns(prev => {
    const next = new Set(prev);
    if (next.has(key)) { if (next.size > 1) next.delete(key); } else next.add(key);
    return next;
  });

  const STATUS_TABS: (TaskStatus | "All")[] = ["All", "To-Do", "In Progress", "Backlog", "Completed"];

  const filtered = ALL_TASKS.filter(t => {
    const matchStatus = activeFilter === "All" || t.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.subject.toLowerCase().includes(q) || t.contact.toLowerCase().includes(q) || t.relatedTo.toLowerCase().includes(q);

    const matchFilters = activeFilters.every(f => {
      const raw = (t as unknown as Record<string, string>)[f.column] ?? "";
      const val = raw.toLowerCase();
      const fv  = f.value.toLowerCase();
      switch (f.operator) {
        case "contains":         return val.includes(fv);
        case "does_not_contain": return !val.includes(fv);
        case "equals":           return val === fv;
        case "does_not_equal":   return val !== fv;
        case "starts_with":      return val.startsWith(fv);
        case "ends_with":        return val.endsWith(fv);
        case "is_empty":         return val === "";
        case "is_not_empty":     return val !== "";
        default:                 return true;
      }
    });

    return matchStatus && matchSearch && matchFilters;
  });

  const sorted = activeSorts.length === 0 ? filtered : [...filtered].sort((a, b) => {
    for (const s of activeSorts) {
      const av = (a as unknown as Record<string, string>)[s.column] ?? "";
      const bv = (b as unknown as Record<string, string>)[s.column] ?? "";
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
      if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  const statusCounts: Record<string, number> = { All: ALL_TASKS.length };
  ALL_TASKS.forEach(t => { if (t.status) statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1; });

  // -- DataGrid column definitions
  const gridColumns: GridColDef<TaskRecord>[] = [
    {
      field: "type", headerName: "Type", flex: 0.8, minWidth: 80, sortable: false,
      renderHeader: () => <ColHeader label="Type" icon={Tag} />,
      renderCell: (params) => (
        <p className={`text-[15px]/[20px] truncate mb-0 ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.type || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </p>
      ),
    },
    {
      field: "subject", headerName: "Subject", flex: 1.8, minWidth: 200, sortable: false,
      renderHeader: () => <ColHeader label="Subject" icon={ClipboardText} />,
      renderCell: (params) => (
        <Link href={`/tasks/${params.row.id}`}
          className={`font-heading text-[15px]/[20px] font-medium truncate hover:underline ${isDark ? "text-[#FFFFFF]" : "text-slate-800"}`}
          onClick={e => e.stopPropagation()}>
          {params.row.subject}
        </Link>
      ),
    },
    {
      field: "dueDate", headerName: "Due Date", flex: 1, minWidth: 100, sortable: false,
      renderHeader: () => <ColHeader label="Due Date" icon={CalendarBlank} />,
      renderCell: (params) => (
        <p className={`text-[13px]/[16px] truncate mb-0 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
          {params.row.dueDate || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </p>
      ),
    },
    {
      field: "status", headerName: "Status", flex: 1.2, minWidth: 120, sortable: false,
      renderHeader: () => <ColHeader label="Status" icon={Pulse} />,
      renderCell: (params) => {
        const rawCfg    = params.row.status ? STATUS_CFG[params.row.status] : null;
        const statusCfg = isDark && params.row.status ? STATUS_CFG_DARK[params.row.status] : rawCfg;
        return statusCfg ? (
          <span className="self-center inline-flex items-center gap-1.5 text-[13px] font-medium px-2 py-[3px] rounded-full leading-none"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
            <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.dot }} />
            {params.row.status}
          </span>
        ) : <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>;
      },
    },
    {
      field: "priority", headerName: "Priority", flex: 0.9, minWidth: 90, sortable: false,
      renderHeader: () => <ColHeader label="Priority" icon={Flag} />,
      renderCell: (params) => {
        const priCfg = params.row.priority ? PRIORITY_CFG[params.row.priority] : null;
        return priCfg ? (
          <span className="self-center inline-flex items-center gap-1 text-[13px] font-medium px-2 py-[3px] rounded-full leading-none"
            style={{ backgroundColor: priCfg.bg, color: priCfg.text }}>
            {params.row.priority}
          </span>
        ) : <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>;
      },
    },
    {
      field: "contact", headerName: "Contact", flex: 1.5, minWidth: 150, sortable: false,
      renderHeader: () => <ColHeader label="Contact" icon={User} />,
      renderCell: (params) => (
        <p className={`text-[15px]/[20px] truncate mb-0 ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.contact || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </p>
      ),
    },
    {
      field: "relatedTo", headerName: "Related To", flex: 1.7, minWidth: 170, sortable: false,
      renderHeader: () => <ColHeader label="Related To" icon={LinkSimple} />,
      renderCell: (params) => (
        <p className={`text-[15px]/[20px] truncate mb-0 ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.relatedTo || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </p>
      ),
    },
    {
      field: "taskOwner", headerName: "Task Owner", flex: 2, minWidth: 200, sortable: false,
      renderHeader: () => <ColHeader label="Task Owner" icon={UserCircle} />,
      renderCell: (params) => (
        <p className={`text-[13px]/[16px] truncate mb-0 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
          {params.row.taskOwner || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </p>
      ),
    },
    {
      field: "actions", headerName: "", width: 50, sortable: false, disableColumnMenu: true,
      renderCell: () => (
        <div className="flex justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip title="Actions">
            <IconButton size="small" onClick={e => e.stopPropagation()}
              sx={{ borderRadius: "6px", p: 0.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#E3ECFC" } }}>
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
                <Link href="/tasks" className={`transition-colors font-medium ${isDark ? "hover:text-[#D4D4D8]" : "hover:text-[#1D4ED8]"}`}>Tasks</Link>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="font-heading text-lg sm:text-[22px]/[28px] font-semibold text-slate-900 tracking-tight m-0">Tasks</h1>
                <span className={`text-[12px] sm:text-[13px]/[16px] font-medium border px-2 sm:px-2.5 py-1 rounded-full shadow-sm flex items-center whitespace-nowrap ${isDark ? "bg-[#0A0A0A] border-[#27272A] text-[#E4E4E7]" : "bg-[#f9fbff] border-[#E3ECFC] text-slate-400"}`}>
                  {ALL_TASKS.length} total
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* View toggle */}
              <div className={`flex items-center rounded-xl p-0.5 gap-0.5 shadow-sm border ${isDark ? "bg-[#000000] border-[#27272A]" : "bg-white border-slate-100"}`}>
                {([{ k: "list", Icon: List, label: "List" }, { k: "grid", Icon: GridFour, label: "Grid" }] as { k: string; Icon: ElementType; label: string }[]).map(({ k, Icon, label }) => (
                  <button key={k} onClick={() => setView(k as "list" | "grid")}
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
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">New</span>
              </Button>

              <Tooltip title="More options">
                <IconButton size="small" onClick={e => setMoreAnchor(e.currentTarget)}
                  sx={{ borderRadius: "8px", p: 0.8, bgcolor: isDark ? "#0A0A0A" : "#f9fbff", border: isDark ? "1px solid #27272A" : "1px solid #E3ECFC", "&:hover": { bgcolor: isDark ? "#27272A" : "#E3ECFC" } }}>
                  <DotsThreeVertical size={16} color={isDark ? "#5A7089" : "#334155"} weight="bold" />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* -- Status filter tabs -- */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STATUS_TABS.map(tab => {
              const cnt    = statusCounts[tab] ?? 0;
              const active = activeFilter === tab;
              if (tab !== "All" && cnt === 0) return null;
              return (
                <button key={tab} onClick={() => setActiveFilter(tab)}
                  className={`flex items-center gap-1.5 px-3 py-[7px] rounded-xl text-[14px]/[18px] font-medium whitespace-nowrap transition-all flex-shrink-0 border ${
                    active
                      ? isDark ? "bg-[#18181B] text-white shadow-sm shadow-[#27272A]/10 border-[#27272A]" : "bg-[#1D4ED8] text-white shadow-sm shadow-[#1D4ED8]/25 border-[#1D4ED8]"
                      : isDark ? "bg-[#0A0A0A] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A] hover:text-[#FFFFFF]" : "bg-[#f9fbff] text-[#0C2472] border-[#E3ECFC] hover:bg-[#E3ECFC]"
                  }`}>
                  {tab}
                  {tab !== "All" && cnt > 0 && (
                    <span className={`text-[12px] px-1.5 py-0.5 rounded-full leading-none ${
                      active
                        ? isDark ? "bg-white/10 text-[#A1A1AA]" : "bg-white/20 text-white"
                        : isDark ? "bg-[#27272A] text-[#9CA3AF]" : "bg-slate-100 text-slate-600"
                    }`}>{cnt}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* -- Toolbar -- */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 sm:w-72 focus-within:border-[#60A5FA] focus-within:border-2 focus-within:shadow-[0_0_0_2px_#60A5FA] transition-all ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <MagnifyingGlass size={15} color="#94A3B8" weight="duotone" />
              <InputBase placeholder="Search tasks…" value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flex: 1, fontSize: "0.86rem", color: isDark ? "#D4D4D8" : "#334155", "& input::placeholder": { color: "#94A3B8", opacity: 1 } }}
              />
              {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 text-sm">✕</button>}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
            <Button variant="outlined" size="small"
              startIcon={<FunnelSimple size={14} weight="duotone" />}
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

            {/* Columns button */}
            <Button variant="outlined" size="small"
              startIcon={<Columns size={14} weight="duotone" />}
              onClick={e => setColumnsAnchor(e.currentTarget)}
              sx={{
                borderColor: isDark ? "#27272A" : "#E3ECFC",
                color: isDark ? "#E4E4E7" : "#0C2472",
                bgcolor: isDark ? "#0F0F0F" : "#E3ECFC",
                borderRadius: "9px", textTransform: "none", fontWeight: 500, fontSize: "14px",
                "&:hover": { borderColor: "#1D4ED8", color: "#0C2472", bgcolor: isDark ? "#0A0A0A" : "#DCE6FB" },
              }}>
              Columns
            </Button>

            {/* Sort button */}
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
            </div>

            <span className={`sm:ml-auto text-[13px]/[16px] px-3 py-1.5 rounded-lg ${isDark ? "text-[#E4E4E7] bg-[#0A0A0A]" : "text-slate-400 bg-[#f9fbff]"}`}>
              {sorted.length} of {ALL_TASKS.length} records
            </span>
          </div>

          <Menu anchorEl={columnsAnchor} open={Boolean(columnsAnchor)} onClose={() => setColumnsAnchor(null)}
            PaperProps={{ sx: { borderRadius: "12px", border: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(12,36,114,0.10)", minWidth: 190 } }}>
            {TASK_COLUMN_TOGGLES.map(col => (
              <MenuItem key={col.key} onClick={() => toggleColumn(col.key as string)}
                sx={{ mx: 0.5, borderRadius: "8px", py: 0.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
                <Checkbox size="small" checked={visibleColumns.has(col.key as string)}
                  sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#CBD5E1", "&.Mui-checked": { color: "#1D4ED8" } }} />
                <ListItemText primary={col.label} primaryTypographyProps={{ fontSize: "13.5px", color: isDark ? "#D4D4D8" : "#334155" }} />
              </MenuItem>
            ))}
          </Menu>

          <SortPopover
            anchor={sortAnchor} onClose={() => setSortAnchor(null)}
            sorts={activeSorts} onChange={setActiveSorts}
            columns={TASK_SORT_COLUMNS}
          />

          {/* -- Bulk action bar -- */}
          {selected.length > 0 && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-sm flex-wrap ${isDark ? "bg-[#18181B] border-[#27272A]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1D4ED8] text-white flex items-center justify-center text-[12px]">{selected.length}</span>
                <span className={`text-[14px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>selected</span>
              </div>
              <div className={`w-px h-4 hidden sm:block ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
              <button className={`text-[14px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>Update Status</button>
              <button className={`text-[14px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>Assign Owner</button>
              <button onClick={() => setSelected([])} className={`sm:ml-auto text-[14px] font-medium transition-colors ${isDark ? "text-[#9CA3AF] hover:text-[#A1A1AA]" : "text-slate-400 hover:text-slate-600"}`}>Clear</button>
              <button className={`flex items-center gap-1.5 text-[14px] font-medium transition-colors ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"}`}>
                <Trash size={14} weight="duotone" /> Delete
              </button>
            </div>
          )}

          {/* -- GRID -- */}
          {view === "grid" && <TaskGridView tasks={sorted} />}

          {/* -- Table (MUI DataGrid) -- */}
          {view === "list" && (
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`} style={{ height: 600 }}>
            <DataGrid<TaskRecord>
              rows={sorted}
              columns={gridColumns.filter(c => c.field === "actions" || visibleColumns.has(c.field))}
              getRowId={row => row.id}
              checkboxSelection
              disableRowSelectionOnClick
              disableColumnMenu
              rowHeight={44}
              columnHeaderHeight={40}
              rowSelectionModel={selected}
              onRowSelectionModelChange={model => setSelected(model as number[])}
              onRowClick={params => router.push(`/tasks/${params.id}`)}
              initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
              pageSizeOptions={ROWS_PER_PAGE_OPTIONS}
              slots={{
                noRowsOverlay: () => (
                  <div className="py-16 text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-[#27272A]" : "bg-[#f9fbff]"}`}>
                      <CheckCircle size={22} color={isDark ? "#3F3F46" : "#94A3B8"} weight="duotone" />
                    </div>
                    <p className={`font-heading text-sm font-semibold ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>No tasks found</p>
                    <p className={`text-xs mt-1 ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>Try adjusting your search or filter</p>
                  </div>
                ),
              }}
              sx={getDataGridSx(isDark)}
            />
          </div>
          )}

        </main>

      <NewTaskDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <FiltersDrawer
        anchor={filtersAnchor} onClose={() => setFiltersAnchor(null)}
        filters={activeFilters} onChange={setActiveFilters}
        columns={TASK_FILTER_COLUMNS}
        subtitle="Narrow down tasks by conditions"
      />

      {/* -- More menu -- */}
      <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}
        PaperProps={{ sx: { borderRadius: "12px", border: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(12,36,114,0.10)", minWidth: 160 } }}>
        {[
          { label: "Export",     icon: Copy,         color: isDark ? "#D4D4D8" : "#334155" },
          { label: "Import",     icon: PencilSimple, color: isDark ? "#D4D4D8" : "#334155" },
          { label: "Delete All", icon: Trash,        color: "#EF4444" },
        ].map(opt => (
          <MenuItem key={opt.label} onClick={() => setMoreAnchor(null)}
            sx={{ mx: 0.5, borderRadius: "8px", py: 1, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <opt.icon size={15} color={opt.color} weight="duotone" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: "14px", fontWeight: 500, color: opt.color === "#EF4444" ? "#EF4444" : (isDark ? "#D4D4D8" : "#334155") }}>
              {opt.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
