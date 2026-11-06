"use client";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { Plus, Phone, Envelope, Buildings, DotsThreeVertical } from "@phosphor-icons/react";
import { LEAD_AVATARS, OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

type LeadStatus = "New" | "Contacted" | "In Progress" | "Qualified" | "Lost" | "Unqualified";

interface Lead {
  id: number; name: string; company: string; email: string; mobile: string;
  status: LeadStatus; owner: string; ownerInitials: string;
}

const STATUSES: { key: LeadStatus; label: string; color: string; bg: string; dot: string; headerBg: string }[] = [
  { key: "New",         label: "New",          color: "#0C2472", bg: "#EFF6FF", dot: "#E3ECFC", headerBg: "#0C2472" },
  { key: "Contacted",   label: "Contacted",    color: "inherit", bg: "#E3ECFC", dot: "#3B82F6", headerBg: "#1D4ED8" },
  { key: "In Progress", label: "In Progress",  color: "#0C2472", bg: "#E3ECFC", dot: "#E3ECFC", headerBg: "#B45309" },
  { key: "Qualified",   label: "Qualified",    color: "#166534", bg: "#DCFCE7", dot: "#16A34A", headerBg: "#166534" },
  { key: "Lost",        label: "Lost",         color: "#991B1B", bg: "#FEF2F2", dot: "#EF4444", headerBg: "#991B1B" },
  { key: "Unqualified", label: "Unqualified",  color: "#475569", bg: "#EFF6FF", dot: "#94A3B8", headerBg: "#334155" },
];

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PAL.length];
const initials    = (n: string) => { const p = n.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.substring(0, 2).toUpperCase(); };

interface Props { leads: Lead[] }

export default function LeadKanbanView({ leads }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const byStatus = Object.fromEntries(STATUSES.map(s => [s.key, leads.filter(l => l.status === s.key)]));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-280px)]" style={{ scrollbarWidth: "thin" }}>
      {STATUSES.map(col => {
        const colLeads = byStatus[col.key] || [];

        return (
          <div key={col.key} className="flex-shrink-0 w-[240px] flex flex-col">
            {/* Column header — keeps semantic color regardless of theme */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 text-white"
              style={{ backgroundColor: col.headerBg }}
            >
              <div className="flex items-center gap-2">
                <span className="font-heading text-[14px] font-bold">{col.label}</span>
                <span className="text-[11px] font-bold bg-[#f9fbff]/20 px-1.5 py-0.5 rounded-full leading-none">
                  {colLeads.length}
                </span>
              </div>
              <Tooltip title={`Add lead to ${col.label}`}>
                <button
                  onClick={e => e.stopPropagation()}
                  className="w-6 h-6 rounded-lg bg-[#f9fbff]/15 hover:bg-[#f9fbff]/30 flex items-center justify-center transition-colors"
                >
                  <Plus size={13} color="white" weight="bold" />
                </button>
              </Tooltip>
            </div>

            {/* Lead cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
              {colLeads.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed text-[12px] text-center ${isDark ? "text-[#3F3F46]" : "text-slate-300"}`}
                  style={{ borderColor: col.dot + "60" }}
                >
                  <Plus size={20} color={col.dot} weight="bold" className="mb-1 opacity-40" />
                  No {col.label.toLowerCase()} leads
                </div>
              ) : colLeads.map(lead => {
                const avCol  = avatarColor(lead.name);
                const avInit = initials(lead.name);
                const owCol  = avatarColor(lead.owner);

                return (
                  <div
                    key={lead.id}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className={`rounded-xl border p-3 shadow-sm cursor-pointer group transition-all hover:-translate-y-0.5 ${
                      isDark
                        ? "bg-[#1C1C1E] border-[#27272A] hover:shadow-md hover:border-[#3F3F46]"
                        : "bg-[#f9fbff] border-[#E3ECFC] hover:shadow-md hover:border-[#60A5FA]"
                    }`}
                  >
                    {/* Lead header */}
                    <div className="flex items-start gap-2 mb-2">
                      <Avatar
                        src={LEAD_AVATARS[lead.id]}
                        sx={{ width: 32, height: 32, bgcolor: avCol, fontSize: "0.72rem", fontWeight: 800, flexShrink: 0 }}
                      >
                        {avInit}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`font-heading text-[14px] font-bold truncate leading-tight ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>
                          {lead.name}
                        </p>
                        {lead.company && (
                          <p className={`text-[12px] truncate flex items-center gap-0.5 mt-0.5 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
                            <Buildings size={10} color={isDark ? "#3F3F46" : "#E2E8F0"} weight="duotone" />
                            {lead.company}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]"}`}
                      >
                        <DotsThreeVertical size={13} color={isDark ? "#E4E4E7" : "#94A3B8"} weight="duotone" />
                      </button>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1 mb-2.5">
                      {lead.email && (
                        <div className={`flex items-center gap-1.5 text-[14px] truncate ${isDark ? "text-[#A1A1AA]" : "text-inherit"}`}>
                          <Envelope size={10} color={isDark ? "#3F3F46" : "#E3ECFC"} weight="duotone" className="flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.mobile && (
                        <div className={`flex items-center gap-1.5 text-[14px] font-mono ${isDark ? "text-[#A1A1AA]" : "text-slate-500"}`}>
                          <Phone size={10} color={isDark ? "#3F3F46" : "#E3ECFC"} weight="duotone" className="flex-shrink-0" />
                          <span>{lead.mobile}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className={`flex items-center gap-1.5 pt-2 border-t ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                      <Tooltip title={lead.owner}>
                        <Avatar src={OWNER_AVATARS[lead.owner]} sx={{ width: 16, height: 16, bgcolor: owCol, fontSize: "0.55rem", fontWeight: 800 }}>
                          {lead.ownerInitials}
                        </Avatar>
                      </Tooltip>
                      <span className={`text-[12px] truncate ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>{lead.owner}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column footer — add lead */}
            <button
              onClick={e => e.stopPropagation()}
              className={`flex items-center gap-1.5 mt-3 px-2 py-2 rounded-xl border border-dashed text-[14px] font-medium w-full transition-all ${
                isDark ? "text-[#E4E4E7] hover:bg-[#1C1C1E] hover:text-[#A1A1AA]" : ""
              }`}
              style={{ borderColor: col.dot + "60", color: isDark ? undefined : col.color + "99" }}
              onMouseEnter={e => { if (!isDark) (e.currentTarget as HTMLButtonElement).style.backgroundColor = col.bg; }}
              onMouseLeave={e => { if (!isDark) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
            >
              <Plus size={13} weight="bold" />
              Add lead
            </button>
          </div>
        );
      })}
    </div>
  );
}

