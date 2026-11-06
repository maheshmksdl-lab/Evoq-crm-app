"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { useTheme } from "@/components/ThemeContext";
import TopBar from "@/components/layout/TopBar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InputBase from "@mui/material/InputBase";
import {
  House, CaretRight, PencilSimple, DotsThreeVertical,
  Note, Paperclip, ClipboardText,
  GridFour, List, Tag, Trash, Copy,
} from "@phosphor-icons/react";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
interface TimelineEntry {
  date: string;
  time: string;
  event: string;
  by: string;
}

interface TaskRecord {
  id: number;
  refId: string;
  type: string;
  subject: string;
  dueDate: string;
  status: string;
  priority: string;
  contact: string;
  relatedTo: string;
  reminder: string;
  taskOwner: string;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  description: string;
  timeline: TimelineEntry[];
}

// ─────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────
const TASKS_DETAIL: Record<number, TaskRecord> = {
  1: {
    id: 1, refId: "19",
    type: "Task", subject: "New", dueDate: "", status: "", priority: "",
    contact: "", relatedTo: "", reminder: "",
    taskOwner: "PM SDL",
    createdBy: "pm@socialdnalabs.com", createdAt: "Wed, May 27, 2026 02:47 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Wed, May 27, 2026 02:47 PM",
    description: "",
    timeline: [
      { date: "2026-05-27", time: "02:47 pm", event: "Task created", by: "pm@socialdnalabs.com" },
    ],
  },
  2: {
    id: 2, refId: "20",
    type: "Task", subject: "New", dueDate: "07/05/2026", status: "Todo", priority: "",
    contact: "", relatedTo: "", reminder: "",
    taskOwner: "PM SDL",
    createdBy: "pm@socialdnalabs.com", createdAt: "Tue, May 07, 2026 09:00 AM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Tue, May 07, 2026 09:00 AM",
    description: "",
    timeline: [
      { date: "2026-05-07", time: "09:00 am", event: "Task created", by: "pm@socialdnalabs.com" },
    ],
  },
  3: {
    id: 3, refId: "21",
    type: "Task", subject: "Schedule Demo", dueDate: "17/04/2026", status: "Backlog", priority: "High",
    contact: "SDL Test Test-SDL", relatedTo: "SDL - Account", reminder: "",
    taskOwner: "PM SDL",
    createdBy: "pm@socialdnalabs.com", createdAt: "Thu, Apr 17, 2026 10:15 AM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Thu, Apr 17, 2026 10:15 AM",
    description: "Schedule a product demo with SDL team.",
    timeline: [
      { date: "2026-04-17", time: "10:15 am", event: "Task created", by: "pm@socialdnalabs.com" },
    ],
  },
  4: {
    id: 4, refId: "22",
    type: "Task", subject: "Prepare quote sent to email", dueDate: "16/04/2026", status: "Backlog", priority: "Medium",
    contact: "SDL Test Test-SDL", relatedTo: "SDL - Account", reminder: "",
    taskOwner: "PM SDL",
    createdBy: "pm@socialdnalabs.com", createdAt: "Wed, Apr 16, 2026 02:30 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Wed, Apr 16, 2026 02:30 PM",
    description: "Prepare and send the quote document via email.",
    timeline: [
      { date: "2026-04-16", time: "02:30 pm", event: "Task created", by: "pm@socialdnalabs.com" },
    ],
  },
  5: {
    id: 5, refId: "23",
    type: "Quote", subject: "Quote", dueDate: "24/03/2026", status: "In Progress", priority: "Low",
    contact: "", relatedTo: "", reminder: "",
    taskOwner: "PM SDL",
    createdBy: "pm@socialdnalabs.com", createdAt: "Mon, Mar 24, 2026 11:00 AM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Mon, Mar 24, 2026 11:00 AM",
    description: "",
    timeline: [
      { date: "2026-03-24", time: "11:00 am", event: "Task created", by: "pm@socialdnalabs.com" },
    ],
  },
};

// ─────────────────────────────────────────────
//  Config
// ─────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  "Todo":        { bg: "#EFF6FF",  text: "#0C2472", dot: "#3B82F6" },
  "In Progress": { bg: "#FEF3C7",  text: "#92400E", dot: "#F59E0B" },
  "Backlog":     { bg: "#F1F5F9",  text: "#475569", dot: "#94A3B8" },
  "Completed":   { bg: "#DCFCE7",  text: "#166534", dot: "#10B981" },
};
const STATUS_CFG_DARK: Record<string, { bg: string; text: string; dot: string }> = {
  "Todo":        { bg: "#18181B", text: "#D4D4D8", dot: "#3B82F6" },
  "In Progress": { bg: "#451A00", text: "#FCD34D", dot: "#F59E0B" },
  "Backlog":     { bg: "#27272A", text: "#D4D4D8", dot: "#94A3B8" },
  "Completed":   { bg: "#064E3B", text: "#34D399", dot: "#10B981" },
};

const PRIORITY_CFG: Record<string, { bg: string; text: string }> = {
  "High":   { bg: "#FEF2F2", text: "#DC2626" },
  "Medium": { bg: "#FEF3C7", text: "#D97706" },
  "Low":    { bg: "#F0FDF4", text: "#16A34A" },
};
const PRIORITY_CFG_DARK: Record<string, { bg: string; text: string }> = {
  "High":   { bg: "#450A0A", text: "#FCA5A5" },
  "Medium": { bg: "#451A00", text: "#FCD34D" },
  "Low":    { bg: "#052E16", text: "#86EFAC" },
};

// ─────────────────────────────────────────────
//  Sub-components (theme-aware)
// ─────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, action }: {
  icon: React.ElementType; title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
      <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
          <Icon size={13} color={isDark ? "#9CA3AF" : "#1D4ED8"} weight="duotone" />
        </div>
        <p className={`font-heading text-[12px] font-bold uppercase tracking-[0.12em] flex-1 ${isDark ? "text-[#D4D4D8]" : "text-[#1D4ED8]"}`}>{title}</p>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function KV({ label, value, editable }: { label: string; value?: string | number; editable?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const display = value !== undefined && value !== "" ? String(value) : "—";
  return (
    <div className={`py-2 border-b last:border-0 flex items-start justify-between group ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
      <div className="flex-1">
        <p className={`font-heading text-[11.5px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{label}</p>
        <p className={`text-[14px] font-medium whitespace-pre-line ${display === "—" ? (isDark ? "text-[#3F3F46] italic" : "text-slate-300 italic") : (isDark ? "text-[#D4D4D8]" : "text-slate-800")}`}>{display}</p>
      </div>
      {editable && (
        <IconButton size="small"
          sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#E2E8F0", opacity: 0, transition: "opacity 0.15s", ".group:hover &": { opacity: 1 }, "&:hover": { color: "#1D4ED8", bgcolor: isDark ? "#27272A" : "#EFF6FF" }, borderRadius: "6px" }}>
          <PencilSimple size={13} weight="duotone" />
        </IconButton>
      )}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-10 gap-y-0">{children}</div>;
}

// ─────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────
export default function TaskDetail({ taskId }: { taskId: number }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const task = TASKS_DETAIL[taskId];

  const [activeTab, setActiveTab]     = useState<"overview" | "timeline">("overview");
  const [note, setNote]               = useState("");
  const [notes, setNotes]             = useState<{ text: string; at: string }[]>([]);
  const [attachView, setAttachView]   = useState<"grid" | "list">("grid");
  const [moreAnchor, setMoreAnchor]   = useState<null | HTMLElement>(null);

  if (!task) {
    return (
      <div className="flex h-screen bg-transparent font-sans">
        <Sidebar />
        <div className="sidebar-content flex-1 flex flex-col">
          {/* <TopBar title="Tasks" /> */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-xl font-bold mb-2 ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>Task not found</div>
              <button onClick={() => router.push("/tasks")} className={`text-sm underline ${isDark ? "text-[#A1A1AA]" : "text-[#1D4ED8]"}`}>Back to Tasks</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(prev => [{ text: note.trim(), at: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) }, ...prev]);
    setNote("");
  };

  const statusCfg   = (isDark ? STATUS_CFG_DARK : STATUS_CFG)[task.status];
  const priorityCfg = (isDark ? PRIORITY_CFG_DARK : PRIORITY_CFG)[task.priority];

  const relatedItems = [
    { label: "Notes",       icon: Note,      count: notes.length, color: "#8B5CF6" },
    { label: "Attachments", icon: Paperclip, count: 0,            color: "#F59E0B" },
  ];

  const RelatedListPanel = ({ onItemClick }: { onItemClick: (label: string) => void }) => (
    <div className="space-y-4">
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className={`px-4 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
          <p className={`font-heading text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>Related List</p>
        </div>
        <div className="p-2 space-y-0.5">
          {relatedItems.map(({ label, icon: Icon, count, color }) => (
            <button key={label} onClick={() => onItemClick(label)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl group transition-colors ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]"}`}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "20" }}>
                <Icon size={14} color={color} weight="duotone" />
              </div>
              <span className={`flex-1 min-w-0 truncate text-left text-[14px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{label}</span>
              {count > 0 && (
                <span className="text-[12px] font-bold bg-[#E3ECFC] text-[#1D4ED8] px-1.5 py-0.5 rounded-full">{count}</span>
              )}
              <CaretRight size={14} color="#E2E8F0" weight="duotone" />
            </button>
          ))}
        </div>
      </div>

      {/* Ownership / details panel */}
      <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <p className={`font-heading text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>Details</p>
        {[
          { label: "Due Date",    value: task.dueDate   || "—" },
          { label: "Task Owner",  value: task.taskOwner || "—" },
          { label: "Created By",  value: task.createdBy || "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-[12px]">
            <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{label}</span>
            <span className={`font-semibold text-right max-w-[140px] truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-transparent font-sans">
      <Sidebar />

      <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">
        {/* <TopBar title="Tasks" /> */}

        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-4 animate-fade-in">

          {/* ── Breadcrumb ── */}
          <div className={`flex items-center gap-1.5 text-[13.5px] ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>
            <House size={16} weight="duotone" />
            <CaretRight size={12} weight="duotone" />
            <Link href="/tasks" className="hover:text-[#1D4ED8] transition-colors font-medium">Tasks</Link>
            <CaretRight size={12} weight="duotone" />
            <span className="text-[#1D4ED8] font-semibold truncate max-w-[240px]">{task.subject}</span>
          </div>

          {/* ── Header card ── */}
          <div className={`rounded-2xl border shadow-sm px-5 py-4 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${isDark ? "bg-[#27272A]" : "bg-[#1D4ED8]"}`}>
                  <ClipboardText size={18} color={isDark ? "#71717A" : "#fff"} weight="duotone" />
                </div>
                <div>
                  <h1 className={`text-[20px] font-extrabold tracking-tight leading-tight mb-0 ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{task.subject}</h1>
                  <p className={`text-[12px] mt-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{task.type} · #{task.refId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {statusCfg && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold"
                    style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: statusCfg.dot }} />
                    {task.status}
                  </span>
                )}
                {priorityCfg && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold"
                    style={{ backgroundColor: priorityCfg.bg, color: priorityCfg.text }}>
                    {task.priority}
                  </span>
                )}
                <Button size="small" variant="outlined" startIcon={<PencilSimple size={13} weight="duotone" />}
                  sx={{ borderColor: isDark ? "#27272A" : "#E3ECFC", color: isDark ? "#B4B5B6" : "#1D4ED8", borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "0.84rem", bgcolor: isDark ? "#0F0F0F" : "transparent", "&:hover": { borderColor: "#1D4ED8", color: "#1D4ED8", bgcolor: isDark ? "#0A0A0A" : "#EFF6FF" } }}>
                  Edit
                </Button>
                <Tooltip title="More actions">
                  <IconButton size="small" onClick={e => setMoreAnchor(e.currentTarget)}
                    sx={{ border: `1.5px solid ${isDark ? "#27272A" : "#E3ECFC"}`, borderRadius: "9px", bgcolor: isDark ? "#0F0F0F" : "transparent", p: 0.8, "&:hover": { borderColor: "#1D4ED8", bgcolor: isDark ? "#0A0A0A" : "#EFF6FF" } }}>
                    <DotsThreeVertical size={16} weight="bold" color={isDark ? "#B4B5B6" : "#64748B"} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className={`flex items-center gap-1 border rounded-xl p-1 w-fit shadow-sm ${isDark ? "bg-[#000000] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
            {(["overview", "timeline"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[14px] font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-[#1D4ED8] text-white shadow-sm"
                    : isDark ? "text-[#B4B5B6] bg-[#0A0A0A] hover:bg-[#27272A] hover:text-[#D4D4D8]"
                    : "text-[#0C2472] bg-[#E3ECFC] hover:bg-[#1D4ED8]/10"
                }`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2 space-y-5 min-w-0">

                {/* ── Quick Info card ── */}
                <div className={`rounded-2xl border shadow-sm divide-y ${isDark ? "bg-[#1C1C1E] border-[#27272A] divide-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC] divide-[#EFF6FF]"}`}>
                  {[
                    { label: "Type",     value: task.type },
                    { label: "Subject",  value: task.subject },
                    { label: "Due Date", value: task.dueDate },
                    { label: "Priority", value: task.priority },
                    { label: "Status",   value: task.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3">
                      <span className={`text-[12px] font-medium w-32 flex-shrink-0 ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>{label}:</span>
                      <span className={`flex-1 text-[14px] font-semibold ${value ? (isDark ? "text-[#D4D4D8]" : "text-slate-700") : (isDark ? "text-[#3F3F46]" : "text-slate-300")}`}>
                        {label === "Status" && value && statusCfg ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: statusCfg.dot }} />
                            {value}
                          </span>
                        ) : label === "Priority" && value && priorityCfg ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: priorityCfg.bg, color: priorityCfg.text }}>
                            {value}
                          </span>
                        ) : (
                          value || <span className={isDark ? "text-[#3F3F46]" : "text-slate-300"}>—</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Task Information ── */}
                <SectionCard icon={ClipboardText} title="Task Information"
                  action={
                    <IconButton size="small" onClick={e => setMoreAnchor(e.currentTarget)}
                      sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover": { color: "#1D4ED8", bgcolor: isDark ? "#27272A" : "#EFF6FF" }, borderRadius: "6px" }}>
                      <DotsThreeVertical size={16} weight="bold" />
                    </IconButton>
                  }>
                  <InfoGrid>
                    <KV label="Type"        value={task.type} />
                    <KV label="Subject"     value={task.subject}   editable />
                    <KV label="Due Date"    value={task.dueDate} />
                    <KV label="Status"      value={task.status} />
                    <KV label="Priority"    value={task.priority} />
                    <KV label="Contact"     value={task.contact} />
                    <KV label="Related to"  value={task.relatedTo} />
                    <KV label="Reminder"    value={task.reminder} />
                    <KV label="Task Owner"  value={task.taskOwner} />
                    <KV label="Created By"  value={`${task.createdBy}\n${task.createdAt}`} />
                    <KV label="Modified By" value={`${task.modifiedBy}\n${task.modifiedAt}`} />
                  </InfoGrid>
                </SectionCard>

                {/* ── Description ── */}
                <SectionCard icon={Tag} title="Description Information">
                  <KV label="Description" value={task.description} editable />
                </SectionCard>

                {/* ── Notes ── */}
                <div id="section-notes">
                  <SectionCard icon={Note} title="Notes">
                    <div className="space-y-3">
                      <div className={`border rounded-xl overflow-hidden transition-all ${isDark ? "border-[#3F3F46] focus-within:border-[#9CA3AF]" : "border-[#E3ECFC] focus-within:border-[#1D4ED8] focus-within:shadow-[0_0_0_2px_#4A7AE8]"}`}>
                        <InputBase
                          fullWidth multiline minRows={2}
                          placeholder="Add a note…"
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          sx={{ px: 2, py: 1.5, fontSize: "0.8rem", color: isDark ? "#D4D4D8" : "#334155", "& textarea::placeholder": { color: isDark ? "#3F3F46" : "#E2E8F0", opacity: 1 } }}
                        />
                        {note.trim() && (
                          <div className="flex justify-end px-3 pb-2">
                            <Button size="small" variant="contained" onClick={addNote}
                              sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius: "8px", textTransform: "none", fontWeight: 700, fontSize: "0.73rem", boxShadow: "0 1px 8px 0 #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "#60A5FA", boxShadow: "0 2px 14px 0 #60A5FA55" }, "&:active": { bgcolor: isDark ? "#52525B" : "#0C2472" } }}>
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

                {/* ── Attachments ── */}
                <div id="section-attachments">
                  <SectionCard icon={Paperclip} title="Attachments"
                    action={
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center rounded-lg p-0.5 gap-0.5 ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
                          {[{ k: "grid", Icon: GridFour }, { k: "list", Icon: List }].map(({ k, Icon }) => (
                            <button key={k} onClick={() => setAttachView(k as "grid" | "list")}
                              className={`p-1 rounded-md transition-colors ${attachView === k ? (isDark ? "bg-[#3F3F46] text-[#D4D4D8]" : "bg-[#f9fbff] text-[#1D4ED8]") : (isDark ? "text-[#9CA3AF]" : "text-slate-400")}`}>
                              <Icon size={13} weight="duotone" />
                            </button>
                          ))}
                        </div>
                        <Button size="small" variant="outlined"
                          sx={{ borderColor: isDark ? "#27272A" : "#E3ECFC", color: isDark ? "#B4B5B6" : "#1D4ED8", bgcolor: isDark ? "#0F0F0F" : "transparent", borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.73rem", "&:hover": { borderColor: "#1D4ED8", color: "#1D4ED8", bgcolor: isDark ? "#0A0A0A" : "#EFF6FF" } }}>
                          Attach
                        </Button>
                      </div>
                    }>
                    <div className={`flex items-center justify-center py-6 text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>
                      No attachments yet
                    </div>
                  </SectionCard>
                </div>

              </div>{/* end col-span-2 */}

              <div className="lg:sticky lg:top-4 lg:self-start">
                <RelatedListPanel
                  onItemClick={label =>
                    document.getElementById(`section-${label.toLowerCase()}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                />
              </div>

            </div>
          )}

          {activeTab === "timeline" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2">
                <SectionCard icon={ClipboardText} title="Activity Timeline">
                  {task.timeline.length === 0 ? (
                    <div className={`text-[14px] text-center py-6 ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>No activity yet</div>
                  ) : (
                    <div className="relative">
                      <div className={`absolute left-[11px] top-2 bottom-2 w-px ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
                      <div className="space-y-5">
                        {task.timeline.map((entry, i) => (
                          <div key={i} className="flex items-start gap-4 pl-7 relative">
                            <div className={`absolute left-0 top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                              <ClipboardText size={10} color={isDark ? "#9CA3AF" : "#1D4ED8"} weight="duotone" />
                            </div>
                            <div className="flex-1">
                              <div className={`text-[14px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{entry.event}</div>
                              <div className={`text-[12px] mt-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{entry.by}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className={`text-[12px] font-medium ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>
                                {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                              </div>
                              <div className={`text-[12px] ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{entry.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>

              <div className="lg:sticky lg:top-4 lg:self-start">
                <RelatedListPanel onItemClick={() => setActiveTab("overview")} />
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ── More menu ── */}
      <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}
        PaperProps={{ sx: { borderRadius: "12px", border: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`, bgcolor: isDark ? "#1C1C1E" : "#fff", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(29,78,216,0.10)", minWidth: 170 } }}>
        <MenuItem onClick={() => setMoreAnchor(null)}
          sx={{ fontSize: "0.8rem", gap: 1.5, py: 1, mx: 0.5, borderRadius: "8px", color: isDark ? "#A1A1AA" : "inherit", "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
          <ListItemIcon sx={{ minWidth: 0 }}><Copy size={14} color="#64748B" weight="duotone" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.8rem" }}>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setMoreAnchor(null)}
          sx={{ fontSize: "0.8rem", gap: 1.5, py: 1, mx: 0.5, borderRadius: "8px", color: "#DC2626", "&:hover": { bgcolor: isDark ? "#27272A" : "#FEF2F2" } }}>
          <ListItemIcon sx={{ minWidth: 0 }}><Trash size={14} color="#DC2626" weight="duotone" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.8rem", color: "#DC2626" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

    </div>
  );
}
