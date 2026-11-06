"use client";
import { useState, useRef, type ElementType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewLeadDrawer from "@/components/leads/NewLeadDrawer";
import FiltersDrawer, { type FilterRow } from "@/components/leads/FiltersDrawer";
import ColumnsDrawer, { COLUMN_GROUPS, DEFAULT_COLUMNS } from "@/components/leads/ColumnsDrawer";
import SortPopover, { type SortRow } from "@/components/leads/SortPopover";
import LeadGridView from "@/components/leads/LeadGridView";
import LeadKanbanView from "@/components/leads/LeadKanbanView";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { getDataGridSx } from "@/lib/dataGridStyles";
import {
  Plus, MagnifyingGlass, SlidersHorizontal, SortAscending, Columns,
  DotsThreeVertical, ArrowsDownUp, ListIcon, GridFour, Kanban,
  CaretDown, House, CaretRight, Trash, UserCheck, NotePencil, Phone,
  FunnelSimple, PencilSimple, Eye,
  IdentificationBadge, Buildings, Envelope, Pulse, UserCircle, CalendarBlank,
} from "@phosphor-icons/react";
import { LEAD_AVATARS, OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
type LeadStatus = "New" | "Contacted" | "Qualified" | "In Progress" | "Lost" | "Unqualified";

interface Lead {
  id: number; name: string; company: string; email: string; mobile: string;
  status: LeadStatus; owner: string; ownerInitials: string; created: string;
  leadSource: string; rating: string;
}

// ─────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────
const ALL_LEADS: Lead[] = [
  { id:1,  name:"Mrs. Shobha R",      company:"Shobha Realty",    email:"",                     mobile:"",               status:"New",         owner:"PM SDL",    ownerInitials:"PM", created:"27 May 2026", leadSource:"Web",       rating:"Hot"  },
  { id:2,  name:"Priya Nair",         company:"Nair & Co",        email:"priya.nair@demo.com",  mobile:"9988776655",     status:"Contacted",   owner:"SE User 1", ownerInitials:"SU", created:"02 Feb 2025", leadSource:"Referral",  rating:"Warm" },
  { id:3,  name:"John Carter",        company:"Carter Traders",   email:"john.carter@demo.com", mobile:"9876543210",     status:"Qualified",   owner:"SE User 1", ownerInitials:"SU", created:"02 Feb 2025", leadSource:"Cold Call", rating:"Hot"  },
  { id:4,  name:"Sudha R",            company:"ddd",              email:"Sudha@gmail.com",      mobile:"76656564456544", status:"In Progress", owner:"Admin",     ownerInitials:"AD", created:"22 Jul 2025", leadSource:"",          rating:"Cold" },
  { id:5,  name:"Jaya 56678",         company:"",                 email:"",                     mobile:"76656564456544", status:"New",         owner:"Admin",     ownerInitials:"AD", created:"22 Jul 2025", leadSource:"Web",       rating:""     },
  { id:6,  name:"Leo $#$#$#",         company:"",                 email:"",                     mobile:"7865443322",     status:"Unqualified", owner:"Admin",     ownerInitials:"AD", created:"22 Jul 2025", leadSource:"",          rating:"Cold" },
  { id:7,  name:"gfdsfs%$%^$^%$",    company:"",                 email:"",                     mobile:"9876543212",     status:"Lost",        owner:"Admin",     ownerInitials:"AD", created:"22 Jul 2025", leadSource:"",          rating:""     },
  { id:8,  name:"335634656",          company:"",                 email:"",                     mobile:"675432124578",   status:"New",         owner:"Admin",     ownerInitials:"AD", created:"22 Jul 2025", leadSource:"",          rating:""     },
  { id:9,  name:"Leo",                company:"",                 email:"",                     mobile:"6757567456",     status:"Contacted",   owner:"Admin",     ownerInitials:"AD", created:"22 Jul 2025", leadSource:"Web",       rating:"Cold" },
  { id:10, name:"James Wilson",       company:"Wilson & Partners",email:"james@wilson.com",     mobile:"9876541234",     status:"Qualified",   owner:"PM SDL",    ownerInitials:"PM", created:"15 May 2026", leadSource:"Referral",  rating:"Hot"  },
  { id:11, name:"Sara Kim",           company:"TechFlow Ltd",     email:"sara.kim@techflow.io", mobile:"8765432109",     status:"In Progress", owner:"SE User 1", ownerInitials:"SU", created:"10 Apr 2026", leadSource:"Trade Show",rating:"Warm" },
  { id:12, name:"Raj Mehta",          company:"Apex Group",       email:"raj@apex.in",          mobile:"9845123456",     status:"New",         owner:"Admin",     ownerInitials:"AD", created:"08 Mar 2026", leadSource:"Web",       rating:"Hot"  },
];

// ─────────────────────────────────────────────
//  Status config
// ─────────────────────────────────────────────
const STATUS_CFG: Record<LeadStatus, { bg: string; text: string; dot: string; bgDark: string; textDark: string }> = {
  "New":         { bg:"#EFF6FF", text:"#0C2472", dot:"#94A3B8", bgDark:"rgba(96, 165, 250, 0.15)", textDark:"#60A5FA" },
  "Contacted":   { bg:"#E3ECFC", text:"#0C2472", dot:"#3B82F6", bgDark:"rgba(52, 211, 153, 0.15)", textDark:"#34D399" },
  "Qualified":   { bg:"#DCFCE7", text:"#166534", dot:"#16A34A", bgDark:"rgba(16, 185, 129, 0.15)", textDark:"#E2E8F0" },
  "In Progress": { bg:"#E3ECFC", text:"#0C2472", dot:"#1D4ED8", bgDark:"rgba(251, 191, 36, 0.15)", textDark:"#FBBF24" },
  "Lost":        { bg:"#FEF2F2", text:"#991B1B", dot:"#EF4444", bgDark:"rgba(244, 63, 94, 0.15)", textDark:"#E2E8F0" },
  "Unqualified": { bg:"#EFF6FF", text:"#475569", dot:"#94A3B8", bgDark:"rgba(168, 85, 247, 0.15)", textDark:"#A855F7" },
};

const TABS: Array<{ key: LeadStatus | "All"; label: string }> = [
  { key:"All",         label:"All"         },
  { key:"New",         label:"New"         },
  { key:"Contacted",   label:"Contacted"   },
  { key:"In Progress", label:"In Progress" },
  { key:"Qualified",   label:"Qualified"   },
  { key:"Lost",        label:"Lost"        },
  { key:"Unqualified", label:"Unqualified" },
];

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%AVATAR_PAL.length];
const initials    = (n: string) => { const p=n.trim().split(/\s+/); return p.length>=2?(p[0][0]+p[1][0]).toUpperCase():n.substring(0,2).toUpperCase(); };

// Maps logical filter/sort column keys (used by FiltersDrawer/SortPopover) to actual Lead fields
const FIELD_MAP: Record<string, keyof Lead | undefined> = {
  name: "name", company: "company", email: "email", mobile: "mobile", phone: "mobile",
  leadStatus: "status", leadSource: "leadSource", rating: "rating",
  leadOwner: "owner", creation: "created", modified: "created",
};
const getField = (lead: Lead, column: string): string => {
  const key = FIELD_MAP[column];
  return key ? String(lead[key] ?? "") : "";
};

// Filter columns scoped to fields that actually exist on a Lead (FIELD_MAP keys)
const LEAD_FILTER_COLUMNS = [
  { value: "name",       label: "CRM Lead · Lead Name"  },
  { value: "company",    label: "CRM Lead · Company"     },
  { value: "email",      label: "CRM Lead · Email"       },
  { value: "mobile",     label: "CRM Lead · Mobile"      },
  { value: "leadStatus", label: "CRM Lead · Lead Status" },
  { value: "leadSource", label: "CRM Lead · Lead Source" },
  { value: "rating",     label: "CRM Lead · Rating"      },
  { value: "leadOwner",  label: "CRM Lead · Lead Owner"  },
  { value: "creation",   label: "CRM Lead · Created"     },
];

const OWNERS: { name: string; initials: string }[] = [
  { name: "PM SDL",    initials: "PM" },
  { name: "SE User 1", initials: "SU" },
  { name: "Admin",     initials: "AD" },
];
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

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

// ─────────────────────────────────────────────
//  All column definitions (for list view)
// ─────────────────────────────────────────────
const COL_DEFS: { key: string; label: string; width: string }[] = [
  { key:"leadName",    label:"Lead Name",  width:"1fr"   },
  { key:"company",     label:"Company",    width:"140px" },
  { key:"email",       label:"Email",      width:"190px" },
  { key:"mobile",      label:"Mobile",     width:"135px" },
  { key:"leadStatus",  label:"Status",     width:"125px" },
  { key:"leadOwner",   label:"Lead Owner", width:"145px" },
  { key:"creation",    label:"Created",    width:"110px" },
];

// ─────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────
export default function LeadsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ── Data (mutable copy so bulk actions / delete can update it)
  const [leads, setLeads] = useState<Lead[]>(ALL_LEADS);

  // ── View & selection state
  const [selected, setSelected] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch]       = useState("");
  const [view, setView]           = useState<"list" | "grid" | "kanban">("list");

  // ── Panel state
  const [drawerOpen,   setDrawerOpen]   = useState(false);   // New Lead
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [columnsOpen,  setColumnsOpen]  = useState(false);
  const [sortAnchor,   setSortAnchor]   = useState<HTMLElement | null>(null);

  // ── Filter / Sort / Columns data
  const [activeFilters, setActiveFilters] = useState<FilterRow[]>([]);
  const [activeSorts,   setActiveSorts]   = useState<SortRow[]>([]);
  const [visibleCols,   setVisibleCols]   = useState<Set<string>>(new Set(DEFAULT_COLUMNS));

  // ── Pagination
  const [page, setPage]               = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // ── Bulk action menus
  const [ownerMenuAnchor,  setOwnerMenuAnchor]  = useState<HTMLElement | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<HTMLElement | null>(null);

  // ── Row action menu
  const [rowMenuAnchor, setRowMenuAnchor] = useState<HTMLElement | null>(null);
  const [rowMenuLeadId, setRowMenuLeadId] = useState<number | null>(null);

  // ── Counts per status
  const counts: Record<string, number> = { All: leads.length };
  leads.forEach(l => { counts[l.status] = (counts[l.status] ?? 0) + 1; });

  // ── Filtered list
  const filtered = leads.filter(l => {
    const matchTab    = activeTab === "All" || l.status === activeTab;
    const q           = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    // Apply active filters — rows combine left-to-right using each row's own AND/OR logic
    const evalRow = (f: FilterRow): boolean => {
      const val = getField(l, f.column);
      if (f.operator === "is_empty")     return !val;
      if (f.operator === "is_not_empty") return !!val;
      if (!f.value) return true;
      const v = f.value.toLowerCase();
      switch (f.operator) {
        case "contains":         return val.toLowerCase().includes(v);
        case "does_not_contain": return !val.toLowerCase().includes(v);
        case "equals":           return val.toLowerCase() === v;
        case "does_not_equal":   return val.toLowerCase() !== v;
        case "starts_with":      return val.toLowerCase().startsWith(v);
        case "ends_with":        return val.toLowerCase().endsWith(v);
        default: return true;
      }
    };
    const matchFilters = activeFilters.length === 0 ? true : activeFilters.reduce<boolean>((acc, f, idx) => {
      const result = evalRow(f);
      if (idx === 0) return result;
      return f.logic === "OR" ? acc || result : acc && result;
    }, true);
    return matchTab && matchSearch && matchFilters;
  });

  // ── Sorted list (multi-level: first sort row is primary, subsequent rows tie-break)
  const sorted = activeSorts.length === 0 ? filtered : [...filtered].sort((a, b) => {
    for (const s of activeSorts) {
      const av = getField(a, s.column);
      const bv = getField(b, s.column);
      let cmp: number;
      if (s.column === "creation" || s.column === "modified") {
        cmp = new Date(av).getTime() - new Date(bv).getTime();
      } else {
        cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
      }
      if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  const resetToFirstPage = () => setPage(1);

  // ── Bulk actions
  const assignOwner = (owner: { name: string; initials: string }) => {
    setLeads(prev => prev.map(l => selected.includes(l.id) ? { ...l, owner: owner.name, ownerInitials: owner.initials } : l));
    setOwnerMenuAnchor(null);
  };
  const updateStatus = (status: LeadStatus) => {
    setLeads(prev => prev.map(l => selected.includes(l.id) ? { ...l, status } : l));
    setStatusMenuAnchor(null);
  };
  const deleteSelected = () => {
    setLeads(prev => prev.filter(l => !selected.includes(l.id)));
    setSelected([]);
  };
  const deleteLead = (id: number) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelected(prev => prev.filter(x => x !== id));
    setRowMenuAnchor(null);
  };

  // ── DataGrid column builders, keyed by COL_DEFS.key
  const COLUMN_BUILDERS: Record<string, GridColDef<Lead>> = {
    leadName: {
      field: "leadName", headerName: "Lead Name", flex: 2, minWidth: 180, sortable: false,
      renderHeader: () => <ColHeader label="Lead Name" icon={IdentificationBadge} />,
      renderCell: (params) => {
        const lead = params.row;
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar src={LEAD_AVATARS[lead.id]} sx={{ width: 28, height: 28, bgcolor: avatarColor(lead.name), fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>{initials(lead.name)}</Avatar>
            <p className={`m-0 font-heading text-[15px]/[20px] font-medium truncate ${isDark ? "text-[#FFFFFF]" : "text-slate-800"}`}>{lead.name}</p>
          </div>
        );
      },
    },
    company: {
      field: "company", headerName: "Company", flex: 1.3, minWidth: 120, sortable: false,
      renderHeader: () => <ColHeader label="Company" icon={Buildings} />,
      renderCell: (params) => (
        <div className={`text-[15px]/[20px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.company || <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </div>
      ),
    },
    email: {
      field: "email", headerName: "Email", flex: 1.7, minWidth: 160, sortable: false,
      renderHeader: () => <ColHeader label="Email" icon={Envelope} />,
      renderCell: (params) => (
        <Tooltip title={params.row.email} placement="top">
          <div className="text-[15px]/[20px] truncate w-full">
            {params.row.email
              ? <span className={`hover:underline cursor-pointer ${isDark ? "text-[#D4D4D8]" : "text-inherit"}`}>{params.row.email}</span>
              : <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
          </div>
        </Tooltip>
      ),
    },
    mobile: {
      field: "mobile", headerName: "Mobile", flex: 1.2, minWidth: 120, sortable: false,
      renderHeader: () => <ColHeader label="Mobile" icon={Phone} />,
      renderCell: (params) => (
        <div className={`text-[15px]/[20px] font-mono truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
          {params.row.mobile
            ? <span className="flex items-center gap-1"><Phone size={11} color="#94A3B8" weight="duotone" />{params.row.mobile}</span>
            : <span className={isDark ? "text-[#52525B]" : "text-slate-200"}>—</span>}
        </div>
      ),
    },
    leadStatus: {
      field: "leadStatus", headerName: "Status", flex: 1.1, minWidth: 110, sortable: false,
      renderHeader: () => <ColHeader label="Status" icon={Pulse} />,
      renderCell: (params) => {
        const cfg = STATUS_CFG[params.row.status];
        return (
          <span className="self-center inline-flex items-center gap-1.5 text-[13px] font-medium px-2 py-[3px] rounded-full leading-none"
            style={{ backgroundColor: isDark ? cfg.bgDark : cfg.bg, color: isDark ? cfg.textDark : cfg.text }}>
            <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? cfg.textDark : cfg.dot }} />
            {params.row.status}
          </span>
        );
      },
    },
    leadOwner: {
      field: "leadOwner", headerName: "Lead Owner", flex: 1.3, minWidth: 130, sortable: false,
      renderHeader: () => <ColHeader label="Lead Owner" icon={UserCircle} />,
      renderCell: (params) => {
        const lead = params.row;
        return (
          <Tooltip title={lead.owner} placement="top">
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar src={OWNER_AVATARS[lead.owner]} sx={{ width: 20, height: 20, bgcolor: avatarColor(lead.owner), fontSize: "0.58rem", fontWeight: 800, flexShrink: 0 }}>{lead.ownerInitials}</Avatar>
              <span className={`text-[13px]/[16px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>{lead.owner}</span>
            </div>
          </Tooltip>
        );
      },
    },
    creation: {
      field: "creation", headerName: "Created", flex: 1, minWidth: 100, sortable: false,
      renderHeader: () => <ColHeader label="Created" icon={CalendarBlank} />,
      renderCell: (params) => <div className={`text-[13px]/[16px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{params.row.created}</div>,
    },
  };

  const gridColumns: GridColDef<Lead>[] = [
    ...COL_DEFS.filter(c => visibleCols.has(c.key)).map(c => COLUMN_BUILDERS[c.key]),
    {
      field: "actions", headerName: "", width: 50, sortable: false, disableColumnMenu: true,
      renderCell: (params) => (
        <div className="flex justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip title="Actions">
            <IconButton size="small" onClick={e => { e.stopPropagation(); setRowMenuAnchor(e.currentTarget); setRowMenuLeadId(params.row.id); }}
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

          {/* ══ Page header ══ */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className={`flex items-center gap-1.5 text-[13.5px]/[18px] mb-1 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
                <House size={16} weight="duotone" />
                <CaretRight size={12} weight="duotone" />
                <Link href="/leads" className={`transition-colors font-medium ${isDark ? "hover:text-[#D4D4D8]" : "hover:text-[#1D4ED8]"}`}>Leads</Link>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="font-heading text-lg sm:text-[22px]/[28px] font-semibold text-slate-900 tracking-tight m-0">Leads</h1>
                <span className={`text-[12px] sm:text-[13px]/[16px] font-medium border px-2 sm:px-2.5 py-1 rounded-full shadow-sm flex items-center whitespace-nowrap ${isDark ? "bg-[#0A0A0A] border-[#27272A] text-[#E4E4E7]" : "bg-[#f9fbff] border-[#E3ECFC] text-slate-400"}`}>
                  {leads.length} total
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* View toggle - hidden on mobile, show on sm+ */}
              <div className={`hidden sm:flex items-center rounded-xl p-0.5 gap-0.5 shadow-sm border ${isDark ? "bg-[#000000] border-[#27272A]" : "bg-white border-slate-100"}`}>
                {[
                  { k:"list",   Icon:ListIcon,     label:"List"   },
                  { k:"grid",   Icon:GridFour,    label:"Grid"   },
                  { k:"kanban", Icon:Kanban,      label:"Kanban" },
                ].map(({ k, Icon, label }) => (
                  <button key={k} onClick={() => setView(k as typeof view)}
                    className={`flex items-center gap-1 px-2 py-[6px] rounded-lg text-[13px]/[16px] font-medium transition-all ${
                      view === k
                        ? isDark ? "bg-[#18181B] text-[#D4D4D8]" : "bg-[#f9fbff] text-[#1D4ED8]"
                        : isDark ? "text-[#E4E4E7] hover:bg-[#27272A] hover:text-[#D4D4D8]" : "bg-[#f9fbff] text-slate-400 hover:bg-[#E3ECFC]"
                    }`}>
                    <Icon size={14} weight="duotone" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <Button variant="contained" startIcon={<Plus size={16} weight="bold" />}
                onClick={() => setDrawerOpen(true)}
                sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius:"9px", textTransform:"none", fontWeight:500, fontSize:{ xs: "13px", sm: "15px" }, px: { xs: 1.5, sm: 2 }, py: 0.75, flex: { xs: 1, sm: "unset" }, boxShadow: isDark ? "none" : "0 1px 8px 0 #1D4ED833", "&:hover":{ bgcolor: isDark ? "#3F3F46" : "#2563EB", boxShadow: isDark ? "none" : "0 2px 14px 0 #60A5FA55" }, "&:active":{ bgcolor: isDark ? "#52525B" : "#0C2472" } }}>
                <span className="hidden sm:inline">New Lead</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* ══ Status tabs ══ */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {TABS.map(({ key, label }) => {
              const cnt = counts[key] ?? 0;
              const active = activeTab === key;
              if (key !== "All" && cnt === 0) return null;
              return (
                <button key={key} onClick={() => { setActiveTab(key); resetToFirstPage(); }}
                  className={`flex items-center gap-1.5 px-3 py-[7px] rounded-xl text-[14px]/[18px] font-medium whitespace-nowrap transition-all border ${
                    active ? isDark ? "bg-[#18181B] text-white shadow-sm shadow-[#27272A]/10 border-[#27272A]" : "bg-[#1D4ED8] text-white shadow-sm shadow-[#1D4ED8]/25 border-[#1D4ED8]"
                           : isDark ? "bg-[#0A0A0A] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A] hover:text-[#FFFFFF]" : "bg-[#f9fbff] text-[#0C2472] border-[#E3ECFC] hover:bg-[#E3ECFC]"
                  }`}>
                  {label}
                  <span className={`text-[13px]/[16px] font-medium px-1.5 py-0.5 rounded-full leading-none ${
                    active ? "bg-white/20 text-white" : "bg-[#1D4ED8]/10 text-[#0C2472]"
                  }`}>{cnt}</span>
                </button>
              );
            })}
          </div>

          {/* ══ Toolbar: Search | Filters | Columns | Sort ══ */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 sm:w-72 focus-within:border-[#60A5FA] focus-within:border-2 focus-within:shadow-[0_0_0_2px_#60A5FA] transition-all ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <MagnifyingGlass size={15} color="#94A3B8" weight="duotone" />
              <InputBase placeholder="Search by name, company, email…" value={search}
                onChange={e => { setSearch(e.target.value); resetToFirstPage(); }}
                sx={{ flex:1, fontSize:"0.86rem", color: isDark ? "#D4D4D8" : "#334155", "& input::placeholder":{ color:"#94A3B8", opacity:1 } }}
              />
              {search && <button onClick={() => { setSearch(""); resetToFirstPage(); }} className="text-slate-300 hover:text-slate-500 transition-colors text-[15px]/[20px]">✕</button>}
            </div>

            {/* Filters button */}
            <Button variant="outlined" size="small"
              startIcon={
                activeFilters.length > 0
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

            {/* Columns button */}
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

            {/* Sort button */}
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

            <span className={`ml-auto text-[13px]/[16px] px-3 py-1.5 rounded-lg ${isDark ? "text-[#E4E4E7] bg-[#0A0A0A]" : "text-slate-400 bg-[#f9fbff]"}`}>
              {sorted.length} of {leads.length} records
            </span>
          </div>

          {/* ══ Bulk action bar ══ */}
          {selected.length > 0 && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border animate-slide-up shadow-sm ${isDark ? "bg-[#18181B] border-[#27272A]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#1D4ED8] text-white flex items-center justify-center text-[13px]/[16px] font-medium">{selected.length}</span>
                <span className={`text-[14px]/[18px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>selected</span>
              </div>
              <div className={`w-px h-4 ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
              <button onClick={e => setOwnerMenuAnchor(e.currentTarget)} className={`flex items-center gap-1.5 text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>
                <UserCheck size={14} weight="duotone" /> Assign Owner
              </button>
              <button onClick={e => setStatusMenuAnchor(e.currentTarget)} className={`flex items-center gap-1.5 text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA]" : "text-[#1D4ED8] hover:text-[#0C2472]"}`}>
                <NotePencil size={14} weight="duotone" /> Update Status
              </button>
              <button onClick={() => setSelected([])} className={`ml-auto text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-[#E4E4E7] hover:text-[#A1A1AA]" : "text-slate-400 hover:text-slate-600"}`}>Clear</button>
              <button onClick={deleteSelected} className={`flex items-center gap-1.5 text-[14px]/[18px] font-medium transition-colors ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"}`}>
                <Trash size={14} weight="duotone" /> Delete
              </button>
            </div>
          )}

          {/* ══ Bulk action menus ══ */}
          <Menu anchorEl={ownerMenuAnchor} open={Boolean(ownerMenuAnchor)} onClose={() => setOwnerMenuAnchor(null)}>
            {OWNERS.map(o => (
              <MenuItem key={o.name} onClick={() => assignOwner(o)} sx={{ fontSize: "0.9rem", gap: 1 }}>
                <Avatar sx={{ width: 20, height: 20, bgcolor: avatarColor(o.name), fontSize: "0.6rem", fontWeight: 800 }}>{o.initials}</Avatar>
                {o.name}
              </MenuItem>
            ))}
          </Menu>
          <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={() => setStatusMenuAnchor(null)}>
            {TABS.filter(t => t.key !== "All").map(t => (
              <MenuItem key={t.key} onClick={() => updateStatus(t.key as LeadStatus)} sx={{ fontSize: "0.9rem" }}>
                {t.label}
              </MenuItem>
            ))}
          </Menu>

          {/* ══ GRID VIEW ══ */}
          {view === "grid" && <LeadGridView leads={sorted} />}

          {/* ══ KANBAN VIEW ══ */}
          {view === "kanban" && <LeadKanbanView leads={sorted} />}

          {/* ══ LIST VIEW (MUI DataGrid) ══ */}
          {view === "list" && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`} style={{ height: 600 }}>
              <DataGrid<Lead>
                rows={sorted}
                columns={gridColumns}
                getRowId={row => row.id}
                checkboxSelection
                disableRowSelectionOnClick
                disableColumnMenu
                rowHeight={44}
                columnHeaderHeight={40}
                rowSelectionModel={selected}
                onRowSelectionModelChange={model => setSelected(model as number[])}
                onRowClick={params => router.push(`/leads/${params.id}`)}
                paginationModel={{ page: page - 1, pageSize: rowsPerPage }}
                onPaginationModelChange={model => { setPage(model.page + 1); setRowsPerPage(model.pageSize); }}
                pageSizeOptions={ROWS_PER_PAGE_OPTIONS}
                slots={{
                  noRowsOverlay: () => (
                    <div className="py-16 text-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
                        <MagnifyingGlass size={22} color={isDark ? "#E4E4E7" : "#94A3B8"} weight="duotone" />
                      </div>
                      <p className={`font-heading text-[15px]/[20px] font-semibold ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>No leads found</p>
                      <p className={`text-[13px]/[16px] mt-1 ${isDark ? "text-[#E4E4E7]" : "text-slate-300"}`}>Try adjusting your search, filters or tab</p>
                    </div>
                  ),
                }}
                sx={getDataGridSx(isDark)}
              />
            </div>
          )}

          {/* ══ Row action menu ══ */}
          <Menu anchorEl={rowMenuAnchor} open={Boolean(rowMenuAnchor)} onClose={() => setRowMenuAnchor(null)}>
            <MenuItem onClick={() => { if (rowMenuLeadId) router.push(`/leads/${rowMenuLeadId}`); setRowMenuAnchor(null); }} sx={{ fontSize: "0.9rem", gap: 1 }}>
              <Eye size={14} weight="duotone" /> View
            </MenuItem>
            <MenuItem onClick={() => { if (rowMenuLeadId) router.push(`/leads/${rowMenuLeadId}`); setRowMenuAnchor(null); }} sx={{ fontSize: "0.9rem", gap: 1 }}>
              <PencilSimple size={14} weight="duotone" /> Edit
            </MenuItem>
            <MenuItem onClick={() => rowMenuLeadId && deleteLead(rowMenuLeadId)} sx={{ fontSize: "0.9rem", gap: 1, color: "#EF4444" }}>
              <Trash size={14} weight="duotone" /> Delete
            </MenuItem>
          </Menu>
        </main>

      {/* ══ Panels ══ */}
      <NewLeadDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <FiltersDrawer
        anchor={filtersAnchor}
        onClose={() => setFiltersAnchor(null)}
        filters={activeFilters}
        onChange={f => { setActiveFilters(f); resetToFirstPage(); }}
        columns={LEAD_FILTER_COLUMNS}
      />

      <ColumnsDrawer
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        selected={visibleCols}
        onChange={setVisibleCols}
      />

      <SortPopover
        anchor={sortAnchor}
        onClose={() => setSortAnchor(null)}
        sorts={activeSorts}
        onChange={s => { setActiveSorts(s); resetToFirstPage(); }}
      />
    </div>
  );
}


