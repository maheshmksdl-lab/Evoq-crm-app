"use client";
import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import {
  X, ArrowsLeftRight, Buildings, User,
  Handshake, CheckCircle, Bell,
} from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
const SALUTATIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];

const stripSalutation = (name: string) => {
  for (const s of SALUTATIONS) {
    if (name.startsWith(s + " ")) return name.slice(s.length + 1).trim();
  }
  return name.trim();
};

const getLastName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
};

const DEAL_STAGES = [
  "Qualification",
  "Needs Analysis",
  "Value Proposition",
  "Identify Decision Makers",
  "Proposal/Price Quote",
  "Negotiation/Review",
  "Closed Won",
];

// ─────────────────────────────────────────────
//  Section card with toggle checkbox
// ─────────────────────────────────────────────
function SectionToggle({
  checked, onToggle, icon: Icon, iconColor, title, children, isDark,
}: {
  checked: boolean;
  onToggle: (v: boolean) => void;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
      <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]/60"}`}>
        <Checkbox
          checked={checked}
          onChange={e => onToggle(e.target.checked)}
          size="small"
          sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&.Mui-checked": { color: "inherit" }, flexShrink: 0 }}
        />
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconColor + "18" }}>
            <Icon size={15} color={iconColor} weight="duotone" />
          </div>
          <span className={`font-heading text-[13px] font-bold truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>{title}</span>
        </div>
      </label>

      {checked && children && (
        <div className={`px-4 pb-4 pt-2 border-t ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  leadName: string;
  leadCompany: string;
  leadOwner: string;
  leadOwnerInitials: string;
  leadOwnerColor: string;
  leadAvatarColor: string;
  leadInitials: string;
}

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
export default function ConvertToDealDrawer({
  open, onClose, leadName, leadCompany,
  leadOwner, leadOwnerInitials, leadOwnerColor,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const shortName = stripSalutation(leadName);
  const lastName  = getLastName(shortName);

  const [createDeal,  setCreateDeal]  = useState(false);
  const [notifyOwner, setNotifyOwner] = useState(false);

  const [accountName,   setAccountName]   = useState(leadCompany || shortName);
  const [contactName,   setContactName]   = useState(shortName);
  const [dealName,      setDealName]      = useState(lastName);
  const [dealAmount,    setDealAmount]    = useState("0");
  const [dealCloseDate, setDealCloseDate] = useState("");
  const [dealStage,     setDealStage]     = useState("Qualification");

  const [converted, setConverted] = useState(false);

  const canConvert = !createDeal || (dealName.trim() && !!dealCloseDate);

  const handleConvert = () => setConverted(true);
  const handleClose   = () => { setConverted(false); onClose(); };

  const FX = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      ...(isDark ? {} : { backgroundColor: "#EFF6FF" }),
      fontSize: "0.82rem",
      "& fieldset": { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
      "&:hover fieldset": { borderColor: isDark ? "#52525B" : "#E3ECFC" },
      "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#D0DEFA", borderWidth: 1.5 },
      "&.Mui-focused": { boxShadow: "none" },
      "& input": { padding: "10px 14px" },
    },
    "& .MuiInputLabel-root":             { fontSize: "0.79rem", ...(isDark ? {} : { color: "#94A3B8" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "#64748B" },
    "& .MuiSelect-select":               { fontSize: "0.82rem", padding: "10px 14px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }) },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520 },
          display: "flex",
          flexDirection: "column",
          bgcolor: isDark ? "#18181B" : "#F8FAFF",
          boxShadow: isDark ? "-12px 0 48px rgba(0,0,0,0.5)" : "-12px 0 48px rgba(12,36,114,0.12)",
        },
      }}
    >
      {/* ══ Header ══ */}
      <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
            <ArrowsLeftRight size={18} color={isDark ? "#71717A" : "#1D4ED8"} weight="duotone" />
          </div>
          <div>
            <h2 className={`m-0 font-heading text-[15px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
              Convert Lead
            </h2>
            <p className={`text-[11.5px] font-medium ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
              ({shortName}{leadCompany ? ` – ${leadCompany}` : ""})
            </p>
          </div>
        </div>
        <Tooltip title="Close">
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}
          >
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* ══ Body ══ */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

        {!converted ? (
          <>
            {/* ── Create New Account ── */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
                  <Buildings size={15} color={isDark ? "#71717A" : "#1D4ED8"} weight="duotone" />
                </div>
                <span className={`font-heading text-[13px] font-bold ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>Create New Account</span>
              </div>
              <div className="px-4 py-3">
                <TextField value={accountName} onChange={e => setAccountName(e.target.value)}
                  size="small" fullWidth placeholder="Account name" sx={FX} />
              </div>
            </div>

            {/* ── Create New Contact ── */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
                  <User size={15} color={isDark ? "#71717A" : "#1D4ED8"} weight="duotone" />
                </div>
                <span className={`font-heading text-[13px] font-bold ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>Create New Contact</span>
              </div>
              <div className="px-4 py-3">
                <TextField value={contactName} onChange={e => setContactName(e.target.value)}
                  size="small" fullWidth placeholder="Contact name" sx={FX} />
              </div>
            </div>

            {/* ── Create a new Deal ── */}
            <SectionToggle
              checked={createDeal}
              onToggle={setCreateDeal}
              icon={Handshake}
              iconColor={isDark ? "#E4E4E7" : "#1D4ED8"}
              title="Create a new Deal for this Account"
              isDark={isDark}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Deal Name *" value={dealName} onChange={e => setDealName(e.target.value)}
                    size="small" fullWidth sx={FX} />
                  <TextField label="Amount *" value={dealAmount} onChange={e => setDealAmount(e.target.value)}
                    size="small" fullWidth sx={FX}
                    InputProps={{ startAdornment: <span className={`text-sm mr-1 font-medium ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>₹</span> }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Closing Date *" type="date" value={dealCloseDate}
                    onChange={e => setDealCloseDate(e.target.value)}
                    size="small" fullWidth sx={FX} InputLabelProps={{ shrink: true }} />
                  <FormControl size="small" fullWidth sx={FX}>
                    <InputLabel>Stage *</InputLabel>
                    <Select label="Stage *" value={dealStage} onChange={e => setDealStage(e.target.value)}>
                      {DEAL_STAGES.map(s => (
                        <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            </SectionToggle>

            {/* ── Owner of the New Records ── */}
            <div className={`rounded-2xl border shadow-sm p-4 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <p className={`font-heading text-[10.5px] font-bold uppercase tracking-widest mb-3 ${isDark ? "text-[#71717A]" : "text-[#0C2472]"}`}>
                Owner of the New Records
              </p>
              <div className="flex items-center gap-3">
                <Avatar src={OWNER_AVATARS[leadOwner]}
                  sx={{ width: 36, height: 36, bgcolor: leadOwnerColor, fontSize: "0.65rem", fontWeight: 800 }}>
                  {leadOwnerInitials}
                </Avatar>
                <div>
                  <p className={`text-[13px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>{leadOwner}</p>
                  <p className={`text-[11px] ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Record Owner</p>
                </div>
              </div>
            </div>

            {/* ── Notify record owner ── */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
              <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors select-none ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]/60"}`}>
                <Checkbox
                  checked={notifyOwner}
                  onChange={e => setNotifyOwner(e.target.checked)}
                  size="small"
                  sx={{ p: 0.5, color: isDark ? "#3F3F46" : "#E2E8F0", "&.Mui-checked": { color: "inherit" }, flexShrink: 0 }}
                />
                <Bell size={15} color={isDark ? "#E4E4E7" : "#64748B"} weight="duotone" className="flex-shrink-0" />
                <span className={`text-[13px] font-medium ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>
                  Notify record owner (Account and Contact).
                </span>
              </label>
            </div>
          </>
        ) : (
          /* ── Success state ── */
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${isDark ? "bg-emerald-900/30" : "bg-emerald-50"}`}>
              <CheckCircle size={38} color="#10B981" weight="duotone" />
            </div>
            <h3 className={`font-heading text-[18px] font-extrabold mb-2 tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
              Lead Converted!
            </h3>
            <p className={`text-[12.5px] mb-4 ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>
              <span className={`font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{shortName}</span> has been successfully converted.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${isDark ? "bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]" : "bg-[#EFF6FF] text-[#475569] border-[#E3ECFC]"}`}>
                ✓ Account created
              </span>
              <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${isDark ? "bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]" : "bg-[#EFF6FF] text-[#475569] border-[#E3ECFC]"}`}>
                ✓ Contact created
              </span>
              {createDeal && (
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${isDark ? "bg-emerald-900/30 text-emerald-400 border-emerald-800" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                  ✓ Deal created
                </span>
              )}
            </div>
            <Button
              variant="contained"
              size="small"
              onClick={handleClose}
              sx={{
                mt: 4,
                bgcolor: isDark ? "#27272A" : "inherit",
                color: isDark ? "#F4F4F5" : undefined,
                borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.78rem", px: 4,
                boxShadow: "none",
                "&:hover": { bgcolor: isDark ? "#3F3F46" : "inherit" },
                "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" },
              }}
            >
              Done
            </Button>
          </div>
        )}
      </div>

      {/* ══ Footer ══ */}
      {!converted && (
        <div className={`flex items-center justify-between px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClose}
            sx={{
              borderColor: isDark ? "#3F3F46" : "#E3ECFC",
              color: isDark ? "#A1A1AA" : "#475569",
              borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "0.78rem", px: 2.5,
              "&:hover": { borderColor: isDark ? "#52525B" : "#E3ECFC", bgcolor: isDark ? "#27272A" : "#EFF6FF" },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleConvert}
            disabled={!canConvert}
            sx={{
              bgcolor: "#059669",
              borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.78rem", px: 3, py: 0.9,
              boxShadow: "0 2px 12px rgba(5,150,105,0.25)",
              "&:hover":  { bgcolor: "#047857", boxShadow: "0 4px 16px rgba(5,150,105,0.35)" },
              "&:active": { bgcolor: "#065F46" },
              "&.Mui-disabled": { bgcolor: isDark ? "#27272A" : "#E3ECFC", color: isDark ? "#52525B" : "#94A3B8", boxShadow: "none" },
            }}
          >
            Convert
          </Button>
        </div>
      )}
    </Drawer>
  );
}
