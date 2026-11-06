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
import Divider from "@mui/material/Divider";
import { X, Buildings, FloppyDisk } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

const OWNERS     = ["PM SDL", "SE User 1", "Admin"];
const ACCT_TYPES = ["Analyst", "Competitor", "Customer", "Distributor", "Integrator", "Investor", "Individual", "Other", "Partner", "Press", "Prospect", "Reseller", "Supplier", "Vendor"];
const INDUSTRIES = ["Aerospace", "Agriculture", "Apparel", "Banking", "Biotechnology", "Chemicals", "Communications", "Construction", "Education", "Electronics", "Energy", "Engineering", "Entertainment", "Finance", "Food & Beverage", "Government", "Healthcare", "Hospitality", "Insurance", "Machinery", "Manufacturing", "Media", "Not For Profit", "Recreation", "Retail", "Shipping", "Technology", "Telecommunications", "Transportation", "Utilities", "Other"];
const RATINGS    = ["Hot", "Cold", "Warm"];
const COUNTRIES  = ["India", "United States", "United Kingdom", "Singapore", "Australia", "UAE", "Other"];
const STATES     = ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Tamil Nadu", "Telangana", "Other"];

function SectionTitle({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return <h3 className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-4 ${isDark ? "text-[#D4D4D8]" : "text-slate-500"}`}>{children}</h3>;
}

const DEFAULT = {
  accountName: "", owner: "PM SDL", phone: "", fax: "", website: "",
  accountType: "", industry: "", rating: "", annualRevenue: "",
  employees: "", description: "",
  billingCountry: "", billingBuilding: "", billingStreet: "", billingCity: "", billingState: "", billingZip: "", billingLat: "", billingLng: "",
  shippingCountry: "", shippingBuilding: "", shippingStreet: "", shippingCity: "", shippingState: "", shippingZip: "", shippingLat: "", shippingLng: "",
};

interface Props { open: boolean; onClose: () => void; mode?: "create" | "edit"; initialData?: Partial<typeof DEFAULT>; }

function AddressBlock({ title, prefix, form, set, isDark, fx }: {
  title: string; prefix: string; form: Record<string, string>;
  set: (k: string, v: string) => void; isDark: boolean; fx: object;
}) {
  const k = (f: string) => prefix + f;
  const clearAll = () => ["Country","Building","Street","City","State","Zip","Lat","Lng"].forEach(f => set(k(f.toLowerCase()), ""));
  return (
    <div className={`flex-1 min-w-0 rounded-xl border p-4 space-y-2.5 ${isDark ? "bg-[#27272A] border-[#3F3F46]" : "bg-[#EFF6FF]/60 border-[#E3ECFC]"}`}>
      <p className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-3 ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>{title}</p>
      <FormControl size="small" fullWidth sx={fx}>
        <InputLabel>Country / Region</InputLabel>
        <Select label="Country / Region" value={form[k("country")] || ""} onChange={e => set(k("country"), e.target.value)}>
          <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
          {COUNTRIES.map(c => <MenuItem key={c} value={c} sx={{ fontSize: "0.82rem" }}>{c}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="Flat / House No. / Building / Apartment Name" value={form[k("building")] || ""} onChange={e => set(k("building"), e.target.value)} size="small" fullWidth sx={fx} />
      <TextField label="Street Address"   value={form[k("street")] || ""}   onChange={e => set(k("street"),   e.target.value)} size="small" fullWidth sx={fx} />
      <TextField label="City"             value={form[k("city")] || ""}     onChange={e => set(k("city"),     e.target.value)} size="small" fullWidth sx={fx} />
      <FormControl size="small" fullWidth sx={fx}>
        <InputLabel>State / Province</InputLabel>
        <Select label="State / Province" value={form[k("state")] || ""} onChange={e => set(k("state"), e.target.value)}>
          <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
          {STATES.map(s => <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="Zip / Postal Code" value={form[k("zip")] || ""} onChange={e => set(k("zip"), e.target.value)} size="small" fullWidth sx={fx} />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Latitude"  value={form[k("lat")] || ""} onChange={e => set(k("lat"), e.target.value)} size="small" fullWidth sx={fx} />
        <TextField label="Longitude" value={form[k("lng")] || ""} onChange={e => set(k("lng"), e.target.value)} size="small" fullWidth sx={fx} />
      </div>
      <div className="flex justify-end pt-0.5">
        <button onClick={clearAll} className={`text-[11.5px] font-semibold transition-colors ${isDark ? "text-[#9CA3AF] hover:text-[#A1A1AA]" : "text-[#475569] hover:underline"}`}>Clear All</button>
      </div>
    </div>
  );
}

export default function NewAccountDrawer({ open, onClose, mode = "create", initialData }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isEdit = mode === "edit";
  const [form, setForm] = useState({ ...DEFAULT, ...initialData } as Record<string, string>);
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
      "& input":                { padding: "9px 12px" },
    },
    "& .MuiInputLabel-root":             { fontSize: "0.78rem", ...(isDark ? {} : { color: "#6B7280" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "#64748B" },
    "& .MuiSelect-select":               { fontSize: "0.82rem", padding: "9px 12px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }) },
  };

  const handleSubmit = () => { console.log(isEdit ? "Update account:" : "New account:", form); onClose(); };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 700 }, display: "flex", flexDirection: "column", bgcolor: isDark ? "#18181B" : "#F8FAFF", boxShadow: isDark ? "-12px 0 48px rgba(0,0,0,0.5)" : "-12px 0 48px rgba(12,36,114,0.12)" } }}>

      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isDark ? "bg-[#27272A]" : "bg-[#1D4ED8]"}`}>
            <Buildings size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
          </div>
          <h2 className={`m-0 font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
            {isEdit ? "Edit Account" : "New Account"}
          </h2>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Account Information */}
        <div>
          <SectionTitle isDark={isDark}>Account Information</SectionTitle>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <TextField label={<>Account Name <span className="text-red-400">*</span></>} value={form.accountName} onChange={e => set("accountName", e.target.value)} size="small" fullWidth sx={FX} />
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Account Owner</InputLabel>
                <Select label="Account Owner" value={form.owner} onChange={e => set("owner", e.target.value)}>
                  {OWNERS.map(o => <MenuItem key={o} value={o} sx={{ fontSize: "0.82rem" }}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Phone"   value={form.phone}   onChange={e => set("phone",   e.target.value)} size="small" fullWidth sx={FX} />
              <TextField label="Fax"     value={form.fax}     onChange={e => set("fax",     e.target.value)} size="small" fullWidth sx={FX} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Website" value={form.website} onChange={e => set("website", e.target.value)} size="small" fullWidth sx={FX} placeholder="https://" />
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Account Type</InputLabel>
                <Select label="Account Type" value={form.accountType} onChange={e => set("accountType", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {ACCT_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Industry</InputLabel>
                <Select label="Industry" value={form.industry} onChange={e => set("industry", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {INDUSTRIES.map(i => <MenuItem key={i} value={i} sx={{ fontSize: "0.82rem" }}>{i}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Rating</InputLabel>
                <Select label="Rating" value={form.rating} onChange={e => set("rating", e.target.value)}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</MenuItem>
                  {RATINGS.map(r => <MenuItem key={r} value={r} sx={{ fontSize: "0.82rem" }}>{r}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Annual Revenue (₹)" value={form.annualRevenue} onChange={e => set("annualRevenue", e.target.value)} size="small" fullWidth sx={FX} placeholder="0" />
              <TextField label="No. of Employees"   value={form.employees}     onChange={e => set("employees",     e.target.value)} size="small" fullWidth sx={FX} />
            </div>
          </div>
        </div>

        <Divider sx={{ borderColor: isDark ? "#3F3F46" : "#E3ECFC" }} />

        {/* Description */}
        <div>
          <SectionTitle isDark={isDark}>Description Information</SectionTitle>
          <TextField label="Description" value={form.description} onChange={e => set("description", e.target.value)}
            size="small" fullWidth multiline rows={3}
            sx={{ ...FX, "& .MuiOutlinedInput-root": { ...FX["& .MuiOutlinedInput-root"], "& textarea": { padding: "9px 12px" } } }} />
        </div>

        <Divider sx={{ borderColor: isDark ? "#3F3F46" : "#E3ECFC" }} />

        {/* Address Information */}
        <div>
          <SectionTitle isDark={isDark}>Address Information</SectionTitle>
          <div className="flex gap-4">
            <AddressBlock title="Billing Address"  prefix="billing"  form={form} set={set} isDark={isDark} fx={FX} />
            <AddressBlock title="Shipping Address" prefix="shipping" form={form} set={set} isDark={isDark} fx={FX} />
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* Footer */}
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
        <Button variant="contained" size="small"
          startIcon={<FloppyDisk size={15} weight="duotone" />}
          onClick={handleSubmit}
          disabled={!form.accountName}
          sx={{
            bgcolor: isDark ? "#27272A" : "#1D4ED8",
            color: isDark ? "#F4F4F5" : "#fff",
            borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.8rem", px: 3, py: 0.9,
            boxShadow: isDark ? "none" : "0 2px 12px #1D4ED833",
            "&:hover": { bgcolor: isDark ? "#3F3F46" : "#60A5FA", boxShadow: isDark ? "none" : "0 4px 18px #60A5FA55" },
            "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" },
            "&.Mui-disabled": { bgcolor: isDark ? "#1C1C1E" : "#E3ECFC", color: isDark ? "#3F3F46" : "#9CA3AF" },
          }}>
          {isEdit ? "Update Account" : "Save Account"}
        </Button>
      </div>
    </Drawer>
  );
}
