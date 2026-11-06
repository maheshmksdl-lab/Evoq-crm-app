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
import Tooltip from "@mui/material/Tooltip";
import { X, Handshake } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Data lists
// ─────────────────────────────────────────────
const STAGES = [
  "Qualification", "Needs Analysis", "Value Proposition",
  "Identify Decision Makers", "Proposal/Price Quote",
  "Negotiation/Review", "Closed Won",
];

const STAGE_PROB: Record<string, string> = {
  "Qualification": "10", "Needs Analysis": "20",
  "Value Proposition": "40", "Identify Decision Makers": "60",
  "Proposal/Price Quote": "75", "Negotiation/Review": "90",
  "Closed Won": "100",
};

const DEAL_TYPES = ["Existing Business", "New Business"];

const LEAD_SOURCES = [
  "Web", "Referral", "Cold Call", "Advertisement",
  "Trade Show", "Word of Mouth", "Partner", "Other",
];

const DEAL_OWNERS = ["PM SDL", "SE User 1", "Admin"];

const ACCOUNTS = [
  "Sweany Inc", "SDL LEAD1", "Sears Homelife", "RMVT",
  "SDL", "test", "Speedy Motors",
];

const CONTACTS = [
  "Lead SDL 11", "John Smith", "Raja rajan", "mmmm mmmm",
  "SDL Test Test-SDL", "Vishnutharan R", "test test", "Speedy Mike",
];

// ─────────────────────────────────────────────
//  Default form state
// ─────────────────────────────────────────────
const DEFAULT = {
  dealName:        "",
  amount:          "",
  dealOwner:       "PM SDL",
  closingDate:     "",
  accountName:     "",
  stage:           "Qualification",
  type:            "",
  nextStep:        "",
  probability:     "10",
  leadSource:      "",
  expectedRevenue: "",
  contactName:     "",
  description:     "",
};

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
interface Props {
  open:         boolean;
  onClose:      () => void;
  mode?:        "create" | "edit";
  initialData?: Partial<typeof DEFAULT>;
}

export default function NewDealDrawer({ open, onClose, mode = "create", initialData }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isEdit = mode === "edit";
  const [form, setForm] = useState({ ...DEFAULT, ...initialData });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const FX = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      ...(isDark ? {} : { backgroundColor: "#EFF6FF" }),
      fontSize: "0.82rem",
      "& fieldset":             { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
      "&:hover fieldset":       { borderColor: isDark ? "#52525B" : "#E3ECFC" },
      "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#D0DEFA", borderWidth: 1.5 },
      "&.Mui-focused":          { boxShadow: "none" },
      "& input":                { padding: "10px 14px" },
    },
    "& .MuiInputLabel-root":             { fontSize: "0.79rem", ...(isDark ? {} : { color: "#6B7280" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "#64748B" },
    "& .MuiSelect-select":               { fontSize: "0.82rem", padding: "10px 14px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }) },
  };

  const handleStageChange = (stage: string) => {
    setForm(p => ({ ...p, stage, probability: STAGE_PROB[stage] ?? p.probability }));
  };

  const handleSubmit = () => {
    console.log(isEdit ? "Update deal:" : "New deal:", form);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 680 },
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
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isDark ? "bg-[#27272A]" : "bg-[#1D4ED8]"}`}>
            <Handshake size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
          </div>
          <h2 className={`m-0 font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
            {isEdit ? "Edit Deal" : "New Deal"}
          </h2>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* ══ Scrollable Body ══ */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* ── Section 1: Deal Information ── */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-4 ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>Deal Information</h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Deal Name" value={form.dealName}
                onChange={e => set("dealName", e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Amount" value={form.amount}
                onChange={e => set("amount", e.target.value)} size="small" fullWidth sx={FX} placeholder="0" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Deal Owner</InputLabel>
                <Select label="Deal Owner" value={form.dealOwner} onChange={e => set("dealOwner", e.target.value)}>
                  {DEAL_OWNERS.map(o => (
                    <MenuItem key={o} value={o} sx={{ fontSize: "0.82rem" }}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Closing Date" type="date" value={form.closingDate}
                onChange={e => set("closingDate", e.target.value)} size="small" fullWidth sx={FX}
                InputLabelProps={{ shrink: true }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Account Name</InputLabel>
                <Select label="Account Name" value={form.accountName} onChange={e => set("accountName", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {ACCOUNTS.map(a => (
                    <MenuItem key={a} value={a} sx={{ fontSize: "0.82rem" }}>{a}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Stage</InputLabel>
                <Select label="Stage" value={form.stage} onChange={e => handleStageChange(e.target.value)}>
                  {STAGES.map(s => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {DEAL_TYPES.map(t => (
                    <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Next Step" value={form.nextStep}
                onChange={e => set("nextStep", e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Probability (%)" value={form.probability}
                onChange={e => set("probability", e.target.value)} size="small" fullWidth sx={FX} />
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Lead Source</InputLabel>
                <Select label="Lead Source" value={form.leadSource} onChange={e => set("leadSource", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {LEAD_SOURCES.map(s => (
                    <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Expected Revenue" value={form.expectedRevenue}
                onChange={e => set("expectedRevenue", e.target.value)} size="small" fullWidth sx={FX} placeholder="0" />
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Contact Name</InputLabel>
                <Select label="Contact Name" value={form.contactName} onChange={e => set("contactName", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {CONTACTS.map(c => (
                    <MenuItem key={c} value={c} sx={{ fontSize: "0.82rem" }}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {/* ── Section 2: Description Information ── */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-4 ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>Description Information</h3>
          <TextField
            label="Description"
            value={form.description}
            onChange={e => set("description", e.target.value)}
            size="small" fullWidth multiline rows={4}
            sx={{
              ...FX,
              "& .MuiOutlinedInput-root": {
                ...FX["& .MuiOutlinedInput-root"],
                "& textarea": { padding: "10px 14px" },
              },
            }}
          />
        </div>

        <div className="h-2" />
      </div>

      {/* ══ Footer ══ */}
      <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <Button variant="outlined" size="small" onClick={onClose}
          sx={{
            borderColor: isDark ? "#3F3F46" : "#E3ECFC",
            color: isDark ? "#A1A1AA" : "#475569",
            borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "0.8rem", px: 3, py: 0.9,
            "&:hover": { borderColor: isDark ? "#52525B" : "#E3ECFC", bgcolor: isDark ? "#27272A" : "#EFF6FF" },
          }}>
          Cancel
        </Button>
        <Button variant="contained" size="small" onClick={handleSubmit}
          sx={{
            bgcolor: isDark ? "#27272A" : "#1D4ED8",
            color: isDark ? "#F4F4F5" : "#fff",
            borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.8rem", px: 3, py: 0.9,
            boxShadow: isDark ? "none" : "0 2px 12px #1D4ED833",
            "&:hover":  { bgcolor: isDark ? "#3F3F46" : "#60A5FA", boxShadow: isDark ? "none" : "0 4px 18px #60A5FA55" },
            "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" },
          }}>
          Submit
        </Button>
      </div>
    </Drawer>
  );
}
