"use client";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { Buildings, User, TrendUp, DotsThreeVertical } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

type DealStage = "Qualification" | "Needs Analysis" | "Value Proposition" |
  "Identify Decision Makers" | "Proposal/Price Quote" | "Negotiation/Review" |
  "Closed Won" | "Closed Lost";

interface Deal {
  id: number; name: string; amount: number; account: string; stage: DealStage;
  probability: number; contactName: string; owner: string; ownerInitials: string;
  creation: string;
}

const STAGE_CFG: Record<DealStage, { fill: string; deep: string; darkFill: string; darkDeep: string }> = {
  "Qualification":            { fill: "#D6E4F9", deep: "#2F6FED", darkFill: "#1E2235", darkDeep: "#4F8EF7" },
  "Needs Analysis":           { fill: "#D0E5E0", deep: "#2E9E7B", darkFill: "#1A2820", darkDeep: "#34D399" },
  "Value Proposition":        { fill: "#FAE3D0", deep: "#E0883F", darkFill: "#2A1F18", darkDeep: "#F59E0B" },
  "Identify Decision Makers": { fill: "#F5D9E1", deep: "#DB5E8C", darkFill: "#28181F", darkDeep: "#F472B6" },
  "Proposal/Price Quote":     { fill: "#D2DFF0", deep: "#5B6CB5", darkFill: "#1B1E2D", darkDeep: "#818CF8" },
  "Negotiation/Review":       { fill: "#FAE3D0", deep: "#E0883F", darkFill: "#2A1F18", darkDeep: "#F59E0B" },
  "Closed Won":               { fill: "#D0E5E0", deep: "#2E9E7B", darkFill: "#1A2820", darkDeep: "#34D399" },
  "Closed Lost":              { fill: "#F5D9E1", deep: "#DB5E8C", darkFill: "#28181F", darkDeep: "#F472B6" },
};

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PAL.length];
const initials    = (n: string) => { const p = n.trim().split(/\s+/); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.substring(0, 2).toUpperCase(); };
const fmt         = (n: number) => n === 0 ? "₹0" : `₹${n.toLocaleString("en-IN")}`;

interface Props { deals: Deal[] }

export default function DealGridView({ deals }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (deals.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>
        <p className="font-heading text-sm font-semibold">No deals found</p>
        <p className="text-xs mt-1">Adjust filters or create a new deal</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {deals.map(deal => {
        const raw    = STAGE_CFG[deal.stage] ?? STAGE_CFG["Qualification"];
        const fill   = isDark ? raw.darkFill : raw.fill;
        const deep   = isDark ? raw.darkDeep : raw.deep;
        const owCol  = avatarColor(deal.owner);
        const owInit = initials(deal.ownerInitials);

        return (
          <div
            key={deal.id}
            onClick={() => router.push(`/deals/${deal.id}`)}
            className={`rounded-xl sm:rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden ${
              isDark ? "border-[#27272A] hover:border-[#3F3F46]" : "border-white/50"
            }`}
            style={{
              backgroundColor: fill,
              boxShadow: isDark ? "0 6px 24px rgba(0,0,0,0.3)" : "0 6px 24px rgba(15,23,42,0.06)",
            }}
          >
            <div className="p-3 sm:p-4">
              {/* Deal name + menu */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className={`m-0 font-heading text-[14px] font-bold truncate transition-colors leading-tight flex-1 ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>
                  {deal.name}
                </h3>
                <button onClick={e => e.stopPropagation()}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-[#f9fbff]/60"}`}>
                  <DotsThreeVertical size={15} color={isDark ? "#71717A" : "#475569"} weight="duotone" />
                </button>
              </div>

              {/* Amount — prominent */}
              <p className={`font-heading text-[22px] font-extrabold tracking-tight mb-3 ${isDark ? "text-[#A1A1AA]" : "text-[#0C2472]"}`}>
                {fmt(deal.amount)}
              </p>

              {/* Stage + Probability */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isDark ? "bg-white/10 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>
                  <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: deep }} />
                  {deal.stage}
                </span>
                {deal.probability > 0 && (
                  <span className={`text-[11px] font-bold ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>{deal.probability}%</span>
                )}
              </div>

              {/* Probability bar */}
              <div className={`w-full h-1 rounded-full mb-4 overflow-hidden ${isDark ? "bg-white/10" : "bg-[#f9fbff]/60"}`}>
                <div className="h-full rounded-full transition-all" style={{ width: `${deal.probability}%`, backgroundColor: deep }} />
              </div>

              {/* Account + Contact */}
              <div className="space-y-1.5">
                {deal.account && (
                  <div className={`flex items-center gap-1.5 text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>
                    <Buildings size={11} color={deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate">{deal.account}</span>
                  </div>
                )}
                {deal.contactName && (
                  <div className={`flex items-center gap-1.5 text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>
                    <User size={11} color={deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate">{deal.contactName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between px-4 py-2.5 border-t ${isDark ? "border-[#27272A] bg-black/20" : "border-white/50 bg-[#f9fbff]/30"}`}>
              <Tooltip title={deal.owner}>
                <div className="flex items-center gap-1.5">
                  <Avatar sx={{ width: 20, height: 20, bgcolor: owCol, fontSize: "0.48rem", fontWeight: 800 }}>{owInit}</Avatar>
                  <span className={`text-[12px] font-medium ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>{deal.owner}</span>
                </div>
              </Tooltip>
              <span className={`flex items-center gap-1 text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
                <TrendUp size={10} color={deep} weight="duotone" />
                {deal.creation}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
