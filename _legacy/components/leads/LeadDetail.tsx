"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import NewLeadDrawer from "@/components/leads/NewLeadDrawer";
import ConvertToDealDrawer from "@/components/leads/ConvertToDealDrawer";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InputBase from "@mui/material/InputBase";
// Phosphor Duotone Icons
import {
  House, CaretRight, PencilSimple, Phone, Envelope,
  DotsThreeVertical, Check, Note, ClipboardText, Paperclip,
  ClockCounterClockwise, User, AddressBook, TrendUp, Buildings,
  ArrowsLeftRight, Star, Clock, UserPlus, Copy, DownloadSimple,
  Trash, Users,
} from "@phosphor-icons/react";
import { LEAD_AVATARS, OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Types & data
// ─────────────────────────────────────────────
type LeadStatus = "New" | "Contacted" | "In Progress" | "Qualified" | "Lost" | "Unqualified";

interface LeadRecord {
  id: number; salutation: string; firstName: string; lastName: string;
  company: string; title: string; email: string; phone: string;
  mobile: string; fax: string; website: string; status: LeadStatus;
  leadSource: string; industry: string; rating: string;
  noOfEmployees: string; annualRevenue: string; owner: string;
  ownerInitials: string; ownerColor: string; created: string;
  modified: string; emailOptOut: boolean; description: string;
}

const LEADS: Record<number, LeadRecord> = {
  1:  { id:1,  salutation:"Mrs.", firstName:"Shobha",    lastName:"R",       company:"Shobha Realty",     title:"Director",  email:"",                      phone:"",            mobile:"",               fax:"", website:"www.shobarealty.in",     status:"New",         leadSource:"Web",         industry:"Real Estate",   rating:"Hot",  noOfEmployees:"1–10",   annualRevenue:"",         owner:"PM SDL",    ownerInitials:"PM", ownerColor:"#1D4ED8", created:"27 May 2026", modified:"27 May 2026", emailOptOut:false, description:"" },
  2:  { id:2,  salutation:"Ms.",  firstName:"Priya",     lastName:"Nair",    company:"Nair & Co",         title:"Manager",   email:"priya.nair@demo.com",    phone:"04425561234", mobile:"9988776655",     fax:"", website:"",                      status:"Contacted",    leadSource:"Referral",    industry:"Finance",       rating:"Warm", noOfEmployees:"11–50",  annualRevenue:"2500000",  owner:"SE User 1", ownerInitials:"SU", ownerColor:"#3B82F6", created:"02 Feb 2025", modified:"15 Apr 2026", emailOptOut:false, description:"Interested in enterprise plan." },
  3:  { id:3,  salutation:"Mr.",  firstName:"John",      lastName:"Carter",  company:"Carter Traders",    title:"CEO",       email:"john.carter@demo.com",   phone:"",            mobile:"9876543210",     fax:"", website:"www.cartertraders.com", status:"Qualified",    leadSource:"Cold Call",   industry:"Retail",        rating:"Hot",  noOfEmployees:"51–200", annualRevenue:"8000000",  owner:"SE User 1", ownerInitials:"SU", ownerColor:"#3B82F6", created:"02 Feb 2025", modified:"10 May 2026", emailOptOut:false, description:"Looking for bulk pricing. Follow up next week." },
  4:  { id:4,  salutation:"Mrs.", firstName:"Sudha",     lastName:"R",       company:"ddd",               title:"",          email:"Sudha@gmail.com",        phone:"",            mobile:"76656564456544", fax:"", website:"",                      status:"In Progress",  leadSource:"Advertisement",industry:"Other",          rating:"Cold", noOfEmployees:"1–10",   annualRevenue:"",         owner:"Admin",     ownerInitials:"AD", ownerColor:"#0C2472", created:"22 Jul 2025", modified:"22 Jul 2025", emailOptOut:false, description:"" },
  5:  { id:5,  salutation:"",     firstName:"Jaya",      lastName:"56678",   company:"",                  title:"",          email:"",                       phone:"",            mobile:"76656564456544", fax:"", website:"",                      status:"New",          leadSource:"Web",         industry:"",              rating:"",     noOfEmployees:"",       annualRevenue:"",         owner:"Admin",     ownerInitials:"AD", ownerColor:"#0C2472", created:"22 Jul 2025", modified:"22 Jul 2025", emailOptOut:false, description:"" },
  6:  { id:6,  salutation:"Mr.",  firstName:"Leo",       lastName:"",        company:"",                  title:"",          email:"",                       phone:"",            mobile:"7865443322",     fax:"", website:"",                      status:"Unqualified",  leadSource:"Web",         industry:"",              rating:"Cold", noOfEmployees:"",       annualRevenue:"",         owner:"Admin",     ownerInitials:"AD", ownerColor:"#0C2472", created:"22 Jul 2025", modified:"22 Jul 2025", emailOptOut:false, description:"" },
  7:  { id:7,  salutation:"",     firstName:"gfdsfs",    lastName:"",        company:"",                  title:"",          email:"",                       phone:"",            mobile:"9876543212",     fax:"", website:"",                      status:"Lost",         leadSource:"",            industry:"",              rating:"",     noOfEmployees:"",       annualRevenue:"",         owner:"Admin",     ownerInitials:"AD", ownerColor:"#0C2472", created:"22 Jul 2025", modified:"22 Jul 2025", emailOptOut:false, description:"" },
  8:  { id:8,  salutation:"",     firstName:"335634656", lastName:"",        company:"",                  title:"",          email:"",                       phone:"",            mobile:"675432124578",   fax:"", website:"",                      status:"New",          leadSource:"",            industry:"",              rating:"",     noOfEmployees:"",       annualRevenue:"",         owner:"Admin",     ownerInitials:"AD", ownerColor:"#0C2472", created:"22 Jul 2025", modified:"22 Jul 2025", emailOptOut:false, description:"" },
  9:  { id:9,  salutation:"Mr.",  firstName:"Leo",       lastName:"",        company:"",                  title:"",          email:"",                       phone:"",            mobile:"6757567456",     fax:"", website:"",                      status:"Contacted",    leadSource:"Web",         industry:"",              rating:"Cold", noOfEmployees:"",       annualRevenue:"",         owner:"Admin",     ownerInitials:"AD", ownerColor:"#0C2472", created:"22 Jul 2025", modified:"22 Jul 2025", emailOptOut:false, description:"" },
  10: { id:10, salutation:"Mr.",  firstName:"James",     lastName:"Wilson",  company:"Wilson & Partners", title:"Partner",   email:"james@wilson.com",       phone:"02244556677", mobile:"9876541234",     fax:"", website:"www.wilsonpartners.com",status:"Qualified",    leadSource:"Referral",    industry:"Finance",       rating:"Hot",  noOfEmployees:"11–50",  annualRevenue:"12000000", owner:"PM SDL",    ownerInitials:"PM", ownerColor:"#1D4ED8", created:"15 May 2026", modified:"28 May 2026", emailOptOut:false, description:"High-value lead via Apex Solutions." },
  11: { id:11, salutation:"Ms.",  firstName:"Sara",      lastName:"Kim",     company:"TechFlow Ltd",      title:"CTO",       email:"sara.kim@techflow.io",   phone:"",            mobile:"8765432109",     fax:"", website:"www.techflow.io",       status:"In Progress",  leadSource:"Trade Show",  industry:"Technology",    rating:"Warm", noOfEmployees:"51–200", annualRevenue:"5000000",  owner:"SE User 1", ownerInitials:"SU", ownerColor:"#3B82F6", created:"10 Apr 2026", modified:"20 May 2026", emailOptOut:false, description:"Met at TechSummit 2026. Needs platform demo." },
  12: { id:12, salutation:"Mr.",  firstName:"Raj",       lastName:"Mehta",   company:"Apex Group",        title:"MD",        email:"raj@apex.in",            phone:"08033445566", mobile:"9845123456",     fax:"", website:"www.apexgroup.in",      status:"New",          leadSource:"Web",         industry:"Manufacturing", rating:"Hot",  noOfEmployees:"200+",   annualRevenue:"50000000", owner:"Admin",     ownerInitials:"AD", ownerColor:"#0C2472", created:"08 Mar 2026", modified:"08 Mar 2026", emailOptOut:false, description:"" },
};

const STATUS_CFG: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  "New":         { bg:"#EFF6FF", text:"#0C2472", dot:"#94A3B8" },
  "Contacted":   { bg:"#E3ECFC", text:"#0C2472", dot:"#3B82F6" },
  "In Progress": { bg:"#E3ECFC", text:"#0C2472", dot:"#1D4ED8" },
  "Qualified":   { bg:"#DCFCE7", text:"#166534", dot:"#16A34A" },
  "Lost":        { bg:"#FEF2F2", text:"#991B1B", dot:"#EF4444" },
  "Unqualified": { bg:"#EFF6FF", text:"#475569", dot:"#94A3B8" },
};

const STATUS_CFG_DARK: Record<LeadStatus, { bg: string; text: string; dot: string }> = {
  "New":         { bg:"#18181B", text:"#D4D4D8", dot:"#D4D4D8" },
  "Contacted":   { bg:"#27272A", text:"#D4D4D8", dot:"#D4D4D8" },
  "In Progress": { bg:"#27272A", text:"#D4D4D8", dot:"#38BDF8" },
  "Qualified":   { bg:"#064E3B", text:"#E2E8F0", dot:"#10B981" },
  "Lost":        { bg:"#450A0A", text:"#E2E8F0", dot:"#EF4444" },
  "Unqualified": { bg:"#2D2D2D", text:"#D4D4D8", dot:"#9CA3AF" },
};

const PIPELINE: LeadStatus[] = ["New", "Contacted", "In Progress", "Qualified"];

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%AVATAR_PAL.length];
const initials = (n: string) => { const p = n.trim().split(/\s+/); return p.length>=2?(p[0][0]+p[1][0]).toUpperCase():n.substring(0,2).toUpperCase(); };

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
      <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
          <Icon size={13} color={isDark ? "#9CA3AF" : "#1D4ED8"} weight="duotone" />
        </div>
        <p className={`font-heading text-[12px] font-bold uppercase tracking-[0.12em] ${isDark ? "text-[#D4D4D8]" : "text-[#1D4ED8]"}`}>{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function KV({ label, value, blue }: { label: string; value?: string; blue?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="py-2 border-b border-[#EFF6FF] last:border-0">
      <p className={`font-heading text-[11.5px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{label}</p>
      <p className={`text-[14px] font-medium ${blue?"text-inherit":"text-slate-800"} ${!value?"text-slate-300 italic":""}`}>
        {value || "—"}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────
export default function LeadDetail({ leadId }: { leadId: number }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const lead = LEADS[leadId];

  // ── UI state ──
  const [activeTab, setActiveTab]         = useState<"overview"|"activity">("overview");
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead?.status ?? "New");
  const [editOpen, setEditOpen]           = useState(false);
  const [convertOpen, setConvertOpen]     = useState(false);
  const [moreAnchor, setMoreAnchor]       = useState<null|HTMLElement>(null);
  const [note, setNote]                   = useState("");
  const [notes, setNotes]                 = useState<{ text: string; at: string }[]>([
    { text: "Initial contact made…", at: lead?.modified ?? "" },
  ]);

  if (!lead) {
    return (
      <div className="flex h-screen bg-[#f9fbff]"><Sidebar />
        <div className="sidebar-content flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-slate-500 font-semibold">Lead not found</p>
          <button onClick={() => router.push("/leads")} className="text-[#1D4ED8] text-[15px] font-bold hover:underline">← Back to Leads</button>
        </div>
      </div>
    );
  }

  const fullName  = [lead.salutation, lead.firstName, lead.lastName].filter(Boolean).join(" ");
  const avColor   = avatarColor(fullName);
  const avInit    = initials(fullName || "?");
  const pipelineIdx = PIPELINE.indexOf(currentStatus);
  const cfg       = isDark ? STATUS_CFG_DARK[currentStatus] : STATUS_CFG[currentStatus];

  // Activity timeline items
  const actBg = isDark ? "#27272A" : "#EFF6FF";
  const activityFeed = [
    { icon: UserPlus,            color:"#2F6FED", bg:actBg, text:`Lead created by ${lead.owner}`,          time:lead.created  },
    { icon: TrendUp,             color:"#3B82F6", bg:actBg, text:`Status set to "${lead.status}"`,         time:lead.created  },
    { icon: Note,                color:"#7C3AED", bg:actBg, text:"Note added: Initial contact made…",      time:lead.modified },
    { icon: Envelope,            color:"#E0883F", bg:actBg, text:"Email sent to lead",                     time:lead.modified },
    { icon: Phone,               color:"#DB5E8C", bg:actBg, text:"Call logged — 5 min, no answer",         time:lead.modified },
  ];

  // More menu options
  const moreOptions = [
    { icon: Envelope,       label:"Send Email",      color:"#3B82F6" },
    { icon: Users,          label:"Assign to Team",  color:"#2E9E7B" },
    { icon: Copy,           label:"Duplicate Lead",  color:"#5B6CB5" },
    { icon: DownloadSimple, label:"Export as PDF",   color:"#94A3B8" },
    { type:"divider" as const },
    { icon: Trash,          label:"Delete Lead",     color:"#EF4444" },
  ];

  // Tasks & Calls (section content)
  const tasksData = [
    { subject:"Follow up call",        status:"To Do",  due:lead.modified },
    { subject:"Send proposal document", status:"To Do",  due:lead.modified },
  ];
  const callsData = [
    { summary:"Call logged — 5 min, no answer", time:lead.modified },
  ];

  // Related list → section mapping (Stage History links to the Timeline tab)
  const relatedItems = [
    { icon: Note,                label:"Notes",         count:notes.length,        color:"#7C3AED" },
    { icon: ClipboardText,       label:"Tasks",         count:tasksData.length,    color:"#3B82F6" },
    { icon: Phone,               label:"Calls",         count:callsData.length,    color:"#DB5E8C" },
    { icon: Envelope,            label:"Emails",        count:0,                   color:"#E0883F" },
    { icon: Paperclip,           label:"Attachments",   count:0,                   color:"#94A3B8" },
    { icon: ClockCounterClockwise,label:"Stage History", count:activityFeed.length, color: isDark?"#38BDF8":"#0C2472" },
  ];

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(prev => [{ text: note.trim(), at: "Just now" }, ...prev]);
    setNote("");
  };

  const handleRelatedClick = (label: string) => {
    if (label === "Stage History") { setActiveTab("activity"); return; }
    const id = `section-${label.toLowerCase()}`;
    if (activeTab !== "overview") {
      setActiveTab("overview");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" }), 50);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  };

  return (
    <div className="flex h-screen bg-transparent font-sans">
      <Sidebar />

      <div className={`sidebar-content flex-1 flex flex-col min-h-screen overflow-auto transition-colors duration-300 ${isDark ? "bg-[#000000]" : "bg-transparent"}`}>
        {/* <TopBar /> */}

        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-4 animate-fade-in">

          {/* ══ Breadcrumb ══ */}
          <div className={`flex items-center gap-1.5 text-[13.5px] ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>
            <House size={16} weight="duotone" />
            <CaretRight size={12} weight="duotone" />
            <Link href="/leads" className="hover:text-[#1D4ED8] transition-colors font-medium">Leads</Link>
            <CaretRight size={12} weight="duotone" />
            <span className="text-[#1D4ED8] font-semibold truncate max-w-[240px]">{fullName}</span>
          </div>

          {/* ══ Lead Header Card ══ */}
          <div className="bg-[#f9fbff] rounded-2xl border border-[#E3ECFC] shadow-sm px-5 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-shrink-0">
                <Avatar
                  src={LEAD_AVATARS[leadId]}
                  sx={{ width:56, height:56, bgcolor:avColor, fontSize:"1.2rem", fontWeight:800, boxShadow:"0 4px 14px 0 rgba(12,36,114,0.2)" }}
                >
                  {avInit}
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: cfg.dot }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                  <h1 className="m-0 text-[20px] font-extrabold text-slate-900 tracking-tight">{fullName}</h1>
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor:cfg.bg, color:cfg.text }}>
                    <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor:cfg.dot }} />
                    {currentStatus}
                  </span>
                </div>
                {lead.company && (
                  <p className="text-[14px] text-slate-500 font-medium flex items-center gap-1.5">
                    <Buildings size={13} color="#94A3B8" weight="duotone" />
                    {lead.company}
                    {lead.industry && <><span className="text-slate-300">·</span><span className={isDark ? "text-[#ABABAD]" : "text-slate-400"}>{lead.industry}</span></>}
                  </p>
                )}
                <p className={`text-[12px] mt-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>
                  Lead ID: CRM-LEAD-{String(lead.id).padStart(4,"0")} · Created {lead.created}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                {(lead.phone || lead.mobile) && (
                  <Button variant="outlined" size="small" startIcon={<Phone size={14} weight="duotone" />}
                    sx={{ borderColor: isDark?"#27272A":"#E3ECFC", color: isDark?"#B4B5B6":"#1D4ED8", borderRadius:"9px", textTransform:"none", fontWeight:600, fontSize:"0.84rem", bgcolor: isDark?"#0F0F0F":"transparent", "&:hover":{ borderColor:"#1D4ED8", color:"#1D4ED8", bgcolor: isDark?"#0A0A0A":"#EFF6FF" } }}>
                    Call
                  </Button>
                )}
                {lead.email && (
                  <Button variant="outlined" size="small" startIcon={<Envelope size={14} weight="duotone" />}
                    sx={{ borderColor: isDark?"#27272A":"#E3ECFC", color: isDark?"#B4B5B6":"#1D4ED8", borderRadius:"9px", textTransform:"none", fontWeight:600, fontSize:"0.84rem", bgcolor: isDark?"#0F0F0F":"transparent", "&:hover":{ borderColor:"#1D4ED8", color:"#1D4ED8", bgcolor: isDark?"#0A0A0A":"#EFF6FF" } }}>
                    Email
                  </Button>
                )}

                {/* Convert to Deal */}
                <Button variant="outlined" size="small" startIcon={<ArrowsLeftRight size={14} weight="duotone" />}
                  onClick={() => setConvertOpen(true)}
                  sx={{ borderColor: isDark?"#27272A":"#E3ECFC", color: isDark?"#B4B5B6":"#1D4ED8", borderRadius:"9px", textTransform:"none", fontWeight:700, fontSize:"0.84rem", bgcolor: isDark?"#0F0F0F":"transparent", "&:hover":{ borderColor:"#1D4ED8", color:"#1D4ED8", bgcolor: isDark?"#0A0A0A":"#EFF6FF" } }}>
                  Convert
                </Button>

                {/* Edit */}
                <Button variant="contained" size="small" startIcon={<PencilSimple size={14} weight="duotone" />}
                  onClick={() => setEditOpen(true)}
                  sx={{ bgcolor:"#1D4ED8", borderRadius:"9px", textTransform:"none", fontWeight:700, fontSize:"0.84rem", boxShadow:"0 1px 8px 0 #1D4ED833", "&:hover":{ bgcolor:"#60A5FA", boxShadow:"0 2px 14px 0 #60A5FA55" }, "&:active":{ bgcolor:"#0C2472" } }}>
                  Edit
                </Button>

                {/* Three-dot menu */}
                <IconButton size="small"
                  onClick={e => setMoreAnchor(e.currentTarget)}
                  sx={{ borderRadius:"8px", border: isDark?"1.5px solid #27272A":"1.5px solid #E3ECFC", bgcolor: moreAnchor ? (isDark?"#27272A":"#EFF6FF") : (isDark?"#0A0A0A":"transparent"), "&:hover":{ bgcolor: isDark?"#27272A":"#EFF6FF" } }}>
                  <DotsThreeVertical size={17} color="#94A3B8" weight="duotone" />
                </IconButton>

                {/* MUI Menu */}
                <Menu
                  anchorEl={moreAnchor}
                  open={Boolean(moreAnchor)}
                  onClose={() => setMoreAnchor(null)}
                  transformOrigin={{ horizontal:"right", vertical:"top" }}
                  anchorOrigin={{ horizontal:"right", vertical:"bottom" }}
                  PaperProps={{ sx: { borderRadius:"14px", border: isDark?"1.5px solid #27272A":"1.5px solid #E3ECFC", bgcolor: isDark?"#0A0A0A":"#fff", boxShadow: isDark?"0 8px 32px rgba(0,0,0,0.4)":"0 8px 32px rgba(12,36,114,0.12)", minWidth:200, mt:0.5 } }}
                >
                  {moreOptions.map((opt, i) =>
                    opt.type === "divider"
                      ? <Divider key={i} sx={{ my:0.5, borderColor: isDark?"#27272A":"#EFF6FF" }} />
                      : (
                        <MenuItem key={opt.label} onClick={() => setMoreAnchor(null)}
                          sx={{ mx:0.5, borderRadius:"8px", py:1, "&:hover":{ bgcolor: isDark?"#27272A":"#EFF6FF" } }}>
                          <ListItemIcon sx={{ minWidth:30 }}>
                            <opt.icon size={16} color={opt.color} weight="duotone" />
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ fontSize:"0.9rem", fontWeight:600, color: opt.color==="#EF4444"?"#EF4444": isDark?"#E2E8F0":"#334155" }}>
                            {opt.label}
                          </ListItemText>
                        </MenuItem>
                      )
                  )}
                </Menu>
              </div>
            </div>
          </div>

          {/* ══ Tab Bar ══ */}
          <div className={`flex items-center gap-1 border rounded-xl p-1 w-fit shadow-sm ${isDark ? "bg-[#000000] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
            {([{ key:"overview", label:"Overview" }, { key:"activity", label:"Timeline" }] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-lg text-[14px] font-semibold transition-all ${
                  activeTab===key ? "bg-[#1D4ED8] text-white shadow-sm"
                    : isDark ? "text-[#B4B5B6] bg-[#0A0A0A] hover:bg-[#27272A] hover:text-[#D4D4D8]"
                    : "text-[#0C2472] bg-[#E3ECFC] hover:bg-[#1D4ED8]/10"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════ OVERVIEW ══════════════════════════ */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

              {/* Left 2/3 */}
              <div className="lg:col-span-2 space-y-4 min-w-0">

                {/* ── Stage Pipeline (clickable) ── */}
                <div className={`rounded-2xl border shadow-sm p-5 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`font-heading text-[12px] font-bold uppercase tracking-widest ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Stage Progress</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">Click a stage to update · Started <span className="font-semibold text-slate-700">{lead.created}</span></p>
                    </div>
                    <div className="text-right">
                      <p className={`font-heading text-[12px] font-bold uppercase tracking-widest ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Last Updated</p>
                      <p className="text-[12px] font-semibold text-slate-700 mt-0.5">{lead.modified}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {PIPELINE.map((stage, i) => {
                      const isDone    = i < pipelineIdx;
                      const isActive  = i === pipelineIdx;
                      const isPending = i > pipelineIdx;
                      return (
                        <div key={stage} className="flex items-center flex-shrink-0 lg:flex-1 gap-1">
                          <Tooltip title={isDone ? "Completed" : isActive ? "Current stage" : "Click to set stage"}>
                            <button
                              onClick={() => setCurrentStatus(stage)}
                              className={`flex items-center justify-center gap-1.5 flex-shrink-0 lg:flex-1 min-w-[104px] lg:min-w-0 py-2 px-2 rounded-xl text-[12.5px] font-bold transition-all
                                ${isActive  ? "bg-[#1D4ED8] text-white shadow-md shadow-[#1D4ED8]/25 scale-[1.02]" : ""}
                                ${isDone    ? isDark ? "bg-[#27272A] text-[#D4D4D8] hover:bg-[#4B4B52]" : "bg-[#E3ECFC] text-[#1D4ED8] hover:bg-[#BFD3F5]" : ""}
                                ${isPending ? isDark ? "bg-transparent text-[#ABABAD] border border-[#27272A] hover:bg-[#27272A] hover:text-[#D4D4D8]" : "bg-transparent text-slate-400 border border-transparent hover:bg-[#E3ECFC] hover:text-[#1D4ED8]" : ""}
                              `}
                            >
                              {isDone && <Check size={12} weight="duotone" />}
                              <span className="whitespace-nowrap lg:truncate">{stage}</span>
                            </button>
                          </Tooltip>
                          {i < PIPELINE.length - 1 && (
                            <CaretRight size={16} color={isDone||isActive ? (isDark ? "#60A5FA" : "#1D4ED8") : (isDark ? "#71717A" : "#CBD5E1")} weight="duotone" style={{ flexShrink:0 }} />
                          )}
                        </div>
                      );
                    })}

                    {/* Won / Lost buttons */}
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Tooltip title="Mark as Qualified / Won">
                        <button onClick={() => setCurrentStatus("Qualified")}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-[17px]
                            ${currentStatus==="Qualified" ? "bg-emerald-500 scale-110" : "bg-emerald-50 hover:bg-emerald-100"}`}>
                          👍
                        </button>
                      </Tooltip>
                      <Tooltip title="Mark as Lost">
                        <button onClick={() => setCurrentStatus("Lost")}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-[17px]
                            ${currentStatus==="Lost" ? "bg-red-500 scale-110" : "bg-red-50 hover:bg-red-100"}`}>
                          👎
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Status changed banner */}
                  {currentStatus !== lead.status && (
                    <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] animate-slide-up border ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                      <span className="text-[#1D4ED8] font-semibold">Stage updated to "{currentStatus}"</span>
                      <span className={isDark ? "text-[#ABABAD]" : "text-slate-400"}>— not saved yet</span>
                      <button onClick={() => setCurrentStatus(lead.status)} className="ml-auto text-inherit font-bold hover:text-[#0C2472] transition-colors">Undo</button>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Lead Source", value:lead.leadSource||"—",    icon:TrendUp,   fill: isDark?"#1A2D4A":"#D6E4F9", deep: isDark?"#60A5FA":"#2F6FED" },
                    { label:"Rating",      value:lead.rating||"—",        icon:Star,      fill: isDark?"#1A2D3A":"#D0E5E0", deep: isDark?"#34D399":"#2E9E7B" },
                    { label:"Industry",    value:lead.industry||"—",      icon:Buildings, fill: isDark?"#2A1E10":"#FAE3D0", deep: isDark?"#FB923C":"#E0883F" },
                    { label:"Employees",   value:lead.noOfEmployees||"—", icon:User,      fill: isDark?"#2A1828":"#F5D9E1", deep: isDark?"#F472B6":"#DB5E8C" },
                  ].map(({ label, value, icon: Icon, fill, deep }) => (
                    <div key={label} className="rounded-xl border border-white/50 p-3.5"
                      style={{ backgroundColor:fill, boxShadow:"0 6px 24px rgba(15,23,42,0.06)" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(249,251,255,0.7)" }}>
                        <Icon size={15} color={deep} weight="duotone" />
                      </div>
                      <p className="font-heading text-[12px] font-bold uppercase tracking-wider mb-0.5" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{label}</p>
                      <p className="text-[14px] font-bold truncate" style={{ color: isDark ? "#FFFFFF" : "#0C2472" }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Personal Info */}
                <SectionCard icon={User} title="Personal Information">
                  <div className="grid grid-cols-2 gap-x-8">
                    <KV label="Salutation"   value={lead.salutation} />
                    <KV label="First Name"   value={lead.firstName} />
                    <KV label="Last Name"    value={lead.lastName} />
                    <KV label="Title"        value={lead.title} />
                    <KV label="Company"      value={lead.company} />
                    <KV label="Industry"     value={lead.industry} />
                    <KV label="Email Opt Out" value={lead.emailOptOut?"Yes":"No"} />
                    <KV label="Description"  value={lead.description} />
                  </div>
                </SectionCard>

                {/* Contact Details */}
                <SectionCard icon={AddressBook} title="Contact Details">
                  <div className="grid grid-cols-2 gap-x-8">
                    <KV label="Email"   value={lead.email}   blue={!!lead.email} />
                    <KV label="Phone"   value={lead.phone} />
                    <KV label="Mobile"  value={lead.mobile} />
                    <KV label="Fax"     value={lead.fax} />
                    <KV label="Website" value={lead.website} blue={!!lead.website} />
                  </div>
                </SectionCard>

                {/* Lead Details */}
                <SectionCard icon={TrendUp} title="Lead Details">
                  <div className="grid grid-cols-2 gap-x-8">
                    <KV label="Lead Source"       value={lead.leadSource} />
                    <KV label="Lead Status"       value={currentStatus} />
                    <KV label="Rating"            value={lead.rating} />
                    <KV label="No. of Employees"  value={lead.noOfEmployees} />
                    <KV label="Annual Revenue"    value={lead.annualRevenue ? `₹${Number(lead.annualRevenue).toLocaleString("en-IN")}` : ""} />
                  </div>
                </SectionCard>

                {/* Notes */}
                <div id="section-notes">
                  <SectionCard icon={Note} title="Notes">
                    <div className="space-y-3">
                      <div className={`border rounded-xl overflow-hidden transition-all ${isDark ? "border-[#3F3F46] focus-within:border-[#9CA3AF]" : "border-[#E3ECFC] focus-within:border-[#1D4ED8] focus-within:shadow-[0_0_0_2px_#4A7AE8]"}`}>
                        <InputBase
                          fullWidth multiline minRows={2}
                          placeholder="Add a note…"
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          sx={{ px:2, py:1.5, fontSize:"0.8rem", color: isDark ? "#D4D4D8" : "#334155", "& textarea::placeholder":{ color: isDark ? "#71717A" : "#94A3B8", opacity:1 } }}
                        />
                        {note.trim() && (
                          <div className="flex justify-end px-3 pb-2">
                            <Button size="small" variant="contained" onClick={addNote}
                              sx={{ bgcolor: isDark ? "#27272A" : "#E3ECFC", color: isDark ? "#F4F4F5" : undefined, borderRadius:"8px", textTransform:"none", fontWeight:700, fontSize:"0.73rem", "&:hover":{ bgcolor: isDark ? "#3F3F46" : "#E3ECFC" } }}>
                              Save Note
                            </Button>
                          </div>
                        )}
                      </div>
                      {notes.map((n, i) => (
                        <div key={i} className={`rounded-xl px-4 py-3 border ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                          <p className={`text-[14px] ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{n.text}</p>
                          <p className={`text-[12px] mt-1 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{n.at}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                {/* Tasks */}
                <div id="section-tasks">
                  <SectionCard icon={ClipboardText} title="Tasks">
                    <div className="space-y-2">
                      {tasksData.map((t, i) => (
                        <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                          <div>
                            <p className={`text-[14px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{t.subject}</p>
                            <p className={`text-[12px] mt-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Due {t.due}</p>
                          </div>
                          <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-[#3F3F46] text-[#D4D4D8]" : "bg-[#E3ECFC] text-[#1D4ED8]"}`}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                {/* Calls */}
                <div id="section-calls">
                  <SectionCard icon={Phone} title="Calls">
                    <div className="space-y-2">
                      {callsData.map((c, i) => (
                        <div key={i} className={`rounded-xl px-4 py-3 border ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                          <p className={`text-[14px] ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{c.summary}</p>
                          <p className={`text-[12px] mt-1 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{c.time}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                {/* Emails */}
                <div id="section-emails">
                  <SectionCard icon={Envelope} title="Emails">
                    <div className={`flex items-center justify-center py-6 text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>
                      No emails yet
                    </div>
                  </SectionCard>
                </div>

                {/* Attachments */}
                <div id="section-attachments">
                  <SectionCard icon={Paperclip} title="Attachments">
                    <div className={`flex items-center justify-center py-6 text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>
                      No attachments yet
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* Right 1/3 */}
              <div className="space-y-4 lg:sticky lg:top-[100px] lg:self-start">

                {/* Related List */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden w-full ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                  <div className={`px-4 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                    <p className={`font-heading text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>Related List</p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {relatedItems.map(({ icon: Icon, label, count, color }) => (
                      <button key={label}
                        onClick={() => handleRelatedClick(label)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl group transition-colors ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]"}`}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor:color+"20" }}>
                          <Icon size={14} color={color} weight="duotone" />
                        </div>
                        <span className="flex-1 text-left text-[14px] font-medium text-slate-700 transition-colors min-w-0 truncate">{label}</span>
                        {count > 0 && (
                          <span className="text-[12px] font-bold bg-[#E3ECFC] text-[#1D4ED8] px-1.5 py-0.5 rounded-full">{count}</span>
                        )}
                        <CaretRight size={14} color="#E2E8F0" weight="duotone" className="group-hover:text-[#60A5FA] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead Owner */}
                <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                  <p className={`font-heading text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>Ownership</p>
                  <div className="flex items-center gap-2.5">
                    <Avatar src={OWNER_AVATARS[lead.owner]} sx={{ width:32, height:32, bgcolor:lead.ownerColor, fontSize:"0.72rem", fontWeight:800 }}>
                      {lead.ownerInitials}
                    </Avatar>
                    <div>
                      <p className={`text-[14px] font-semibold ${isDark ? "text-[#F4F4F5]" : "text-slate-800"}`}>{lead.owner}</p>
                      <p className={`text-[12px] ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Lead Owner</p>
                    </div>
                  </div>
                  <Divider sx={{ borderColor: isDark ? "#27272A" : "#EFF6FF" }} />
                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px]">
                      <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Created</span>
                      <span className={`font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{lead.created}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Modified</span>
                      <span className={`font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{lead.modified}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════ ACTIVITY ══════════════════════════ */}
          {activeTab === "activity" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-[#f9fbff] rounded-2xl border border-[#E3ECFC] shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFF6FF]">
                  <p className="font-heading text-[12px] font-bold text-slate-500 uppercase tracking-wider">Timeline</p>
                  <span className={`text-[12px] font-semibold bg-slate-100 px-2 py-0.5 rounded-full ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{activityFeed.length} events</span>
                </div>
                <div className="px-5 py-4 space-y-0">
                  {activityFeed.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-4 group">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center z-10" style={{ backgroundColor:item.bg }}>
                            <Icon size={15} color={item.color} weight="duotone" />
                          </div>
                          {i < activityFeed.length-1 && <div className={`w-px flex-1 my-1 min-h-[20px] ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <p className="text-[14px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors mt-1">{item.text}</p>
                          <p className={`text-[12px] mt-0.5 flex items-center gap-1 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>
                            <Clock size={11} weight="duotone" />{item.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side: related list still visible */}
              <div className="space-y-4 lg:sticky lg:top-[100px] lg:self-start">
                <div className={`rounded-2xl border shadow-sm overflow-hidden w-full ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                  <div className={`px-4 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                    <p className={`font-heading text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>Related List</p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {relatedItems.map(({ icon: Icon, label, count, color }) => (
                      <button key={label} onClick={() => handleRelatedClick(label)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl group transition-colors ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]"}`}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor:color+"20" }}>
                          <Icon size={14} color={color} weight="duotone" />
                        </div>
                        <span className="flex-1 text-left text-[14px] font-medium text-slate-700 min-w-0 truncate">{label}</span>
                        {count>0 && <span className="text-[12px] font-bold bg-[#E3ECFC] text-[#1D4ED8] px-1.5 py-0.5 rounded-full">{count}</span>}
                        <CaretRight size={14} color="#E2E8F0" weight="duotone" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══ Drawers ══ */}
      <NewLeadDrawer
        key={editOpen ? "edit" : "closed"}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        initialData={{
          salutation: lead.salutation, firstName: lead.firstName,
          lastName: lead.lastName, company: lead.company, title: lead.title,
          email: lead.email, phone: lead.phone, mobile: lead.mobile,
          fax: lead.fax, website: lead.website, leadSource: lead.leadSource,
          leadStatus: currentStatus, industry: lead.industry,
          noOfEmployees: lead.noOfEmployees, annualRevenue: lead.annualRevenue,
          rating: lead.rating, emailOptOut: lead.emailOptOut,
        }}
      />

      <ConvertToDealDrawer
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        leadName={fullName}
        leadCompany={lead.company}
        leadOwner={lead.owner}
        leadOwnerInitials={lead.ownerInitials}
        leadOwnerColor={lead.ownerColor}
        leadAvatarColor={avColor}
        leadInitials={avInit}
      />
    </div>
  );
}


