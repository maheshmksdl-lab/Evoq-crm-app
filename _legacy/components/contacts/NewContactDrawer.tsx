"use client";
import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { X, AddressBook } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Lists
// ─────────────────────────────────────────────
const SALUTATIONS   = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
const OWNERS        = ["PM SDL", "SE User 1", "Admin"];
const LEAD_SOURCES  = ["Web", "Referral", "Cold Call", "Advertisement", "Trade Show", "Word of Mouth", "Partner", "Other"];
const ACCOUNTS      = ["Sweany Inc", "SDL LEAD1", "Sears Homelife", "RMVT", "SDL", "test", "Speedy Motors"];
const REPORTING_TO  = ["PM SDL", "SE User 1", "Admin"];
const COUNTRIES     = ["India", "United States", "United Kingdom", "Singapore", "Australia", "UAE", "Other"];
const STATES_IN     = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Tamil Nadu", "Telangana", "Other"];

// ─────────────────────────────────────────────
//  Section header
// ─────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <h3 className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-4 ${theme === "dark" ? "text-[#D4D4D8]" : "text-slate-500"}`}>{children}</h3>
  );
}

// ─────────────────────────────────────────────
//  Address sub-panel (Mailing or Other)
// ─────────────────────────────────────────────
type AddressKey = "country" | "building" | "street" | "city" | "state" | "zip" | "lat" | "lng";
interface AddressFields { country: string; building: string; street: string; city: string; state: string; zip: string; lat: string; lng: string; }

function AddressPanel({
  title, values, onChange, onClear, isDark, fx,
}: {
  title: string;
  values: AddressFields;
  onChange: (k: AddressKey, v: string) => void;
  onClear: () => void;
  isDark: boolean;
  fx: object;
}) {
  return (
    <div className={`flex-1 min-w-0 rounded-xl border p-4 space-y-2.5 ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF]/60 border-[#E3ECFC]"}`}>
      <p className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-3 ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>{title}</p>

      <FormControl size="small" fullWidth sx={fx}>
        <InputLabel>Country / Region</InputLabel>
        <Select label="Country / Region" value={values.country} onChange={e => onChange("country", e.target.value)}>
          <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
          {COUNTRIES.map(c => <MenuItem key={c} value={c} sx={{ fontSize: "0.82rem" }}>{c}</MenuItem>)}
        </Select>
      </FormControl>

      <TextField label="Flat / House No. / Building / Apartment Name" value={values.building}
        onChange={e => onChange("building", e.target.value)} size="small" fullWidth sx={fx} />
      <TextField label="Street Address" value={values.street}
        onChange={e => onChange("street", e.target.value)} size="small" fullWidth sx={fx} />
      <TextField label="City" value={values.city}
        onChange={e => onChange("city", e.target.value)} size="small" fullWidth sx={fx} />

      <FormControl size="small" fullWidth sx={fx}>
        <InputLabel>State / Province</InputLabel>
        <Select label="State / Province" value={values.state} onChange={e => onChange("state", e.target.value)}>
          <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
          {STATES_IN.map(s => <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>)}
        </Select>
      </FormControl>

      <TextField label="Zip / Postal Code" value={values.zip}
        onChange={e => onChange("zip", e.target.value)} size="small" fullWidth sx={fx} />

      <div className="grid grid-cols-2 gap-2">
        <TextField label="Latitude"  value={values.lat} onChange={e => onChange("lat", e.target.value)} size="small" fullWidth sx={fx} />
        <TextField label="Longitude" value={values.lng} onChange={e => onChange("lng", e.target.value)} size="small" fullWidth sx={fx} />
      </div>

      <div className="flex justify-end pt-0.5">
        <button onClick={onClear} className={`text-[11.5px] font-semibold transition-colors ${isDark ? "text-[#9CA3AF] hover:text-[#A1A1AA]" : "text-[#475569] hover:underline"}`}>
          Clear All
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Empty address block
// ─────────────────────────────────────────────
const EMPTY_ADDR: AddressFields = { country: "", building: "", street: "", city: "", state: "", zip: "", lat: "", lng: "" };

// ─────────────────────────────────────────────
//  Default form state
// ─────────────────────────────────────────────
const DEFAULT = {
  salutation:    "",
  firstName:     "",
  lastName:      "",
  contactOwner:  "PM SDL",
  leadSource:    "",
  accountName:   "",
  email:         "",
  title:         "",
  phone:         "",
  department:    "",
  otherPhone:    "",
  homePhone:     "",
  mobile:        "",
  fax:           "",
  assistant:     "",
  dateOfBirth:   "",
  asstPhone:     "",
  emailOptOut:   false,
  skypeId:       "",
  secondaryEmail:"",
  twitter:       "",
  reportingTo:   "",
  mailing:       { ...EMPTY_ADDR } as AddressFields,
  other:         { ...EMPTY_ADDR } as AddressFields,
};

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialData?: Partial<typeof DEFAULT>;
}

export default function NewContactDrawer({ open, onClose, mode = "create", initialData }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isEdit = mode === "edit";
  const [form, setForm] = useState<typeof DEFAULT>({ ...DEFAULT, ...initialData });

  const FX = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      ...(isDark ? {} : { backgroundColor: "#EFF6FF" }),
      fontSize: "0.82rem",
      "& fieldset":             { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
      "&:hover fieldset":       { borderColor: isDark ? "#52525B" : "#E3ECFC" },
      "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#D0DEFA", borderWidth: 1.5 },
      "&.Mui-focused":          { boxShadow: "none" },
      "& input":                { padding: "9px 12px" },
    },
    "& .MuiInputLabel-root":             { fontSize: "0.78rem", ...(isDark ? {} : { color: "#94A3B8" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "#64748B" },
    "& .MuiSelect-select":               { fontSize: "0.82rem", padding: "9px 12px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }) },
  };

  const FX_SM = {
    ...FX,
    "& .MuiOutlinedInput-root": {
      ...FX["& .MuiOutlinedInput-root"],
      "& .MuiSelect-select": { fontSize: "0.78rem", padding: "9px 10px" },
    },
  };

  const set  = (k: keyof typeof DEFAULT, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));
  const setA = (side: "mailing" | "other", k: AddressKey, v: string) =>
    setForm(p => ({ ...p, [side]: { ...p[side], [k]: v } }));
  const clearAddr = (side: "mailing" | "other") =>
    setForm(p => ({ ...p, [side]: { ...EMPTY_ADDR } }));

  const handleSubmit = () => { console.log(isEdit ? "Update:" : "New:", form); onClose(); };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 700 },
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
            <AddressBook size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
          </div>
          <h2 className={`m-0 font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
            {isEdit ? "Edit Contact" : "New Contact"}
          </h2>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* ══ Scrollable body ══ */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* ── Section 1: Contact Information ── */}
        <div>
          <SectionTitle>Contact Information</SectionTitle>
          <div className="space-y-3">

            <div className="grid gap-3" style={{ gridTemplateColumns: "110px 1fr 1fr" }}>
              <FormControl size="small" sx={FX_SM}>
                <InputLabel>Salutation</InputLabel>
                <Select label="Salutation" value={form.salutation} onChange={e => set("salutation", e.target.value)}>
                  {SALUTATIONS.map(s => <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="First Name" value={form.firstName} onChange={e => set("firstName", e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Last Name"  value={form.lastName}  onChange={e => set("lastName",  e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Contact Owner</InputLabel>
                <Select label="Contact Owner" value={form.contactOwner} onChange={e => set("contactOwner", e.target.value)}>
                  {OWNERS.map(o => <MenuItem key={o} value={o} sx={{ fontSize: "0.82rem" }}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Lead Source</InputLabel>
                <Select label="Lead Source" value={form.leadSource} onChange={e => set("leadSource", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {LEAD_SOURCES.map(s => <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Account Name</InputLabel>
                <Select label="Account Name" value={form.accountName} onChange={e => set("accountName", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {ACCOUNTS.map(a => <MenuItem key={a} value={a} sx={{ fontSize: "0.82rem" }}>{a}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Title"  value={form.title} onChange={e => set("title", e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Phone"  value={form.phone} onChange={e => set("phone", e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Department"  value={form.department}  onChange={e => set("department",  e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Other Phone" value={form.otherPhone}  onChange={e => set("otherPhone",  e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Home Phone" value={form.homePhone} onChange={e => set("homePhone", e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Mobile"     value={form.mobile}    onChange={e => set("mobile",    e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Fax"       value={form.fax}       onChange={e => set("fax",       e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Assistant" value={form.assistant}  onChange={e => set("assistant", e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Date of Birth" type="date" value={form.dateOfBirth}
                onChange={e => set("dateOfBirth", e.target.value)} size="small" fullWidth sx={FX} InputLabelProps={{ shrink: true }} />
              <TextField label="Asst Phone" value={form.asstPhone} onChange={e => set("asstPhone", e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <FormControlLabel
                control={
                  <Checkbox checked={form.emailOptOut} onChange={e => set("emailOptOut", e.target.checked)} size="small"
                    sx={{ color: isDark ? "#3F3F46" : "#E2E8F0", "&.Mui-checked": { color: "inherit" }, p: 0.75 }} />
                }
                label={<span className={`text-[14px] font-medium ${isDark ? "text-[#A1A1AA]" : "text-slate-700"}`}>Email Opt Out</span>}
                sx={{ m: 0 }}
              />
              <TextField label="Skype ID" value={form.skypeId} onChange={e => set("skypeId", e.target.value)} size="small" fullWidth sx={FX} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Secondary Email" type="email" value={form.secondaryEmail} onChange={e => set("secondaryEmail", e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Twitter" value={form.twitter} onChange={e => set("twitter", e.target.value)} size="small" fullWidth sx={FX} placeholder="@handle" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Reporting To</InputLabel>
                <Select label="Reporting To" value={form.reportingTo} onChange={e => set("reportingTo", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {REPORTING_TO.map(r => <MenuItem key={r} value={r} sx={{ fontSize: "0.82rem" }}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        <Divider sx={{ borderColor: isDark ? "#3F3F46" : "#E3ECFC" }} />

        {/* ── Section 2: Address Information ── */}
        <div>
          <SectionTitle>Address Information</SectionTitle>
          <div className="flex gap-4">
            <AddressPanel
              title="Mailing Address"
              values={form.mailing}
              onChange={(k, v) => setA("mailing", k, v)}
              onClear={() => clearAddr("mailing")}
              isDark={isDark}
              fx={FX}
            />
            <AddressPanel
              title="Other Address"
              values={form.other}
              onChange={(k, v) => setA("other", k, v)}
              onClear={() => clearAddr("other")}
              isDark={isDark}
              fx={FX}
            />
          </div>
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
            "&:hover": { bgcolor: isDark ? "#3F3F46" : "#60A5FA", boxShadow: isDark ? "none" : "0 4px 18px #60A5FA55" },
            "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" },
          }}>
          Submit
        </Button>
      </div>
    </Drawer>
  );
}
