"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  House, CaretRight, PencilSimple, DotsThreeVertical,
  Note, ClipboardText, Paperclip, ClockCounterClockwise,
  Plus, GridFour, List, UserCircle, MapPin, Handshake,
  Phone, Envelope, Buildings,
} from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
interface TimelineEntry {
  date: string;
  time: string;
  field?: string;
  from?: string;
  to?: string;
  by: string;
}

interface RelatedDeal {
  name: string; amount: number; stage: string;
  probability: number; closingDate: string;
}

interface ContactRecord {
  id: number; refId: string;
  firstName: string; lastName: string;
  contactOwner: string; contactOwnerEmail: string;
  email: string; phone: string; mobile: string; department: string;
  title: string; leadSource: string; accountName: string;
  otherPhone: string; homePhone: string; fax: string;
  assistant: string; dateOfBirth: string; asstPhone: string;
  emailOptOut: boolean; skypeId: string; secondaryEmail: string;
  twitter: string; reportingTo: string;
  mailingAddress: string; otherAddress: string;
  createdBy: string; createdAt: string;
  modifiedBy: string; modifiedAt: string;
  relatedDeals: RelatedDeal[];
  timeline: TimelineEntry[];
}

// ─────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────
const CONTACTS_DETAIL: Record<number, ContactRecord> = {
  1: {
    id: 1, refId: "Cop Mar",
    firstName: "Cop", lastName: "Mar",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "", phone: "", mobile: "", department: "",
    title: "Sweany Inc", leadSource: "Advertisement", accountName: "Sweany Inc",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Wed, May 27, 2026 02:38 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Wed, May 27, 2026 02:38 PM",
    relatedDeals: [
      { name: "New", amount: 29999, stage: "Proposal/Price Quote", probability: 75, closingDate: "2026-07-15" },
    ],
    timeline: [
      { date: "2026-05-27", time: "02:38 pm", field: "Created", from: "", to: "Cop Mar", by: "pm@socialdnalabs.com" },
    ],
  },
  2: {
    id: 2, refId: "Michael Lee",
    firstName: "Michael", lastName: "Lee",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "michael.lee@demo.com", phone: "", mobile: "9123456780", department: "",
    title: "", leadSource: "Web", accountName: "",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Thu, May 15, 2026 09:31 AM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Thu, May 15, 2026 09:31 AM",
    relatedDeals: [],
    timeline: [
      { date: "2026-05-15", time: "09:31 am", field: "Created", from: "", to: "Michael Lee", by: "pm@socialdnalabs.com" },
    ],
  },
  3: {
    id: 3, refId: "Lead SDL 11",
    firstName: "Lead SDL", lastName: "11",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "leadsdl1@mailinator.com", phone: "", mobile: "9999992222", department: "",
    title: "", leadSource: "Referral", accountName: "SDL LEAD1",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Wed, Apr 15, 2026 11:13 AM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Wed, Apr 15, 2026 11:13 AM",
    relatedDeals: [
      { name: "Deal SDL 11", amount: 500000, stage: "Identify Decision Makers", probability: 60, closingDate: "2026-08-31" },
    ],
    timeline: [
      { date: "2026-04-15", time: "11:13 am", field: "Created", from: "", to: "Lead SDL 11", by: "pm@socialdnalabs.com" },
    ],
  },
  4: {
    id: 4, refId: "John Smith",
    firstName: "John", lastName: "Smith",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "johnsmith@mailinator.com", phone: "9898989898", mobile: "", department: "",
    title: "", leadSource: "Cold Call", accountName: "Sears Homelife",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Sun, Apr 13, 2026 06:00 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Mon, Apr 14, 2026 07:45 PM",
    relatedDeals: [
      { name: "test deal john smith", amount: 200000, stage: "Qualification", probability: 10, closingDate: "2026-09-30" },
      { name: "Smith", amount: 100000, stage: "Value Proposition", probability: 40, closingDate: "2026-09-01" },
    ],
    timeline: [
      { date: "2026-04-14", time: "07:45 pm", field: "Account Name", from: "", to: "Sears Homelife", by: "pm@socialdnalabs.com" },
      { date: "2026-04-13", time: "06:00 pm", field: "Created", from: "", to: "John Smith", by: "pm@socialdnalabs.com" },
    ],
  },
  5: {
    id: 5, refId: "Raja rajan",
    firstName: "Raja", lastName: "rajan",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "rajarajan@rmvt.com", phone: "", mobile: "", department: "",
    title: "", leadSource: "Advertisement", accountName: "RMVT",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Mon, Apr 14, 2026 06:40 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Mon, Apr 14, 2026 07:30 PM",
    relatedDeals: [
      { name: "testing", amount: 500000, stage: "Needs Analysis", probability: 20, closingDate: "2026-07-31" },
      { name: "fsm single user application", amount: 200000, stage: "Qualification", probability: 10, closingDate: "2026-09-15" },
      { name: "Test", amount: 10000, stage: "Qualification", probability: 10, closingDate: "2026-06-30" },
    ],
    timeline: [
      { date: "2026-04-14", time: "07:30 pm", field: "Account Name", from: "", to: "RMVT", by: "pm@socialdnalabs.com" },
      { date: "2026-04-14", time: "06:40 pm", field: "Created", from: "", to: "Raja rajan", by: "pm@socialdnalabs.com" },
    ],
  },
  6: {
    id: 6, refId: "mmmm mmmm",
    firstName: "mmmm", lastName: "mmmm",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "mmmm@rmvt.com", phone: "", mobile: "", department: "",
    title: "", leadSource: "Advertisement", accountName: "RMVT",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Mon, Apr 14, 2026 06:53 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Mon, Apr 14, 2026 06:53 PM",
    relatedDeals: [
      { name: "fsm enterprise application", amount: 800000, stage: "Needs Analysis", probability: 20, closingDate: "2026-10-31" },
    ],
    timeline: [
      { date: "2026-04-14", time: "06:53 pm", field: "Created", from: "", to: "mmmm mmmm", by: "pm@socialdnalabs.com" },
    ],
  },
  7: {
    id: 7, refId: "Vishnutharan R",
    firstName: "Vishnutharan", lastName: "R",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "vishnu@rmvt.com", phone: "", mobile: "", department: "",
    title: "", leadSource: "Web", accountName: "RMVT",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Mon, Apr 14, 2026 06:38 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Mon, Apr 14, 2026 06:44 PM",
    relatedDeals: [
      { name: "CRM Application", amount: 500000, stage: "Qualification", probability: 10, closingDate: "2026-10-01" },
    ],
    timeline: [
      { date: "2026-04-14", time: "06:44 pm", field: "Account Name", from: "", to: "RMVT", by: "pm@socialdnalabs.com" },
      { date: "2026-04-14", time: "06:38 pm", field: "Created", from: "", to: "Vishnutharan R", by: "pm@socialdnalabs.com" },
    ],
  },
  8: {
    id: 8, refId: "test test",
    firstName: "test", lastName: "test",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "test@mailinator.com", phone: "", mobile: "", department: "",
    title: "", leadSource: "Web", accountName: "test",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Sun, Apr 13, 2026 06:17 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Sun, Apr 13, 2026 06:17 PM",
    relatedDeals: [
      { name: "Deal test", amount: 150000, stage: "Qualification", probability: 10, closingDate: "2026-07-01" },
      { name: "test", amount: 50000, stage: "Needs Analysis", probability: 20, closingDate: "2026-08-01" },
    ],
    timeline: [
      { date: "2026-04-13", time: "06:17 pm", field: "Created", from: "", to: "test test", by: "pm@socialdnalabs.com" },
    ],
  },
  9: {
    id: 9, refId: "Speedy Mike",
    firstName: "Speedy", lastName: "Mike",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "", phone: "", mobile: "0111111111", department: "",
    title: "", leadSource: "Cold Call", accountName: "Speedy Motors",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Sun, Apr 13, 2026 05:56 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Sun, Apr 13, 2026 05:56 PM",
    relatedDeals: [
      { name: "Mike", amount: 0, stage: "Qualification", probability: 10, closingDate: "2026-12-31" },
    ],
    timeline: [
      { date: "2026-04-13", time: "05:56 pm", field: "Created", from: "", to: "Speedy Mike", by: "pm@socialdnalabs.com" },
    ],
  },
  10: {
    id: 10, refId: "SDL Test Test",
    firstName: "SDL Test", lastName: "Test",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "sdltest@mailinator.com", phone: "9988776655", mobile: "", department: "",
    title: "", leadSource: "Web", accountName: "SDL",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Tue, Mar 17, 2026 06:06 PM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Fri, Mar 20, 2026 05:13 PM",
    relatedDeals: [
      { name: "CRM Application", amount: 200000, stage: "Qualification", probability: 10, closingDate: "2026-08-15" },
    ],
    timeline: [
      { date: "2026-03-20", time: "05:13 pm", field: "Account Name", from: "", to: "SDL", by: "pm@socialdnalabs.com" },
      { date: "2026-03-17", time: "06:06 pm", field: "Created", from: "", to: "SDL Test Test", by: "pm@socialdnalabs.com" },
    ],
  },
  11: {
    id: 11, refId: "SDL Mar 17 SDL",
    firstName: "SDL Mar 17", lastName: "SDL",
    contactOwner: "PM SDL", contactOwnerEmail: "pm@socialdnalabs.com",
    email: "", phone: "77881122", mobile: "", department: "",
    title: "", leadSource: "Web", accountName: "SDL",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "pm@socialdnalabs.com", createdAt: "Mon, Mar 17, 2026 11:32 AM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Mon, Mar 17, 2026 11:34 AM",
    relatedDeals: [],
    timeline: [
      { date: "2026-03-17", time: "11:34 am", field: "Phone", from: "", to: "77881122", by: "pm@socialdnalabs.com" },
      { date: "2026-03-17", time: "11:32 am", field: "Created", from: "", to: "SDL Mar 17 SDL", by: "pm@socialdnalabs.com" },
    ],
  },
  12: {
    id: 12, refId: "Jimmy Davis",
    firstName: "Jimmy", lastName: "Davis",
    contactOwner: "Admin", contactOwnerEmail: "admin@mailinator.com",
    email: "", phone: "8877994455", mobile: "", department: "",
    title: "", leadSource: "Cold Call", accountName: "",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "admin@mailinator.com", createdAt: "Tue, Jul 08, 2025 11:14 AM",
    modifiedBy: "pm@socialdnalabs.com", modifiedAt: "Mon, Mar 17, 2026 11:32 AM",
    relatedDeals: [],
    timeline: [
      { date: "2026-03-17", time: "11:32 am", field: "Modified By", from: "admin@mailinator.com", to: "pm@socialdnalabs.com", by: "pm@socialdnalabs.com" },
      { date: "2025-07-08", time: "11:14 am", field: "Created", from: "", to: "Jimmy Davis", by: "admin@mailinator.com" },
    ],
  },
  13: {
    id: 13, refId: "Test user001",
    firstName: "Test", lastName: "user001",
    contactOwner: "Admin", contactOwnerEmail: "admin@mailinator.com",
    email: "", phone: "9978654311", mobile: "", department: "",
    title: "", leadSource: "Web", accountName: "",
    otherPhone: "", homePhone: "", fax: "", assistant: "", dateOfBirth: "",
    asstPhone: "", emailOptOut: false, skypeId: "", secondaryEmail: "",
    twitter: "", reportingTo: "",
    mailingAddress: "", otherAddress: "",
    createdBy: "admin@mailinator.com", createdAt: "Wed, Aug 20, 2025 11:57 AM",
    modifiedBy: "admin@mailinator.com", modifiedAt: "Thu, Feb 05, 2026 06:50 PM",
    relatedDeals: [],
    timeline: [
      { date: "2026-02-05", time: "06:50 pm", field: "Phone", from: "", to: "9978654311", by: "admin@mailinator.com" },
      { date: "2025-08-20", time: "11:57 am", field: "Created", from: "", to: "Test user001", by: "admin@mailinator.com" },
    ],
  },
};

// ─────────────────────────────────────────────
//  Avatar color helper
// ─────────────────────────────────────────────
const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777", "#0EA5E9", "#EF4444"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PAL.length];

// ─────────────────────────────────────────────
//  Sub-components (theme-aware)
// ─────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, action, id }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
  action?: React.ReactNode; id?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div id={id} className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
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

function KV({ label, value, fullWidth }: { label: string; value?: string | boolean; fullWidth?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const display = value !== undefined && value !== "" && value !== false
    ? (typeof value === "boolean" ? (value ? "Yes" : "No") : String(value))
    : (typeof value === "boolean" ? "No" : "—");
  const isEmpty = display === "—" || display === "No";
  return (
    <div className={`py-2 border-b last:border-0 ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"} ${fullWidth ? "col-span-2" : ""}`}>
      <p className={`font-heading text-[11.5px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{label}</p>
      <p className={`text-[14px] font-medium ${isEmpty ? (isDark ? "text-[#3F3F46] italic" : "text-slate-300 italic") : (isDark ? "text-[#D4D4D8]" : "text-slate-800")}`}>{display}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────
export default function ContactDetail({ contactId }: { contactId: number }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const contact = CONTACTS_DETAIL[contactId];

  const [activeTab, setActiveTab] = useState<"overview" | "timeline">("overview");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ text: string; at: string }[]>([]);
  const [attachView, setAttachView] = useState<"grid" | "list">("grid");
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);

  if (!contact) {
    return (
      <div className="flex h-screen bg-transparent font-sans">
        <Sidebar />
        <div className="sidebar-content flex-1 flex flex-col">
          {/* <TopBar title="Contacts" /> */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className={`text-xl font-bold mb-2 ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>Contact not found</p>
              <button onClick={() => router.push("/contacts")} className={`text-sm underline ${isDark ? "text-[#A1A1AA]" : "text-[#1D4ED8]"}`}>
                Back to Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(prev => [{
      text: note.trim(),
      at: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    }, ...prev]);
    setNote("");
  };

  const relatedItems = [
    { label: "Tasks",        icon: ClipboardText, count: 0,                          color: "#10B981" },
    { label: "Notes",        icon: Note,          count: notes.length,               color: "#8B5CF6" },
    { label: "Attachments",  icon: Paperclip,     count: 0,                          color: "#F59E0B" },
    { label: "Contact Name", icon: Handshake,     count: contact.relatedDeals.length, color: "#64748B" },
  ];

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const avColor = avatarColor(fullName);
  const initials = `${contact.firstName[0] ?? ""}${contact.lastName[0] ?? ""}`.toUpperCase();

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
        <div className="flex items-center gap-2.5">
          <Avatar sx={{ width: 28, height: 28, bgcolor: avatarColor(contact.contactOwner), fontSize: "0.6rem", fontWeight: 800 }}>
            {contact.contactOwner.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
          </Avatar>
          <div>
            <p className={`text-[13px] font-semibold leading-tight ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{contact.contactOwner}</p>
            <p className={`text-[11px] ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{contact.contactOwnerEmail}</p>
          </div>
        </div>
        <div className={`h-px ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`} />
        <div className="flex justify-between text-[12px]">
          <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Created</span>
          <span className={`font-semibold text-right max-w-[130px] ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{contact.createdAt}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className={`font-medium ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>Modified</span>
          <span className={`font-semibold text-right max-w-[130px] ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{contact.modifiedAt}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-transparent font-sans">
      <Sidebar />

      <div className="sidebar-content flex-1 flex flex-col min-h-screen overflow-auto">
        {/* <TopBar title="Contacts" /> */}

        <main className="flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-4 animate-fade-in">

          {/* ── Breadcrumb ── */}
          <div className={`flex items-center gap-1.5 text-[13.5px] ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>
            <House size={16} weight="duotone" />
            <CaretRight size={12} weight="duotone" />
            <Link href="/contacts" className="hover:text-[#1D4ED8] transition-colors font-medium">Contacts</Link>
            <CaretRight size={12} weight="duotone" />
            <span className="text-[#1D4ED8] font-semibold truncate max-w-[240px]">{fullName}</span>
          </div>

          {/* ── Header card ── */}
          <div className={`rounded-2xl border shadow-sm px-5 py-4 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
            <div className="flex items-start gap-4 flex-wrap">
              <Avatar sx={{ width: 56, height: 56, bgcolor: avColor, fontSize: "1.2rem", fontWeight: 800, boxShadow: "0 4px 14px 0 rgba(12,36,114,0.2)", flexShrink: 0 }}>
                {initials}
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className={`m-0 text-[20px] font-extrabold tracking-tight leading-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{fullName}</h1>
                {contact.title && (
                  <p className={`text-[13px] mt-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{contact.title}</p>
                )}
                <p className={`text-[12px] mt-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>
                  ID: {contact.refId}
                  {contact.accountName && <span> · {contact.accountName}</span>}
                </p>
                {/* Quick contact chips */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {contact.email && (
                    <span className={`flex items-center gap-1 text-[12px] ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>
                      <Envelope size={12} color="#94A3B8" weight="duotone" />{contact.email}
                    </span>
                  )}
                  {contact.phone && (
                    <span className={`flex items-center gap-1 text-[12px] ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>
                      <Phone size={12} color="#94A3B8" weight="duotone" />{contact.phone}
                    </span>
                  )}
                  {contact.accountName && (
                    <span className={`flex items-center gap-1 text-[12px] ${isDark ? "text-[#ABABAD]" : "text-slate-500"}`}>
                      <Buildings size={12} color="#94A3B8" weight="duotone" />{contact.accountName}
                    </span>
                  )}
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                <Button variant="outlined" size="small"
                  sx={{ borderColor: isDark ? "#27272A" : "#E3ECFC", color: isDark ? "#B4B5B6" : "#1D4ED8", borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "0.84rem", bgcolor: isDark ? "#0F0F0F" : "transparent", "&:hover": { borderColor: "#1D4ED8", color: "#1D4ED8", bgcolor: isDark ? "#0A0A0A" : "#EFF6FF" } }}>
                  Send Email
                </Button>
                <Button variant="contained" size="small"
                  startIcon={<PencilSimple size={13} weight="bold" />}
                  sx={{ bgcolor: "#1D4ED8", borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.84rem", boxShadow: "0 1px 8px 0 #1D4ED833", "&:hover": { bgcolor: "#60A5FA", boxShadow: "0 2px 14px 0 #60A5FA55" }, "&:active": { bgcolor: "#0C2472" } }}>
                  Edit
                </Button>
                <Tooltip title="More actions">
                  <IconButton size="small" onClick={e => setMoreAnchor(e.currentTarget)}
                    sx={{ borderRadius: "8px", border: isDark ? "1.5px solid #27272A" : "1.5px solid #E3ECFC", bgcolor: moreAnchor ? (isDark ? "#27272A" : "#EFF6FF") : (isDark ? "#0A0A0A" : "transparent"), "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
                    <DotsThreeVertical size={16} color={isDark ? "#B4B5B6" : "#64748B"} weight="bold" />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}
                  PaperProps={{ sx: { borderRadius: "12px", border: isDark ? "1px solid #27272A" : "1px solid #E3ECFC", bgcolor: isDark ? "#1C1C1E" : "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 160 } }}>
                  <MenuItem onClick={() => setMoreAnchor(null)} sx={{ fontSize: "0.84rem", color: isDark ? "#D4D4D8" : "#334155", "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>Convert</MenuItem>
                  <MenuItem onClick={() => setMoreAnchor(null)} sx={{ fontSize: "0.84rem", color: "#EF4444", "&:hover": { bgcolor: isDark ? "#27272A" : "#FEF2F2" } }}>Delete</MenuItem>
                </Menu>
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

          {/* ══════════════ OVERVIEW TAB ══════════════ */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-2 space-y-5 min-w-0">

                {/* ── Quick info card ── */}
                <div className={`rounded-2xl border shadow-sm divide-y ${isDark ? "bg-[#1C1C1E] border-[#27272A] divide-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC] divide-[#EFF6FF]"}`}>
                  {[
                    { label: "Contact Owner", value: contact.contactOwner },
                    { label: "Email",         value: contact.email },
                    { label: "Phone",         value: contact.phone },
                    { label: "Mobile",        value: contact.mobile },
                    { label: "Department",    value: contact.department },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center px-5 py-3">
                      <span className={`text-[12px] font-medium w-40 flex-shrink-0 ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>{label}:</span>
                      <span className={`flex-1 text-[14px] font-semibold ${value ? (isDark ? "text-[#D4D4D8]" : "text-slate-700") : (isDark ? "text-[#3F3F46]" : "text-slate-300")}`}>
                        {value || "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Contact Information ── */}
                <SectionCard icon={UserCircle} title="Contact Information"
                  action={
                    <IconButton size="small"
                      sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover": { color: "#1D4ED8", bgcolor: isDark ? "#27272A" : "#EFF6FF" }, borderRadius: "6px" }}>
                      <DotsThreeVertical size={16} weight="bold" />
                    </IconButton>
                  }>
                  <div className="grid grid-cols-2 gap-x-10 gap-y-0">
                    <KV label="First Name"       value={contact.firstName} />
                    <KV label="Last Name"        value={contact.lastName} />
                    <KV label="Contact Owner"    value={contact.contactOwner} />
                    <KV label="Lead Source"      value={contact.leadSource} />
                    <KV label="Account Name"     value={contact.accountName} />
                    <KV label="Email"            value={contact.email} />
                    <KV label="Title"            value={contact.title} />
                    <KV label="Phone"            value={contact.phone} />
                    <KV label="Department"       value={contact.department} />
                    <KV label="Other Phone"      value={contact.otherPhone} />
                    <KV label="Home Phone"       value={contact.homePhone} />
                    <KV label="Mobile"           value={contact.mobile} />
                    <KV label="Fax"              value={contact.fax} />
                    <KV label="Assistant"        value={contact.assistant} />
                    <KV label="Date of Birth"    value={contact.dateOfBirth} />
                    <KV label="Created By"       value={`${contact.createdBy}\n${contact.createdAt}`} />
                    <KV label="Asst Phone"       value={contact.asstPhone} />
                    <KV label="Modified By"      value={`${contact.modifiedBy}\n${contact.modifiedAt}`} />
                    <KV label="Email Opt Out"    value={contact.emailOptOut} />
                    <KV label="Skype ID"         value={contact.skypeId} />
                    <KV label="Secondary Email"  value={contact.secondaryEmail} />
                    <KV label="Twitter"          value={contact.twitter} />
                    <KV label="Reporting To"     value={contact.reportingTo} fullWidth />
                  </div>
                </SectionCard>

                {/* ── Address Information ── */}
                <SectionCard icon={MapPin} title="Address Information">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-0">
                    <KV label="Mailing Address" value={contact.mailingAddress} />
                    <KV label="Other Address"   value={contact.otherAddress} />
                  </div>
                </SectionCard>

                {/* ── Tasks ── */}
                <div id="section-tasks">
                  <SectionCard icon={ClipboardText} title="Tasks"
                    action={
                      <div className="flex items-center gap-2">
                        <Button size="small" variant="contained"
                          startIcon={<Plus size={13} weight="bold" />}
                          sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius: "8px", textTransform: "none", fontWeight: 700, fontSize: "0.73rem", boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "#2563EB" } }}>
                          New Task
                        </Button>
                        <IconButton size="small"
                          sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover": { color: "#1D4ED8" }, borderRadius: "6px" }}>
                          <DotsThreeVertical size={16} weight="bold" />
                        </IconButton>
                      </div>
                    }>
                    <div className="overflow-x-auto -mx-5 px-5">
                      <table className="w-full text-[14px]">
                        <thead>
                          <tr className={`border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                            <th className={`text-left py-2 pr-4 text-[11.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-[#0C2472]"}`}>Subject</th>
                            <th className={`text-left py-2 pr-4 text-[11.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#ABABAD]" : "text-[#0C2472]"}`}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={2} className={`py-8 text-center text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>No rows</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </div>

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
                          sx={{ px: 2, py: 1.5, fontSize: "0.8rem", color: isDark ? "#D4D4D8" : "#334155", "& textarea::placeholder": { color: isDark ? "#3F3F46" : "#CBD5E1", opacity: 1 } }}
                        />
                        {note.trim() && (
                          <div className="flex justify-end px-3 pb-2">
                            <Button size="small" variant="contained" onClick={addNote}
                              sx={{ bgcolor: "#1D4ED8", color: "white", borderRadius: "8px", textTransform: "none", fontWeight: 700, fontSize: "0.73rem", "&:hover": { bgcolor: "#2563EB" } }}>
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
                          sx={{ borderColor: isDark ? "#3F3F46" : "#E3ECFC", color: isDark ? "#A1A1AA" : "#0C2472", bgcolor: isDark ? "#27272A" : "#E3ECFC", borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "0.73rem", "&:hover": { borderColor: isDark ? "#9CA3AF" : "#E3ECFC", bgcolor: isDark ? "#3F3F46" : "#f9fbff" } }}>
                          Attach
                        </Button>
                      </div>
                    }>
                    <div className={`flex items-center justify-center py-6 text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>
                      No attachments yet
                    </div>
                  </SectionCard>
                </div>

                {/* ── Contact Name (Related Deals) ── */}
                <div id="section-contact-name">
                  <SectionCard icon={Handshake} title="Contact Name"
                    action={
                      <div className="flex items-center gap-2">
                        <Button size="small" variant="contained"
                          startIcon={<Plus size={13} weight="bold" />}
                          sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius: "8px", textTransform: "none", fontWeight: 700, fontSize: "0.73rem", boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "#2563EB" } }}>
                          New Contact
                        </Button>
                        <IconButton size="small"
                          sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&:hover": { color: "#1D4ED8" }, borderRadius: "6px" }}>
                          <DotsThreeVertical size={16} weight="bold" />
                        </IconButton>
                      </div>
                    }>
                    <div className="overflow-x-auto -mx-5 px-5">
                      <table className="w-full text-[14px] min-w-[500px]">
                        <thead>
                          <tr className={`border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                            {["Deal Name", "Amount", "Stage", "Probability (%)", "Closing Date"].map(h => (
                              <th key={h} className={`text-left py-2 pr-4 text-[11.5px] font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-[#ABABAD]" : "text-[#0C2472]"}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {contact.relatedDeals.length === 0 ? (
                            <tr>
                              <td colSpan={5} className={`py-8 text-center text-[14px] ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}>No rows</td>
                            </tr>
                          ) : contact.relatedDeals.map((d, i) => (
                            <tr key={i} className={`border-b transition-colors ${isDark ? "border-[#27272A] hover:bg-[#27272A]" : "border-[#EFF6FF] hover:bg-[rgba(29,78,216,0.03)]"}`}>
                              <td className={`py-3 pr-4 font-medium cursor-pointer hover:underline ${isDark ? "text-[#A1A1AA]" : "text-[#1D4ED8]"}`}>{d.name}</td>
                              <td className={`py-3 pr-4 ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>₹{d.amount.toLocaleString()}</td>
                              <td className={`py-3 pr-4 ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{d.stage}</td>
                              <td className={`py-3 pr-4 ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{d.probability}</td>
                              <td className={`py-3 pr-4 ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{d.closingDate}</td>
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
                  document.getElementById(`section-${label.toLowerCase().replace(/\s+/g, "-")}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                } />
              </div>
            </div>
          )}

          {/* ══════════════ TIMELINE TAB ══════════════ */}
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

                  {contact.timeline.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <ClockCounterClockwise size={28} color={isDark ? "#27272A" : "#E2E8F0"} weight="duotone" />
                      <p className={`text-[14px] ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>No history yet</p>
                    </div>
                  ) : (() => {
                    const grouped: Record<string, TimelineEntry[]> = {};
                    contact.timeline.forEach(e => {
                      if (!grouped[e.date]) grouped[e.date] = [];
                      grouped[e.date].push(e);
                    });
                    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

                    return (
                      <div className="px-6 py-5 space-y-6">
                        {sortedDates.map(date => (
                          <div key={date}>
                            <div className="flex items-center gap-3 mb-4">
                              <span className={`text-[12px] font-semibold whitespace-nowrap ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>
                                {new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                              <div className={`flex-1 h-px ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
                            </div>

                            <div className="space-y-0">
                              {grouped[date].map((entry, i) => {
                                const isLast = i === grouped[date].length - 1 && date === sortedDates[sortedDates.length - 1];
                                return (
                                  <div key={i} className="flex gap-4">
                                    <div className="w-16 flex-shrink-0 text-right">
                                      <span className={`text-[12px] font-medium ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>{entry.time}</span>
                                    </div>
                                    <div className="flex flex-col items-center flex-shrink-0">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF] border-[#E3ECFC]"}`}>
                                        <PencilSimple size={13} color={isDark ? "#9CA3AF" : "#1D4ED8"} weight="duotone" />
                                      </div>
                                      {!isLast && <div className={`w-px flex-1 my-1 min-h-[20px] ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />}
                                    </div>
                                    <div className="pb-5 flex-1 min-w-0 overflow-hidden">
                                      {entry.field && (
                                        <p className={`text-[14px] leading-relaxed break-words ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>
                                          <span className="font-bold">{entry.field}:</span>{" "}
                                          {entry.from
                                            ? <span className={isDark ? "text-[#71717A]" : "text-slate-500"}>{entry.from} → {entry.to}</span>
                                            : <span className={isDark ? "text-[#71717A]" : "text-slate-500"}>{entry.to}</span>
                                          }
                                        </p>
                                      )}
                                      <p className={`text-[12px] mt-0.5 break-all ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>by {entry.by}</p>
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
    </div>
  );
}
