"use client";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { Envelope, Phone, DeviceMobile, Buildings, DotsThreeVertical } from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

interface Contact {
  id: number; firstName: string; lastName: string;
  ownerName: string; ownerInitials: string;
  email: string; phone: string; mobile: string;
  accountName: string;
}

const AVATAR_PAL = ["#7C3AED", "#10B981", "#F59E0B", "#DB2777"];
const avatarColor = (n: string) => AVATAR_PAL[n.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PAL.length];
const initials    = (first: string, last: string) => ((first[0] || "") + (last[0] || "")).toUpperCase();

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

interface Props { contacts: Contact[] }

export default function ContactGridView({ contacts }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (contacts.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>
        <p className="font-heading text-sm font-semibold">No contacts found</p>
        <p className="text-xs mt-1">Adjust filters or add a new contact</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {contacts.map((contact, i) => {
        const fullName = `${contact.firstName} ${contact.lastName}`.trim();
        const avCol    = avatarColor(fullName);
        const avInit   = initials(contact.firstName, contact.lastName);
        const owCol    = avatarColor(contact.ownerName);

        const colored = i % 2 === 0;
        const pal     = isDark ? DARK_PASTELS : PASTELS;
        const baseT   = isDark ? { fill: "#1C1C1E", deep: "#4F8EF7" } : { fill: "#f9fbff", deep: "#3B82F6" };
        const cardT   = colored ? pal[(i / 2) % pal.length] : baseT;

        return (
          <div
            key={contact.id}
            onClick={() => router.push(`/contacts/${contact.id}`)}
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
                <Avatar sx={{ width: 44, height: 44, bgcolor: avCol, fontSize: "0.85rem", fontWeight: 800, flexShrink: 0, boxShadow: "0 2px 8px rgba(12,36,114,0.15)" }}>
                  {avInit}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={`font-heading text-[14px] font-bold truncate transition-colors ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>
                    {fullName}
                  </p>
                  {contact.accountName && (
                    <p className={`text-[12px] truncate flex items-center gap-1 mt-0.5 ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>
                      <Buildings size={10} color={cardT.deep} weight="duotone" />
                      {contact.accountName}
                    </p>
                  )}
                </div>
                <button onClick={e => e.stopPropagation()}
                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-[#f9fbff]/60"}`}>
                  <DotsThreeVertical size={15} color={isDark ? "#71717A" : "#475569"} weight="duotone" />
                </button>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5">
                {contact.email ? (
                  <div className={`flex items-center gap-2 text-[14px] ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>
                    <Envelope size={12} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate font-medium">{contact.email}</span>
                  </div>
                ) : null}
                {contact.phone ? (
                  <div className={`flex items-center gap-2 text-[14px] font-mono ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                    <Phone size={12} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                ) : null}
                {contact.mobile ? (
                  <div className={`flex items-center gap-2 text-[14px] font-mono ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>
                    <DeviceMobile size={12} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span>{contact.mobile}</span>
                  </div>
                ) : null}
                {!contact.email && !contact.phone && !contact.mobile && (
                  <p className={`text-[14px] italic ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>No contact info</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center gap-2 px-4 py-2.5 border-t ${
              isDark
                ? "border-[#27272A] bg-black/20"
                : colored ? "border-white/50 bg-[#f9fbff]/30" : "border-[#EFF6FF] bg-[#EFF6FF]"
            }`}>
              <Tooltip title={contact.ownerName}>
                <div className="flex items-center gap-1.5">
                  <Avatar src={OWNER_AVATARS[contact.ownerName]} sx={{ width: 20, height: 20, bgcolor: owCol, fontSize: "0.48rem", fontWeight: 800 }}>
                    {contact.ownerInitials}
                  </Avatar>
                  <span className={`text-[12px] font-medium ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>{contact.ownerName}</span>
                </div>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
}

