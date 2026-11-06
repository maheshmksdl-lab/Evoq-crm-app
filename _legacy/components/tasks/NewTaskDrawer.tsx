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
import Switch from "@mui/material/Switch";
import { X, ClipboardText } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

// ─────────────────────────────────────────────
//  Data lists
// ─────────────────────────────────────────────
const TASK_TYPES    = ["Task", "Call", "Email", "Quote", "Meeting"];
const STATUSES      = ["Todo", "In Progress", "Backlog", "Completed"];
const PRIORITIES    = ["High", "Medium", "Low"];
const CONTACT_TYPES = ["Contact", "Lead"];
const RELATE_TYPES  = ["Account", "Deal", "Contact", "Lead"];
const CONTACTS      = ["SDL Test Test-SDL", "John Smith", "Raja rajan", "Vishnutharan R", "Speedy Mike", "test test"];
const RELATED_TO    = ["SDL - Account", "RMVT - Account", "Sweany Inc - Account", "SDL LEAD1 - Account", "New - Deal", "CRM Application - Deal"];
const TASK_OWNERS   = ["PM SDL", "SE User 1", "Admin"];

// ─────────────────────────────────────────────
//  Default state
// ─────────────────────────────────────────────
const DEFAULT = {
  type:         "",
  subject:      "",
  dueDate:      "",
  status:       "",
  priority:     "",
  contactType:  "Contact",
  contactName:  "",
  relateType:   "Account",
  relatedTo:    "",
  reminder:     false,
  taskOwner:    "PM SDL",
  description:  "",
};

interface Props {
  open:    boolean;
  onClose: () => void;
}

export default function NewTaskDrawer({ open, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form, setForm] = useState({ ...DEFAULT });
  const set  = (k: string, v: string)  => setForm(p => ({ ...p, [k]: v }));
  const setB = (k: string, v: boolean) => setForm(p => ({ ...p, [k]: v }));

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
    "& .MuiInputLabel-root":             { fontSize: "0.79rem", ...(isDark ? {} : { color: "#94A3B8" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "#64748B" },
    "& .MuiSelect-select":               { fontSize: "0.82rem", padding: "10px 14px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }) },
  };

  const TEXTAREA_FX = {
    ...FX,
    "& .MuiOutlinedInput-root": {
      ...FX["& .MuiOutlinedInput-root"],
      "& textarea": { padding: "10px 14px" },
      "& input":    undefined,
    },
  };

  const handleSubmit = () => {
    console.log("New task:", form);
    onClose();
    setForm({ ...DEFAULT });
  };

  const handleClose = () => {
    onClose();
    setForm({ ...DEFAULT });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 580 },
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
            <ClipboardText size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
          </div>
          <h2 className={`m-0 font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>New Task</h2>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={handleClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* ══ Scrollable body ══ */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* ── Task Information ── */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-4 ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>Task Information</h3>

          <div className="space-y-3">
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
                {TASK_TYPES.map(t => (
                  <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Subject"
              value={form.subject}
              onChange={e => set("subject", e.target.value)}
              size="small" fullWidth sx={FX}
            />

            <TextField
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={e => set("dueDate", e.target.value)}
              size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              sx={FX}
            />

            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => (
                  <MenuItem key={s} value={s} sx={{ fontSize: "0.82rem" }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" value={form.priority} onChange={e => set("priority", e.target.value)}>
                {PRIORITIES.map(p => (
                  <MenuItem key={p} value={p} sx={{ fontSize: "0.82rem" }}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Contact — type + name */}
            <div className="grid grid-cols-[160px_1fr] gap-2">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Contact</InputLabel>
                <Select label="Contact" value={form.contactType} onChange={e => set("contactType", e.target.value)}>
                  {CONTACT_TYPES.map(t => (
                    <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Name</InputLabel>
                <Select label="Name" value={form.contactName} onChange={e => set("contactName", e.target.value)}
                  displayEmpty renderValue={v => v || ""}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#94A3B8" }}><em>None</em></MenuItem>
                  {CONTACTS.map(c => (
                    <MenuItem key={c} value={c} sx={{ fontSize: "0.82rem" }}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Related to — type + record */}
            <div className="grid grid-cols-[160px_1fr] gap-2">
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Relate to</InputLabel>
                <Select label="Relate to" value={form.relateType} onChange={e => set("relateType", e.target.value)}>
                  {RELATE_TYPES.map(t => (
                    <MenuItem key={t} value={t} sx={{ fontSize: "0.82rem" }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth sx={FX}>
                <InputLabel>Related to</InputLabel>
                <Select label="Related to" value={form.relatedTo} onChange={e => set("relatedTo", e.target.value)}
                  displayEmpty renderValue={v => v || ""}>
                  <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#94A3B8" }}><em>None</em></MenuItem>
                  {RELATED_TO.map(r => (
                    <MenuItem key={r} value={r} sx={{ fontSize: "0.82rem" }}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Reminder toggle */}
            <div className="flex items-center gap-3 py-1">
              <span className={`text-[14px] font-medium ${isDark ? "text-[#A1A1AA]" : "text-slate-600"}`}>Reminder</span>
              <Switch
                checked={form.reminder}
                onChange={e => setB("reminder", e.target.checked)}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked":             { color: "inherit" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "inherit" },
                }}
              />
            </div>

            {/* Task Owner — fieldset-style */}
            <fieldset className={`rounded-[10px] border px-3 pb-3 pt-1 ${isDark ? "border-[#3F3F46] bg-[#1C1C1E]" : "border-[#E3ECFC] bg-[#EFF6FF]"}`}>
              <legend className={`text-[11.5px] font-semibold uppercase tracking-wider px-1 ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>Task Owner</legend>
              <FormControl size="small" fullWidth sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px", fontSize: "0.82rem",
                  "& fieldset":             { borderColor: isDark ? "#3F3F46" : "#E3ECFC" },
                  "&:hover fieldset":       { borderColor: isDark ? "#52525B" : "#E3ECFC" },
                  "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#D0DEFA" },
                  "& .MuiSelect-select":    { padding: "8px 14px", ...(isDark ? {} : { backgroundColor: "#fff" }) },
                },
              }}>
                <Select value={form.taskOwner} onChange={e => set("taskOwner", e.target.value)}>
                  {TASK_OWNERS.map(o => (
                    <MenuItem key={o} value={o} sx={{ fontSize: "0.82rem" }}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </fieldset>
          </div>
        </div>

        {/* ── Description Information ── */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold uppercase tracking-wider mb-4 ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>Description Information</h3>
          <TextField
            label="Description"
            value={form.description}
            onChange={e => set("description", e.target.value)}
            multiline minRows={4} fullWidth
            sx={TEXTAREA_FX}
          />
        </div>

      </div>

      {/* ══ Footer ══ */}
      <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <Button variant="text" onClick={handleClose}
          sx={{
            color: isDark ? "#A1A1AA" : "#64748B",
            textTransform: "none", fontWeight: 600, fontSize: "0.82rem", borderRadius: "9px", px: 2.5,
            "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" },
          }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}
          sx={{
            bgcolor: isDark ? "#27272A" : "#1D4ED8",
            color: isDark ? "#F4F4F5" : "#fff",
            borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.82rem", px: 3,
            boxShadow: isDark ? "none" : "0 1px 8px #1D4ED833",
            "&:hover":  { bgcolor: isDark ? "#3F3F46" : "#60A5FA" },
            "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" },
          }}>
          Submit
        </Button>
      </div>
    </Drawer>
  );
}
