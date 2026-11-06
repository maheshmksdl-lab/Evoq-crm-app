"use client";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { Phone, Globe, DotsThreeVertical } from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

interface Account {
  id: number; name: string; ownerName: string; ownerInitials: string;
  phone: string; accountType: string; website?: string; creation: string;
}

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PAL.length];
const initials    = (n: string) => n.substring(0, 2).toUpperCase();

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

interface Props { accounts: Account[] }

export default function AccountGridView({ accounts }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (accounts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>
        <p className="font-heading text-sm font-semibold">No accounts found</p>
        <p className="text-xs mt-1">Adjust filters or add a new account</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {accounts.map((acc, i) => {
        const avCol = avatarColor(acc.name);
        const owCol = avatarColor(acc.ownerName);

        const colored = i % 2 === 0;
        const pal     = isDark ? DARK_PASTELS : PASTELS;
        const baseT   = isDark ? { fill: "#1C1C1E", deep: "#4F8EF7" } : { fill: "#f9fbff", deep: "#3B82F6" };
        const cardT   = colored ? pal[(i / 2) % pal.length] : baseT;

        return (
          <div key={acc.id}
            onClick={() => router.push(`/accounts/${acc.id}`)}
            className={`rounded-xl sm:rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden ${
              isDark
                ? "border-[#27272A] hover:border-[#3F3F46]"
                : colored ? "border-white/50" : "border-[#E3ECFC]"
            }`}
            style={{
              backgroundColor: cardT.fill,
              boxShadow: isDark ? "0 6px 24px rgba(0,0,0,0.3)" : "0 6px 24px rgba(15,23,42,0.06)",
            }}>

            <div className="p-3 sm:p-4">
              {/* Icon + Name + Menu */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-[13px] shadow-sm"
                  style={{ backgroundColor: avCol }}>
                  {initials(acc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-heading text-[14px] font-bold truncate transition-colors ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>
                    {acc.name}
                  </p>
                  {acc.accountType && (
                    <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${isDark ? "bg-white/10 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>
                      {acc.accountType}
                    </span>
                  )}
                </div>
                <button onClick={e => e.stopPropagation()}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-[#f9fbff]/60"}`}>
                  <DotsThreeVertical size={15} color={isDark ? "#71717A" : "#475569"} weight="duotone" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                {acc.phone && (
                  <div className={`flex items-center gap-2 text-[14px] font-mono ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                    <Phone size={11} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span>{acc.phone}</span>
                  </div>
                )}
                {acc.website && (
                  <div className={`flex items-center gap-2 text-[14px] truncate ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>
                    <Globe size={11} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate">{acc.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between px-4 py-2.5 border-t ${
              isDark
                ? "border-[#27272A] bg-black/20"
                : colored ? "border-white/50 bg-[#f9fbff]/30" : "border-[#EFF6FF] bg-[#EFF6FF]"
            }`}>
              <Tooltip title={acc.ownerName}>
                <div className="flex items-center gap-1.5">
                  <Avatar src={OWNER_AVATARS[acc.ownerName]} sx={{ width: 20, height: 20, bgcolor: owCol, fontSize: "0.48rem", fontWeight: 800 }}>
                    {acc.ownerInitials}
                  </Avatar>
                  <span className={`text-[12px] font-medium ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>{acc.ownerName}</span>
                </div>
              </Tooltip>
              <span className={`text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{acc.creation.split(",")[0]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
