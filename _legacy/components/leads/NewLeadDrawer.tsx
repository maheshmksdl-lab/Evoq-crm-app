"use client";
import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { X, User, Envelope, TrendUp, SlidersHorizontal, UserPlus, PencilSimple, FloppyDisk } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Section header helper
// ─────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  isDark,
}: {
  icon: React.ElementType;
  title: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
        <Icon size={13} color={isDark ? "#71717A" : "#1D4ED8"} weight="duotone" />
      </div>
      <p className={`font-heading text-[10.5px] font-bold uppercase tracking-[0.13em] whitespace-nowrap ${isDark ? "text-[#71717A]" : "text-[#1D4ED8]"}`}>
        {title}
      </p>
      <div className={`flex-1 h-px ${isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Required label helper
// ─────────────────────────────────────────────
function Req() {
  return <span className="text-red-400 ml-0.5">*</span>;
}

// ─────────────────────────────────────────────
//  Form defaults
// ─────────────────────────────────────────────
const DEFAULT_FORM = {
  salutation:      "",
  firstName:       "",
  lastName:        "",
  company:         "",
  title:           "",
  email:           "",
  phone:           "",
  mobile:          "",
  fax:             "",
  website:         "",
  leadSource:      "",
  leadStatus:      "",
  industry:        "",
  noOfEmployees:   "",
  annualRevenue:   "",
  rating:          "",
  emailOptOut:     false,
};

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
export default function NewLeadDrawer({
  open,
  onClose,
  mode = "create",
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialData?: Partial<typeof DEFAULT_FORM>;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isEdit = mode === "edit";
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialData });

  const prevOpen = open;
  if (!prevOpen && open) {
    // handled by key prop on parent
  }

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
    "& .MuiInputLabel-root": { fontSize: "0.79rem", ...(isDark ? {} : { color: "#94A3B8" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "#64748B" },
    "& .MuiSelect-select": { fontSize: "0.82rem", padding: "10px 14px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }) },
  };

  const set = (k: string, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    console.log(isEdit ? "Update lead:" : "New lead:", form);
    onClose();
    if (!isEdit) setForm(DEFAULT_FORM);
  };

  const handleCancel = () => {
    onClose();
    if (!isEdit) setForm(DEFAULT_FORM);
  };

  const sectionCardCls = `rounded-2xl p-5 border shadow-sm ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#f9fbff] border-[#E3ECFC]"}`;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 640 },
          display: "flex",
          flexDirection: "column",
          bgcolor: isDark ? "#18181B" : "#F8FAFF",
          boxShadow: isDark ? "-12px 0 48px rgba(0,0,0,0.5)" : "-12px 0 48px 0 rgba(12,36,114,0.14)",
        },
      }}
    >
      {/* ══ Sticky Header ══ */}
      <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isDark ? "bg-[#27272A]" : "bg-[#1D4ED8]"}`}>
            {isEdit
              ? <PencilSimple size={17} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
              : <UserPlus    size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
            }
          </div>
          <div>
            <h2 className={`m-0 text-[15px] font-extrabold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
              {isEdit ? "Edit Lead" : "New Lead"}
            </h2>
            <p className={`text-[11px] font-medium ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
              Fields marked <span className="text-red-400 font-bold">*</span> are required
            </p>
          </div>
        </div>

        <Tooltip title="Close">
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              borderRadius: "9px",
              border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`,
              "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF", borderColor: isDark ? "#52525B" : "#E3ECFC" },
            }}
          >
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* ══ Scrollable Body ══ */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {/* ── Section 1: Personal Information ── */}
        <div className={sectionCardCls}>
          <SectionHeader icon={User} title="Personal Information" isDark={isDark} />

          <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: "110px 1fr 1fr" }}>
            <FormControl size="small" sx={FX}>
              <InputLabel>Salutation</InputLabel>
              <Select label="Salutation" value={form.salutation} onChange={(e) => set("salutation", e.target.value)}>
                {["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label={<>First Name<Req /></>} value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)} size="small" fullWidth sx={FX} />
            <TextField label={<>Last Name<Req /></>} value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)} size="small" fullWidth sx={FX} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField label={<>Company<Req /></>} value={form.company}
              onChange={(e) => set("company", e.target.value)} size="small" fullWidth sx={FX} />
            <TextField label="Title / Designation" value={form.title}
              onChange={(e) => set("title", e.target.value)} size="small" fullWidth sx={FX} />
          </div>
        </div>

        {/* ── Section 2: Contact Details ── */}
        <div className={sectionCardCls}>
          <SectionHeader icon={Envelope} title="Contact Details" isDark={isDark} />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <TextField label={<>Email<Req /></>} type="email" value={form.email}
              onChange={(e) => set("email", e.target.value)} size="small" fullWidth sx={FX} />
            <TextField label="Phone" value={form.phone}
              onChange={(e) => set("phone", e.target.value)} size="small" fullWidth sx={FX} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <TextField label="Mobile" value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)} size="small" fullWidth sx={FX} />
            <TextField label="Fax" value={form.fax}
              onChange={(e) => set("fax", e.target.value)} size="small" fullWidth sx={FX} />
          </div>

          <TextField label="Website" value={form.website}
            onChange={(e) => set("website", e.target.value)}
            size="small" fullWidth placeholder="https://" sx={FX} />
        </div>

        {/* ── Section 3: Lead Details ── */}
        <div className={sectionCardCls}>
          <SectionHeader icon={TrendUp} title="Lead Details" isDark={isDark} />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Lead Status</InputLabel>
              <Select label="Lead Status" value={form.leadStatus} onChange={(e) => set("leadStatus", e.target.value)}>
                {["New", "Contacted", "In Progress", "Qualified", "Lost", "Unqualified"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Lead Source</InputLabel>
              <Select label="Lead Source" value={form.leadSource} onChange={(e) => set("leadSource", e.target.value)}>
                {["Web", "Referral", "Cold Call", "Advertisement", "Trade Show", "Other"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Industry</InputLabel>
              <Select label="Industry" value={form.industry} onChange={(e) => set("industry", e.target.value)}>
                {["Technology", "Finance", "Healthcare", "Real Estate", "Retail", "Manufacturing", "Education", "Other"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Rating</InputLabel>
              <Select label="Rating" value={form.rating} onChange={(e) => set("rating", e.target.value)}>
                {["Hot", "Warm", "Cold"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>No. of Employees</InputLabel>
              <Select label="No. of Employees" value={form.noOfEmployees} onChange={(e) => set("noOfEmployees", e.target.value)}>
                {["1–10", "11–50", "51–200", "201–500", "500+"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Annual Revenue (₹)" value={form.annualRevenue}
              onChange={(e) => set("annualRevenue", e.target.value)}
              size="small" fullWidth placeholder="e.g. 5000000" sx={FX} />
          </div>
        </div>

        {/* ── Section 4: Preferences ── */}
        <div className={sectionCardCls}>
          <SectionHeader icon={SlidersHorizontal} title="Preferences" isDark={isDark} />

          <FormControlLabel
            control={
              <Checkbox
                checked={form.emailOptOut}
                onChange={(e) => set("emailOptOut", e.target.checked)}
                size="small"
                sx={{
                  color: isDark ? "#3F3F46" : "#E2E8F0",
                  "&.Mui-checked": { color: "inherit" },
                  p: 0.75,
                }}
              />
            }
            label={
              <div className="ml-1">
                <p className={`text-[12.5px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>Email Opt Out</p>
                <p className={`text-[11px] mt-0.5 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
                  Do not send marketing emails to this lead
                </p>
              </div>
            }
            sx={{ alignItems: "flex-start", m: 0 }}
          />
        </div>

        <div className="h-2" />
      </div>

      {/* ══ Sticky Footer ══ */}
      <div className={`flex items-center justify-end px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={handleCancel}
            sx={{
              borderColor: isDark ? "#3F3F46" : "#E3ECFC",
              color: isDark ? "#A1A1AA" : "#475569",
              borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "0.76rem", px: 2,
              "&:hover": { borderColor: isDark ? "#52525B" : "#E3ECFC", bgcolor: isDark ? "#27272A" : "#EFF6FF" },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<FloppyDisk size={15} weight="duotone" />}
            onClick={handleSubmit}
            sx={{
              bgcolor: isDark ? "#27272A" : "#1D4ED8",
              color: isDark ? "#F4F4F5" : "#fff",
              borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.78rem", px: 2.5, py: 0.9,
              boxShadow: isDark ? "none" : "0 2px 12px 0 #1D4ED833",
              "&:hover":  { bgcolor: isDark ? "#3F3F46" : "#60A5FA", boxShadow: isDark ? "none" : "0 4px 18px 0 #60A5FA55" },
              "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" },
            }}
          >
            {isEdit ? "Update Lead" : "Save Lead"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
