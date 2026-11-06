"use client";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { Phone, Envelope, TrendUp, Star, Buildings, DotsThreeVertical } from "@phosphor-icons/react";
import { LEAD_AVATARS, OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

type LeadStatus = "New" | "Contacted" | "In Progress" | "Qualified" | "Lost" | "Unqualified";

interface Lead {
  id: number; name: string; company: string; email: string; mobile: string;
  status: LeadStatus; owner: string; ownerInitials: string;
  leadSource: string; rating: string; created: string;
}

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PAL.length];
const initials    = (n: string) => { const p = n.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.substring(0, 2).toUpperCase(); };

const PASTELS = [
  { fill: "#D6E4F9", deep: "#2F6FED" },
  { fill: "#D0E5E0", deep: "#2E9E7B" },
  { fill: "#FAE3D0", deep: "#E0883F" },
  { fill: "#F5D9E1", deep: "#DB5E8C" },
  { fill: "#D2DFF0", deep: "#5B6CB5" },
];

const DARK_PASTELS = [
  { fill: "#1E2235", deep: "#4F8EF7" },
  { fill: "#1A2820", deep: "#34D399" },
  { fill: "#2A1F18", deep: "#F59E0B" },
  { fill: "#28181F", deep: "#F472B6" },
  { fill: "#1B1E2D", deep: "#818CF8" },
];

interface Props { leads: Lead[] }

export default function LeadGridView({ leads }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (leads.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>
        <p className="font-heading text-[15px]/[20px] font-semibold">No leads found</p>
        <p className="text-[13px]/[16px] mt-1">Adjust filters or add a new lead</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {leads.map((lead, i) => {
        const avCol  = avatarColor(lead.name);
        const avInit = initials(lead.name);
        const owCol  = avatarColor(lead.owner);

        const colored = i % 2 === 0;
        const pal     = isDark ? DARK_PASTELS : PASTELS;
        const baseT   = isDark ? { fill: "#1C1C1E", deep: "#4F8EF7" } : { fill: "#f9fbff", deep: "#3B82F6" };
        const cardT   = colored ? pal[(i / 2) % pal.length] : baseT;

        return (
          <div
            key={lead.id}
            onClick={() => router.push(`/leads/${lead.id}`)}
            className={`rounded-xl sm:rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden ${
              isDark
                ? "border-[#27272A] hover:border-[#3F3F46]"
                : colored ? "border-white/50" : "border-[#E3ECFC]"
            }`}
            style={{
              backgroundColor: cardT.fill,
              boxShadow: isDark ? "0 6px 24px rgba(0,0,0,0.3)" : "0 6px 24px rgba(15,23,42,0.06)",
            }}
          >
            <div className="p-3 sm:p-4">
              {/* Avatar + Name + Menu */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar
                  src={LEAD_AVATARS[lead.id]}
                  sx={{ width: 44, height: 44, bgcolor: avCol, fontSize: "0.95rem", fontWeight: 800, flexShrink: 0, boxShadow: "0 2px 8px rgba(12,36,114,0.15)" }}
                >
                  {avInit}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={`font-heading text-[14.5px] font-bold truncate transition-colors ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>
                    {lead.name}
                  </p>
                  {lead.company && (
                    <p className={`text-[12.5px] truncate flex items-center gap-1 mt-0.5 ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                      <Buildings size={11} color={cardT.deep} weight="duotone" />
                      {lead.company}
                    </p>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={e => e.stopPropagation()}
                    className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-[#f9fbff]/60"}`}>
                    <DotsThreeVertical size={15} color={isDark ? "#A1A1AA" : "#475569"} weight="duotone" />
                  </button>
                </div>
              </div>

              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-0.5 rounded-full mb-3 ${isDark ? "bg-white/10 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>
                <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: cardT.deep }} />
                {lead.status}
              </span>

              {/* Contact info */}
              <div className="space-y-1.5">
                {lead.email ? (
                  <div className={`flex items-center gap-2 text-[12.5px] ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>
                    <Envelope size={12} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate font-medium">{lead.email}</span>
                  </div>
                ) : null}
                {lead.mobile ? (
                  <div className={`flex items-center gap-2 text-[12.5px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                    <Phone size={12} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span className="font-mono">{lead.mobile}</span>
                  </div>
                ) : null}
                {!lead.email && !lead.mobile && (
                  <p className={`text-[12px] italic ${isDark ? "text-[#E4E4E7]" : "text-slate-400"}`}>No contact info</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between px-4 py-2.5 border-t ${
              isDark
                ? "border-[#27272A] bg-black/20"
                : colored ? "border-white/50 bg-[#f9fbff]/30" : "border-[#EFF6FF] bg-[#EFF6FF]"
            }`}>
              <Tooltip title={lead.owner}>
                <div className="flex items-center gap-1.5">
                  <Avatar src={OWNER_AVATARS[lead.owner]} sx={{ width: 20, height: 20, bgcolor: owCol, fontSize: "0.58rem", fontWeight: 800 }}>
                    {lead.ownerInitials}
                  </Avatar>
                  <span className={`text-[12px] font-medium truncate max-w-[80px] ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>{lead.owner}</span>
                </div>
              </Tooltip>
              <div className="flex items-center gap-1.5">
                {lead.leadSource && (
                  <span className={`flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-white/10 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-slate-600"}`}>
                    <TrendUp size={10} color={cardT.deep} weight="duotone" />{lead.leadSource}
                  </span>
                )}
                {lead.rating && (
                  <span className={`flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-white/10 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-slate-600"}`}>
                    <Star size={10} color="#F59E0B" weight="duotone" />{lead.rating}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

