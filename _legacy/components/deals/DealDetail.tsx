"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
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
  Note, ClipboardText, Paperclip, ClockCounterClockwise,
  ThumbsUp, ThumbsDown, Plus, Trash, Copy,
  GridFour, List, Trophy, Handshake, Tag,
  CurrencyCircleDollar, ChartLineUp, CalendarBlank,
} from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
type DealStage =
  | "Qualification" | "Needs Analysis" | "Value Proposition"
  | "Identify Decision Makers" | "Proposal/Price Quote"
  | "Negotiation/Review" | "Closed Won";

interface StageHistoryRow {
  stage: DealStage; amount: number; probability: number;
  expectedRevenue: number; stageDurationDays: number;
  movedFrom: string; isCurrent: number;
}
interface TaskRow { subject: string; status: string; }
interface TimelineEntry {
  date: string;
  time: string;
  probability?: { from: number; to: number };
  stage?: { from: string; to: string };
  by: string;
}
interface DealRecord {
  id: number; refId: string; name: string; amount: number;
  owner: string; ownerEmail: string; account: string; stage: DealStage;
  type: string; nextStep: string; probability: number; leadSource: string;
  expectedRevenue: number; contactName: string; closingDate: string;
  startDate: string; createdBy: string; createdAt: string;
  modifiedBy: string; modifiedAt: string; recordCategory: string;
  description: string; stageHistory: StageHistoryRow[]; tasks: TaskRow[];
  timeline: TimelineEntry[];
}

// ─────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────
const DEALS_DETAIL: Record<number, DealRecord> = {
  1:  { id:1,  refId:"CRM DEAL 2026 00001", name:"New",                         amount:29999,  owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"Sweany Inc",     stage:"Proposal/Price Quote",      type:"New Business",       nextStep:"Send proposal",      probability:75, leadSource:"Web",          expectedRevenue:29999,  contactName:"",                 closingDate:"2026-07-15", startDate:"2026-05-27", createdBy:"pm@socialdnalabs.com", createdAt:"Tue, May 27, 2026 03:14 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Fri, May 30, 2026 02:10 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Proposal/Price Quote",amount:29999,probability:75,expectedRevenue:22499,stageDurationDays:3,movedFrom:"Needs Analysis",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-05-30", time:"02:10 pm", probability:{from:60,to:75}, stage:{from:"Needs Analysis",to:"Proposal/Price Quote"}, by:"pm@socialdnalabs.com" },
    { date:"2026-05-29", time:"10:22 am", probability:{from:20,to:60}, stage:{from:"Qualification",to:"Needs Analysis"}, by:"pm@socialdnalabs.com" },
    { date:"2026-05-27", time:"03:14 pm", probability:{from:0,to:20},  stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
  2:  { id:2,  refId:"CRM DEAL 2026 00002", name:"Deal SDL 11",                 amount:500000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"SDL LEAD1",      stage:"Identify Decision Makers",  type:"Existing Business",  nextStep:"Schedule meeting",   probability:60, leadSource:"Referral",     expectedRevenue:300000, contactName:"Lead SDL 11",      closingDate:"2026-08-31", startDate:"2026-04-15", createdBy:"pm@socialdnalabs.com", createdAt:"Wed, Apr 15, 2026 11:13 AM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Tue, May 05, 2026 04:55 PM", recordCategory:"Open", description:"Enterprise deal with SDL LEAD1.", stageHistory:[{stage:"Identify Decision Makers",amount:500000,probability:60,expectedRevenue:300000,stageDurationDays:20,movedFrom:"Value Proposition",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-06-11", time:"11:37 am", probability:{from:60,to:75}, stage:{from:"Identify Decision Makers",to:"Proposal/Price Quote"}, by:"pm@socialdnalabs.com" },
    { date:"2026-05-05", time:"04:55 pm", probability:{from:40,to:60}, stage:{from:"Value Proposition",to:"Identify Decision Makers"},    by:"pm@socialdnalabs.com" },
    { date:"2026-05-05", time:"04:55 pm", probability:{from:20,to:40}, stage:{from:"Needs Analysis",to:"Value Proposition"},             by:"pm@socialdnalabs.com" },
    { date:"2026-05-05", time:"04:55 pm", probability:{from:40,to:20}, stage:{from:"Value Proposition",to:"Needs Analysis"},             by:"pm@socialdnalabs.com" },
    { date:"2026-05-05", time:"04:50 pm", probability:{from:20,to:40}, stage:{from:"Needs Analysis",to:"Value Proposition"},             by:"pm@socialdnalabs.com" },
    { date:"2026-05-05", time:"04:50 pm", probability:{from:10,to:20}, stage:{from:"Qualification",to:"Needs Analysis"},                 by:"pm@socialdnalabs.com" },
  ]},
  3:  { id:3,  refId:"CRM DEAL 2026 00003", name:"test deal john smith",        amount:200000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"Sears Homelife",  stage:"Qualification",             type:"New Business",       nextStep:"",                   probability:10, leadSource:"Cold Call",    expectedRevenue:20000,  contactName:"John Smith",       closingDate:"2026-09-30", startDate:"2026-04-14", createdBy:"pm@socialdnalabs.com", createdAt:"Mon, Apr 14, 2026 07:45 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Mon, Apr 14, 2026 07:45 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Qualification",amount:200000,probability:10,expectedRevenue:20000,stageDurationDays:0,movedFrom:"",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-14", time:"07:45 pm", probability:{from:0,to:10}, stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
  4:  { id:4,  refId:"CRM DEAL 2026 00004", name:"testing",                     amount:500000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"RMVT",            stage:"Needs Analysis",            type:"Existing Business",  nextStep:"",                   probability:20, leadSource:"Advertisement",expectedRevenue:100000, contactName:"Raja rajan",       closingDate:"2026-07-31", startDate:"2026-04-14", createdBy:"pm@socialdnalabs.com", createdAt:"Mon, Apr 14, 2026 07:30 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Mon, Apr 14, 2026 07:34 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Needs Analysis",amount:500000,probability:20,expectedRevenue:100000,stageDurationDays:0,movedFrom:"Qualification",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-14", time:"07:34 pm", probability:{from:10,to:20}, stage:{from:"Qualification",to:"Needs Analysis"}, by:"pm@socialdnalabs.com" },
    { date:"2026-04-14", time:"07:30 pm", probability:{from:0,to:10},  stage:{from:"",to:"Qualification"},               by:"pm@socialdnalabs.com" },
  ]},
  5:  { id:5,  refId:"CRM DEAL 2026 00005", name:"fsm enterprise application",  amount:800000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"RMVT",            stage:"Needs Analysis",            type:"New Business",       nextStep:"Demo scheduled",     probability:20, leadSource:"Advertisement",expectedRevenue:160000, contactName:"mmmm mmmm",        closingDate:"2026-10-31", startDate:"2026-04-14", createdBy:"pm@socialdnalabs.com", createdAt:"Mon, Apr 14, 2026 06:53 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Mon, Apr 14, 2026 07:07 PM", recordCategory:"Open", description:"Full FSM enterprise application build.", stageHistory:[{stage:"Needs Analysis",amount:800000,probability:20,expectedRevenue:160000,stageDurationDays:0,movedFrom:"Qualification",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-14", time:"07:07 pm", probability:{from:10,to:20}, stage:{from:"Qualification",to:"Needs Analysis"}, by:"pm@socialdnalabs.com" },
    { date:"2026-04-14", time:"06:53 pm", probability:{from:0,to:10},  stage:{from:"",to:"Qualification"},               by:"pm@socialdnalabs.com" },
  ]},
  6:  { id:6,  refId:"CRM DEAL 2026 00006", name:"CRM Application",             amount:200000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"SDL",             stage:"Qualification",             type:"New Business",       nextStep:"",                   probability:10, leadSource:"Web",          expectedRevenue:20000,  contactName:"SDL Test Test-SDL",closingDate:"2026-08-15", startDate:"2026-04-14", createdBy:"pm@socialdnalabs.com", createdAt:"Mon, Apr 14, 2026 07:04 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Mon, Apr 14, 2026 07:04 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Qualification",amount:200000,probability:10,expectedRevenue:20000,stageDurationDays:0,movedFrom:"",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-14", time:"07:04 pm", probability:{from:0,to:10}, stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
  7:  { id:7,  refId:"CRM DEAL 2026 00007", name:"fsm single user application", amount:200000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"RMVT",            stage:"Qualification",             type:"New Business",       nextStep:"",                   probability:10, leadSource:"Advertisement",expectedRevenue:20000,  contactName:"Raja rajan",       closingDate:"2026-09-15", startDate:"2026-04-14", createdBy:"pm@socialdnalabs.com", createdAt:"Mon, Apr 14, 2026 06:40 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Mon, Apr 14, 2026 06:40 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Qualification",amount:200000,probability:10,expectedRevenue:20000,stageDurationDays:0,movedFrom:"",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-14", time:"06:40 pm", probability:{from:0,to:10}, stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
  8:  { id:8,  refId:"CRM DEAL 2026 00008", name:"CRM Application",             amount:500000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"RMVT",            stage:"Qualification",             type:"New Business",       nextStep:"",                   probability:10, leadSource:"Web",          expectedRevenue:50000,  contactName:"Vishnutharan R",   closingDate:"2026-10-01", startDate:"2026-04-14", createdBy:"pm@socialdnalabs.com", createdAt:"Mon, Apr 14, 2026 06:38 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Mon, Apr 14, 2026 06:38 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Qualification",amount:500000,probability:10,expectedRevenue:50000,stageDurationDays:0,movedFrom:"",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-14", time:"06:38 pm", probability:{from:0,to:10}, stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
  9:  { id:9,  refId:"CRM DEAL 2026 00009", name:"Deal test",                   amount:150000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"test",            stage:"Qualification",             type:"New Business",       nextStep:"",                   probability:10, leadSource:"Web",          expectedRevenue:15000,  contactName:"test test",        closingDate:"2026-07-01", startDate:"2026-04-13", createdBy:"pm@socialdnalabs.com", createdAt:"Sun, Apr 13, 2026 06:35 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Sun, Apr 13, 2026 06:35 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Qualification",amount:150000,probability:10,expectedRevenue:15000,stageDurationDays:0,movedFrom:"",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-13", time:"06:35 pm", probability:{from:0,to:10}, stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
  10: { id:10, refId:"CRM DEAL 2026 00010", name:"test",                        amount:50000,  owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"test",            stage:"Needs Analysis",            type:"New Business",       nextStep:"",                   probability:20, leadSource:"Web",          expectedRevenue:10000,  contactName:"test test",        closingDate:"2026-08-01", startDate:"2026-04-13", createdBy:"pm@socialdnalabs.com", createdAt:"Sun, Apr 13, 2026 06:17 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Sun, Apr 13, 2026 06:34 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Needs Analysis",amount:50000,probability:20,expectedRevenue:10000,stageDurationDays:17,movedFrom:"Qualification",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-13", time:"06:34 pm", probability:{from:10,to:20}, stage:{from:"Qualification",to:"Needs Analysis"}, by:"pm@socialdnalabs.com" },
    { date:"2026-04-13", time:"06:17 pm", probability:{from:0,to:10},  stage:{from:"",to:"Qualification"},               by:"pm@socialdnalabs.com" },
  ]},
  11: { id:11, refId:"CRM DEAL 2026 00011", name:"Smith",                       amount:100000, owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"test",            stage:"Value Proposition",         type:"New Business",       nextStep:"Send proposal doc",  probability:40, leadSource:"Referral",     expectedRevenue:40000,  contactName:"John Smith",       closingDate:"2026-09-01", startDate:"2026-04-13", createdBy:"pm@socialdnalabs.com", createdAt:"Sun, Apr 13, 2026 06:00 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Sun, Apr 13, 2026 06:02 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Value Proposition",amount:100000,probability:40,expectedRevenue:40000,stageDurationDays:2,movedFrom:"Needs Analysis",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-13", time:"06:02 pm", probability:{from:20,to:40}, stage:{from:"Needs Analysis",to:"Value Proposition"}, by:"pm@socialdnalabs.com" },
    { date:"2026-04-13", time:"06:00 pm", probability:{from:10,to:20}, stage:{from:"Qualification",to:"Needs Analysis"},     by:"pm@socialdnalabs.com" },
    { date:"2026-04-13", time:"06:00 pm", probability:{from:0,to:10},  stage:{from:"",to:"Qualification"},                   by:"pm@socialdnalabs.com" },
  ]},
  12: { id:12, refId:"CRM DEAL 2026 00012", name:"Mike",                        amount:0,      owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"Speedy Motors",   stage:"Qualification",             type:"New Business",       nextStep:"",                   probability:10, leadSource:"Cold Call",    expectedRevenue:0,      contactName:"Speedy Mike",      closingDate:"2026-12-31", startDate:"2026-04-13", createdBy:"pm@socialdnalabs.com", createdAt:"Sun, Apr 13, 2026 05:56 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Sun, Apr 13, 2026 05:56 PM", recordCategory:"Open", description:"", stageHistory:[{stage:"Qualification",amount:0,probability:10,expectedRevenue:0,stageDurationDays:0,movedFrom:"",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-04-13", time:"05:56 pm", probability:{from:0,to:10}, stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
  13: { id:13, refId:"CRM DEAL 2026 00013", name:"Test",                        amount:10000,  owner:"PM SDL", ownerEmail:"pm@socialdnalabs.com", account:"RMVT",            stage:"Qualification",             type:"Existing Business",  nextStep:"",                   probability:10, leadSource:"Advertisement",expectedRevenue:10000,  contactName:"Raja rajan",       closingDate:"2026-06-30", startDate:"2026-06-10", createdBy:"pm@socialdnalabs.com", createdAt:"Wed, Jun 10, 2026 02:12 PM", modifiedBy:"pm@socialdnalabs.com", modifiedAt:"Wed, Jun 10, 2026 02:12 PM", recordCategory:"Open", description:"test", stageHistory:[{stage:"Qualification",amount:10000,probability:10,expectedRevenue:1000,stageDurationDays:0,movedFrom:"",isCurrent:1}], tasks:[], timeline:[
    { date:"2026-06-10", time:"02:12 pm", probability:{from:0,to:10}, stage:{from:"",to:"Qualification"}, by:"pm@socialdnalabs.com" },
  ]},
};

const STAGES: DealStage[] = [
  "Qualification", "Needs Analysis", "Value Proposition",
  "Identify Decision Makers", "Proposal/Price Quote", "Negotiation/Review", "Closed Won",
];

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

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-10 gap-y-0">{children}</div>;
}

function KV({ label, value, blue }: { label: string; value?: string | number; blue?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const display = value !== undefined && value !== "" && value !== 0 ? String(value) : "—";
  const isEmpty = display === "—";
  return (
    <div className="py-2 border-b border-[#EFF6FF] last:border-0">
      <p className={`font-heading text-[11.5px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{label}</p>
      <p className={`text-[14px] font-medium ${blue ? "text-inherit" : isDark ? (isEmpty ? "text-[#3F3F46] italic" : "text-[#D4D4D8]") : (isEmpty ? "text-slate-300 italic" : "text-slate-800")}`}>{display}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────
export default function DealDetail({ dealId }: { dealId: number }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const deal = DEALS_DETAIL[dealId];

  const [activeTab, setActiveTab] = useState<"overview" | "timeline">("overview");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ text: string; at: string }[]>([]);
  const [attachView, setAttachView] = useState<"grid" | "list">("grid");
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  if (!deal) {
    return (
      <div className="flex h-screen bg-transparent font-sans">
        <Sidebar />
        <div className="sidebar-content flex-1 flex flex-col">
          {/* <TopBar title="Deals" /> */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className={`text-xl font-bold mb-2 ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>Deal not found</p>
              <button onClick={() => router.push("/deals")} className={`text-sm underline ${isDark ? "text-[#A1A1AA]" : "text-[#1D4ED8]"}`}>Back to Deals</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stageIdx = STAGES.indexOf(deal.stage);

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(prev => [{ text: note.trim(), at: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) }, ...prev]);
    setNote("");
  };

  const relatedItems = [
    { label: "Notes",         icon: Note,                  count: notes.length,             color: "#8B5CF6" },
    { label: "Attachments",   icon: Paperclip,             count: 0,                        color: "#F59E0B" },
    { label: "Stage History", icon: ClockCounterClockwise, count: deal.stageHistory.length, color: "#64748B" },
    { label: "Tasks",         icon: ClipboardText,         count: deal.tasks.length,        color: "#10B981" },
  ];

  // Quick stat cards data
  const quickStats = [
    { label: "Amount",           value: `₹${deal.amount.toLocaleString("en-IN")}`, icon: CurrencyCircleDollar, fill: isDark ? "rgba(96,165,250,0.08)"  : "#EFF6FF", deep: isDark ? "#60A5FA" : "#1D4ED8" },
    { label: "Probability",      value: `${deal.probability}%`,                    icon: ChartLineUp,          fill: isDark ? "rgba(52,211,153,0.08)"  : "#F0FDF4", deep: isDark ? "#34D399" : "#059669" },
    { label: "Expected Revenue", value: `₹${deal.expectedRevenue.toLocaleString("en-IN")}`, icon: CurrencyCircleDollar, fill: isDark ? "rgba(251,191,36,0.08)" : "#FFFBEB", deep: isDark ? "#FBBF24" : "#D97706" },
    { label: "Closing Date",     value: deal.closingDate,                           icon: CalendarBlank,        fill: isDark ? "rgba(244,114,182,0.08)" : "#FDF2F8", deep: isDark ? "#F472B6" : "#DB2777" },
  ];

  const RelatedListPanel = ({ onClickItem }: { onClickItem: (label: string) => void }) => (
    <div className="space-y-4">
      <div className={`rounded-2xl border shadow-sm overflow-hidden w-full ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className={`px-4 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
          <p className={`font-heading text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>Related List</p>
        </div>
        <div className="p-2 space-y-0.5">
          {relatedItems.map(({ label, icon: Icon, count, color }) => (
            <button key={label} onClick={() => onClickItem(label)}
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

      {/* Ownership panel */}
      <div className={`rounded-2xl border shadow-sm p-4 space-y-3 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <p className={`font-heading text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>Ownership</p>
        <div className="space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Owner</span>
            <span className={`font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{deal.owner}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Created</span>
            <span className={`font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{deal.createdAt}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Modified</span>
            <span className={`font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{deal.modifiedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-transparent font-sans">
      <Sidebar />

      <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">
        {/* <TopBar title="Deals" /> */}

        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-4 animate-fade-in">

          {/* ── Breadcrumb ── */}
          <div className={`flex items-center gap-1.5 text-[13.5px] ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>
            <House size={16} weight="duotone" />
            <CaretRight size={12} weight="duotone" />
            <Link href="/deals" className="hover:text-[#1D4ED8] transition-colors font-medium">Deals</Link>
            <CaretRight size={12} weight="duotone" />
            <span className="text-[#1D4ED8] font-semibold truncate max-w-[240px]">{deal.name}</span>
          </div>

          {/* ── Header card ── */}
          <div className={`rounded-2xl border shadow-sm px-5 py-4 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h1 className={`m-0 text-[20px] font-extrabold tracking-tight truncate ${isDark ? "text-[#FFFFFF]" : "text-slate-900"}`}>{deal.name}</h1>
                <p className={`text-[12px] mt-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{deal.refId} · {deal.account}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                <Button variant="outlined" size="small"
                  sx={{ borderColor: isDark?"#27272A":"#E3ECFC", color: isDark?"#B4B5B6":"#1D4ED8", borderRadius:"9px", textTransform:"none", fontWeight:600, fontSize:"0.84rem", bgcolor: isDark?"#0F0F0F":"transparent", "&:hover":{ borderColor:"#1D4ED8", color:"#1D4ED8", bgcolor: isDark?"#0A0A0A":"#EFF6FF" } }}>
                  Convert
                </Button>
                <Button variant="outlined" size="small"
                  sx={{ borderColor: isDark?"#27272A":"#E3ECFC", color: isDark?"#B4B5B6":"#1D4ED8", borderRadius:"9px", textTransform:"none", fontWeight:600, fontSize:"0.84rem", bgcolor: isDark?"#0F0F0F":"transparent", "&:hover":{ borderColor:"#1D4ED8", color:"#1D4ED8", bgcolor: isDark?"#0A0A0A":"#EFF6FF" } }}>
                  Send Email
                </Button>
                <Button variant="contained" size="small"
                  startIcon={<PencilSimple size={14} weight="duotone" />}
                  onClick={e => setMoreAnchor(e.currentTarget)}
                  sx={{ bgcolor:"#1D4ED8", borderRadius:"9px", textTransform:"none", fontWeight:700, fontSize:"0.84rem", boxShadow:"0 1px 8px 0 #1D4ED833", "&:hover":{ bgcolor:"#60A5FA", boxShadow:"0 2px 14px 0 #60A5FA55" }, "&:active":{ bgcolor:"#0C2472" } }}>
                  Edit
                </Button>
                <Tooltip title="More options">
                  <IconButton size="small"
                    sx={{ border:`1px solid ${isDark?"#27272A":"#E3ECFC"}`, bgcolor: isDark?"#0F0F0F":"transparent", borderRadius:"9px", p:0.75, "&:hover":{ borderColor:"#1D4ED8", bgcolor: isDark?"#0A0A0A":"#EFF6FF" } }}>
                    <DotsThreeVertical size={16} color={isDark?"#B4B5B6":"#1D4ED8"} weight="bold" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            {/* Quick stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {quickStats.map(({ label, value, icon: Icon, fill, deep }) => (
                <div key={label} className="rounded-xl border border-white/50 p-3.5"
                  style={{ backgroundColor: fill, boxShadow: "0 6px 24px rgba(15,23,42,0.06)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(249,251,255,0.7)" }}>
                    <Icon size={15} color={deep} weight="duotone" />
                  </div>
                  <p className="font-heading text-[12px] font-bold uppercase tracking-wider mb-0.5" style={{ color: isDark ? "#94A3B8" : "#475569" }}>{label}</p>
                  <p className="text-[14px] font-bold truncate" style={{ color: isDark ? "#FFFFFF" : "#0C2472" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
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
                {/* ── Stage Pipeline ── */}
                <div className={`rounded-2xl border shadow-sm p-4 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className={`text-[12px] font-bold uppercase tracking-widest ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Start</p>
                      <p className={`text-[12px] font-semibold ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                        {new Date(deal.startDate).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[12px] font-bold uppercase tracking-widest ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Closing</p>
                      <p className={`text-[12px] font-semibold ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                        {new Date(deal.closingDate).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0 overflow-x-auto pb-1">
                    {STAGES.map((stage, i) => {
                      const isActive = deal.stage === stage;
                      const isPast = stageIdx > i;
                      const isLast = i === STAGES.length - 1;
                      return (
                        <div key={stage} className="flex items-center flex-shrink-0">
                          <div className={`
                            relative px-3 py-1.5 text-[12.5px] font-bold flex items-center gap-1.5 transition-all
                            ${i === 0 ? "rounded-l-lg" : ""} ${isLast ? "rounded-r-lg" : ""}
                            ${isActive
                              ? isDark ? "bg-[#3F3F46] text-[#F4F4F5] z-10 shadow-md" : "bg-[#1D4ED8] text-white z-10 shadow-md shadow-[#1D4ED8]/20"
                              : isPast
                                ? isDark ? "bg-[#27272A] text-[#71717A]" : "bg-[#E3ECFC] text-[#1D4ED8]"
                                : isDark ? "bg-[#1C1C1E] text-[#3F3F46] border border-[#27272A]" : "bg-[#f9fbff] text-slate-400 border border-[#E3ECFC]"}
                          `}>
                            {isLast && <Trophy size={12} weight="duotone" />}
                            <span className="whitespace-nowrap">{stage}</span>
                          </div>
                          {!isLast && (
                            <div className={`w-0 h-0 border-t-[14px] border-b-[14px] border-l-[10px] border-transparent flex-shrink-0 ${
                              isActive ? (isDark ? "border-l-[#3F3F46]" : "border-l-[#1D4ED8]")
                                : isPast ? (isDark ? "border-l-[#27272A]" : "border-l-[#E3ECFC]")
                                : isDark ? "border-l-[#1C1C1E]" : "border-l-[#E3ECFC]"
                            }`} />
                          )}
                        </div>
                      );
                    })}

                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <Tooltip title="Won">
                        <IconButton size="small" sx={{ bgcolor: isDark ? "#14532D" : "#DCFCE7", "&:hover":{bgcolor: isDark ? "#166534" : "#BBF7D0"}, borderRadius:"8px", p:0.8 }}>
                          <ThumbsUp size={14} color={isDark ? "#4ADE80" : "#16A34A"} weight="duotone" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Lost">
                        <IconButton size="small" sx={{ bgcolor: isDark ? "#450A0A" : "#FEF2F2", "&:hover":{bgcolor: isDark ? "#7F1D1D" : "#FECACA"}, borderRadius:"8px", p:0.8 }}>
                          <ThumbsDown size={14} color={isDark ? "#F87171" : "#DC2626"} weight="duotone" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* ── Quick Info ── */}
                <div className={`rounded-2xl border shadow-sm divide-y ${isDark ? "bg-[#1C1C1E] border-[#27272A] divide-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC] divide-[#EFF6FF]"}`}>
                  {[
                    { label: "Deal Name", value: deal.name },
                    { label: "Stage",     value: deal.stage },
                    { label: "Probability (%)", value: String(deal.probability) },
                    { label: "Closing Date", value: deal.closingDate },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3">
                      <span className={`text-[12px] font-medium w-40 flex-shrink-0 ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>{label}:</span>
                      <span className={`flex-1 text-[14px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{value}</span>
                      <IconButton size="small" sx={{ p:0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover":{color:"#1D4ED8", bgcolor: isDark ? "#27272A" : "#EFF6FF"}, borderRadius:"6px" }}>
                        <PencilSimple size={14} weight="duotone" />
                      </IconButton>
                    </div>
                  ))}
                </div>

                {/* ── Deal Information ── */}
                <SectionCard icon={Handshake} title="Deal Information"
                  action={
                    <IconButton size="small" onClick={e => setMoreAnchor(e.currentTarget)}
                      sx={{ p:0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover":{color:"#1D4ED8", bgcolor: isDark ? "#27272A" : "#EFF6FF"}, borderRadius:"6px" }}>
                      <DotsThreeVertical size={16} weight="bold" />
                    </IconButton>
                  }>
                  <InfoGrid>
                    <KV label="Deal Name"        value={deal.name} />
                    <KV label="Amount"            value={`₹${deal.amount.toLocaleString()}`} />
                    <KV label="Deal Owner"        value={deal.owner} />
                    <KV label="Closing Date"      value={deal.closingDate} />
                    <KV label="Account Name"      value={deal.account} />
                    <KV label="Stage"             value={deal.stage} />
                    <KV label="Type"              value={deal.type} />
                    <KV label="Next Step"         value={deal.nextStep} />
                    <KV label="Probability (%)"   value={deal.probability} />
                    <KV label="Lead Source"       value={deal.leadSource} />
                    <KV label="Expected Revenue"  value={`₹${deal.expectedRevenue.toLocaleString()}`} />
                    <KV label="Contact Name"      value={deal.contactName} />
                    <KV label="Created By"        value={`${deal.createdBy} · ${deal.createdAt}`} />
                    <KV label="Modified By"       value={`${deal.modifiedBy} · ${deal.modifiedAt}`} />
                    <KV label="Record Category"   value={deal.recordCategory} />
                  </InfoGrid>
                </SectionCard>

                {/* ── Description ── */}
                <SectionCard icon={Tag} title="Description Information">
                  <KV label="Description" value={deal.description} />
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
                          sx={{ px:2, py:1.5, fontSize:"0.8rem", color: isDark ? "#D4D4D8" : "#334155", "& textarea::placeholder":{ color: isDark ? "#3F3F46" : "#CBD5E1", opacity:1 } }}
                        />
                        {note.trim() && (
                          <div className="flex justify-end px-3 pb-2">
                            <Button size="small" variant="contained" onClick={addNote}
                              sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius:"8px", textTransform:"none", fontWeight:700, fontSize:"0.73rem", "&:hover":{bgcolor: isDark ? "#3F3F46" : "#2563EB"} }}>
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
                          {[{ k:"grid", Icon:GridFour }, { k:"list", Icon:List }].map(({ k, Icon }) => (
                            <button key={k} onClick={() => setAttachView(k as "grid" | "list")}
                              className={`p-1 rounded-md transition-colors ${attachView===k ? (isDark ? "bg-[#3F3F46] text-[#D4D4D8]" : "bg-[#f9fbff] text-[#1D4ED8]") : (isDark ? "text-[#E4E4E7]" : "text-slate-400")}`}>
                              <Icon size={13} weight="duotone" />
                            </button>
                          ))}
                        </div>
                        <Button size="small" variant="outlined"
                          sx={{ borderColor: isDark ? "#27272A" : "#E3ECFC", color: isDark ? "#B4B5B6" : "#1D4ED8", bgcolor: isDark ? "#0F0F0F" : "transparent", borderRadius:"9px", textTransform:"none", fontWeight:600, fontSize:"0.84rem", "&:hover":{ borderColor:"#1D4ED8", color:"#1D4ED8", bgcolor: isDark ? "#0A0A0A" : "#EFF6FF" } }}>
                          Attach
                        </Button>
                      </div>
                    }>
                    <div className={`flex items-center justify-center py-6 text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>
                      No attachments yet
                    </div>
                  </SectionCard>
                </div>

                {/* ── Stage History ── */}
                <div id="section-stage-history">
                  <SectionCard icon={ClockCounterClockwise} title="Stage History"
                    action={
                      <IconButton size="small" sx={{ p:0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover":{color:"#1D4ED8"}, borderRadius:"6px" }}>
                        <DotsThreeVertical size={16} weight="bold" />
                      </IconButton>
                    }>
                    <div className="overflow-x-auto -mx-5 px-5">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className={`border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                            {["Stage","Amount","Probability (%)","Expected Revenue","Stage Duration (Days)","Moved From","Is Current"].map(h => (
                              <th key={h} className={`text-left py-2 pr-4 text-[11.5px] font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-[#ABABAD]" : "text-[#0C2472]"}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-[#27272A]" : "divide-[#EFF6FF]"}`}>
                          {deal.stageHistory.map((row, i) => (
                            <tr key={i} className={`transition-colors ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[rgba(29,78,216,0.03)]"}`}>
                              <td className={`py-3 pr-4 text-[14px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{row.stage}</td>
                              <td className={`py-3 pr-4 text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>₹{row.amount.toLocaleString()}</td>
                              <td className={`py-3 pr-4 text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{row.probability}</td>
                              <td className={`py-3 pr-4 text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>₹{row.expectedRevenue.toLocaleString()}</td>
                              <td className={`py-3 pr-4 text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{row.stageDurationDays}</td>
                              <td className={`py-3 pr-4 text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{row.movedFrom || "—"}</td>
                              <td className="py-3 pr-4">
                                {row.isCurrent === 1 && (
                                  <span className="text-[11px] font-bold bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-full">1</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </div>

                {/* ── Tasks ── */}
                <div id="section-tasks">
                  <SectionCard icon={ClipboardText} title="Tasks"
                    action={
                      <div className="flex items-center gap-2">
                        <Button size="small" variant="contained" startIcon={<Plus size={13} weight="bold" />}
                          sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius:"8px", textTransform:"none", fontWeight:700, fontSize:"0.73rem", boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", "&:hover":{bgcolor: isDark ? "#3F3F46" : "#2563EB"} }}>
                          New Task
                        </Button>
                        <IconButton size="small" sx={{ p:0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover":{color:"#1D4ED8"}, borderRadius:"6px" }}>
                          <DotsThreeVertical size={16} weight="bold" />
                        </IconButton>
                      </div>
                    }>
                    <div className="overflow-x-auto -mx-5 px-5">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                            <th className={`text-left py-2 pr-4 text-[11.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-[#0C2472]"}`}>Subject</th>
                            <th className={`text-left py-2 pr-4 text-[11.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-[#0C2472]"}`}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deal.tasks.length === 0 ? (
                            <tr>
                              <td colSpan={2} className={`py-8 text-center text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>No rows</td>
                            </tr>
                          ) : deal.tasks.map((t, i) => (
                            <tr key={i} className={`border-b transition-colors ${isDark ? "border-[#27272A] hover:bg-[#27272A]" : "border-[#EFF6FF] hover:bg-[rgba(29,78,216,0.03)]"}`}>
                              <td className={`py-3 pr-4 text-[14px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{t.subject}</td>
                              <td className={`py-3 pr-4 text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{t.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </div>

              </div>{/* end col-span-2 */}

              <div className="lg:sticky lg:top-4 lg:self-start">
                <RelatedListPanel onClickItem={label =>
                  document.getElementById(`section-${label.toLowerCase().replace(/\s/g, "-")}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                } />
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2">
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                  <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
                      <ClockCounterClockwise size={13} color={isDark ? "#9CA3AF" : "#1D4ED8"} weight="duotone" />
                    </div>
                    <p className={`font-heading text-[12px] font-bold uppercase tracking-[0.12em] ${isDark ? "text-[#D4D4D8]" : "text-[#1D4ED8]"}`}>History</p>
                  </div>

                  {deal.timeline.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <ClockCounterClockwise size={28} color={isDark ? "#27272A" : "#E2E8F0"} weight="duotone" />
                      <p className={`text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-400"}`}>No history yet</p>
                    </div>
                  ) : (() => {
                    const grouped: Record<string, TimelineEntry[]> = {};
                    deal.timeline.forEach(e => {
                      if (!grouped[e.date]) grouped[e.date] = [];
                      grouped[e.date].push(e);
                    });
                    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

                    return (
                      <div className="px-6 py-5 space-y-6">
                        {sortedDates.map(date => (
                          <div key={date}>
                            <div className="flex items-center gap-3 mb-4">
                              <span className={`text-[12px] font-semibold ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
                                {new Date(date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                              </span>
                              <div className={`flex-1 h-px ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
                            </div>

                            <div className="space-y-0">
                              {grouped[date].map((entry, i) => {
                                const isLast = i === grouped[date].length - 1 && date === sortedDates[sortedDates.length - 1];
                                return (
                                  <div key={i} className="flex gap-4">
                                    <div className="w-16 flex-shrink-0 text-right">
                                      <span className={`text-[12px] font-medium ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{entry.time}</span>
                                    </div>

                                    <div className="flex flex-col items-center flex-shrink-0">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                                        <PencilSimple size={13} color={isDark ? "#A1A1AA" : "#1D4ED8"} weight="duotone" />
                                      </div>
                                      {!isLast && <div className={`w-px flex-1 my-1 min-h-[24px] ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />}
                                    </div>

                                    <div className="pb-5 flex-1 min-w-0 overflow-hidden">
                                      {entry.probability && (
                                        <p className={`text-[14px] leading-relaxed break-words ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>
                                          <span className="font-bold">Probability:</span>{" "}
                                          <span className={isDark ? "text-[#71717A]" : "text-slate-500"}>{entry.probability.from}.0 → {entry.probability.to}.0</span>
                                        </p>
                                      )}
                                      {entry.stage && entry.stage.to && (
                                        <p className={`text-[14px] leading-relaxed break-words ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>
                                          <span className="font-bold">Stage:</span>{" "}
                                          {entry.stage.from
                                            ? <span className={isDark ? "text-[#71717A]" : "text-slate-500"}>{entry.stage.from} → {entry.stage.to}</span>
                                            : <span className={isDark ? "text-[#71717A]" : "text-slate-500"}>{entry.stage.to}</span>
                                          }
                                        </p>
                                      )}
                                      <p className={`text-[12px] mt-0.5 break-all ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>by {entry.by}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>{/* end col-span-2 */}

              <div className="lg:sticky lg:top-4 lg:self-start">
                <RelatedListPanel onClickItem={() => setActiveTab("overview")} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── More menu ── */}
      <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}
        PaperProps={{ sx:{ borderRadius:"12px", border:`1px solid ${isDark ? "#27272A" : "#E3ECFC"}`, bgcolor: isDark ? "#1C1C1E" : "#fff", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)", minWidth:160 } }}>
        {[
          { label:"Edit Deal", icon:PencilSimple, color: isDark ? "#D4D4D8" : "#334155" },
          { label:"Copy",      icon:Copy,         color: isDark ? "#D4D4D8" : "#334155" },
          { label:"Delete",    icon:Trash,        color:"#EF4444" },
        ].map(opt => (
          <MenuItem key={opt.label} onClick={() => setMoreAnchor(null)}
            sx={{ mx:0.5, borderRadius:"8px", py:1, "&:hover":{bgcolor: isDark ? "#27272A" : "#EFF6FF"} }}>
            <ListItemIcon sx={{ minWidth:30 }}>
              <opt.icon size={15} color={opt.color} weight="duotone" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize:"0.8rem", fontWeight:600, color: opt.color==="#EF4444"?"#EF4444": (isDark ? "#D4D4D8" : "#334155") }}>
              {opt.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
