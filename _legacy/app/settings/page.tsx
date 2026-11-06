"use client";
import { useState, useRef, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Menu from "@mui/material/Menu";
import {
  Gear, User, UsersThree, Buildings, ShieldCheck, Lock,
  Envelope, Cube, House, UploadSimple, DownloadSimple, Upload,
  HardDrive, CaretUp, CaretDown, Camera, PencilSimple,
  Phone, IdentificationCard, MapPin, MagnifyingGlass,
  Plus, Globe, Tree, CaretRight, CheckCircle,
  Eye, Square, Printer, Trash,
  Lightning, AddressBook, SquaresFour, UserPlus, ArrowLeft, Info,
  DotsSixVertical, DotsThreeVertical, TextT, TextAlignLeft, ListBullets, CalendarBlank,
  Hash, CurrencyDollar, CheckSquare, LinkSimple, ChartBar, X,
  ClockCounterClockwise, ArrowsLeftRight, Rows, CopySimple,
} from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";
import { useRouter, useSearchParams } from "next/navigation";

// ---------------------------------------------
//  Nav structure
// ---------------------------------------------
const SECTIONS = [
  {
    key: "general", label: "General", icon: Gear,
    items: [
      { key: "personal",     label: "Personal Settings", icon: User       },
      { key: "users",        label: "Users",             icon: UsersThree },
      { key: "organization", label: "Organization",      icon: Buildings  },
    ],
  },
  {
    key: "security", label: "Security Control", icon: ShieldCheck,
    items: [
      { key: "roles",      label: "Roles",      icon: ShieldCheck },
      { key: "permission", label: "Permissions", icon: Lock        },
    ],
  },
  {
    key: "channels", label: "Channels", icon: Envelope,
    items: [{ key: "email", label: "Email", icon: Envelope }],
  },
  {
    key: "customization", label: "Customization", icon: Cube,
    items: [
      { key: "modules",  label: "Modules and Fields",  icon: Cube  },
      { key: "homepage", label: "Dashboard Customization", icon: House },
    ],
  },
  {
    key: "data", label: "Data Administration", icon: HardDrive,
    items: [
      { key: "import",  label: "Import",      icon: UploadSimple   },
      { key: "export",  label: "Export",      icon: DownloadSimple },
      { key: "backup",  label: "Data Backup", icon: HardDrive      },
    ],
  },
];

// ---------------------------------------------
//  Data
// ---------------------------------------------
interface UserRecord {
  id: number; name: string; role: string; email: string;
  initials: string; firstName: string; lastName: string; phone: string;
  avatarColor: string; textColor: string;
}
const USERS: UserRecord[] = [
  { id:1,  name:"PM SDL",                  role:"Super Admin",       email:"pm@socialdnalabs.com",            initials:"PM", firstName:"PM",        lastName:"SDL",         phone:"7788778855", avatarColor:"#FEF3C7", textColor:"#B45309" },
  { id:2,  name:"sdl aug0701",             role:"Administrator",     email:"sdlaug0701@mailinator.com",       initials:"SA", firstName:"sdl",       lastName:"aug0701",     phone:"",           avatarColor:"#EDE9FE", textColor:"#6D28D9" },
  { id:3,  name:"Rajarajan N",             role:"Administrator",     email:"rajarajan.n@socialdnalabs.com",   initials:"RN", firstName:"Rajarajan", lastName:"N",           phone:"",           avatarColor:"#DCFCE7", textColor:"#166534" },
  { id:4,  name:"Admin",                   role:"Administrator",     email:"admin@mailinator.com",            initials:"A",  firstName:"Admin",     lastName:"",            phone:"",           avatarColor:"#FEF3C7", textColor:"#B45309" },
  { id:5,  name:"crmuser",                 role:"Support Executive", email:"crmuser@mailinator.com",          initials:"CU", firstName:"crm",       lastName:"user",        phone:"",           avatarColor:"#EFF6FF", textColor:"#1D4ED8" },
  { id:6,  name:"Sales manager",           role:"Operations Manager",email:"sdlsalesmanager@mailinator.com",  initials:"SM", firstName:"Sales",     lastName:"manager",     phone:"",           avatarColor:"#FEF2F2", textColor:"#DC2626" },
  { id:7,  name:"manager sdl",             role:"Operations Manager",email:"sdlmanager@mailinator.com",       initials:"MS", firstName:"manager",   lastName:"sdl",         phone:"",           avatarColor:"#F0FDF4", textColor:"#16A34A" },
  { id:8,  name:"Support executive user1", role:"Support Executive", email:"seuser1@mailinator.com",          initials:"SU", firstName:"Support",   lastName:"exec user1",  phone:"",           avatarColor:"#EFF6FF", textColor:"#1D4ED8" },
  { id:9,  name:"Operation Manager user 1",role:"Operations Manager",email:"opmanageruser1@mailinator.com",   initials:"OM", firstName:"Operation", lastName:"Mgr user 1",  phone:"",           avatarColor:"#FDF4FF", textColor:"#7E22CE" },
  { id:10, name:"Support executive user 2",role:"Support Executive", email:"seuser2@mailinator.com",          initials:"SU", firstName:"Support",   lastName:"exec user 2", phone:"",           avatarColor:"#EFF6FF", textColor:"#1D4ED8" },
  { id:11, name:"VP Operation User 1",     role:"VP of Operations",  email:"vpoperationuser1@mailinator.com", initials:"VP", firstName:"VP Ops",   lastName:"User 1",      phone:"",           avatarColor:"#FEF3C7", textColor:"#B45309" },
];

const ROLE_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  "Super Admin":        { bg:"#FEF3C7", text:"#B45309", border:"#FDE68A" },
  "Administrator":      { bg:"#FEF3C7", text:"#B45309", border:"#FDE68A" },
  "Support Executive":  { bg:"#EFF6FF", text:"#1D4ED8", border:"#BFDBFE" },
  "Operations Manager": { bg:"#F0FDF4", text:"#166534", border:"#BBF7D0" },
  "VP of Operations":   { bg:"#EDE9FE", text:"#6D28D9", border:"#DDD6FE" },
  "Team Leader":        { bg:"#FEF2F2", text:"#DC2626", border:"#FECACA" },
};

interface RoleNode {
  id: string; name: string; description: string; reportsTo?: string; department?: string; createdDate?: string; children?: RoleNode[];
}
interface RoleActivity {
  id: string; roleId: string; action: string; user: string; userEmail: string; timestamp: string;
}

const ROLE_TREE: RoleNode[] = [{
  id:"admin", name:"Administrator", description:"Full access administrator", reportsTo:"—", department:"Management",
  children:[
    { id:"vp", name:"VP of Operations", description:"VP-level operations access", reportsTo:"Administrator", department:"Operations", createdDate:"2025-10-15",
      children:[{ id:"ops", name:"Operations Manager", description:"Manages operations team", reportsTo:"VP of Operations", department:"Operations", createdDate:"2025-11-20",
        children:[{ id:"se", name:"Support Executive", description:"Customer support role", reportsTo:"Operations Manager", department:"Support", createdDate:"2025-12-01", children:[] }]
      }]
    },
    { id:"tl", name:"Team Leader", description:"Team leadership role", reportsTo:"Administrator", department:"Management", createdDate:"2026-01-10", children:[] },
    { id:"sa", name:"Super Admin", description:"Super administrator with all permissions", reportsTo:"Administrator", department:"Management", createdDate:"2025-09-05", children:[] },
  ],
}];

const ROLE_ACTIVITIES: RoleActivity[] = [
  { id:"1", roleId:"admin", action:"Role updated",                    user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-06-15 14:30" },
  { id:"2", roleId:"admin", action:"Permissions modified",            user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-06-14 10:15" },
  { id:"3", roleId:"admin", action:"Role created",                    user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-06-12 09:20" },
  { id:"4", roleId:"vp",    action:"Department changed to Operations", user:"Admin",  userEmail:"admin@mailinator.com",    timestamp:"2026-06-13 16:45" },
  { id:"5", roleId:"vp",    action:"Role created",                    user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-05-27 14:30" },
  { id:"6", roleId:"ops",   action:"Role created",                    user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-06-12 09:20" },
  { id:"7", roleId:"se",    action:"Reporting structure updated",     user:"Admin",  userEmail:"admin@mailinator.com",    timestamp:"2026-06-11 13:00" },
  { id:"8", roleId:"se",    action:"Role created",                    user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-05-27 14:38" },
  { id:"9", roleId:"tl",    action:"Description updated",             user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-06-10 15:30" },
  { id:"10",roleId:"tl",    action:"Role created",                    user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-05-27 14:38" },
  { id:"11",roleId:"sa",    action:"Role created",                    user:"PM SDL", userEmail:"pm@socialdnalabs.com",    timestamp:"2026-05-27 14:38" },
];

// ---------------------------------------------
//  Shared UI primitives — NO <p> tags
// ---------------------------------------------
function SettingCard({ icon: Icon, title, color = "#3B82F6", children, action }: {
  icon: React.ElementType; title: string; color?: string;
  children: React.ReactNode; action?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
      <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + (isDark ? "22" : "18") }}>
          <Icon size={13} color={color} weight="duotone" />
        </div>
        <span className={`font-heading text-[12px] font-bold uppercase tracking-wider flex-1 text-slate-500`}>{title}</span>
        {action}
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

function KV({ label, value, link, editable, onSave }: {
  label: string; value: string; link?: boolean; editable?: boolean; onSave?: (newValue: string) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const empty = !value || value === "—" || value === "-";

  const handleSave = () => {
    if (editValue.trim()) {
      onSave?.(editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className={`py-2.5 border-b last:border-0 flex items-start justify-between group ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
      <div className="flex-1 min-w-0">
        <div className={`text-[11.5px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-[#ABABAD]" : "text-slate-400"}`}>{label}</div>
        {isEditing ? (
          <div className="flex items-center gap-1.5 -mx-2">
            <input
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
              className={`flex-1 px-2 py-1 text-[14px] font-medium border rounded-lg focus:outline-none ${isDark ? "border-[#9CA3AF] bg-[#27272A] text-[#D4D4D8] focus:border-[#71717A]" : "border-[#4A7AE8] bg-white focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#4A7AE8] text-slate-700"}`}
            />
            <button onClick={handleSave} className={`px-2 py-1 text-[11px] font-bold rounded whitespace-nowrap transition-colors ${isDark ? "bg-[#3F3F46] text-[#D4D4D8] hover:bg-[#9CA3AF]" : "bg-[#1D4ED8] text-white hover:bg-[#60A5FA]"}`}>
              Save
            </button>
            <button onClick={handleCancel} className={`px-2 py-1 text-[11px] font-semibold border rounded whitespace-nowrap transition-colors ${isDark ? "border-[#3F3F46] text-[#71717A] hover:bg-[#27272A]" : "border-[#E3ECFC] text-slate-500 hover:bg-slate-50"}`}>
              Cancel
            </button>
          </div>
        ) : (
          <div
            title={empty ? undefined : editValue}
            className={`text-[14px] font-bold leading-snug truncate ${link ? (isDark ? "text-[#A1A1AA]" : "text-[#1D4ED8]") : empty ? (isDark ? "text-[#3F3F46]" : "text-slate-300") : (isDark ? "text-[#D4D4D8]" : "text-slate-700")}`}>
            {empty ? "—" : editValue}
          </div>
        )}
      </div>
      {editable && !isEditing && (
        <Tooltip title="Edit">
          <IconButton
            onClick={() => setIsEditing(true)}
            size="small"
            sx={{ p:0.4, mt:0.5, color: isDark ? "#3F3F46" : "#E2E8F0", opacity:0, transition:"opacity 0.15s", ".group:hover &":{opacity:1}, "&:hover":{color: isDark ? "#71717A" : "#E3ECFC", bgcolor: isDark ? "#27272A" : "#EFF6FF"}, borderRadius:"6px", cursor:"pointer" }}>
            <PencilSimple size={13} weight="duotone" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}

function KVGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6">{children}</div>;
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_BADGE[role] ?? { bg:"#F1F5F9", text:"#475569", border:"#E2E8F0" };
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor:cfg.bg, color:cfg.text, borderColor:cfg.border }}>
      {role}
    </span>
  );
}

function ProfileHero({ initials, name, role, subtitle, contacts, avatarBg, avatarText }: {
  initials: string; name: string; role: string; subtitle?: string;
  contacts: { icon: React.ElementType; value: string; link?: boolean }[];
  avatarBg: string; avatarText: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden mb-4 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
      <div className={`relative h-[64px] ${isDark ? "bg-gradient-to-r from-[#18181B] to-[#27272A]" : "bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6]"}`}>
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
      </div>
      <div className="relative px-6 pb-5">
        <div className="absolute -top-8 left-6">
          <div className="relative">
            <div className={`w-[64px] h-[64px] rounded-full border-[3px] shadow-md flex items-center justify-center ${isDark ? "border-[#1C1C1E]" : "border-[#f9fbff]"}`} style={{ backgroundColor:avatarBg }}>
              <span className="text-[20px] font-extrabold leading-none select-none" style={{ color:avatarText }}>{initials}</span>
            </div>
            <button className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border shadow-sm flex items-center justify-center transition-colors ${isDark ? "bg-[#27272A] border-[#3F3F46] hover:bg-[#3F3F46]" : "bg-white border-[#E3ECFC] hover:bg-[#EFF6FF]"}`}>
              <Camera size={10} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
            </button>
          </div>
        </div>
        <div className="pt-3 pl-[80px]">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[16px] font-extrabold tracking-tight leading-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{name}</span>
            <RoleBadge role={role} />
          </div>
          {subtitle && <div className={`text-[12px] mb-1.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>{subtitle}</div>}
          <div className="flex items-center gap-3 flex-wrap">
            {contacts.map(({ icon: Icon, value, link }, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-[12px] ${link ? (isDark ? "text-[#A1A1AA]" : "text-[#1D4ED8]") : (isDark ? "text-[#71717A]" : "text-slate-500")}`}>
                <Icon size={11} weight="duotone" />
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
//  Personal Settings panel
// ---------------------------------------------
function PersonalSettingsPanel() {
  const [data, setData] = useState({
    firstName: "PM",
    lastName: "SDL",
    email: "pm@socialdnalabs.com",
    mobileNo: "7788778855",
    gender: "Prefer not to say",
    dateOfBirth: "—",
    dateOfJoining: "11/01/2025",
    address: "—",
  });

  const updateField = (field: keyof typeof data, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`flex-1 overflow-y-auto px-6 py-6 space-y-4 ${isDark ? "bg-[#0A0A0A]" : "bg-[#EFF6FF]"}`}>
      <ProfileHero
        initials="PM" name="PM SDL" role="Super Admin"
        avatarBg="#FEF3C7" avatarText="#B45309"
        contacts={[
          { icon:Envelope, value:data.email, link:true },
          { icon:Phone,    value:data.mobileNo },
        ]}
      />
      <SettingCard icon={User} title="User Information">
        <KVGrid>
          <KV label="First Name" value={data.firstName} editable onSave={v => updateField("firstName", v)} />
          <KV label="Last Name"  value={data.lastName} editable onSave={v => updateField("lastName", v)} />
          <KV label="Email"      value={data.email} link editable onSave={v => updateField("email", v)} />
          <KV label="Mobile No"  value={data.mobileNo} editable onSave={v => updateField("mobileNo", v)} />
        </KVGrid>
      </SettingCard>
      <SettingCard icon={ShieldCheck} title="Role Information" color="#8B5CF6">
        <KV label="Role" value="Super Admin" />
      </SettingCard>
      <SettingCard icon={IdentificationCard} title="More Information" color="#F59E0B">
        <KVGrid>
          <KV label="Gender"          value={data.gender} editable onSave={v => updateField("gender", v)} />
          <KV label="Date Of Birth"   value={data.dateOfBirth} editable onSave={v => updateField("dateOfBirth", v)} />
          <KV label="Date Of Joining" value={data.dateOfJoining} editable onSave={v => updateField("dateOfJoining", v)} />
        </KVGrid>
      </SettingCard>
      <SettingCard icon={MapPin} title="Address" color="#10B981">
        <KV label="Address" value={data.address} editable onSave={v => updateField("address", v)} />
      </SettingCard>
    </div>
  );
}

// ---------------------------------------------
//  New User Drawer
// ---------------------------------------------
function NewUserDrawer({ open, onClose, onSubmit }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { firstName: string; lastName: string; email: string; role: string }) => void;
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Support Executive",
    gender: "",
    dateOfBirth: "",
    dateOfJoining: "",
    address: "",
    country: "",
    flatHouseNo: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.firstName.trim() && formData.lastName.trim() && formData.email.trim()) {
      onSubmit(formData);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "Support Executive",
        gender: "",
        dateOfBirth: "",
        dateOfJoining: "",
        address: "",
        country: "",
        flatHouseNo: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        latitude: "",
        longitude: "",
      });
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "Support Executive",
      gender: "",
      dateOfBirth: "",
      dateOfJoining: "",
      address: "",
      country: "",
      flatHouseNo: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      latitude: "",
      longitude: "",
    });
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const FX = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      ...(isDark ? {} : { backgroundColor: "#EFF6FF" }),
      fontSize: "0.82rem",
      "& fieldset":             { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
      "&:hover fieldset":       { borderColor: isDark ? "#9CA3AF" : "#E3ECFC" },
      "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#E3ECFC", borderWidth: 2 },
      "&.Mui-focused":          { boxShadow: isDark ? "none" : "0 0 0 2px #4A7AE8" },
      "& input":                { padding: "10px 14px" },
    },
    "& .MuiInputLabel-root":             { fontSize: "0.79rem", ...(isDark ? {} : { color: "#6B7280" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "inherit" },
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
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isDark ? "bg-[#27272A]" : "bg-[#1D4ED8]"}`}>
            <UsersThree size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
          </div>
          <h2 className={`m-0 font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>New User</h2>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={handleClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* User Information */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold mb-4 uppercase tracking-wider text-slate-500`}>User Information</h3>
          <div className="space-y-3">
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={e => handleChange("firstName", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={e => handleChange("lastName", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => handleChange("email", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={formData.role} onChange={e => handleChange("role", e.target.value)}>
                <MenuItem value="Administrator" sx={{ fontSize: "0.82rem" }}>Administrator</MenuItem>
                <MenuItem value="VP of Operations" sx={{ fontSize: "0.82rem" }}>VP of Operations</MenuItem>
                <MenuItem value="Operations Manager" sx={{ fontSize: "0.82rem" }}>Operations Manager</MenuItem>
                <MenuItem value="Support Executive" sx={{ fontSize: "0.82rem" }}>Support Executive</MenuItem>
                <MenuItem value="Team Leader" sx={{ fontSize: "0.82rem" }}>Team Leader</MenuItem>
                <MenuItem value="Super Admin" sx={{ fontSize: "0.82rem" }}>Super Admin</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* More Information */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold mb-4 uppercase tracking-wider text-slate-500`}>More Information</h3>
          <div className="space-y-3">
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel shrink>Gender</InputLabel>
              <Select label="Gender" value={formData.gender} onChange={e => handleChange("gender", e.target.value)} displayEmpty>
                <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#94A3B8" }}><em>Select gender</em></MenuItem>
                <MenuItem value="Male" sx={{ fontSize: "0.82rem" }}>Male</MenuItem>
                <MenuItem value="Female" sx={{ fontSize: "0.82rem" }}>Female</MenuItem>
                <MenuItem value="Other" sx={{ fontSize: "0.82rem" }}>Other</MenuItem>
                <MenuItem value="Prefer not to say" sx={{ fontSize: "0.82rem" }}>Prefer not to say</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Date Of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={e => handleChange("dateOfBirth", e.target.value)}
              size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              sx={FX}
            />
            <TextField
              label="Date Of Joining"
              type="date"
              value={formData.dateOfJoining}
              onChange={e => handleChange("dateOfJoining", e.target.value)}
              size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              sx={FX}
            />
          </div>
        </div>

        {/* Address Details */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold mb-4 uppercase tracking-wider text-slate-500`}>Address Details</h3>
          <div className="space-y-3">
            <TextField
              label="Address"
              value={formData.address}
              onChange={e => handleChange("address", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="Country / Region"
              value={formData.country}
              onChange={e => handleChange("country", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="Flat / House No. / Building / Apartment Name"
              value={formData.flatHouseNo}
              onChange={e => handleChange("flatHouseNo", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="Street Address"
              value={formData.streetAddress}
              onChange={e => handleChange("streetAddress", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="City"
              value={formData.city}
              onChange={e => handleChange("city", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="State / Province"
              value={formData.state}
              onChange={e => handleChange("state", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <TextField
              label="Zip / Postal Code"
              value={formData.zipCode}
              onChange={e => handleChange("zipCode", e.target.value)}
              size="small" fullWidth sx={FX}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Latitude"
                value={formData.latitude}
                onChange={e => handleChange("latitude", e.target.value)}
                size="small" fullWidth sx={FX}
              />
              <TextField
                label="Longitude"
                value={formData.longitude}
                onChange={e => handleChange("longitude", e.target.value)}
                size="small" fullWidth sx={FX}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <Button variant="text" onClick={handleClose}
          sx={{ color: isDark ? "#A1A1AA" : "#64748B", textTransform: "none", fontWeight: 600, fontSize: "0.82rem", borderRadius: "9px", px: 2.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
          sx={{ bgcolor: isDark ? "#27272A" : "inherit", color: isDark ? "#F4F4F5" : undefined, borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.82rem", px: 3, boxShadow: isDark ? "none" : "0 1px 8px #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "inherit" }, "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" }, "&:disabled": { bgcolor: isDark ? "#27272A" : "#E2E8F0", color: isDark ? "#9CA3AF" : "#F1F5F9" } }}>
          Create User
        </Button>
      </div>
    </Drawer>
  );
}

// ---------------------------------------------
//  Users panel
// ---------------------------------------------
function UserDetailPanel({ user, onUpdate }: { user: UserRecord; onUpdate: (updates: Partial<UserRecord>) => void }) {
  const [data, setData] = useState<Record<string, string>>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "—",
    gender: "Prefer not to say",
    dateOfBirth: "—",
    dateOfJoining: "11/01/2025",
    address: "—",
  });

  const updateField = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (field === "firstName" || field === "lastName" || field === "email" || field === "phone") {
      onUpdate({ [field]: value });
    }
  };

  const { theme: uTheme } = useTheme();
  const isDarkUD = uTheme === "dark";
  return (
    <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-4 ${isDarkUD ? "bg-[#0A0A0A]" : "bg-[#EFF6FF]"}`}>
      <ProfileHero
        initials={user.initials} name={user.name} role={user.role}
        avatarBg={user.avatarColor} avatarText={user.textColor}
        contacts={[
          { icon:Envelope, value:data.email, link:true },
          ...(data.phone && data.phone !== "—" ? [{ icon:Phone, value:data.phone }] : []),
        ]}
      />
      <SettingCard icon={User} title="User Information">
        <KVGrid>
          <KV label="First Name" value={data.firstName} editable onSave={v => updateField("firstName", v)} />
          <KV label="Last Name"  value={data.lastName} editable onSave={v => updateField("lastName", v)} />
          <KV label="Email"      value={data.email} link editable onSave={v => updateField("email", v)} />
          <KV label="Mobile No"  value={data.phone} editable onSave={v => updateField("phone", v)} />
        </KVGrid>
      </SettingCard>
      <SettingCard icon={ShieldCheck} title="Role Information" color="#8B5CF6">
        <KV label="Role" value={user.role} />
      </SettingCard>
      <SettingCard icon={IdentificationCard} title="More Information" color="#F59E0B">
        <KVGrid>
          <KV label="Gender"          value={data.gender} editable onSave={v => updateField("gender", v)} />
          <KV label="Date Of Birth"   value={data.dateOfBirth} editable onSave={v => updateField("dateOfBirth", v)} />
          <KV label="Date Of Joining" value={data.dateOfJoining} editable onSave={v => updateField("dateOfJoining", v)} />
        </KVGrid>
      </SettingCard>
      <SettingCard icon={MapPin} title="Address" color="#10B981">
        <KV label="Address" value={data.address} editable onSave={v => updateField("address", v)} />
      </SettingCard>
    </div>
  );
}

function UsersPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selected, setSelected]   = useState<UserRecord>(USERS[0]);
  const [search, setSearch]       = useState("");
  const [checked, setChecked]     = useState<number[]>([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>(USERS);

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCheck = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const updateSelectedUser = (updates: Partial<UserRecord>) => {
    setSelected(prev => ({ ...prev, ...updates }));
  };

  const handleCreateUser = (formData: { firstName: string; lastName: string; email: string; role: string }) => {
    const initials = (formData.firstName[0] + formData.lastName[0]).toUpperCase();
    const colors = ["#DBEAFE", "#DCE7F1", "#E0E7FF", "#F0FDF4"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: UserRecord = {
      id: Math.max(...users.map(u => u.id)) + 1,
      initials,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      role: formData.role,
      phone: "",
      firstName: formData.firstName,
      lastName: formData.lastName,
      avatarColor: randomColor,
      textColor: "#1F2937",
    };

    setUsers(prev => [newUser, ...prev]);
    setSelected(newUser);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* User list */}
      <div className={`w-[340px] flex-shrink-0 flex flex-col border-r ${isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#f9fbff]"}`}>
        {/* Toolbar */}
        <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <div className={`flex-1 flex items-center gap-1.5 border rounded-xl px-3 py-1.5 focus-within:border-[#1D4ED8] focus-within:shadow-[0_0_0_2px_#4A7AE8] transition-all ${isDark ? "bg-[#18181B] border-[#3F3F46]" : "bg-white border-[#E3ECFC]"}`}>
            <MagnifyingGlass size={13} color="#94A3B8" weight="duotone" />
            <InputBase placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
              sx={{ flex:1, fontSize:"0.75rem", color: isDark ? "#D4D4D8" : "#334155", "& input::placeholder":{color:"#94A3B8",opacity:1} }} />
          </div>
          <Button variant="contained" size="small" startIcon={<Plus size={12} weight="bold" />}
            onClick={() => setShowNewUserModal(true)}
            sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius:"9px", textTransform:"none", fontWeight:700, fontSize:"0.73rem", px:1.5, py:0.7, whiteSpace:"nowrap", boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", "&:hover":{ bgcolor: isDark ? "#3F3F46" : "#2563EB" } }}>
            New User
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(user => {
            const isActive = selected.id === user.id;
            const isChecked = checked.includes(user.id);
            return (
              <div key={user.id} onClick={() => setSelected(user)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#EFF6FF] transition-colors group ${
                  isActive ? "bg-[#EFF6FF]" : "hover:bg-[#f9fbff]"
                }`}>
                <div onClick={e => toggleCheck(user.id, e)}>
                  <Checkbox size="small" checked={isChecked}
                    sx={{ p:0.3, color:"#E2E8F0", "&.Mui-checked":{color:"#1D4ED8"} }} />
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                  style={{ backgroundColor: user.avatarColor, color: user.textColor }}>
                  {user.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[14px] font-semibold truncate ${isActive?"text-[#1D4ED8]":"text-slate-800"}`}>{user.name}</span>
                    <div className="flex-shrink-0">
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  <div className="text-[12px] text-slate-400 truncate">{user.email}</div>
                </div>
                {/* Online dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.id <= 2 ? "bg-[#10B981]" : "bg-slate-200"}`} />
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t border-[#E3ECFC] flex items-center justify-between">
          <span className="text-[12px] text-slate-400">Rows per page: <span className="font-semibold text-slate-600">25</span></span>
          <span className="text-[12px] text-slate-500 font-medium">1–{filtered.length} of {filtered.length}</span>
        </div>
      </div>

      {/* Detail */}
      <UserDetailPanel user={selected} onUpdate={updateSelectedUser} />

      {/* New User Drawer */}
      <NewUserDrawer
        open={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
}

// ---------------------------------------------
//  Organization panel
// ---------------------------------------------
function OrganizationPanel() {
  const [orgData, setOrgData] = useState({
    companyName: "Social DNA Labs",
    abbreviation: "SDL",
    defaultCurrency: "INR",
    country: "India",
    taxId: "—",
    domain: "—",
    dateOfEstablishment: "—",
    dateOfIncorporation: "—",
    dateOfCommencement: "—",
    timeZone: "Asia/Calcutta",
    phoneNo: "9988775566",
    email: "pm@socialdnalabs.com",
    fax: "—",
    website: "www.socialdnalabs.com",
    companyDescription: "—",
    registrationDetails: "—",
  });

  const handleSave = (field: string, value: string) => {
    setOrgData(prev => ({ ...prev, [field]: value }));
  };

  const { theme: orgTheme } = useTheme();
  const isDarkOrg = orgTheme === "dark";
  return (
    <div className={`flex-1 overflow-y-auto px-6 py-6 space-y-4 ${isDarkOrg ? "bg-[#0A0A0A]" : "bg-[#EFF6FF]"}`}>
      <ProfileHero
        initials="S" name="Social DNA Labs" role="Super Admin"
        subtitle="India · INR"
        avatarBg="#F1F5F9" avatarText="#475569"
        contacts={[
          { icon:Envelope, value:"pm@socialdnalabs.com", link:true },
          { icon:Phone,    value:"9988775566" },
          { icon:Globe,    value:"www.socialdnalabs.com", link:true },
        ]}
      />
      <SettingCard icon={Buildings} title="General Information">
        <KVGrid>
          <KV label="Company Name"            value={orgData.companyName}          editable onSave={(v) => handleSave("companyName", v)} />
          <KV label="Abbreviation"            value={orgData.abbreviation}         editable onSave={(v) => handleSave("abbreviation", v)} />
          <KV label="Default Currency"        value={orgData.defaultCurrency}      editable onSave={(v) => handleSave("defaultCurrency", v)} />
          <KV label="Country"                 value={orgData.country}              editable onSave={(v) => handleSave("country", v)} />
          <KV label="Tax ID"                  value={orgData.taxId}                editable onSave={(v) => handleSave("taxId", v)} />
          <KV label="Domain"                  value={orgData.domain}               editable onSave={(v) => handleSave("domain", v)} />
          <KV label="Date Of Establishment"   value={orgData.dateOfEstablishment}  editable onSave={(v) => handleSave("dateOfEstablishment", v)} />
          <KV label="Date Of Incorporation"   value={orgData.dateOfIncorporation}  editable onSave={(v) => handleSave("dateOfIncorporation", v)} />
          <KV label="Date Of Commencement"    value={orgData.dateOfCommencement}   editable onSave={(v) => handleSave("dateOfCommencement", v)} />
          <KV label="Time Zone"               value={orgData.timeZone}             editable onSave={(v) => handleSave("timeZone", v)} />
        </KVGrid>
      </SettingCard>
      <SettingCard icon={Phone} title="Contact Information" color="#10B981">
        <KVGrid>
          <KV label="Phone No" value={orgData.phoneNo}    editable onSave={(v) => handleSave("phoneNo", v)} />
          <KV label="Email"    value={orgData.email}      editable onSave={(v) => handleSave("email", v)} link />
          <KV label="Fax"      value={orgData.fax}        editable onSave={(v) => handleSave("fax", v)} />
          <KV label="Website"  value={orgData.website}    editable onSave={(v) => handleSave("website", v)} link />
        </KVGrid>
      </SettingCard>
      <SettingCard icon={IdentificationCard} title="Other Information" color="#F59E0B">
        <KV label="Company Description" value={orgData.companyDescription}   editable onSave={(v) => handleSave("companyDescription", v)} />
        <KV label="Registration Details" value={orgData.registrationDetails} editable onSave={(v) => handleSave("registrationDetails", v)} />
      </SettingCard>
    </div>
  );
}

// ---------------------------------------------
//  New Role Drawer
// ---------------------------------------------
function NewRoleDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    roleName: "",
    roleDescription: "",
    reportsTo: "",
    department: "",
    status: "Active",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.roleName.trim()) {
      console.log("New role:", formData);
      onClose();
      setFormData({ roleName: "", roleDescription: "", reportsTo: "", department: "", status: "Active" });
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ roleName: "", roleDescription: "", reportsTo: "", department: "", status: "Active" });
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const FX = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      ...(isDark ? {} : { backgroundColor: "#EFF6FF" }),
      fontSize: "0.82rem",
      "& fieldset":             { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
      "&:hover fieldset":       { borderColor: isDark ? "#9CA3AF" : "#E3ECFC" },
      "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#E3ECFC", borderWidth: 2 },
      "&.Mui-focused":          { boxShadow: isDark ? "none" : "0 0 0 2px #4A7AE8" },
      "& input":                { padding: "10px 14px" },
    },
    "& .MuiInputLabel-root":             { fontSize: "0.79rem", ...(isDark ? {} : { color: "#6B7280" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "inherit" },
    "& .MuiSelect-select":               { fontSize: "0.82rem", padding: "10px 14px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }) },
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, display: "flex", flexDirection: "column", bgcolor: isDark ? "#18181B" : "#F8FAFF", boxShadow: isDark ? "-12px 0 48px rgba(0,0,0,0.5)" : "-12px 0 48px rgba(12,36,114,0.12)" } }}>
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isDark ? "bg-[#27272A]" : "bg-[#8B5CF6]"}`}>
            <ShieldCheck size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
          </div>
          <h2 className={`m-0 font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>New Role</h2>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={handleClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Role Details */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold mb-4 uppercase tracking-wider text-slate-500`}>Role Details</h3>
          <div className="space-y-3">
            <TextField label="Role Name" value={formData.roleName} onChange={e => handleChange("roleName", e.target.value)}
              size="small" fullWidth sx={FX} />
            <TextField label="Role Description" value={formData.roleDescription} onChange={e => handleChange("roleDescription", e.target.value)}
              multiline minRows={3} size="small" fullWidth sx={FX} />
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Reports To</InputLabel>
              <Select label="Reports To" value={formData.reportsTo} onChange={e => handleChange("reportsTo", e.target.value)} displayEmpty>
                <MenuItem value="" sx={{ fontSize: "0.82rem", color: "#94A3B8" }}><em>Select a role</em></MenuItem>
                <MenuItem value="Administrator" sx={{ fontSize: "0.82rem" }}>Administrator</MenuItem>
                <MenuItem value="VP of Operations" sx={{ fontSize: "0.82rem" }}>VP of Operations</MenuItem>
                <MenuItem value="Operations Manager" sx={{ fontSize: "0.82rem" }}>Operations Manager</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className={`font-heading text-[12px] font-bold mb-4 uppercase tracking-wider text-slate-500`}>Additional Information</h3>
          <div className="space-y-3">
            <TextField label="Department" value={formData.department} onChange={e => handleChange("department", e.target.value)}
              size="small" fullWidth sx={FX} />
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={formData.status} onChange={e => handleChange("status", e.target.value)}>
                <MenuItem value="Active" sx={{ fontSize: "0.82rem" }}>Active</MenuItem>
                <MenuItem value="Inactive" sx={{ fontSize: "0.82rem" }}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <Button variant="text" onClick={handleClose}
          sx={{ color: isDark ? "#A1A1AA" : "#64748B", textTransform: "none", fontWeight: 600, fontSize: "0.82rem", borderRadius: "9px", px: 2.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}
          sx={{ bgcolor: isDark ? "#27272A" : "inherit", color: isDark ? "#F4F4F5" : undefined, borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.82rem", px: 3, boxShadow: isDark ? "none" : "0 1px 8px #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "inherit" }, "&:active": { bgcolor: isDark ? "#18181B" : "#0C2472" } }}>
          Create Role
        </Button>
      </div>
    </Drawer>
  );
}

// ---------------------------------------------
//  Roles panel
// ---------------------------------------------
function RoleTreeNode({ node, depth, selectedId, expandedIds, onSelect, onToggle, isDark }: {
  node: RoleNode; depth: number; selectedId: string;
  expandedIds: Set<string>; onSelect: (n: RoleNode) => void; onToggle: (id: string) => void;
  isDark: boolean;
}) {
  const isSelected = selectedId === node.id;
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div>
      <div onClick={() => onSelect(node)}
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors group ${
          isDark
            ? `border-b border-[#27272A] ${isSelected ? "bg-[#27272A]" : "hover:bg-[#1C1C1E]"}`
            : `border-b border-[#E3ECFC] ${isSelected ? "bg-[#EFF6FF]" : "hover:bg-[#f9fbff]"}`
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}>
        {/* Expand toggle */}
        <button onClick={e => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
          className={`w-5 h-5 flex items-center justify-center flex-shrink-0 rounded-md transition-colors ${isDark ? "hover:bg-[#3F3F46]" : "hover:bg-[#E3ECFC]"}`}>
          {hasChildren
            ? isExpanded
              ? <CaretDown size={10} color={isDark ? "#71717A" : "#94A3B8"} weight="bold" />
              : <CaretRight size={10} color={isDark ? "#71717A" : "#94A3B8"} weight="bold" />
            : <span className={`w-1.5 h-1.5 rounded-full inline-block ${isDark ? "bg-[#3F3F46]" : "bg-[#CBD5E1]"}`} />
          }
        </button>
        <div className={`text-[14px] font-medium flex-1 ${
          isSelected
            ? isDark ? "text-[#D4D4D8] font-semibold" : "text-[#0C2472] font-semibold"
            : isDark ? "text-[#71717A]" : "text-slate-500"
        }`}>
          {node.name}
        </div>
        {isSelected && <CheckCircle size={14} color={isDark ? "#9CA3AF" : "#1D4ED8"} weight="duotone" />}
      </div>

      {hasChildren && isExpanded && node.children!.map(child => (
        <RoleTreeNode key={child.id} node={child} depth={depth + 1}
          selectedId={selectedId} expandedIds={expandedIds}
          onSelect={onSelect} onToggle={onToggle} isDark={isDark} />
      ))}
    </div>
  );
}

function RolesPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedRole, setSelectedRole] = useState<RoleNode>(ROLE_TREE[0]);
  const [activeTab, setActiveTab]       = useState<"overview"|"timeline">("overview");
  const [viewMode, setViewMode]         = useState<"tree"|"list">("tree");
  const [expandedIds, setExpandedIds]   = useState<Set<string>>(
    new Set(["admin", "vp", "ops"])
  );
  const [newRoleOpen, setNewRoleOpen] = useState(false);

  const toggleExpand = (id: string) =>
    setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allRoles = (() => {
    const roles: RoleNode[] = [];
    const collect = (node: RoleNode) => {
      roles.push(node);
      node.children?.forEach(collect);
    };
    ROLE_TREE.forEach(collect);
    return roles;
  })();

  const roleActivities = ROLE_ACTIVITIES.filter(a => a.roleId === selectedRole.id).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const RoleListView = () => (
    <div className="flex-1 overflow-y-auto space-y-2">
      {allRoles.map(role => (
        <button key={role.id} onClick={() => setSelectedRole(role)}
          className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
            selectedRole.id === role.id
              ? isDark ? "bg-[#27272A] border-[#3F3F46] shadow-sm" : "bg-[#EFF6FF] border-[#1D4ED8] shadow-sm"
              : isDark ? "border-[#27272A] hover:bg-[#1C1C1E]" : "border-[#E3ECFC] hover:bg-[#f9fbff]"
          }`}>
          <div className={`text-[14px] font-semibold ${
            selectedRole.id === role.id
              ? isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"
              : isDark ? "text-[#71717A]" : "text-slate-600"
          }`}>
            {role.name}
          </div>
          <div className={`text-[12px] mt-0.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>{role.description}</div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Role sidebar */}
      <div className={`w-[340px] flex-shrink-0 flex flex-col border-r ${isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#f9fbff]"}`}>
        {/* Toolbar */}
        <div className={`px-4 py-3 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"} flex items-center gap-2`}>
          <div className={`flex items-center rounded-xl p-1 gap-1 ${isDark ? "bg-[#1C1C1E] border border-[#27272A]" : "bg-[#EFF6FF] border border-[#E3ECFC]"}`}>
            <button onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                viewMode === "tree"
                  ? isDark ? "bg-[#27272A] text-[#D4D4D8]" : "bg-[#E3ECFC] text-[#0C2472]"
                  : isDark ? "text-[#9CA3AF]" : "text-slate-400"
              }`}>
              <Tree size={12} weight="duotone" />
              Tree
            </button>
            <button onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                viewMode === "list"
                  ? isDark ? "bg-[#27272A] text-[#D4D4D8]" : "bg-[#E3ECFC] text-[#0C2472]"
                  : isDark ? "text-[#9CA3AF]" : "text-slate-400"
              }`}>
              <ListBullets size={12} weight="duotone" />
              List
            </button>
          </div>
          <div className="flex-1" />
          <Button variant="contained" size="small" onClick={() => setNewRoleOpen(true)}
            sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#D4D4D8" : "white", borderRadius:"9px", textTransform:"none", fontWeight:700, fontSize:"0.73rem", px:1.5, py:0.7, boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", "&:hover":{ bgcolor: isDark ? "#3F3F46" : "#2563EB", color: isDark ? "#F4F4F5" : "white" } }}>
            New Role
          </Button>
        </div>

        {/* Tree or List view */}
        <div className="flex-1 overflow-y-auto p-2">
          {viewMode === "tree" ? (
            ROLE_TREE.map(node => (
              <RoleTreeNode key={node.id} node={node} depth={0}
                selectedId={selectedRole.id} expandedIds={expandedIds}
                onSelect={setSelectedRole} onToggle={toggleExpand} isDark={isDark} />
            ))
          ) : (
            <RoleListView />
          )}
        </div>
      </div>

      {/* Role detail */}
      <div className={`flex-1 overflow-y-auto px-6 py-6 ${isDark ? "bg-[#0A0A0A]" : "bg-[#EFF6FF]"}`}>
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5">
          {(["overview","timeline"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-[14px] font-semibold capitalize transition-all ${
                activeTab === tab
                  ? isDark ? "bg-[#27272A] text-[#D4D4D8] shadow-sm" : "bg-[#1D4ED8] text-white shadow-sm"
                  : isDark ? "bg-[#1C1C1E] text-[#9CA3AF] hover:bg-[#27272A] hover:text-[#A1A1AA]" : "bg-white text-slate-500 hover:bg-[#E3ECFC] hover:text-[#0C2472]"
              }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <SettingCard icon={ShieldCheck} title="Role Information" color="#8B5CF6">
            <KV label="Role Name"        value={selectedRole.name}        editable onSave={() => {}} />
            <KV label="Role Description" value={selectedRole.description} editable onSave={() => {}} />
            <KV label="Reports To"       value={selectedRole.reportsTo ?? "—"} editable onSave={() => {}} />
            <KV label="Department"       value={selectedRole.department ?? "—"} editable onSave={() => {}} />
            <KV label="Created Date"     value={selectedRole.createdDate ?? "—"} />
          </SettingCard>
        )}

        {activeTab === "timeline" && (() => {
          const fmt = (ts: string) => {
            const d = new Date(ts);
            return {
              date: d.toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }),
              time: d.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", hour12:true }).toLowerCase(),
            };
          };
          const getIcon = (action: string) => {
            if (action.toLowerCase().includes("created")) return { icon: Plus,          color:"#1D4ED8", bg:"#EFF6FF" };
            if (action.toLowerCase().includes("updated")) return { icon: PencilSimple,  color:"#1D4ED8", bg:"#EFF6FF" };
            if (action.toLowerCase().includes("modified"))return { icon: PencilSimple,  color:"#1D4ED8", bg:"#EFF6FF" };
            if (action.toLowerCase().includes("changed")) return { icon: PencilSimple,  color:"#1D4ED8", bg:"#EFF6FF" };
            return                                               { icon: PencilSimple,  color:"#1D4ED8", bg:"#EFF6FF" };
          };
          // group by date
          const grouped: { date: string; items: typeof roleActivities }[] = [];
          roleActivities.forEach(a => {
            const { date } = fmt(a.timestamp);
            const grp = grouped.find(g => g.date === date);
            if (grp) grp.items.push(a);
            else grouped.push({ date, items: [a] });
          });

          return (
            <div className="bg-[#f9fbff] rounded-2xl border border-[#E3ECFC] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#EFF6FF]">
                <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                  <ClockCounterClockwise size={13} color="#1D4ED8" weight="duotone" />
                </div>
                <span className="font-heading text-[12px] font-bold uppercase tracking-wider text-slate-500">History</span>
              </div>

              {roleActivities.length > 0 ? (
                <div className="px-5 py-4 space-y-5">
                  {grouped.map(({ date, items }) => (
                    <div key={date}>
                      {/* Date divider */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[12px] font-semibold text-slate-400 whitespace-nowrap">{date}</span>
                        <div className="flex-1 h-px bg-[#E3ECFC]" />
                      </div>
                      {/* Items for this date */}
                      <div className="space-y-4">
                        {items.map(activity => {
                          const { time } = fmt(activity.timestamp);
                          const { icon: Icon, color, bg } = getIcon(activity.action);
                          const [verb, ...rest] = activity.action.split(" ");
                          return (
                            <div key={activity.id} className="flex items-start gap-4">
                              {/* Time */}
                              <span className="text-[12px] text-slate-400 font-medium w-[60px] flex-shrink-0 pt-0.5">{time}</span>
                              {/* Icon */}
                              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                                <Icon size={13} color={color} weight="duotone" />
                              </div>
                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <div className="text-[14px] text-slate-700 leading-snug">
                                  <span className="font-bold">{verb}:</span>{" "}
                                  <span className="font-medium">{rest.join(" ")}</span>
                                </div>
                                <div className="text-[11.5px] text-[#1D4ED8] mt-0.5">by {activity.userEmail}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center text-slate-400 text-[14px]">
                  No activity recorded for this role.
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* New Role Drawer */}
      {newRoleOpen && <NewRoleDrawer open={newRoleOpen} onClose={() => setNewRoleOpen(false)} />}
    </div>
  );
}

// ---------------------------------------------
//  Permissions panel
// ---------------------------------------------
type PermKey = "fullAccess"|"create"|"read"|"update"|"delete"|"print"|"import"|"export"|"email"|"dataSharingPublic";
type PermState = Record<string, Record<string, Record<PermKey, boolean>>>;

const PERM_PAIRS: [PermKey, PermKey][] = [
  ["fullAccess","create"],
  ["read","update"],
  ["delete","print"],
  ["import","export"],
  ["email","dataSharingPublic"],
];

const PERM_META: Record<PermKey, { label: string; icon: React.ElementType; color: string }> = {
  fullAccess:        { label:"Full Access",           icon:Square,         color:"#10B981" },
  create:            { label:"Create",                icon:Plus,           color:"#1D4ED8" },
  read:              { label:"Read",                  icon:Eye,            color:"#06B6D4" },
  update:            { label:"Update",                icon:PencilSimple,   color:"#F59E0B" },
  delete:            { label:"Delete",                icon:Trash,          color:"#EF4444" },
  print:             { label:"Print",                 icon:Printer,        color:"#64748B" },
  import:            { label:"Import",                icon:UploadSimple,   color:"#8B5CF6" },
  export:            { label:"Export",                icon:DownloadSimple, color:"#8B5CF6" },
  email:             { label:"Email",                 icon:Envelope,       color:"#64748B" },
  dataSharingPublic: { label:"Data Sharing (Public)", icon:Globe,          color:"#10B981" },
};

const PERM_MODULES = [
  "Leads","Deals","Contacts","Accounts","Tasks",
  "Users","Organizations","Roles","Permissions",
  "Modules and Fields","Import","Export","Data Backup",
  "Reports","Dashboard Customization",
];

const PERM_ROLES = [
  { key:"administrator",  label:"Administrator",      color:"#3B82F6" },
  { key:"vpOperations",   label:"VP of Operations",   color:"#8B5CF6" },
  { key:"opsManager",     label:"Operations Manager", color:"#10B981" },
  { key:"supportExec",    label:"Support Executive",  color:"#06B6D4" },
  { key:"teamLeader",     label:"Team Leader",        color:"#F59E0B" },
];

function buildDefaultPerms(): PermState {
  const s: PermState = {};
  PERM_MODULES.forEach(mod => {
    s[mod] = {};
    PERM_ROLES.forEach(role => {
      s[mod][role.key] = {
        fullAccess:true, create:true, read:true, update:true,
        delete:true, print:true, import:true, export:true,
        email:true, dataSharingPublic:true,
      };
    });
  });
  return s;
}

function MiniToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex w-[28px] h-[15px] rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${checked ? "bg-[#10B981]" : "bg-slate-200"}`}>
      <span className={`inline-block w-[11px] h-[11px] rounded-full bg-white shadow-sm transform transition-transform duration-200 absolute top-[2px] ${checked ? "translate-x-[15px]" : "translate-x-[2px]"}`} />
    </button>
  );
}

function PermCell({ module, role, state, onToggle }: {
  module: string; role: string;
  state: Record<PermKey, boolean>;
  onToggle: (mod: string, role: string, perm: PermKey) => void;
}) {
  return (
    <div className="px-3 py-2 space-y-1.5 min-w-[120px]">
      {PERM_PAIRS.map(([p1, p2]) => {
        const M1 = PERM_META[p1], M2 = PERM_META[p2];
        return (
          <div key={p1} className="flex items-center gap-2.5">
            <Tooltip title={M1.label}>
              <div className="flex items-center gap-0.5">
                <MiniToggle checked={state[p1]} onChange={() => onToggle(module, role, p1)} />
                <M1.icon size={10} color={state[p1] ? M1.color : "#E2E8F0"} weight={p1==="fullAccess"||p1==="delete"?"fill":"duotone"} />
              </div>
            </Tooltip>
            <Tooltip title={M2.label}>
              <div className="flex items-center gap-0.5">
                <MiniToggle checked={state[p2]} onChange={() => onToggle(module, role, p2)} />
                <M2.icon size={10} color={state[p2] ? M2.color : "#E2E8F0"} weight={p2==="fullAccess"||p2==="delete"?"fill":"duotone"} />
              </div>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}

function PermissionPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab]         = useState<"matrix"|"summary">("matrix");
  const [perms, setPerms]     = useState<PermState>(buildDefaultPerms);
  const [saved, setSaved]     = useState(false);
  const [mobileRole, setMobileRole] = useState(PERM_ROLES[0].key);

  const toggle = (mod: string, role: string, perm: PermKey) => {
    setPerms(prev => ({
      ...prev,
      [mod]: { ...prev[mod], [role]: { ...prev[mod][role], [perm]: !prev[mod][role][perm] } },
    }));
    setSaved(false);
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className={`text-[16px] sm:text-[18px] font-extrabold tracking-tight ${isDark ? "text-[#D4D4D8]" : "text-slate-900"}`}>Permissions</div>
        <Button variant="contained" size="small"
          onClick={() => setSaved(true)}
          sx={{ bgcolor: saved ? "#10B981" : (isDark ? "#27272A" : "#1D4ED8"), color: saved ? "#fff" : (isDark ? "#D4D4D8" : "white"), borderRadius:"9px", textTransform:"none", fontWeight:700, fontSize:"0.75rem", px:2, py:0.8, boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", flexShrink: 0, "&:hover":{ bgcolor: saved ? "#059669" : (isDark ? "#3F3F46" : "#2563EB") } }}>
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 sm:px-6 pt-4 pb-0">
        {(["matrix","summary"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-t-xl text-[14px] font-semibold transition-all border border-b-0 ${
              tab === t
                ? isDark ? "bg-[#1C1C1E] border-[#27272A] text-[#D4D4D8]" : "bg-white border-[#E3ECFC] text-slate-900"
                : isDark ? "bg-transparent border-transparent text-[#9CA3AF] hover:text-[#A1A1AA]" : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
            }`}>
            {t === "matrix" ? "Permission Matrix" : "Summary View"}
          </button>
        ))}
      </div>

      {/* Matrix — mobile: pick one role, see it as a scrollable list. Desktop: full grid. */}
      {tab === "matrix" && (
        <div className="md:hidden flex-1 overflow-hidden flex flex-col mx-4 mb-4">
          {/* Role picker */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-3 flex-shrink-0">
            {PERM_ROLES.map(role => {
              const active = mobileRole === role.key;
              return (
                <button key={role.key} onClick={() => setMobileRole(role.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors border-2`}
                  style={active
                    ? { backgroundColor: role.color, borderColor: role.color, color: "#fff" }
                    : { backgroundColor: "transparent", borderColor: isDark ? "#27272A" : "#E3ECFC", color: isDark ? "#9CA3AF" : "#64748B" }}>
                  {role.label}
                </button>
              );
            })}
          </div>
          {/* Module list for the selected role */}
          <div className={`flex-1 overflow-y-auto rounded-2xl border divide-y ${isDark ? "bg-[#1C1C1E] border-[#27272A] divide-[#27272A]" : "bg-white border-[#E3ECFC] divide-[#EFF6FF]"}`}>
            {PERM_MODULES.map(mod => (
              <div key={mod} className="px-4 py-3">
                <div className={`text-[13.5px] font-bold mb-2.5 ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>{mod}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {(Object.keys(PERM_META) as PermKey[]).map(perm => {
                    const meta = PERM_META[perm];
                    const Icon = meta.icon;
                    const checked = perms[mod][mobileRole][perm];
                    return (
                      <button key={perm} onClick={() => toggle(mod, mobileRole, perm)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors ${
                          checked
                            ? isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#f9fbff]"
                            : isDark ? "border-[#1C1C1E] bg-transparent opacity-50" : "border-transparent bg-transparent opacity-50"
                        }`}>
                        <Icon size={12} color={checked ? meta.color : "#94A3B8"} weight={perm === "fullAccess" || perm === "delete" ? "fill" : "duotone"} className="flex-shrink-0" />
                        <span className={`text-[11.5px] font-medium truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "matrix" && (
        <div className={`hidden md:block flex-1 overflow-auto mx-6 mb-4 rounded-b-2xl rounded-tr-2xl border shadow-sm ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
          <table className="w-full border-collapse text-left" style={{ minWidth: 900 }}>
            <thead>
              <tr className={`border-b ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                <th className={`sticky left-0 z-10 px-5 py-3 text-[11px] font-bold uppercase tracking-wider w-[160px] border-r ${isDark ? "bg-[#111113] text-[#9CA3AF] border-[#27272A]" : "bg-[#f9fbff] text-slate-600 border-[#E3ECFC]"}`}>
                  Module
                </th>
                {PERM_ROLES.map(role => (
                  <th key={role.key} className="px-3 py-3 text-center min-w-[140px]">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: role.color }}>
                      {role.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERM_MODULES.map((mod, i) => (
                <tr key={mod} className={`border-b ${isDark ? `border-[#27272A] ${i % 2 === 0 ? "bg-[#1C1C1E]" : "bg-[#18181B]"}` : `border-[#E3ECFC] ${i % 2 === 0 ? "bg-white" : "bg-[#f9fbff]"}`}`}>
                  <td className={`sticky left-0 z-10 px-5 py-2 border-r font-semibold text-[14px] bg-inherit align-middle whitespace-nowrap ${isDark ? "text-[#A1A1AA] border-[#27272A]" : "text-slate-700 border-[#E3ECFC]"}`}>
                    {mod}
                  </td>
                  {PERM_ROLES.map(role => (
                    <td key={role.key} className={`border-r last:border-r-0 align-top ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                      <PermCell module={mod} role={role.key} state={perms[mod][role.key]} onToggle={toggle} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "summary" && (
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-5 space-y-5">
          {/* Role cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERM_ROLES.map(role => {
              const rolePerms = perms;
              return (
                <div key={role.key} className="bg-white rounded-2xl border border-[#E3ECFC] shadow-sm overflow-hidden">
                  {/* Role header badge */}
                  <div className="px-4 py-3 border-b border-[#EFF6FF]">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: role.color }}>
                      {role.label}
                    </span>
                  </div>
                  {/* Module rows */}
                  <div className="divide-y divide-[#F8FAFF]">
                    {PERM_MODULES.map(mod => {
                      const state = rolePerms[mod]?.[role.key];
                      const activePerms = state
                        ? (Object.entries(state) as [PermKey, boolean][]).filter(([, v]) => v).map(([k]) => k)
                        : [];
                      const hasAny = activePerms.length > 0;
                      return (
                        <div key={mod} className="flex items-center justify-between px-4 py-2 hover:bg-[#fafcff] transition-colors">
                          <span className="text-[14px] text-slate-600 font-medium">{mod}</span>
                          {hasAny ? (
                            <div className="flex items-center gap-0.5">
                              {activePerms.map(perm => {
                                const meta = PERM_META[perm];
                                if (!meta) return null;
                                const Icon = meta.icon;
                                return (
                                  <Tooltip key={perm} title={meta.label}>
                                    <span className="flex items-center justify-center w-5 h-5">
                                      <Icon size={12} color={meta.color} weight={perm === "fullAccess" || perm === "delete" ? "fill" : "duotone"} />
                                    </span>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          ) : (
                            <Lock size={12} color="#E2E8F0" weight="duotone" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl border border-[#E3ECFC] px-5 py-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Permission Legend</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-2">
              {(Object.entries(PERM_META) as [PermKey, typeof PERM_META[PermKey]][]).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon size={13} color={meta.color} weight={key === "fullAccess" || key === "delete" ? "fill" : "duotone"} />
                    <span className="text-[12px] text-slate-600">{meta.label}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2">
                <Lock size={13} color="#E2E8F0" weight="duotone" />
                <span className="text-[12px] text-slate-600">Data Sharing (Private)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {tab === "matrix" && (
        <div className={`mx-4 sm:mx-6 mb-5 rounded-2xl border px-4 sm:px-5 py-3 flex-shrink-0 ${isDark ? "bg-[#1C1C1E] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Permission Legend</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-1.5">
            {(Object.entries(PERM_META) as [PermKey, typeof PERM_META[PermKey]][]).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <Icon size={12} color={meta.color} weight={key==="fullAccess"||key==="delete"?"fill":"duotone"} />
                  <span className={`text-[11.5px] ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------
//  Modules and Fields panel
// ---------------------------------------------
// ---------------------------------------------
//  Layout Editor (full-screen overlay)
// ---------------------------------------------
const NEW_FIELD_TYPES = [
  { label:"Single Line",  icon:TextT           },
  { label:"Multi-Line",   icon:TextAlignLeft   },
  { label:"Email",        icon:Envelope        },
  { label:"Phone",        icon:Phone           },
  { label:"Pick List",    icon:ListBullets     },
  { label:"Date",         icon:CalendarBlank   },
  { label:"Number",       icon:Hash            },
  { label:"Currency",     icon:CurrencyDollar  },
  { label:"Long Integer", icon:Hash            },
  { label:"Checkbox",     icon:CheckSquare     },
  { label:"URL",          icon:LinkSimple      },
  { label:"Address",      icon:MapPin          },
  { label:"Lookup",       icon:MagnifyingGlass },
  { label:"Stage",        icon:ChartBar        },
];

interface LField { label:string; type:string; required?:boolean; prefix?:string; fullWidth?:boolean; }
interface LSection { title:string; fields:LField[]; addressLayout?:boolean; }

const LEADS_CREATE_SECTIONS: LSection[] = [
  { title:"Lead Information", fields:[
    { label:"Company",         type:"Single Text",  required:true },
    { label:"First Name",      type:"Single Line",  prefix:"Mr."  },
    { label:"Last Name",       type:"Single Text",  required:true },
    { label:"Title",           type:"Single Text"                 },
    { label:"Email",           type:"Email"                       },
    { label:"Phone",           type:"Phone"                       },
    { label:"Fax",             type:"Phone"                       },
    { label:"Mobile",          type:"Phone"                       },
    { label:"Website",         type:"link"                        },
    { label:"Lead Source",     type:"Option 1 ▾"                  },
    { label:"Lead Status",     type:"Option 1 ▾"                  },
    { label:"Industry",        type:"Option 1 ▾"                  },
    { label:"No of Employees", type:"Option 1 ▾"                  },
    { label:"Annual Revenue",  type:"currency"                    },
    { label:"Rating",          type:"Option 1 ▾"                  },
    { label:"Email Opt out",   type:"Checkbox"                    },
    { label:"Lead Owner",      type:"Lookup"                      },
    { label:"Created By",      type:"Single Text"                 },
    { label:"Modified By",     type:"Single Text"                 },
    { label:"Skype ID",        type:"Single Text"                 },
    { label:"Secondary Email", type:"Email"                       },
    { label:"Twitter",         type:"Single Text"                 },
  ]},
  { title:"Address Information", addressLayout:true, fields:[
    { label:"Address",                                       type:"Address" },
    { label:"Country / Region",                              type:""        },
    { label:"Flat / House No. / Building / Apartment Name",  type:""        },
    { label:"Street Address",                                type:""        },
    { label:"City",                                          type:""        },
    { label:"State / Province",                              type:""        },
    { label:"Zip / Postal Code",                             type:""        },
    { label:"Latitude",  type:"" },
    { label:"Longitude", type:"" },
  ]},
  { title:"Description Information", fields:[
    { label:"Description", type:"Multi-Line", fullWidth:true },
  ]},
];

const QC_ACTIVE: { label:string; type:string; removable?:boolean }[] = [
  { label:"Company",    type:"text"      },
  { label:"First Name", type:"firstname", removable:true },
  { label:"Last Name",  type:"text"      },
  { label:"Email",      type:"email",    removable:true },
  { label:"Phone",      type:"phone",    removable:true },
];

const QC_AVAILABLE: Record<string,string[]> = {
  "Lead Information":      ["Title","Fax","Mobile","Website","Lead Source","Lead Status","Industry","No of Employees","Annual Revenue","Rating","Email Opt out","Lead Owner","Skype ID","Secondary Email","Twitter"],
  "Address Information":   ["Address"],
  "Description Information":["Description"],
};

const DV_BC_FIELDS = [
  { label:"First Name", type:"firstname" },
  { label:"Last Name",  type:"text"      },
  { label:"Email",      type:"email"     },
  { label:"Phone",      type:"phone"     },
  { label:"Lead Owner", type:"lookup"    },
];

function FieldCell({ field, isDark = false }: { field: LField; isDark?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 border rounded-lg transition-colors cursor-pointer group ${isDark ? "border-[#27272A] bg-[#111113] hover:border-[#60A5FA]" : "border-[#E3ECFC] bg-white hover:border-[#4A7AE8]"}`}>
      <div className="flex items-center gap-0.5 min-w-0">
        <span className={`text-[15px] font-medium truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{field.label}</span>
        {field.required && <span className="text-red-500 text-[13px] ml-0.5">*</span>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {field.prefix && <span className={`text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>{field.prefix} ·</span>}
        {field.type && <span className="text-[13px] text-inherit">{field.type}</span>}
        <span className={`text-[11px] font-bold ${isDark ? "text-[#3F3F46] group-hover:text-[#71717A]" : "text-slate-300 group-hover:text-slate-500"}`}>···</span>
      </div>
    </div>
  );
}

function LayoutEditor({ module, layoutName, onClose }: {
  module:string; layoutName:string; onClose:()=>void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab]           = useState<"create"|"quickCreate"|"detailView">("create");
  const [bcEnabled, setBcEnabled] = useState(true);
  const [nfOpen, setNfOpen]     = useState(true);
  const [unusedOpen, setUnusedOpen] = useState(true);
  const [bcCustomizeOpen, setBcCustomizeOpen] = useState(false);
  const [bcFields, setBcFields] = useState(DV_BC_FIELDS);
  const [bcDragIdx, setBcDragIdx] = useState<number|null>(null);
  const [bcDropIdx, setBcDropIdx] = useState<number|null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const modDef = MODULE_DEFS.find(m => m.key === module);

  return (
    <div className={`absolute inset-0 z-30 flex flex-col overflow-hidden ${isDark ? "bg-[#000000]" : "bg-white"}`}>
      {/* Top bar */}
      <div className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b flex-shrink-0 flex-wrap ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <button onClick={onClose} className={`flex items-center gap-1.5 text-[13px] sm:text-[15px] font-semibold transition-colors ${isDark ? "text-[#D4D4D8] hover:text-[#F4F4F5]" : "text-slate-600"}`}>
          <ArrowLeft size={14} weight="bold" />
          {modDef?.label ?? module}
        </button>
        <button className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[13px] sm:text-[15px] font-semibold transition-colors ${isDark ? "border-[#3F3F46] text-[#D4D4D8] hover:border-[#60A5FA] bg-[#18181B]" : "border-[#E3ECFC] text-slate-700 hover:border-[#1D4ED8] bg-white"}`}>
          {layoutName} <CaretDown size={11} weight="bold" />
        </button>
        <IconButton size="small" sx={{ p:0.5, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color: isDark ? "#60A5FA" : "#1D4ED8"}, borderRadius:"6px", display: { xs: "none", sm: "inline-flex" } }}>
          <Gear size={14} weight="duotone" />
        </IconButton>
        <div className="flex-1 hidden sm:block" />
        <button onClick={onClose} className={`px-3 py-1.5 text-[13px] sm:text-[15px] font-semibold border rounded-lg transition-colors ${isDark ? "text-[#9CA3AF] border-[#3F3F46] hover:bg-[#18181B]" : "text-slate-500 border-[#E3ECFC] hover:bg-slate-50"}`}>Cancel</button>
        <button className={`hidden sm:inline-block px-3 py-1.5 text-[13px] sm:text-[15px] font-semibold border rounded-lg transition-colors ${isDark ? "text-[#9CA3AF] border-[#3F3F46] hover:bg-[#18181B]" : "text-slate-500 border-[#E3ECFC] hover:bg-slate-50"}`}>Save and Close</button>
        <button className="px-4 py-1.5 text-[13px] sm:text-[15px] font-bold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#60A5FA] transition-colors">Save</button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* Left sidebar */}
        <div className={`w-full md:w-[300px] flex-shrink-0 border-b md:border-b-0 md:border-r max-h-[35vh] md:max-h-none overflow-y-auto ${isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-[#f9fbff]"}`}>
          {tab === "create" && (<>
            <button onClick={() => setNfOpen(p=>!p)}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-bold uppercase tracking-wider ${isDark ? "hover:bg-[#18181B]" : "hover:bg-[#EFF6FF]"}`}
              style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>
              <span>New Fields</span>
              {nfOpen ? <CaretUp size={9} weight="bold"/> : <CaretDown size={9} weight="bold"/>}
            </button>
            {nfOpen && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                {NEW_FIELD_TYPES.map(ft => {
                  const Icon = ft.icon;
                  return (
                    <div key={ft.label}
                      className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg cursor-grab transition-colors text-[15px] font-medium whitespace-nowrap overflow-hidden ${isDark ? "border-[#3F3F46] bg-[#18181B] hover:border-[#60A5FA] hover:bg-[#1E293B]" : "border-[#E3ECFC] bg-white hover:border-[#1D4ED8] hover:bg-[#EFF6FF]"}`}
                      style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>
                      <Icon size={11} color={isDark ? "#93C5FD" : "#0C2472"} weight="duotone" className="flex-shrink-0" />
                      <span className="truncate">{ft.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="px-3 pb-3">
              <button className={`flex items-center gap-1.5 w-full px-3 py-2 border border-dashed rounded-lg text-[12.5px] font-bold transition-colors justify-center ${isDark ? "border-[#60A5FA] text-[#60A5FA] hover:bg-[#18181B]" : "border-[#4A7AE8] text-[#1D4ED8] hover:bg-[#EFF6FF]"}`}>
                <Plus size={11} weight="bold"/> NEW SECTION
              </button>
            </div>
            <button onClick={() => setUnusedOpen(p=>!p)}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-bold uppercase tracking-wider ${isDark ? "hover:bg-[#18181B]" : "hover:bg-[#EFF6FF]"}`}
              style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>
              <span>Unused Items</span>
              {unusedOpen ? <CaretUp size={9} weight="bold"/> : <CaretDown size={9} weight="bold"/>}
            </button>
            {unusedOpen && <div className={`px-4 pb-2 text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>No unused items.</div>}
          </>)}

          {tab === "quickCreate" && (
            <div>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                <span className={`text-[15px] font-bold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>Available Fields</span>
                <IconButton size="small" sx={{ p:0.4, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color: isDark ? "#60A5FA" : "#1D4ED8"}, borderRadius:"6px" }}>
                  <MagnifyingGlass size={13} weight="duotone"/>
                </IconButton>
              </div>
              {Object.entries(QC_AVAILABLE).map(([sec, flds]) => (
                <div key={sec} className="px-3 pt-3">
                  <div className="text-[13px] font-bold uppercase tracking-wider mb-1.5 px-1" style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>{sec}</div>
                  {flds.map(f => (
                    <div key={f} className={`flex items-center gap-2 px-2 py-1.5 mb-0.5 border rounded-lg text-[13px] cursor-grab transition-colors ${isDark ? "border-[#3F3F46] bg-[#18181B] hover:border-[#60A5FA] hover:bg-[#1E293B]" : "border-[#E3ECFC] bg-white hover:border-[#1D4ED8] hover:bg-[#EFF6FF]"}`} style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>
                      <DotsSixVertical size={11} color={isDark ? "#3F3F46" : "#E2E8F0"}/>
                      {f}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {tab === "detailView" && (
            <div>
              <button onClick={() => setUnusedOpen(p=>!p)}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-bold uppercase tracking-wider border-b ${isDark ? "hover:bg-[#18181B] border-[#27272A]" : "hover:bg-[#EFF6FF] border-[#E3ECFC]"}`}
                style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>
                <span>Unused Related List</span>
                {unusedOpen ? <CaretUp size={9} weight="bold"/> : <CaretDown size={9} weight="bold"/>}
              </button>
              {unusedOpen && <div className={`px-4 py-3 text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>No more related lists available.</div>}
            </div>
          )}
        </div>

        {/* Main area */}
        <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#000000]" : "bg-[#F8FAFC]"}`}>
          {/* Tab bar */}
          <div className={`flex items-center justify-between px-4 sm:px-6 pt-4 border-b mb-0 overflow-x-auto ${isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-white"}`}>
            <div className="flex items-center">
              {(["create","quickCreate","detailView"] as const).map(t => {
                const labels = { create:"Create", quickCreate:"Quick Create", detailView:"Detail View" };
                return (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-5 py-2.5 text-[15px] font-semibold transition-all border-b-2 -mb-px ${
                      tab===t
                        ? isDark ? "border-[#60A5FA] text-[#60A5FA]" : "border-[#1D4ED8] text-[#1D4ED8]"
                        : isDark ? "border-transparent text-[#71717A] hover:text-[#D4D4D8]" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}>
                    {labels[t]}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPreviewOpen(true)} className={`text-[15px] font-semibold hover:underline pb-2.5 ${isDark ? "text-[#60A5FA]" : "text-[#1D4ED8]"}`}>Preview</button>
          </div>

          {/* CREATE */}
          {tab === "create" && (
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {LEADS_CREATE_SECTIONS.map(section => (
                <div key={section.title} className={`rounded-xl border overflow-hidden ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                  <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#fafcff]"}`}>
                    <DotsSixVertical size={14} color={isDark ? "#3F3F46" : "#E2E8F0"}/>
                    <span className={`text-[13px] font-bold flex-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{section.title}</span>
                    <IconButton size="small" sx={{ p:0.3, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color: isDark ? "#60A5FA" : "#1D4ED8"}, borderRadius:"6px" }}>
                      <Gear size={13} weight="duotone"/>
                    </IconButton>
                  </div>
                  {section.addressLayout ? (
                    <div className="p-3 space-y-1.5">
                      {section.fields.slice(0,-2).map((f,i) => (
                        <div key={i} className={`flex items-center justify-between px-3 py-2 border rounded-lg transition-colors cursor-pointer group ${isDark ? "border-[#27272A] bg-[#111113] hover:border-[#60A5FA]" : "border-[#E3ECFC] bg-[#fafcff] hover:border-[#4A7AE8]"}`}>
                          <span className={`text-[15px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                          <div className="flex items-center gap-1.5">
                            {f.type && <span className="text-[13px] text-inherit">{f.type}</span>}
                            <span className={`text-[11px] font-bold ${isDark ? "text-[#3F3F46] group-hover:text-[#71717A]" : "text-slate-300 group-hover:text-slate-500"}`}>···</span>
                          </div>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-1.5">
                        {section.fields.slice(-2).map((f,i) => (
                          <div key={i} className={`flex items-center justify-between px-3 py-2 border rounded-lg transition-colors cursor-pointer group ${isDark ? "border-[#27272A] bg-[#111113] hover:border-[#60A5FA]" : "border-[#E3ECFC] bg-[#fafcff] hover:border-[#4A7AE8]"}`}>
                            <span className={`text-[15px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                            <span className={`text-[11px] font-bold ${isDark ? "text-[#3F3F46] group-hover:text-[#71717A]" : "text-slate-300 group-hover:text-slate-500"}`}>···</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 grid grid-cols-2 gap-1.5">
                      {section.fields.map((f,i) => (
                        f.fullWidth
                          ? <div key={i} className="col-span-2"><FieldCell field={f} isDark={isDark}/></div>
                          : <FieldCell key={i} field={f} isDark={isDark}/>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* QUICK CREATE */}
          {tab === "quickCreate" && (
            <div className="px-4 sm:px-6 py-5 flex justify-center">
              <div className={`w-full max-w-[500px] rounded-xl border overflow-hidden shadow-sm ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                {QC_ACTIVE.map((f,i) => (
                  <div key={i} className={`flex items-center px-4 py-2.5 border-b last:border-0 group ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                    <span className={`text-[15px] w-36 flex-shrink-0 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                    <span className="flex-1 text-[15px] text-inherit">{f.type}</span>
                    {f.removable && (
                      <button className={`w-5 h-5 flex items-center justify-center rounded-full transition-colors opacity-60 hover:opacity-100 ${isDark ? "hover:bg-[#27272A]" : "hover:bg-slate-100"}`}>
                        <X size={11} color={isDark ? "#71717A" : "#94A3B8"} weight="bold"/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETAIL VIEW */}
          {tab === "detailView" && (
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {/* Business Card */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <span className={`text-[13px] font-bold uppercase tracking-wider ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Business Card</span>
                  <div className="flex items-center gap-3">
                    <GreenSwitch checked={bcEnabled} onChange={() => setBcEnabled(p=>!p)}/>
                    <button onClick={() => setBcCustomizeOpen(true)} className={`text-[15px] font-semibold hover:underline ${isDark ? "text-[#60A5FA]" : "text-[#1D4ED8]"}`}>Customize</button>
                  </div>
                </div>
                <div className={`divide-y ${isDark ? "divide-[#27272A]" : "divide-[#EFF6FF]"}`}>
                  {DV_BC_FIELDS.map((f,i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <DotsSixVertical size={13} color={isDark ? "#3F3F46" : "#E2E8F0"}/>
                      <span className={`text-[15px] flex-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                      <span className="text-[13px] text-inherit">{f.type}</span>
                    </div>
                  ))}
                </div>
                <div className={`px-4 py-2.5 border-t ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                  <div className={`flex items-center gap-1.5 text-[13px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>
                    <Info size={11} weight="duotone"/>
                    You can add up to <span className={`font-bold mx-0.5 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>5 fields</span> to your Business Card.
                  </div>
                </div>
              </div>
              {/* Details */}
              <div className={`rounded-xl border ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                <div className={`px-4 py-2.5 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <span className={`text-[13px] font-bold uppercase tracking-wider ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Details</span>
                </div>
                <div className={`mx-3 my-3 px-4 py-3 text-[15px] rounded-lg border ${isDark ? "text-[#9CA3AF] bg-[#111113] border-[#27272A]" : "text-slate-600 bg-[#fafcff] border-[#E3ECFC]"}`}>
                  Fields customized in the Create page will appear here.
                </div>
              </div>
              {/* Related List */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                <div className={`px-4 py-2.5 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <span className={`text-[13px] font-bold uppercase tracking-wider ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Related List</span>
                </div>
                {[
                  { name:"Notes",       standard:true,  customize:false },
                  { name:"Attachments", standard:true,  customize:false },
                  { name:"Tasks",       standard:false, customize:true  },
                ].map(item => (
                  <div key={item.name} className={`px-4 py-3 border-b last:border-0 ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[15px] font-bold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{item.name}</span>
                      <div className="flex items-center gap-1">
                        {item.customize && <button className={`text-[15px] font-semibold hover:underline ${isDark ? "text-[#60A5FA]" : "text-[#1D4ED8]"}`}>Customize</button>}
                        <IconButton size="small" sx={{ p:0.3, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color:"#EF4444"}, borderRadius:"6px" }}>
                          <Trash size={13} weight="duotone"/>
                        </IconButton>
                      </div>
                    </div>
                    {item.standard ? (
                      <div className={`text-center py-2 text-[13px] rounded-lg border ${isDark ? "text-[#9CA3AF] bg-[#111113] border-[#27272A]" : "text-slate-600 bg-[#fafcff] border-[#E3ECFC]"}`}>
                        This is a standard {item.name} section.
                      </div>
                    ) : (
                      <div className={`rounded-lg overflow-hidden border ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                        <div className={`grid grid-cols-2 border-b ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#fafcff] border-[#E3ECFC]"}`}>
                          <div className={`px-4 py-2 text-[12.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Title</div>
                          <div className={`px-4 py-2 text-[12.5px] font-bold uppercase tracking-wider border-l ${isDark ? "text-[#9CA3AF] border-[#27272A]" : "text-slate-500 border-[#E3ECFC]"}`}>Status</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Card Customize Modal */}
      {bcCustomizeOpen && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className={`rounded-2xl shadow-xl w-[92vw] max-w-[420px] max-h-[80vh] overflow-hidden flex flex-col ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <div>
                <h3 className={`text-[17px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Customize Business Card</h3>
                <p className={`text-[13px] mt-0.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Drag to reorder · Max 5 fields</p>
              </div>
              <button onClick={() => { setBcCustomizeOpen(false); setBcDragIdx(null); setBcDropIdx(null); }} className={isDark ? "text-[#71717A] hover:text-[#D4D4D8]" : "text-slate-400 hover:text-slate-600"}>
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {bcFields.map((field, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setBcDragIdx(idx)}
                  onDragOver={e => { e.preventDefault(); setBcDropIdx(idx); }}
                  onDrop={() => {
                    if (bcDragIdx === null || bcDragIdx === idx) return;
                    const reordered = [...bcFields];
                    const [moved] = reordered.splice(bcDragIdx, 1);
                    reordered.splice(idx, 0, moved);
                    setBcFields(reordered);
                    setBcDragIdx(null);
                    setBcDropIdx(null);
                  }}
                  onDragEnd={() => { setBcDragIdx(null); setBcDropIdx(null); }}
                  className={`flex items-center gap-3 px-3 py-3 border rounded-xl transition-all cursor-grab active:cursor-grabbing select-none
                    ${bcDragIdx === idx
                      ? isDark ? "opacity-40 border-dashed border-[#60A5FA] bg-[#18181B]" : "opacity-40 border-dashed border-[#1D4ED8] bg-[#EFF6FF]"
                      : bcDropIdx === idx
                        ? isDark ? "border-[#60A5FA] bg-[#18181B] shadow-sm" : "border-[#1D4ED8] bg-[#EFF6FF] shadow-sm"
                        : isDark ? "border-[#27272A] bg-[#111113] hover:border-[#60A5FA] hover:bg-[#18181B]" : "border-[#E3ECFC] bg-[#f9fbff] hover:border-[#A5B4FC] hover:bg-[#EFF6FF]"}`}
                >
                  <DotsSixVertical size={16} color={bcDropIdx === idx ? (isDark ? "#60A5FA" : "#1D4ED8") : (isDark ? "#71717A" : "#94A3B8")} weight="bold" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[15px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>{field.label}</div>
                    <div className={`text-[12px] capitalize ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{field.type}</div>
                  </div>
                  <span className={`text-[12px] font-semibold rounded px-1.5 py-0.5 ${isDark ? "text-[#9CA3AF] bg-[#27272A]" : "text-slate-400 bg-slate-100"}`}>{idx + 1}</span>
                </div>
              ))}
            </div>

            <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <span className={`text-[13px] ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{bcFields.length}/5 fields</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { setBcCustomizeOpen(false); setBcDragIdx(null); setBcDropIdx(null); }} className={`px-4 py-2 text-[15px] font-medium border rounded-lg transition-colors ${isDark ? "text-[#9CA3AF] border-[#3F3F46] hover:bg-[#18181B]" : "text-slate-600 border-[#E3ECFC] hover:bg-slate-50"}`}>
                  Cancel
                </button>
                <button onClick={() => { setBcCustomizeOpen(false); setBcDragIdx(null); setBcDropIdx(null); }} className="px-4 py-2 text-[15px] font-medium text-white bg-[#1D4ED8] rounded-lg hover:bg-[#2563EB] transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className={`w-[92vw] max-w-[480px] max-h-[80%] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <span className={`text-[15.5px] font-extrabold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
                {layoutName.trim() || "Untitled Layout"} &middot; Preview
              </span>
              <IconButton size="small" onClick={() => setPreviewOpen(false)} sx={{ p:0.4, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color: isDark ? "#60A5FA" : "#1D4ED8"}, borderRadius:"6px" }}>
                <X size={14} weight="bold"/>
              </IconButton>
            </div>
            <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-5 ${isDark ? "bg-[#000000]" : "bg-[#F8FAFC]"}`}>
              {LEADS_CREATE_SECTIONS.map(section => (
                <div key={section.title}>
                  <div className={`text-[12px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{section.title}</div>
                  {section.fields.length === 0 ? (
                    <div className={`text-[14px] italic ${isDark ? "text-[#52525B]" : "text-slate-300"}`}>No fields in this section.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {section.fields.map(f => (
                        <div key={f.label} className={f.fullWidth ? "col-span-2" : undefined}>
                          <label className={`block text-[11.5px] font-semibold mb-1 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
                          <div className={`px-3 py-2 rounded-lg border text-[14px] ${isDark ? "border-[#27272A] bg-[#18181B] text-[#52525B]" : "border-[#E3ECFC] bg-white text-slate-300"}`}>
                            {f.prefix ? `${f.prefix} ` : ""}{f.label.toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BField { id:number; label:string; }
interface BSection { id:number; title:string; fields:BField[]; }

function NewLayoutBuilder({ module, onClose }: { module:string; onClose:()=>void; }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab]             = useState<"create"|"quickCreate"|"detailView">("create");
  const [layoutName, setLayoutName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [nfOpen, setNfOpen]       = useState(true);
  const [unusedOpen, setUnusedOpen] = useState(true);
  const [sections, setSections]   = useState<BSection[]>([]);
  const [qcFields, setQcFields]   = useState<BField[]>([]);
  const [qcDragOver, setQcDragOver] = useState(false);
  const [dvBcEnabled, setDvBcEnabled] = useState(true);
  const [dvBcCustomizeOpen, setDvBcCustomizeOpen] = useState(false);
  const [dvBcFields, setDvBcFields] = useState(DV_BC_FIELDS.map((f,i) => ({ id: i+1, label: f.label, type: f.type })));
  const [dvBcDragIdx, setDvBcDragIdx] = useState<number|null>(null);
  const [dvBcDropIdx, setDvBcDropIdx] = useState<number|null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragField, setDragField] = useState<string|null>(null);
  const [dragOverSection, setDragOverSection] = useState<number|null>(null);
  const idRef = useRef(1);
  const modDef = MODULE_DEFS.find(m => m.key === module);
  const hasSections = sections.length > 0;
  const canDragFields = tab === "create" ? hasSections : tab === "quickCreate";
  const allFields = sections.flatMap(s => s.fields);

  const addSection = () => {
    setSections(prev => [...prev, { id: idRef.current++, title: `New Section ${prev.length + 1}`, fields: [] }]);
  };
  const handleDrop = (sectionId: number) => {
    if (!dragField) { setDragOverSection(null); return; }
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, fields: [...s.fields, { id: idRef.current++, label: dragField }] } : s
    ));
    setDragField(null);
    setDragOverSection(null);
  };
  const removeField = (sectionId: number, fieldId: number) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s));
  };
  const removeSection = (sectionId: number) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };
  const handleQcDrop = () => {
    if (!dragField) { setQcDragOver(false); return; }
    setQcFields(prev => [...prev, { id: idRef.current++, label: dragField }]);
    setDragField(null);
    setQcDragOver(false);
  };
  const removeQcField = (fieldId: number) => {
    setQcFields(prev => prev.filter(f => f.id !== fieldId));
  };
  const requireName = () => { if (!layoutName.trim()) setNameTouched(true); };

  return (
    <div className={`absolute inset-0 z-30 flex flex-col overflow-hidden ${isDark ? "bg-[#000000]" : "bg-white"}`}>
      {/* Top bar */}
      <div className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b flex-shrink-0 flex-wrap ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <button onClick={onClose} className={`flex items-center gap-1.5 text-[13px] sm:text-[14px] font-semibold transition-colors ${isDark ? "text-[#D4D4D8] hover:text-[#F4F4F5]" : "text-slate-600"}`}>
          <ArrowLeft size={14} weight="bold" />
          {modDef?.label ?? module}
        </button>
        <span className={`hidden sm:inline text-[14px] font-semibold ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>add</span>
        <div className="relative">
          <input
            value={layoutName}
            onChange={e => setLayoutName(e.target.value)}
            onBlur={requireName}
            placeholder="Layout Name"
            className={`px-3 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-semibold w-32 sm:w-40 outline-none transition-colors border ${
              nameTouched && !layoutName.trim() ? "border-red-400" : isDark ? "border-[#3F3F46] focus:border-[#60A5FA]" : "border-[#E3ECFC] focus:border-[#1D4ED8]"
            } ${isDark ? "bg-[#18181B] text-[#F4F4F5] placeholder:text-[#71717A]" : "bg-white text-slate-700 placeholder:text-slate-400"}`}
          />
          {nameTouched && !layoutName.trim() && (
            <div className="absolute left-0 top-full mt-0.5 text-[12px] text-red-500 font-medium whitespace-nowrap">Layout Name is required</div>
          )}
        </div>
        <IconButton size="small" sx={{ p:0.5, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color: isDark ? "#60A5FA" : "#1D4ED8"}, borderRadius:"6px", display: { xs: "none", sm: "inline-flex" } }}>
          <Gear size={14} weight="duotone" />
        </IconButton>
        <div className="flex-1 hidden sm:block" />
        <button onClick={onClose} className={`px-3 py-1.5 text-[13px] sm:text-[14px] font-semibold border rounded-lg transition-colors ${isDark ? "text-[#9CA3AF] border-[#3F3F46] hover:bg-[#18181B]" : "text-slate-500 border-[#E3ECFC] hover:bg-slate-50"}`}>Cancel</button>
        <button onClick={requireName} className={`hidden sm:inline-block px-3 py-1.5 text-[14px] font-semibold border rounded-lg transition-colors ${isDark ? "text-[#9CA3AF] border-[#3F3F46] hover:bg-[#18181B]" : "text-slate-500 border-[#E3ECFC] hover:bg-slate-50"}`}>Save and Close</button>
        <button onClick={requireName} className="px-4 py-1.5 text-[13px] sm:text-[14px] font-bold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#60A5FA] transition-colors">Save</button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        {/* Left sidebar */}
        <div className={`w-full md:w-[300px] flex-shrink-0 border-b md:border-b-0 md:border-r max-h-[35vh] md:max-h-none overflow-y-auto ${isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-[#f9fbff]"}`}>
          {tab === "detailView" ? (
            <>
              <button onClick={() => setUnusedOpen(p=>!p)}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider border-b ${isDark ? "hover:bg-[#18181B] border-[#27272A]" : "hover:bg-[#EFF6FF] border-[#E3ECFC]"}`}
                style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>
                <span>Unused Related List</span>
                {unusedOpen ? <CaretUp size={9} weight="bold"/> : <CaretDown size={9} weight="bold"/>}
              </button>
              {unusedOpen && <div className={`px-4 py-3 text-[14px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>No more related lists available.</div>}
            </>
          ) : (
            <>
              <button onClick={() => setNfOpen(p=>!p)}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider ${isDark ? "hover:bg-[#18181B]" : "hover:bg-[#EFF6FF]"}`}
                style={{ color: isDark ? "#93C5FD" : "#0C2472" }}>
                <span>New Fields</span>
                {nfOpen ? <CaretUp size={9} weight="bold"/> : <CaretDown size={9} weight="bold"/>}
              </button>
              {nfOpen && (
                <>
                  {!canDragFields && (
                    <div className={`px-3 pb-2 text-[14px] font-medium border rounded-lg mx-3 px-2.5 py-1.5 ${isDark ? "text-amber-400 bg-amber-950/40 border-amber-800" : "text-amber-600 bg-amber-50 border-amber-200"}`}>
                      {tab === "create" ? "Add a section before dragging in fields." : "Switch to a tab with a drop target to add fields."}
                    </div>
                  )}
                  <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                    {NEW_FIELD_TYPES.map(ft => {
                      const Icon = ft.icon;
                      return (
                        <div key={ft.label}
                          draggable={canDragFields}
                          onDragStart={() => canDragFields && setDragField(ft.label)}
                          onDragEnd={() => setDragField(null)}
                          title={canDragFields ? undefined : "Add a section first"}
                          className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg transition-colors text-[14px] font-medium whitespace-nowrap overflow-hidden ${
                            canDragFields
                              ? isDark
                                ? "border-[#3F3F46] bg-[#18181B] hover:border-[#60A5FA] hover:bg-[#1E293B] cursor-grab active:cursor-grabbing"
                                : "border-[#E3ECFC] bg-white hover:border-[#1D4ED8] hover:bg-[#EFF6FF] cursor-grab active:cursor-grabbing"
                              : isDark
                                ? "border-[#27272A] bg-[#111113] text-[#52525B] cursor-not-allowed"
                                : "border-[#EFF6FF] bg-slate-50 text-slate-300 cursor-not-allowed"
                          }`}
                          style={canDragFields ? { color: isDark ? "#93C5FD" : "#0C2472" } : {}}>
                          <Icon size={11} color={canDragFields ? (isDark ? "#60A5FA" : "#1D4ED8") : (isDark ? "#3F3F46" : "#CBD5E1")} weight="duotone" className="flex-shrink-0" />
                          <span className="truncate">{ft.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="px-3 pb-3">
                <button onClick={addSection}
                  className={`flex items-center gap-1.5 w-full px-3 py-2 border border-dashed rounded-lg text-[14px] font-bold transition-colors justify-center ${isDark ? "border-[#60A5FA] text-[#60A5FA] hover:bg-[#18181B]" : "border-[#4A7AE8] text-[#1D4ED8] hover:bg-[#EFF6FF]"}`}>
                  <Plus size={11} weight="bold"/> NEW SECTION
                </button>
              </div>
            </>
          )}
        </div>

        {/* Main area */}
        <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#000000]" : "bg-[#F8FAFC]"}`}>
          <div className={`flex items-center justify-between px-4 sm:px-6 pt-4 border-b mb-0 overflow-x-auto ${isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-white"}`}>
            <div className="flex items-center">
              {(["create","quickCreate","detailView"] as const).map(t => {
                const labels = { create:"Create", quickCreate:"Quick Create", detailView:"Detail View" };
                return (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-5 py-2.5 text-[14px] font-semibold transition-all border-b-2 -mb-px ${
                      tab===t
                        ? isDark ? "border-[#60A5FA] text-[#60A5FA]" : "border-[#1D4ED8] text-[#1D4ED8]"
                        : isDark ? "border-transparent text-[#71717A] hover:text-[#D4D4D8]" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}>
                    {labels[t]}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setPreviewOpen(true)} className={`text-[14px] font-semibold hover:underline pb-2.5 ${isDark ? "text-[#60A5FA]" : "text-[#1D4ED8]"}`}>Preview</button>
          </div>

          {tab === "create" ? (
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {sections.length === 0 ? (
                <div className={`border-2 border-dashed rounded-xl py-16 flex flex-col items-center justify-center gap-2 ${isDark ? "border-[#3F3F46] text-[#52525B]" : "border-[#CBD5E1] text-slate-300"}`}>
                  <SquaresFour size={28} weight="duotone"/>
                  <span className={`text-[14px] font-semibold ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Click &quot;New Section&quot; to start building this layout</span>
                </div>
              ) : sections.map(section => (
                <div key={section.id} className={`rounded-xl border overflow-hidden ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                  <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#fafcff]"}`}>
                    <DotsSixVertical size={14} color={isDark ? "#3F3F46" : "#E2E8F0"}/>
                    <span className={`text-[14px] font-bold flex-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{section.title}</span>
                    <IconButton size="small" onClick={() => removeSection(section.id)} sx={{ p:0.3, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color:"#EF4444"}, borderRadius:"6px" }}>
                      <Trash size={13} weight="duotone"/>
                    </IconButton>
                  </div>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOverSection(section.id); }}
                    onDragLeave={() => setDragOverSection(prev => prev === section.id ? null : prev)}
                    onDrop={() => handleDrop(section.id)}
                    className={`p-3 grid grid-cols-2 gap-1.5 min-h-[64px] rounded-b-xl transition-colors ${dragOverSection === section.id ? (isDark ? "bg-[#18181B]" : "bg-[#EFF6FF]") : ""}`}>
                    {section.fields.length === 0 ? (
                      <div className={`col-span-2 flex items-center justify-center py-6 text-[14px] border border-dashed rounded-lg ${isDark ? "text-[#52525B] border-[#3F3F46]" : "text-slate-300 border-[#E3ECFC]"}`}>
                        Drag fields here
                      </div>
                    ) : section.fields.map(f => (
                      <div key={f.id} className={`flex items-center justify-between px-3 py-2 border rounded-lg transition-colors group ${isDark ? "border-[#27272A] bg-[#111113] hover:border-[#60A5FA]" : "border-[#E3ECFC] bg-[#fafcff] hover:border-[#4A7AE8]"}`}>
                        <span className={`text-[14px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                        <button onClick={() => removeField(section.id, f.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={11} color={isDark ? "#71717A" : "#94A3B8"} weight="bold"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "quickCreate" ? (
            <div className="px-4 sm:px-6 py-5 flex flex-col items-center">
              <div className={`w-full max-w-[420px] rounded-xl border overflow-hidden shadow-sm ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                <div className={`px-4 py-2.5 border-b ${isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#fafcff]"}`}>
                  <span className={`text-[14px] font-bold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>Quick Create</span>
                </div>
                <div
                  onDragOver={e => { e.preventDefault(); setQcDragOver(true); }}
                  onDragLeave={() => setQcDragOver(false)}
                  onDrop={handleQcDrop}
                  className={`transition-colors ${qcDragOver ? (isDark ? "bg-[#18181B]" : "bg-[#EFF6FF]") : ""}`}>
                  {qcFields.length === 0 ? (
                    <div className={`flex items-center justify-center py-10 text-[14px] m-3 border border-dashed rounded-lg ${isDark ? "text-[#52525B] border-[#3F3F46]" : "text-slate-300 border-[#E3ECFC]"}`}>
                      Drag fields here
                    </div>
                  ) : (
                    <div className={`divide-y ${isDark ? "divide-[#27272A]" : "divide-[#EFF6FF]"}`}>
                      {qcFields.map(f => (
                        <div key={f.id} className="flex items-center px-4 py-2.5 group">
                          <span className={`text-[14px] flex-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                          <button onClick={() => removeQcField(f.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={11} color={isDark ? "#71717A" : "#94A3B8"} weight="bold"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className={`text-[14px] font-medium mt-3 text-center max-w-[420px] ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
                Fields shown here appear in the Quick Create popup used to add a new {modDef?.label.toLowerCase().replace(/s$/, "") ?? "record"} from a list view.
              </p>
            </div>
          ) : (
            <div className="px-4 sm:px-6 py-5 space-y-4">
              {/* Business Card */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <span className={`text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Business Card</span>
                  <div className="flex items-center gap-3">
                    <GreenSwitch checked={dvBcEnabled} onChange={() => setDvBcEnabled(p=>!p)}/>
                    {dvBcEnabled && <button onClick={() => setDvBcCustomizeOpen(true)} className={`text-[14px] font-semibold hover:underline ${isDark ? "text-[#60A5FA]" : "text-[#1D4ED8]"}`}>Customize</button>}
                  </div>
                </div>
                {dvBcEnabled ? (
                  <>
                    <div className={`divide-y ${isDark ? "divide-[#27272A]" : "divide-[#EFF6FF]"}`}>
                      {dvBcFields.map(f => (
                        <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                          <DotsSixVertical size={13} color={isDark ? "#3F3F46" : "#E2E8F0"}/>
                          <span className={`text-[14px] flex-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                          <span className={`text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{f.type}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`px-4 py-2.5 border-t ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}`}>
                      <div className={`flex items-center gap-1.5 text-[14px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>
                          <Info size={11} weight="duotone"/>
                          You can add up to <span className={`font-bold mx-0.5 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>5 fields</span> to your Business Card.
                        </div>
                      </div>
                    </>
                ) : (
                  <div className={`px-4 py-3 text-[14px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>
                    Business Card cannot be customized as it is hidden.<br/>
                    Turn it on to customize the fields to be shown in details page.
                  </div>
                )}
              </div>
              {/* Details */}
              <div className={`rounded-xl border ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                <div className={`px-4 py-2.5 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <span className={`text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Details</span>
                </div>
                {allFields.length === 0 ? (
                  <div className={`mx-3 my-3 px-4 py-3 text-[14px] rounded-lg border ${isDark ? "text-[#9CA3AF] bg-[#111113] border-[#27272A]" : "text-slate-600 bg-[#fafcff] border-[#E3ECFC]"}`}>
                    Fields customized in the Create page will appear here.
                  </div>
                ) : (
                  <div className={`divide-y ${isDark ? "divide-[#27272A]" : "divide-[#EFF6FF]"}`}>
                    {allFields.map(f => (
                      <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                        <DotsSixVertical size={13} color={isDark ? "#3F3F46" : "#E2E8F0"}/>
                        <span className={`text-[14px] flex-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Related List */}
              <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-white border-[#E3ECFC]"}`}>
                <div className={`px-4 py-2.5 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <span className={`text-[12px] font-bold uppercase tracking-wider ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Related List</span>
                </div>
                <div className={`px-4 py-3 text-[14px] ${isDark ? "text-[#9CA3AF]" : "text-slate-600"}`}>No related lists added yet.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {previewOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className={`w-[92vw] max-w-[480px] max-h-[80%] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <span className={`text-[15.5px] font-extrabold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
                {layoutName.trim() || "Untitled Layout"} &middot; Preview
              </span>
              <IconButton size="small" onClick={() => setPreviewOpen(false)} sx={{ p:0.4, color: isDark ? "#71717A" : "#94A3B8", "&:hover":{color: isDark ? "#60A5FA" : "#1D4ED8"}, borderRadius:"6px" }}>
                <X size={14} weight="bold"/>
              </IconButton>
            </div>
            <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-5 ${isDark ? "bg-[#000000]" : "bg-[#F8FAFC]"}`}>
              {sections.length === 0 ? (
                <div className={`text-center text-[14px] py-10 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
                  No sections added yet. Build the Create tab to preview the form here.
                </div>
              ) : sections.map(section => (
                <div key={section.id}>
                  <div className={`text-[12px] font-bold uppercase tracking-wider mb-2 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{section.title}</div>
                  {section.fields.length === 0 ? (
                    <div className={`text-[14px] italic ${isDark ? "text-[#52525B]" : "text-slate-300"}`}>No fields in this section.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {section.fields.map(f => (
                        <div key={f.id}>
                          <label className={`block text-[11.5px] font-semibold mb-1 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{f.label}</label>
                          <div className={`px-3 py-2 rounded-lg border text-[14px] ${isDark ? "border-[#27272A] bg-[#18181B] text-[#52525B]" : "border-[#E3ECFC] bg-white text-slate-300"}`}>
                            {f.label.toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Business Card Customize Modal - NewLayoutBuilder */}
      {dvBcCustomizeOpen && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className={`rounded-2xl shadow-xl w-[92vw] max-w-[420px] max-h-[80vh] overflow-hidden flex flex-col ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <div>
                <h3 className={`text-[17px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Customize Business Card</h3>
                <p className={`text-[13px] mt-0.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Drag to reorder · Max 5 fields</p>
              </div>
              <button onClick={() => { setDvBcCustomizeOpen(false); setDvBcDragIdx(null); setDvBcDropIdx(null); }} className={isDark ? "text-[#71717A] hover:text-[#D4D4D8]" : "text-slate-400 hover:text-slate-600"}>
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {dvBcFields.length === 0 ? (
                <div className={`text-center py-10 text-[13px] ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
                  Add fields in the Create tab to customize the Business Card.
                </div>
              ) : dvBcFields.map((field, idx) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => setDvBcDragIdx(idx)}
                  onDragOver={e => { e.preventDefault(); setDvBcDropIdx(idx); }}
                  onDrop={() => {
                    if (dvBcDragIdx === null || dvBcDragIdx === idx) return;
                    const reordered = [...dvBcFields];
                    const [moved] = reordered.splice(dvBcDragIdx, 1);
                    reordered.splice(idx, 0, moved);
                    setDvBcFields(reordered);
                    setDvBcDragIdx(null);
                    setDvBcDropIdx(null);
                  }}
                  onDragEnd={() => { setDvBcDragIdx(null); setDvBcDropIdx(null); }}
                  className={`flex items-center gap-3 px-3 py-3 border rounded-xl transition-all cursor-grab active:cursor-grabbing select-none
                    ${dvBcDragIdx === idx
                      ? isDark ? "opacity-40 border-dashed border-[#60A5FA] bg-[#18181B]" : "opacity-40 border-dashed border-[#1D4ED8] bg-[#EFF6FF]"
                      : dvBcDropIdx === idx
                        ? isDark ? "border-[#60A5FA] bg-[#18181B] shadow-sm" : "border-[#1D4ED8] bg-[#EFF6FF] shadow-sm"
                        : isDark ? "border-[#27272A] bg-[#111113] hover:border-[#60A5FA] hover:bg-[#18181B]" : "border-[#E3ECFC] bg-[#f9fbff] hover:border-[#A5B4FC] hover:bg-[#EFF6FF]"}`}
                >
                  <DotsSixVertical size={16} color={dvBcDropIdx === idx ? (isDark ? "#60A5FA" : "#1D4ED8") : (isDark ? "#71717A" : "#94A3B8")} weight="bold" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[14px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-800"}`}>{field.label}</div>
                    {'type' in field && <div className={`text-[11px] capitalize ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{(field as any).type}</div>}
                  </div>
                  <span className={`text-[11px] font-semibold rounded px-1.5 py-0.5 ${isDark ? "text-[#9CA3AF] bg-[#27272A]" : "text-slate-400 bg-slate-100"}`}>{idx + 1}</span>
                </div>
              ))}
            </div>

            <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <span className={`text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{dvBcFields.length}/5 fields</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { setDvBcCustomizeOpen(false); setDvBcDragIdx(null); setDvBcDropIdx(null); }} className={`px-4 py-2 text-[14px] font-medium border rounded-lg transition-colors ${isDark ? "text-[#9CA3AF] border-[#3F3F46] hover:bg-[#18181B]" : "text-slate-600 border-[#E3ECFC] hover:bg-slate-50"}`}>
                  Cancel
                </button>
                <button onClick={() => { setDvBcCustomizeOpen(false); setDvBcDragIdx(null); setDvBcDropIdx(null); }} className="px-4 py-2 text-[14px] font-medium text-white bg-[#1D4ED8] rounded-lg hover:bg-[#2563EB] transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MODULE_DEFS = [
  { key:"leads",    label:"Leads",    icon:UserPlus,    color:"#3B82F6", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026" },
  { key:"deals",    label:"Deals",    icon:Lightning,   color:"#F59E0B", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026" },
  { key:"contacts", label:"Contacts", icon:AddressBook, color:"#10B981", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026" },
  { key:"accounts", label:"Accounts", icon:SquaresFour, color:"#8B5CF6", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026" },
  { key:"tasks",    label:"Tasks",    icon:CheckCircle, color:"#06B6D4", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026" },
];

const MODULE_LAYOUTS: Record<string, { name: string; sharedTo: string; lastMod: string; active: boolean }[]> = {
  leads:    [{ name:"Base Layout", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Apr 10, 2026", active:true }],
  deals:    [{ name:"Base Layout", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026", active:true }],
  contacts: [{ name:"Base Layout", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026", active:true }],
  accounts: [{ name:"Base Layout", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026", active:true }],
  tasks:    [{ name:"Base Layout", sharedTo:"Administrator, Operations Manager, Support Executive, VP of Operations", lastMod:"Feb 27, 2026", active:true }],
  new:      [],
};

const MODULE_FIELDS: Record<string, { name: string; dataType: string; custom: boolean; layout: string }[]> = {
  leads: [
    { name:"Address",         dataType:"Link",   custom:false, layout:"Base Layout" },
    { name:"Annual Revenue",  dataType:"Int",    custom:false, layout:"Base Layout" },
    { name:"Company",         dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Created By",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Description",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Email",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Email Opt out",   dataType:"Check",  custom:false, layout:"Base Layout" },
    { name:"Fax",             dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"First Name",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Industry",        dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Last Name",       dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Lead Owner",      dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Lead Source",     dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Lead Status",     dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Mobile",          dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Modified By",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"No of Employees", dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Phone",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Rating",          dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Secondary Email", dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Skype ID",        dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Title",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Twitter",         dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Website",         dataType:"Lookup", custom:false, layout:"Base Layout" },
  ],
  deals: [
    { name:"Account Name",    dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Amount",          dataType:"Int",    custom:false, layout:"Base Layout" },
    { name:"Closing Date",    dataType:"Date",   custom:false, layout:"Base Layout" },
    { name:"Contact Name",    dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Created By",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Deal Name",       dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Deal Owner",      dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Description",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Lead Source",     dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Modified By",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Probability",     dataType:"Int",    custom:false, layout:"Base Layout" },
    { name:"Stage",           dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Type",            dataType:"Select", custom:false, layout:"Base Layout" },
  ],
  contacts: [
    { name:"Account Name",    dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Created By",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Department",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Description",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Email",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Email Opt out",   dataType:"Check",  custom:false, layout:"Base Layout" },
    { name:"Fax",             dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"First Name",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Last Name",       dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Lead Source",     dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Mobile",          dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Modified By",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Phone",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Reporting To",    dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Secondary Email", dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Skype ID",        dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Title",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Twitter",         dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Website",         dataType:"Lookup", custom:false, layout:"Base Layout" },
  ],
  accounts: [
    { name:"Account Name",    dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Account Owner",   dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Account Site",    dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Account Type",    dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Annual Revenue",  dataType:"Int",    custom:false, layout:"Base Layout" },
    { name:"Created By",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Description",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Email",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Fax",             dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Industry",        dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Modified By",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"No of Employees", dataType:"Int",    custom:false, layout:"Base Layout" },
    { name:"Phone",           dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Rating",          dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Website",         dataType:"Lookup", custom:false, layout:"Base Layout" },
  ],
  tasks: [
    { name:"Assigned To",     dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Contact Name",    dataType:"Lookup", custom:false, layout:"Base Layout" },
    { name:"Created By",      dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Description",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Due Date",        dataType:"Date",   custom:false, layout:"Base Layout" },
    { name:"Modified By",     dataType:"Text",   custom:false, layout:"Base Layout" },
    { name:"Priority",        dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Status",          dataType:"Select", custom:false, layout:"Base Layout" },
    { name:"Subject",         dataType:"Text",   custom:false, layout:"Base Layout" },
  ],
};

function GreenSwitch({ checked, onChange }: { checked: boolean; onChange?: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${checked ? "bg-[#10B981]" : "bg-slate-200"}`}>
      <span className={`inline-block w-[14px] h-[14px] rounded-full bg-white shadow transform transition-transform duration-200 absolute top-[3px] ${checked ? "translate-x-[19px]" : "translate-x-[3px]"}`} />
    </button>
  );
}

function ModuleDetail({ modKey, onBack, onSelect, onOpenLayout, initialTab = "layouts", modLabels = {} }: {
  modKey: string; onBack: () => void; onSelect: (k: string) => void;
  onOpenLayout: (name: string) => void; initialTab?: "layouts"|"fields"; modLabels?: Record<string,string>;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [tab, setTab]           = useState<"layouts"|"fields">(initialTab);
  const [fieldSubTab, setFieldSubTab] = useState<"listing"|"permissions">("listing");
  const [search, setSearch]     = useState("");
  const [fieldSearch, setFieldSearch] = useState("");
  const [fieldLayout, setFieldLayout] = useState("all");
  const [permRole, setPermRole]   = useState("Super Admin");
  const [permSearch, setPermSearch] = useState("");
  const [permissions, setPermissions] = useState<Record<string, "rw"|"ro"|"hide">>({});
  const [showCreateLayoutModal, setShowCreateLayoutModal] = useState(false);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [createEditLayout, setCreateEditLayout] = useState("");
  const [layoutRows, setLayoutRows] = useState(MODULE_LAYOUTS[modKey] ?? []);
  const [layoutMenu, setLayoutMenu] = useState<{ el: HTMLElement; name: string } | null>(null);
  const [renameLayout, setRenameLayout] = useState<string | null>(null);
  const [renameLayoutValue, setRenameLayoutValue] = useState("");
  const [layoutConversionMappingOpen, setLayoutConversionMappingOpen] = useState(false);
  const [subNavOpen, setSubNavOpen] = useState(false);
  const labeledMods = MODULE_DEFS.map(m => ({ ...m, label: modLabels[m.key] ?? m.label }));
  const mod     = labeledMods.find(m => m.key === modKey);
  const layouts = layoutRows;
  const allModFields = MODULE_FIELDS[modKey] ?? [];
  const title   = modKey === "new" ? "add" : (mod?.label ?? modKey);

  useEffect(() => { setLayoutRows(MODULE_LAYOUTS[modKey] ?? []); }, [modKey]);

  const closeLayoutMenu = () => setLayoutMenu(null);
  const handleCloneLayoutRow = (name: string) => {
    const source = layoutRows.find(l => l.name === name);
    if (!source) return;
    const now = new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
    let cloneName = `${source.name} (Copy)`;
    let n = 2;
    while (layoutRows.some(l => l.name === cloneName)) { cloneName = `${source.name} (Copy ${n})`; n++; }
    setLayoutRows(prev => [...prev, { ...source, name: cloneName, lastMod: now, active: false }]);
  };
  const handleRenameLayoutSubmit = () => {
    if (renameLayout && renameLayoutValue.trim()) {
      const now = new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
      setLayoutRows(prev => prev.map(l => l.name === renameLayout ? { ...l, name: renameLayoutValue.trim(), lastMod: now } : l));
    }
    setRenameLayout(null);
  };

  const getPerm = (name: string) => permissions[`${permRole}:${name}`] ?? "rw";
  const setPerm = (name: string, val: "rw"|"ro"|"hide") =>
    setPermissions(p => ({ ...p, [`${permRole}:${name}`]: val }));

  const filteredMods = labeledMods.filter(m => !search || m.label.toLowerCase().includes(search.toLowerCase()));
  const filteredFields = allModFields.filter(f =>
    (!fieldSearch || f.name.toLowerCase().includes(fieldSearch.toLowerCase())) &&
    (fieldLayout === "all" || f.layout === fieldLayout)
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-white">
      {/* Sub-sidebar — collapses into a dropdown on mobile */}
      <div className="w-full md:w-[220px] flex-shrink-0 border-b md:border-b-0 md:border-r border-[#E3ECFC] bg-[#f9fbff] flex flex-col">
        <div className="w-full flex items-center justify-between px-3 py-3 border-b border-[#E3ECFC]">
          <button onClick={onBack} className="flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-[#1D4ED8]">
            <ArrowLeft size={13} weight="bold" />
            Modules
          </button>
          <div className="flex items-center gap-1">
            <IconButton size="small" sx={{ p:0.4, color:"#94A3B8", "&:hover":{color:"#1D4ED8",bgcolor:"#EFF6FF"}, borderRadius:"6px", display: { xs: "none", md: "inline-flex" } }}>
              <MagnifyingGlass size={13} weight="duotone" />
            </IconButton>
            <IconButton size="small" onClick={() => setSubNavOpen(o => !o)}
              sx={{ p:0.4, color:"#94A3B8", "&:hover":{color:"#1D4ED8",bgcolor:"#EFF6FF"}, borderRadius:"6px", display: { xs: "inline-flex", md: "none" } }}>
              {subNavOpen ? <CaretUp size={13} weight="bold" /> : <CaretDown size={13} weight="bold" />}
            </IconButton>
          </div>
        </div>
        <div className={`${subNavOpen ? "flex" : "hidden"} md:flex flex-col flex-1 overflow-y-auto py-1 max-h-[40vh] md:max-h-none`}>
          {filteredMods.map(m => {
            const Icon = m.icon;
            const isActive = modKey === m.key;
            return (
              <button key={m.key} onClick={() => { onSelect(m.key); setSubNavOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-[15px] font-medium transition-colors min-h-[40px] ${
                  isActive ? "bg-[#1D4ED8] text-white" : "text-slate-600 hover:bg-[#EFF6FF]"
                }`}>
                <Icon size={13} color={isActive ? "#fff" : m.color} weight="duotone" />
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 pt-5 pb-1 flex items-center gap-1.5 text-[12px] text-slate-400 flex-wrap">
          <House size={11} weight="duotone" />
          {["Setup","Customization","Modules"].map(crumb => (
            <span key={crumb} className="flex items-center gap-1.5">
              <CaretRight size={9} weight="bold" />
              <span className="hover:text-[#1D4ED8] cursor-pointer transition-colors">{crumb}</span>
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <CaretRight size={9} weight="bold" />
            <span className="text-slate-600 font-semibold capitalize">{title}</span>
          </span>
        </div>

        {/* Title */}
        <div className="px-4 sm:px-6 pt-2 pb-3">
          <div className="text-[22px] font-extrabold text-slate-900 capitalize">{title}</div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 border-b border-[#E3ECFC] flex items-center gap-1 overflow-x-auto">
          {(["layouts","fields"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[15px] font-semibold capitalize transition-all border-b-2 -mb-px ${
                tab === t ? "border-[#1D4ED8] text-[#1D4ED8]" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-4 sm:px-6 py-5">
          {tab === "layouts" && (
            <>
              <div className="text-[14px] text-[#1D4ED8] mb-4 leading-relaxed">
                Design your own layouts to fit your business processes, then assign them to your user accounts based on permission profiles.
              </div>
              <div className="flex justify-end mb-4">
                <Button variant="contained" size="small" onClick={() => setShowCreateLayoutModal(true)}
                  sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius:"8px", textTransform:"none", fontWeight:700, fontSize:"0.75rem", px:2, py:0.8, boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", "&:hover":{ bgcolor: isDark ? "#3F3F46" : "#2563EB" } }}>
                  Create New Layout
                </Button>
              </div>
              <div className="border border-[#E3ECFC] rounded-xl overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f9fbff] border-b border-[#E3ECFC]">
                      <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Shared To</th>
                      <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Last Modified</th>
                      <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layouts.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-[15px] text-slate-300">No records found.</td></tr>
                    ) : layouts.map((l, i) => (
                      <tr key={i} className="border-b border-[#EFF6FF] last:border-0 hover:bg-[#fafcff] transition-colors">
                        <td className="px-4 py-3 text-[15px] font-semibold cursor-pointer hover:underline" style={{ color: isDark ? "#60A5FA" : "#1D4ED8" }} onClick={() => onOpenLayout(l.name)}>{l.name}</td>
                        <td className="px-4 py-3 text-[13px] text-slate-500">{l.sharedTo}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                            <User size={12} weight="duotone" />
                            {l.lastMod}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip title="More actions">
                              <IconButton size="small" onClick={e => setLayoutMenu({ el: e.currentTarget, name: l.name })}
                                sx={{ p:0.3, color: isDark ? "#9CA3AF" : "#94A3B8", "&:hover":{color:"#1D4ED8",bgcolor: isDark ? "#27272A" : "#EFF6FF"}, borderRadius:"6px" }}>
                                <DotsThreeVertical size={15} weight="bold" />
                              </IconButton>
                            </Tooltip>
                            <GreenSwitch checked={l.active} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Layout row actions menu */}
              <Menu anchorEl={layoutMenu?.el} open={!!layoutMenu} onClose={closeLayoutMenu}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{ elevation: 4, sx: {
                  mt: 0.5, borderRadius: "12px", minWidth: 200,
                  border: isDark ? "1px solid #27272A" : "1px solid #E3ECFC",
                  bgcolor: isDark ? "#1C1C1E" : "#fff",
                  boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)",
                  "& .MuiMenuItem-root": {
                    fontSize: "14px", py: 1.2, px: 2.5, gap: 1.25,
                    color: isDark ? "#D4D4D8" : "#334155",
                    "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF", color: isDark ? "#F4F4F5" : "#1D4ED8" },
                  },
                } }}>
                <MenuItem onClick={() => { const name = layoutMenu!.name; closeLayoutMenu(); setRenameLayout(name); setRenameLayoutValue(name); }}>
                  <PencilSimple size={15} weight="duotone" /> Rename
                </MenuItem>
                <MenuItem onClick={() => { const name = layoutMenu!.name; closeLayoutMenu(); onOpenLayout(name); }}>
                  <Rows size={15} weight="duotone" /> Edit Layout
                </MenuItem>
                <MenuItem onClick={() => { const name = layoutMenu!.name; closeLayoutMenu(); handleCloneLayoutRow(name); }}>
                  <CopySimple size={15} weight="duotone" /> Clone Layout
                </MenuItem>
                <MenuItem onClick={() => { closeLayoutMenu(); router.push("/settings?tab=permission"); }}>
                  <ShieldCheck size={15} weight="duotone" /> Layout Permission
                </MenuItem>
                {modKey === "leads" && (
                  <MenuItem onClick={() => { closeLayoutMenu(); setLayoutConversionMappingOpen(true); }}>
                    <ArrowsLeftRight size={15} weight="duotone" /> Lead Conversion Mapping
                  </MenuItem>
                )}
              </Menu>

              {/* Rename layout dialog */}
              <Dialog open={!!renameLayout} onClose={() => setRenameLayout(null)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { borderRadius: "16px", bgcolor: isDark ? "#1C1C1E" : "#fff" } }}>
                <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                  <span className={`text-[15px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Rename Layout</span>
                  <IconButton size="small" onClick={() => setRenameLayout(null)}><X size={16} color={isDark ? "#71717A" : "#64748B"} weight="duotone" /></IconButton>
                </div>
                <DialogContent sx={{ p: 3 }}>
                  <TextField autoFocus fullWidth size="small" label="Layout Name" value={renameLayoutValue}
                    onChange={e => setRenameLayoutValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleRenameLayoutSubmit(); }} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                  <Button onClick={() => setRenameLayout(null)} variant="outlined"
                    sx={{ color: isDark ? "#D4D4D8" : "#4A5675", borderColor: isDark ? "#3F3F46" : "#E3ECFC", textTransform: "none", fontWeight: 600, borderRadius: "9px" }}>
                    Cancel
                  </Button>
                  <Button onClick={handleRenameLayoutSubmit} variant="contained"
                    sx={{ bgcolor: "#1D4ED8", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "9px", "&:hover": { bgcolor: "#2563EB" } }}>
                    Save
                  </Button>
                </DialogActions>
              </Dialog>

              <LeadConversionMappingModal open={layoutConversionMappingOpen} onClose={() => setLayoutConversionMappingOpen(false)} isDark={isDark} />
            </>
          )}
          {tab === "fields" && (
            <div>
              {/* Sub-tabs */}
              <div className="flex items-center gap-1 mb-5 border-b border-[#E3ECFC]">
                {(["listing","permissions"] as const).map(st => (
                  <button key={st} onClick={() => setFieldSubTab(st)}
                    className={`px-4 py-2 text-[14px] font-semibold capitalize transition-all border-b-2 -mb-px ${
                      fieldSubTab === st ? "border-[#1D4ED8] text-[#1D4ED8] bg-[#EFF6FF] rounded-t-md" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}>
                    {st === "listing" ? "Field Listing" : "Field Permissions"}
                  </button>
                ))}
              </div>

              {fieldSubTab === "listing" && (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="flex-1 relative min-w-[160px] w-full sm:w-auto">
                      <MagnifyingGlass size={13} weight="duotone" color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={fieldSearch}
                        onChange={e => setFieldSearch(e.target.value)}
                        placeholder="Search Fields or Data Types"
                        className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E3ECFC] rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8]"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={fieldLayout}
                        onChange={e => setFieldLayout(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 text-[13px] border border-[#E3ECFC] rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#1D4ED8] cursor-pointer"
                      >
                        <option value="all">All Layouts</option>
                        {layouts.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                      </select>
                      <CaretDown size={10} weight="bold" color="#94A3B8" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <Button variant="contained" size="small"
                      onClick={() => { setCreateEditLayout(layouts[0]?.name ?? ""); setShowCreateEditModal(true); }}
                      sx={{ bgcolor:"#1D4ED8", color:"white", borderRadius:"8px", textTransform:"none", fontWeight:700, fontSize:"0.75rem", px:2, py:0.9, whiteSpace:"nowrap", boxShadow:"0 1px 6px #1D4ED833", "&:hover":{ bgcolor:"#2563EB" } }}>
                      Create and Edit Fields
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="border border-[#E3ECFC] rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-left">
                      <thead>
                        <tr className="bg-[#f9fbff] border-b border-[#E3ECFC]">
                          <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Fields</th>
                          <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Data Type</th>
                          <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Custom Field</th>
                          <th className="px-4 py-3 text-[12.5px] font-bold text-slate-500 uppercase tracking-wider">Layouts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFields.length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-10 text-center text-[15px] text-slate-300">No fields found.</td></tr>
                        ) : filteredFields.map((f, i) => (
                          <tr key={i} className="border-b border-[#EFF6FF] last:border-0 hover:bg-[#fafcff] transition-colors">
                            <td className="px-4 py-3 text-[14px] text-slate-700 font-medium">{f.name}</td>
                            <td className="px-4 py-3 text-[14px] text-slate-500">{f.dataType}</td>
                            <td className="px-4 py-3 text-[14px] text-slate-400">{f.custom ? "Yes" : ""}</td>
                            <td className="px-4 py-3 text-[14px] font-semibold text-[#1D4ED8] cursor-pointer hover:underline">{f.layout}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {fieldSubTab === "permissions" && (
                <div>
                  {/* Toolbar */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={permRole}
                        onChange={e => setPermRole(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 text-[13px] border border-[#E3ECFC] rounded-lg bg-white text-slate-700 focus:outline-none focus:border-[#1D4ED8] cursor-pointer w-full sm:min-w-[160px]"
                      >
                        {["Super Admin","Administrator","Operations Manager","Support Executive","VP of Operations"].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <CaretDown size={10} weight="bold" color="#94A3B8" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="flex-1 relative min-w-[160px]">
                      <MagnifyingGlass size={13} weight="duotone" color="#94A3B8" className="absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={permSearch}
                        onChange={e => setPermSearch(e.target.value)}
                        placeholder="Search Fields"
                        className="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E3ECFC] rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8]"
                      />
                    </div>
                    <button className="px-4 py-2 text-[13px] font-bold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#2563EB] transition-colors">
                      Save
                    </button>
                    <button onClick={() => { setCreateEditLayout(layouts[0]?.name ?? ""); setShowCreateEditModal(true); }} className="px-4 py-2 text-[13px] font-semibold text-[#1D4ED8] border border-[#1D4ED8] rounded-lg hover:bg-[#EFF6FF] transition-colors whitespace-nowrap">
                      Create and Edit Fields
                    </button>
                  </div>

                  {/* Table */}
                  <div className="border border-[#E3ECFC] rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[480px] border-collapse text-left">
                      <thead>
                        <tr className="bg-[#f9fbff] border-b border-[#E3ECFC]">
                          <th className="px-4 py-3 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider w-[40%]">Fields</th>
                          <th className="px-4 py-3 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider text-center">Read and Write</th>
                          <th className="px-4 py-3 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider text-center">Read Only</th>
                          <th className="px-4 py-3 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider text-center">Don't Show</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allModFields
                          .filter(f => !permSearch || f.name.toLowerCase().includes(permSearch.toLowerCase()))
                          .map((f, i) => {
                            const perm = getPerm(f.name);
                            return (
                              <tr key={i} className="border-b border-[#EFF6FF] last:border-0 hover:bg-[#fafcff] transition-colors">
                                <td className="px-4 py-3 text-[13px] text-slate-600">{f.name}</td>
                                {(["rw","ro","hide"] as const).map(val => (
                                  <td key={val} className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => setPerm(f.name, val)}
                                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto transition-colors"
                                      style={{
                                        borderColor: perm === val ? "#1D4ED8" : "#CBD5E1",
                                        backgroundColor: perm === val ? "#1D4ED8" : "transparent",
                                      }}
                                    >
                                      {perm === val && <span className="w-2 h-2 rounded-full bg-white block" />}
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateLayoutModal && (
        <CreateLayoutModal
          existingLayouts={layouts.map(l => l.name)}
          onClose={() => setShowCreateLayoutModal(false)}
          onContinue={() => { setShowCreateLayoutModal(false); onOpenLayout("__NEW__"); }}
        />
      )}

      {/* Create and Edit Fields Modal */}
      {showCreateEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-[92vw] max-w-[500px] bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="text-[17px] font-extrabold text-slate-900 mb-5">
              Create and Edit Fields in Layout Editor
            </div>
            <FormControl fullWidth size="small" sx={{ mb: 5 }}>
              <InputLabel sx={{ fontSize: "0.8rem", color: "#1D4ED8" }}>Select Layout</InputLabel>
              <Select
                value={createEditLayout}
                label="Select Layout"
                onChange={e => setCreateEditLayout(e.target.value)}
                sx={{
                  borderRadius: "10px", fontSize: "0.8rem",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1D4ED8" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1D4ED8" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1D4ED8" },
                }}>
                {layouts.map(l => (
                  <MenuItem key={l.name} value={l.name} sx={{ fontSize: "0.8rem" }}>{l.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateEditModal(false)}
                className="px-5 py-2 text-[14px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                Cancel
              </button>
              <button
                disabled={!createEditLayout}
                onClick={() => { setShowCreateEditModal(false); onOpenLayout(createEditLayout); }}
                className="px-5 py-2 rounded-lg text-[14px] font-bold text-white bg-[#1D4ED8] hover:bg-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateLayoutModal({ existingLayouts, onClose, onContinue }: {
  existingLayouts: string[]; onClose: () => void; onContinue: (cloneFrom: string|null) => void;
}) {
  const [cloneFrom, setCloneFrom] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-[92vw] max-w-[460px] bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
        <div className="text-[17px] font-extrabold text-slate-900 mb-5">Create New Layout</div>
        <FormControl fullWidth size="small" sx={{ mb: 5 }}>
          <InputLabel sx={{ fontSize: "0.8rem", color: "#1D4ED8" }}>Clone Layout from</InputLabel>
          <Select value={cloneFrom} label="Clone Layout from" onChange={e => setCloneFrom(e.target.value)}
            sx={{ borderRadius: "10px", fontSize: "0.8rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1D4ED8" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1D4ED8" } }}>
            {existingLayouts.map(l => (<MenuItem key={l} value={l} sx={{ fontSize: "0.8rem" }}>{l}</MenuItem>))}
            <MenuItem value="__scratch__" sx={{ fontSize: "0.8rem" }}>Create from scratch (empty)</MenuItem>
          </Select>
        </FormControl>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[14px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
          <button disabled={!cloneFrom} onClick={() => onContinue(cloneFrom === "__scratch__" ? null : cloneFrom)}
            className="px-5 py-2 rounded-lg text-[14px] font-bold text-white bg-[#1D4ED8] hover:bg-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Continue</button>
        </div>
      </div>
    </div>
  );
}

const LEAD_CONVERSION_TARGETS: { module: string; fields: { lead: string; target: string }[] }[] = [
  { module: "Contact", fields: [
    { lead: "First Name", target: "First Name" }, { lead: "Last Name", target: "Last Name" },
    { lead: "Email", target: "Email" }, { lead: "Phone", target: "Phone" }, { lead: "Title", target: "Title" },
  ]},
  { module: "Account", fields: [
    { lead: "Company", target: "Account Name" }, { lead: "Website", target: "Website" },
    { lead: "Industry", target: "Industry" }, { lead: "Annual Revenue", target: "Annual Revenue" },
  ]},
  { module: "Deal", fields: [
    { lead: "Company", target: "Deal Name" }, { lead: "Lead Source", target: "Lead Source" },
  ]},
];

function LeadConversionMappingModal({ open, onClose, isDark }: { open: boolean; onClose: () => void; isDark: boolean }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "16px", bgcolor: isDark ? "#1C1C1E" : "#fff" } }}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <span className={`text-[16px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Lead Conversion Mapping</span>
        <IconButton size="small" onClick={onClose}><X size={16} color={isDark ? "#71717A" : "#64748B"} weight="duotone" /></IconButton>
      </div>
      <DialogContent sx={{ p: 3 }}>
        <p className={`text-[13px] mb-4 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
          Choose which Lead fields carry over when a lead is converted into a Contact, Account, and Deal.
        </p>
        <div className="space-y-5">
          {LEAD_CONVERSION_TARGETS.map(group => (
            <div key={group.module}>
              <div className={`text-[12px] font-bold uppercase tracking-widest mb-2 ${isDark ? "text-[#60A5FA]" : "text-[#1D4ED8]"}`}>{group.module}</div>
              <div className={`rounded-xl border overflow-hidden ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                {group.fields.map((f, i) => (
                  <div key={f.lead} className={`flex items-center gap-3 px-3 py-2 text-[13px] ${i !== 0 ? `border-t ${isDark ? "border-[#27272A]" : "border-[#EFF6FF]"}` : ""}`}>
                    <span className={`flex-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{f.lead}</span>
                    <ArrowsLeftRight size={13} color="#94A3B8" weight="bold" />
                    <span className={`flex-1 text-right ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{f.target}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained"
          sx={{ bgcolor: "#1D4ED8", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "9px", "&:hover": { bgcolor: "#2563EB" } }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ModulesAndFieldsPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [view, setView]             = useState<"list"|"detail">("list");
  const [selectedMod, setSelectedMod] = useState("leads");
  const [detailInitialTab, setDetailInitialTab] = useState<"layouts"|"fields">("layouts");
  const [openLayout, setOpenLayout] = useState<string|null>(null);
  const [modStatuses, setModStatuses] = useState<Record<string,boolean>>(
    Object.fromEntries(MODULE_DEFS.map(m => [m.key, true]))
  );
  const [modLabels, setModLabels] = useState<Record<string,string>>(
    Object.fromEntries(MODULE_DEFS.map(m => [m.key, m.label]))
  );
  const [search, setSearch] = useState("");
  const [rowMenu, setRowMenu] = useState<{ el: HTMLElement; key: string } | null>(null);
  const [renameMod, setRenameMod] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [conversionMappingOpen, setConversionMappingOpen] = useState(false);

  const filtered = MODULE_DEFS
    .map(m => ({ ...m, label: modLabels[m.key] ?? m.label }))
    .filter(m => !search || m.label.toLowerCase().includes(search.toLowerCase()));

  const closeRowMenu = () => setRowMenu(null);
  const openDetail = (modKey: string, tab: "layouts"|"fields") => {
    setSelectedMod(modKey);
    setDetailInitialTab(tab);
    setView("detail");
  };
  const handleRenameSubmit = () => {
    if (renameMod && renameValue.trim()) {
      setModLabels(prev => ({ ...prev, [renameMod]: renameValue.trim() }));
    }
    setRenameMod(null);
  };

  if (openLayout === "__NEW__") {
    return <NewLayoutBuilder module={selectedMod} onClose={() => setOpenLayout(null)} />;
  }
  if (openLayout !== null) {
    return <LayoutEditor module={selectedMod} layoutName={openLayout} onClose={() => setOpenLayout(null)} />;
  }

  if (view === "detail") {
    return (
      <ModuleDetail
        modKey={selectedMod}
        initialTab={detailInitialTab}
        modLabels={modLabels}
        onBack={() => setView("list")}
        onSelect={k => setSelectedMod(k)}
        onOpenLayout={name => setOpenLayout(name)}
      />
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-3 px-4 sm:px-6 py-4 border-b flex-wrap ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 w-full sm:w-56 focus-within:border-[#1D4ED8] focus-within:shadow-[0_0_0_2px_#4A7AE8] transition-all ${isDark ? "bg-[#18181B] border-[#3F3F46]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
          <MagnifyingGlass size={13} color="#94A3B8" weight="duotone" />
          <InputBase placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
            sx={{ flex:1, fontSize:"0.75rem", color: isDark ? "#D4D4D8" : "#334155", "& input::placeholder":{color:"#94A3B8",opacity:1} }} />
        </div>
        <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-semibold rounded-xl hover:border-[#1D4ED8] transition-colors ${isDark ? "text-[#D4D4D8] bg-[#18181B] border border-[#3F3F46]" : "text-slate-600 bg-[#f9fbff] border border-[#E3ECFC]"}`}>
          <Gear size={13} weight="duotone" />
          Custom Module
        </button>
        <div className="flex-1 hidden sm:block" />
        <Button variant="contained" size="small"
          onClick={() => { setSelectedMod("new"); setView("detail"); }}
          sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius:"9px", textTransform:"none", fontWeight:700, fontSize:"0.75rem", px:2, py:0.8, boxShadow: isDark ? "none" : "0 1px 6px #1D4ED833", whiteSpace:"nowrap", "&:hover":{ bgcolor: isDark ? "#3F3F46" : "#2563EB" } }}>
          Create New Module
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className={isDark ? "bg-[#111113] border-b border-[#27272A]" : "bg-[#f9fbff] border-b border-[#E3ECFC]"}>
            <th className={`px-6 py-3 text-[12.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>Displayed In Tabs As</th>
            <th className={`px-6 py-3 text-[12.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>Module Name</th>
            <th className={`px-6 py-3 text-[12.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>Shared To</th>
            <th className={`px-6 py-3 text-[12.5px] font-bold uppercase tracking-wider ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>Last Modified</th>
            <th className={`px-6 py-3 text-[12.5px] font-bold uppercase tracking-wider text-center ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(mod => {
            const Icon = mod.icon;
            const isOn = modStatuses[mod.key];
            return (
              <tr key={mod.key} className={`border-b transition-colors ${isDark ? "border-[#18181B] hover:bg-[#111113]" : "border-[#EFF6FF] hover:bg-[#fafcff]"}`}>
                <td className="px-6 py-4">
                  <button onClick={() => { setSelectedMod(mod.key); setView("detail"); }}
                    className={`flex items-center gap-2 text-[15px] font-semibold hover:underline ${isDark ? "text-[#60A5FA]" : "text-[#1D4ED8]"}`}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: mod.color + "18" }}>
                      <Icon size={12} color={mod.color} weight="duotone" />
                    </div>
                    {mod.label}
                  </button>
                </td>
                <td className={`px-6 py-4 text-[15px] ${isDark ? "text-[#D4D4D8]" : "text-slate-600"}`}>{mod.label}</td>
                <td className={`px-6 py-4 text-[13px] ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>{mod.sharedTo}</td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1.5 text-[13px] ${isDark ? "text-[#71717A]" : "text-slate-500"}`}>
                    <User size={12} weight="duotone" />
                    {mod.lastMod}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Tooltip title="More actions">
                      <IconButton size="small" onClick={e => setRowMenu({ el: e.currentTarget, key: mod.key })}
                        sx={{ p:0.3, color: isDark ? "#9CA3AF" : "#94A3B8", "&:hover":{color:"#1D4ED8",bgcolor: isDark ? "#27272A" : "#EFF6FF"}, borderRadius:"6px" }}>
                        <DotsThreeVertical size={15} weight="bold" />
                      </IconButton>
                    </Tooltip>
                    <GreenSwitch checked={isOn} onChange={() => setModStatuses(p => ({ ...p, [mod.key]: !p[mod.key] }))} />
                    <Tooltip title="Module info">
                      <IconButton size="small" sx={{ p:0.3, color: isDark ? "#9CA3AF" : "#94A3B8", "&:hover":{color:"#1D4ED8",bgcolor: isDark ? "#27272A" : "#EFF6FF"}, borderRadius:"6px" }}>
                        <Info size={13} weight="duotone" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* Row actions menu */}
      <Menu anchorEl={rowMenu?.el} open={!!rowMenu} onClose={closeRowMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ elevation: 4, sx: {
          mt: 0.5, borderRadius: "12px", minWidth: 210,
          border: isDark ? "1px solid #27272A" : "1px solid #E3ECFC",
          bgcolor: isDark ? "#1C1C1E" : "#fff",
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)",
          "& .MuiMenuItem-root": {
            fontSize: "14px", py: 1.2, px: 2.5, gap: 1.25,
            color: isDark ? "#D4D4D8" : "#334155",
            "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF", color: isDark ? "#F4F4F5" : "#1D4ED8" },
          },
        } }}>
        <MenuItem onClick={() => { const k = rowMenu!.key; closeRowMenu(); openDetail(k, "layouts"); }}>
          <Rows size={15} weight="duotone" /> Layout
        </MenuItem>
        <MenuItem onClick={() => { const k = rowMenu!.key; closeRowMenu(); setRenameMod(k); setRenameValue(modLabels[k] ?? ""); }}>
          <PencilSimple size={15} weight="duotone" /> Rename
        </MenuItem>
        <MenuItem onClick={() => { const k = rowMenu!.key; closeRowMenu(); openDetail(k, "fields"); }}>
          <ListBullets size={15} weight="duotone" /> Fields
        </MenuItem>
        {rowMenu?.key === "leads" && (
          <MenuItem onClick={() => { closeRowMenu(); setConversionMappingOpen(true); }}>
            <ArrowsLeftRight size={15} weight="duotone" /> Lead Conversion Mapping
          </MenuItem>
        )}
        <MenuItem onClick={() => { closeRowMenu(); router.push("/settings?tab=permission"); }}>
          <ShieldCheck size={15} weight="duotone" /> Module Permission
        </MenuItem>
      </Menu>

      {/* Rename dialog */}
      <Dialog open={!!renameMod} onClose={() => setRenameMod(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", bgcolor: isDark ? "#1C1C1E" : "#fff" } }}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <span className={`text-[15px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Rename Module</span>
          <IconButton size="small" onClick={() => setRenameMod(null)}><X size={16} color={isDark ? "#71717A" : "#64748B"} weight="duotone" /></IconButton>
        </div>
        <DialogContent sx={{ p: 3 }}>
          <TextField autoFocus fullWidth size="small" label="Displayed In Tabs As" value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleRenameSubmit(); }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRenameMod(null)} variant="outlined"
            sx={{ color: isDark ? "#D4D4D8" : "#4A5675", borderColor: isDark ? "#3F3F46" : "#E3ECFC", textTransform: "none", fontWeight: 600, borderRadius: "9px" }}>
            Cancel
          </Button>
          <Button onClick={handleRenameSubmit} variant="contained"
            sx={{ bgcolor: "#1D4ED8", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "9px", "&:hover": { bgcolor: "#2563EB" } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <LeadConversionMappingModal open={conversionMappingOpen} onClose={() => setConversionMappingOpen(false)} isDark={isDark} />
    </div>
  );
}

// ---------------------------------------------
//  Customize Home page
// ---------------------------------------------
interface HomePage {
  id: string; name: string; description: string;
  sharedWith: string[]; created: string; lastModified: string; isActive: boolean;
  shareMode?: "private" | "all" | "roles" | "users";
  sharedUserIds?: number[];
  filters?: { region: string; dateRange: string; owner: string };
  locked?: boolean;
}
const INITIAL_HOMEPAGES: HomePage[] = [{
  id: "hp1", name: "Dashboard V1", description: "",
  sharedWith: ["Administrator", "VP of Operations", "Operations Manager", "Support Executive", "Team Leader", "Super Admin"],
  created: "Jun 4, 2026", lastModified: "Jun 29, 2026", isActive: true,
}];

const ALL_ROLES = ["Administrator", "VP of Operations", "Operations Manager", "Support Executive", "Team Leader", "Super Admin"];

// Complementary card palette — same soft-pastel fills used by Dashboard KPICards
const HOMEPAGE_CARD_PALETTE = [
  { fill: "#D6E4F9" }, // Lavender
  { fill: "#D0E5E0" }, // Sage
  { fill: "#FAE3D0" }, // Peach
  { fill: "#F5D9E1" }, // Blush
  { fill: "#E2E4EA" }, // Slate
];

const STEPPER_STEPS = [
  { key: "name",    label: "Name Dashboard" },
  { key: "share",   label: "Share Options" },
  { key: "filters", label: "Global Filters" },
  { key: "lock",    label: "Lock / Unlock" },
  { key: "preview", label: "Save & Preview" },
];

const REGION_OPTIONS = ["All Regions", "North America", "EMEA", "APAC", "LATAM"];
const DATE_RANGE_OPTIONS = ["Last 7 Days", "Last 30 Days", "Last Quarter", "Year to Date", "Custom"];
const OWNER_OPTIONS = ["All Owners", "Me", "My Team", ...ALL_ROLES];

function CreateHomePageDrawer({ open, onClose, onCreate, isDark }: {
  open: boolean; onClose: () => void;
  onCreate: (name: string, sharedWith: string[], shareMode: "private" | "all" | "roles" | "users", sharedUserIds: number[], filters: { region: string; dateRange: string; owner: string }, locked: boolean) => void;
  isDark: boolean;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [shareMode, setShareMode] = useState<"private" | "all" | "roles" | "users">("all");
  const [sharedWith, setSharedWith] = useState<string[]>([...ALL_ROLES]);
  const [sharedUserIds, setSharedUserIds] = useState<number[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [dateRange, setDateRange] = useState(DATE_RANGE_OPTIONS[1]);
  const [owner, setOwner] = useState(OWNER_OPTIONS[0]);
  const [locked, setLocked] = useState(false);

  const toggleRole = (role: string) =>
    setSharedWith(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  const toggleUser = (id: number) =>
    setSharedUserIds(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);

  const filteredUsers = USERS.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const resetState = () => {
    setStep(0); setName(""); setShareMode("all"); setSharedWith([...ALL_ROLES]); setSharedUserIds([]); setUserSearch("");
    setRegion(REGION_OPTIONS[0]); setDateRange(DATE_RANGE_OPTIONS[1]); setOwner(OWNER_OPTIONS[0]);
    setLocked(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), shareMode === "roles" ? sharedWith : [], shareMode, shareMode === "users" ? sharedUserIds : [], { region, dateRange, owner }, locked);
    resetState();
  };
  const handleClose = () => { onClose(); resetState(); };

  const canAdvance = step !== 0 || !!name.trim();

  const FX = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", ...(isDark ? {} : { backgroundColor: "#EFF6FF" }), fontSize: "0.82rem",
      "& fieldset": { borderColor: isDark ? "#3F3F46" : "#E3ECFC", borderWidth: 1.5 },
      "&:hover fieldset": { borderColor: isDark ? "#9CA3AF" : "#E3ECFC" },
      "&.Mui-focused fieldset": { borderColor: isDark ? "#71717A" : "#E3ECFC", borderWidth: 2 },
      "&.Mui-focused": { boxShadow: isDark ? "none" : "0 0 0 2px #4A7AE8" },
      "& input": { padding: "10px 14px" },
    },
    "& .MuiInputLabel-root": { fontSize: "0.79rem", ...(isDark ? {} : { color: "#6B7280" }) },
    "& .MuiInputLabel-root.Mui-focused": { color: isDark ? "#A1A1AA" : "inherit" },
  };

  const SHARE_MODES: { key: "private" | "all" | "roles" | "users"; label: string; desc: string; icon: React.ElementType }[] = [
    { key: "private", label: "Private", desc: "Only visible to you", icon: Lock },
    { key: "all", label: "All Users", desc: "Visible to everyone in the org", icon: Globe },
    { key: "roles", label: "Specific Roles", desc: "Choose which roles can view this", icon: UsersThree },
    { key: "users", label: "Specific Users", desc: "Choose one or more individual users", icon: UserPlus },
  ];

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column", bgcolor: isDark ? "#18181B" : "#F8FAFF", boxShadow: isDark ? "-12px 0 48px rgba(0,0,0,0.5)" : "-12px 0 48px rgba(12,36,114,0.12)" } }}>
      <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isDark ? "bg-[#27272A]" : "bg-[#1D4ED8]"}`}>
            <House size={18} color={isDark ? "#A1A1AA" : "#fff"} weight="duotone" />
          </div>
          <span className={`font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Create Dashboard</span>
        </div>
        <Tooltip title="Close">
          <IconButton size="small" onClick={handleClose}
            sx={{ borderRadius: "9px", border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            <X size={17} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Stepper header */}
      <div className={`px-6 py-4 border-b flex-shrink-0 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <div className="flex items-center">
          {STEPPER_STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                  i < step
                    ? "bg-[#1D4ED8] text-white"
                    : i === step
                      ? isDark ? "bg-[#1D4ED8]/20 text-[#93C5FD] ring-2 ring-[#1D4ED8]" : "bg-[#1D4ED8]/10 text-[#1D4ED8] ring-2 ring-[#1D4ED8]"
                      : isDark ? "bg-[#27272A] text-[#71717A]" : "bg-[#E3ECFC] text-slate-400"
                }`}>
                  {i < step ? <CheckCircle size={15} weight="bold" /> : i + 1}
                </div>
                <span className={`hidden sm:block text-[10px] font-semibold text-center max-w-[70px] leading-tight ${
                  i === step ? (isDark ? "text-[#F4F4F5]" : "text-slate-900") : (isDark ? "text-[#71717A]" : "text-slate-400")
                }`}>{s.label}</span>
              </div>
              {i < STEPPER_STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-1 sm:mx-1.5 sm:mb-4 rounded-full transition-colors ${
                  i < step ? "bg-[#1D4ED8]" : isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className={`sm:hidden text-center text-[12px] font-bold mt-2 ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
          Step {step + 1} of {STEPPER_STEPS.length}: {STEPPER_STEPS[step].label}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Step 1 — Name Dashboard */}
        {step === 0 && (
          <div>
            <div className="font-heading text-[12px] font-bold mb-4 uppercase tracking-wider text-slate-500">Dashboard Details</div>
            <TextField label="Dashboard Name" placeholder="e.g. Sales Performance Overview" value={name} onChange={e => setName(e.target.value)}
              size="small" fullWidth autoFocus sx={FX} />
            <p className={`text-[12px] mt-2.5 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Give your dashboard a clear, descriptive name so it's easy to find later.</p>
          </div>
        )}

        {/* Step 2 — Share Options */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="font-heading text-[12px] font-bold mb-3 uppercase tracking-wider text-slate-500">Who can access this dashboard?</div>
              <div className="space-y-2">
                {SHARE_MODES.map(mode => (
                  <button key={mode.key} type="button" onClick={() => setShareMode(mode.key)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                      shareMode === mode.key
                        ? isDark ? "border-[#1D4ED8] bg-[#1D4ED8]/10" : "border-[#1D4ED8] bg-[#1D4ED8]/5"
                        : isDark ? "border-[#27272A] hover:bg-[#27272A]" : "border-[#E3ECFC] hover:bg-[#EFF6FF]"
                    }`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      shareMode === mode.key ? "bg-[#1D4ED8]" : isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"
                    }`}>
                      <mode.icon size={17} weight="duotone" color={shareMode === mode.key ? "#fff" : isDark ? "#A1A1AA" : "#64748B"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[14px] font-semibold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{mode.label}</div>
                      <div className={`text-[12px] mt-0.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{mode.desc}</div>
                    </div>
                    {shareMode === mode.key && <CheckCircle size={18} weight="fill" color="#1D4ED8" className="flex-shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {shareMode === "roles" && (
              <div>
                <div className="font-heading text-[12px] font-bold mb-3 uppercase tracking-wider text-slate-500">Select Roles</div>
                <div className="space-y-1">
                  {ALL_ROLES.map(role => (
                    <label key={role} className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]"}`}>
                      <Checkbox size="small" checked={sharedWith.includes(role)} onChange={() => toggleRole(role)}
                        sx={{ p: 0.3, color: isDark ? "#3F3F46" : "#E2E8F0", "&.Mui-checked": { color: "#1D4ED8" } }} />
                      <span className={`text-[14px] font-medium ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {shareMode === "users" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-heading text-[12px] font-bold uppercase tracking-wider text-slate-500">Select Users</div>
                  {sharedUserIds.length > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-[#1D4ED8]/20 text-[#93C5FD]" : "bg-[#1D4ED8]/10 text-[#1D4ED8]"}`}>
                      {sharedUserIds.length} selected
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 mb-3 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
                  <MagnifyingGlass size={14} color="#94A3B8" weight="duotone" />
                  <input placeholder="Search by name or email" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    className={`flex-1 text-[13px] outline-none bg-transparent ${isDark ? "text-[#D4D4D8] placeholder-[#52525B]" : "text-slate-700 placeholder-slate-400"}`} />
                </div>
                <div className="space-y-1 max-h-[280px] overflow-y-auto">
                  {filteredUsers.map(u => (
                    <label key={u.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#EFF6FF]"}`}>
                      <Checkbox size="small" checked={sharedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)}
                        sx={{ p: 0.3, color: isDark ? "#3F3F46" : "#E2E8F0", "&.Mui-checked": { color: "#1D4ED8" } }} />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10.5px] font-bold flex-shrink-0"
                        style={{ backgroundColor: u.avatarColor, color: u.textColor }}>{u.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13.5px] font-semibold truncate ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{u.name}</div>
                        <div className={`text-[11.5px] truncate ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>{u.email}</div>
                      </div>
                      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${isDark ? "bg-[#27272A] text-[#9CA3AF]" : "bg-[#E3ECFC] text-slate-500"}`}>{u.role}</span>
                    </label>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className={`text-[13px] text-center py-6 ${isDark ? "text-[#52525B]" : "text-slate-400"}`}>No users match "{userSearch}"</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Global Filters */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="font-heading text-[12px] font-bold mb-1 uppercase tracking-wider text-slate-500">Global Filters</div>
              <p className={`text-[12px] mb-4 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>These filters apply across every widget on the dashboard by default. Viewers can still adjust them unless locked.</p>
            </div>
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Region</InputLabel>
              <Select label="Region" value={region} onChange={e => setRegion(e.target.value)}
                MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#1C1C1E" : "#fff" } } }}>
                {REGION_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Date Range</InputLabel>
              <Select label="Date Range" value={dateRange} onChange={e => setDateRange(e.target.value)}
                MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#1C1C1E" : "#fff" } } }}>
                {DATE_RANGE_OPTIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth sx={FX}>
              <InputLabel>Owner</InputLabel>
              <Select label="Owner" value={owner} onChange={e => setOwner(e.target.value)}
                MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#1C1C1E" : "#fff" } } }}>
                {OWNER_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Step 4 — Lock / Unlock */}
        {step === 3 && (
          <div>
            <div className="font-heading text-[12px] font-bold mb-1 uppercase tracking-wider text-slate-500">Lock Dashboard</div>
            <p className={`text-[12px] mb-4 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Locking prevents viewers from changing filters or rearranging widgets — the dashboard shows exactly as designed.</p>
            <div className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border ${isDark ? "border-[#27272A] bg-[#111113]" : "border-[#E3ECFC] bg-[#f9fbff]"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${locked ? "bg-[#1D4ED8]" : isDark ? "bg-[#27272A]" : "bg-[#E3ECFC]"}`}>
                  <Lock size={17} weight="duotone" color={locked ? "#fff" : isDark ? "#A1A1AA" : "#64748B"} />
                </div>
                <div>
                  <div className={`text-[14px] font-semibold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{locked ? "Locked" : "Unlocked"}</div>
                  <div className={`text-[12px] mt-0.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{locked ? "Viewers cannot edit filters or layout" : "Viewers can adjust filters and layout"}</div>
                </div>
              </div>
              <button type="button" role="switch" aria-checked={locked} onClick={() => setLocked(v => !v)}
                className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${locked ? "bg-[#1D4ED8]" : isDark ? "bg-[#3F3F46]" : "bg-[#CBD5E1]"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${locked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Save & Preview */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="font-heading text-[12px] font-bold mb-1 uppercase tracking-wider text-slate-500">Review & Confirm</div>
            <div className={`rounded-xl border divide-y ${isDark ? "border-[#27272A] divide-[#27272A] bg-[#111113]" : "border-[#E3ECFC] divide-[#E3ECFC] bg-[#f9fbff]"}`}>
              <div className="flex items-center justify-between px-4 py-3">
                <span className={`text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Name</span>
                <span className={`text-[13px] font-semibold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{name || "—"}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className={`text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Share</span>
                <span className={`text-[13px] font-semibold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
                  {shareMode === "private" ? "Private"
                    : shareMode === "all" ? "All Users"
                    : shareMode === "roles" ? `${sharedWith.length} Role${sharedWith.length === 1 ? "" : "s"}`
                    : `${sharedUserIds.length} User${sharedUserIds.length === 1 ? "" : "s"}`}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className={`text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Filters</span>
                <span className={`text-[13px] font-semibold text-right ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{region} · {dateRange} · {owner}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className={`text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Status</span>
                <span className={`text-[13px] font-semibold flex items-center gap-1.5 ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
                  <Lock size={13} weight="duotone" />{locked ? "Locked" : "Unlocked"}
                </span>
              </div>
            </div>
            <p className={`text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Saving will open the dashboard editor where you can build out the layout and preview it live.</p>
          </div>
        )}
      </div>

      <div className={`flex items-center justify-between gap-3 px-6 py-4 border-t flex-shrink-0 ${isDark ? "bg-[#111113] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
        {step === 0 ? (
          <Button variant="text" onClick={handleClose}
            sx={{ color: isDark ? "#A1A1AA" : "#64748B", textTransform: "none", fontWeight: 600, fontSize: "0.82rem", borderRadius: "9px", px: 2.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            Cancel
          </Button>
        ) : (
          <Button variant="text" startIcon={<ArrowLeft size={15} weight="bold" />} onClick={() => setStep(s => s - 1)}
            sx={{ color: isDark ? "#A1A1AA" : "#64748B", textTransform: "none", fontWeight: 600, fontSize: "0.82rem", borderRadius: "9px", px: 2.5, "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" } }}>
            Back
          </Button>
        )}
        {step < STEPPER_STEPS.length - 1 ? (
          <Button variant="contained" endIcon={<CaretRight size={15} weight="bold" />} onClick={() => setStep(s => s + 1)} disabled={!canAdvance}
            sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.82rem", px: 3, boxShadow: isDark ? "none" : "0 1px 8px #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "#2563EB" }, "&:disabled": { bgcolor: isDark ? "#1C1C1E" : "#E2E8F0", color: isDark ? "#52525B" : "#CBD5E1" } }}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={!name.trim()}
            sx={{ bgcolor: isDark ? "#27272A" : "#1D4ED8", color: isDark ? "#F4F4F5" : "white", borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.82rem", px: 3, boxShadow: isDark ? "none" : "0 1px 8px #1D4ED833", "&:hover": { bgcolor: isDark ? "#3F3F46" : "#2563EB" }, "&:disabled": { bgcolor: isDark ? "#1C1C1E" : "#E2E8F0", color: isDark ? "#52525B" : "#CBD5E1" } }}>
            Save & Preview
          </Button>
        )}
      </div>
    </Drawer>
  );
}

const HOMEPAGES_STORAGE_KEY = "dashboards-list";

function loadHomepages(): HomePage[] {
  if (typeof window === "undefined") return INITIAL_HOMEPAGES;
  try {
    const raw = localStorage.getItem(HOMEPAGES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_HOMEPAGES;
  } catch {
    return INITIAL_HOMEPAGES;
  }
}

function CustomizeHomepagePanel() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [homepages, setHomepages] = useState<HomePage[]>(INITIAL_HOMEPAGES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHomepages(loadHomepages());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(HOMEPAGES_STORAGE_KEY, JSON.stringify(homepages));
  }, [homepages, hydrated]);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  const openMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setMenuAnchor({ el: e.currentTarget, id });
  };
  const closeMenu = () => setMenuAnchor(null);

  const handleMenuAction = (action: string) => {
    const id = menuAnchor?.id;
    closeMenu();
    if (!id) return;
    if (action === "edit") {
      router.push(`/home/${id}/edit`);
    } else if (action === "rename") {
      const hp = homepages.find(h => h.id === id);
      if (hp) { setRenameId(id); setRenameName(hp.name); }
    } else if (action === "clone") {
      const hp = homepages.find(h => h.id === id);
      if (hp) {
        const now = new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
        setHomepages(prev => [...prev, { ...hp, id: `hp${Date.now()}`, name: `${hp.name} (Copy)`, isActive: false, created: now, lastModified: now }]);
      }
    }
  };

  const handleRenameSubmit = () => {
    if (renameId && renameName.trim()) {
      const now = new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
      setHomepages(prev => prev.map(hp => hp.id === renameId ? { ...hp, name: renameName.trim(), lastModified: now } : hp));
      setRenameId(null);
    }
  };

  const handleCreate = (name: string, sharedWith: string[], shareMode: "private" | "all" | "roles" | "users", sharedUserIds: number[], filters: { region: string; dateRange: string; owner: string }, locked: boolean) => {
    const now = new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
    const newId = `hp${Date.now()}`;
    setHomepages(prev => [...prev, { id: newId, name, description: "", sharedWith, sharedUserIds, created: now, lastModified: now, isActive: true, shareMode, filters, locked }]);
    setCreateOpen(false);
    // New dashboards start blank — the user builds the layout themselves in the editor.
    router.push(`/home/${newId}/edit?new=true`);
  };

  const menuSx = {
    mt: 0.5, borderRadius: "12px",
    border: isDark ? "1px solid #27272A" : "1px solid #E3ECFC",
    bgcolor: isDark ? "#1C1C1E" : "#fff",
    boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)",
    minWidth: 190,
    "& .MuiMenuItem-root": {
      fontSize: "14px", py: 1.2, px: 2.5,
      color: isDark ? "#D4D4D8" : "#334155",
      "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF", color: isDark ? "#F4F4F5" : "#1D4ED8" },
    },
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
      {/* Header */}
      <div className={`px-4 sm:px-8 py-5 border-b flex items-start justify-between gap-4 sm:gap-6 flex-wrap ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <div className="min-w-0">
          <div className={`text-[18px] sm:text-[20px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Dashboard Customization</div>
          <div className={`text-[13px] mt-1 max-w-lg leading-relaxed ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
            You can create custom dashboards, making it easier for employees to complete their daily task efficiently.
          </div>
        </div>
        <Button variant="contained" onClick={() => setCreateOpen(true)}
          sx={{ bgcolor: "#1D4ED8", color: "white", borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "14px", px: 2.5, py: 1, boxShadow: "0 1px 8px #1D4ED833", "&:hover": { bgcolor: "#2563EB" }, "&:active": { bgcolor: "#0C2472" }, whiteSpace: "nowrap", flexShrink: 0 }}>
          Create Dashboard
        </Button>
      </div>

      {/* Widget preview cards — matches Dashboard KPICard visual language */}
      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {homepages.map((hp, i) => {
            const palette = HOMEPAGE_CARD_PALETTE[i % HOMEPAGE_CARD_PALETTE.length];
            return (
              <div key={hp.id}
                className="rounded-2xl p-6 relative overflow-hidden border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: isDark ? "#18181B" : palette.fill,
                  borderColor: isDark ? "#27272A" : "rgba(255,255,255,0.5)",
                  boxShadow: "0 6px 24px rgba(15,23,42,0.06)",
                }}
                onClick={() => router.push(`/home/${hp.id}/edit`)}>
                {/* Header: icon + status + menu */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-black/30 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>
                    <House size={18} weight="duotone" />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <GreenSwitch checked={hp.isActive} onChange={() => setHomepages(prev => prev.map(h => h.id === hp.id ? { ...h, isActive: !h.isActive } : h))} />
                    <Tooltip title="Options">
                      <IconButton size="small" onClick={e => openMenu(e, hp.id)}
                        sx={{ p: 0.4, color: isDark ? "#71717A" : "#4A5675", "&:hover": { color: isDark ? "#D4D4D8" : "#0C2472", bgcolor: isDark ? "#27272A" : "rgba(255,255,255,0.5)" }, borderRadius: "6px" }}>
                        <DotsThreeVertical size={15} weight="bold" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>

                {/* Name */}
                {renameId === hp.id ? (
                  <div className="flex items-center gap-2 mb-2" onClick={e => e.stopPropagation()}>
                    <input value={renameName} onChange={e => setRenameName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setRenameId(null); }}
                      autoFocus
                      className={`px-2 py-1 text-[14px] border rounded-lg focus:outline-none w-full ${isDark ? "bg-[#27272A] border-[#3F3F46] text-[#D4D4D8]" : "bg-white border-[#1D4ED8] text-slate-800"}`} />
                    <button onClick={handleRenameSubmit} className="px-2 py-0.5 text-[11px] font-bold bg-[#1D4ED8] text-white rounded-md flex-shrink-0">Save</button>
                  </div>
                ) : (
                  <p className={`text-[16px] font-extrabold tracking-tight leading-none mb-2 truncate ${isDark ? "text-[#FFFFFF]" : "text-[#0C2472]"}`}>
                    {hp.name}
                  </p>
                )}

                {/* Description */}
                <p className={`text-[12.5px] leading-relaxed mb-4 line-clamp-2 ${hp.description ? (isDark ? "text-[#D4D4D8]" : "text-[#4A5675]") : (isDark ? "text-[#52525B]" : "text-slate-400")}`}>
                  {hp.description || "No description"}
                </p>

                {/* Shared with chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {hp.shareMode === "private" && (
                    <span className={`text-[10.5px] font-bold px-2 py-1 rounded-full ${isDark ? "bg-black/40 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>Private</span>
                  )}
                  {hp.shareMode === "all" && (
                    <span className={`text-[10.5px] font-bold px-2 py-1 rounded-full ${isDark ? "bg-black/40 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>All Users</span>
                  )}
                  {hp.shareMode === "roles" && hp.sharedWith.slice(0, 3).map(role => (
                    <span key={role} className={`text-[10.5px] font-bold px-2 py-1 rounded-full ${isDark ? "bg-black/40 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>{role}</span>
                  ))}
                  {hp.shareMode === "roles" && hp.sharedWith.length > 3 && (
                    <span className={`text-[10.5px] font-bold px-2 py-1 rounded-full ${isDark ? "bg-black/40 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>+{hp.sharedWith.length - 3}</span>
                  )}
                  {hp.shareMode === "users" && (hp.sharedUserIds || []).slice(0, 3).map(id => {
                    const u = USERS.find(usr => usr.id === id);
                    return u ? (
                      <span key={id} className={`text-[10.5px] font-bold px-2 py-1 rounded-full ${isDark ? "bg-black/40 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>{u.name}</span>
                    ) : null;
                  })}
                  {hp.shareMode === "users" && (hp.sharedUserIds || []).length > 3 && (
                    <span className={`text-[10.5px] font-bold px-2 py-1 rounded-full ${isDark ? "bg-black/40 text-[#A1A1AA]" : "bg-[#f9fbff]/70 text-[#0C2472]"}`}>+{(hp.sharedUserIds || []).length - 3}</span>
                  )}
                </div>

                {/* Footer: created / modified */}
                <div className={`flex items-center justify-between text-[11px] font-semibold pt-3 border-t ${isDark ? "border-white/10 text-[#71717A]" : "border-black/5 text-[#4A5675]"}`}>
                  <span>Created {hp.created}</span>
                  <span>Modified {hp.lastModified}</span>
                </div>
              </div>
            );
          })}

          {/* Add new homepage tile */}
          <button onClick={() => setCreateOpen(true)}
            className={`rounded-2xl p-6 border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-[220px] transition-all duration-200 hover:shadow-lg ${isDark ? "border-[#27272A] hover:border-[#3F3F46] hover:bg-[#111113] text-[#71717A]" : "border-[#E3ECFC] hover:border-[#93C5FD] hover:bg-[#f9fbff] text-[#4A5675]"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-[#18181B]" : "bg-[#EFF6FF]"}`}>
              <Plus size={18} weight="bold" />
            </div>
            <span className="text-[13px] font-bold">Create Dashboard</span>
          </button>
        </div>
      </div>

      {/* Context menu */}
      <Menu anchorEl={menuAnchor?.el} open={!!menuAnchor} onClose={closeMenu}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        PaperProps={{ elevation: 4, sx: menuSx }}>
        <MenuItem onClick={() => handleMenuAction("edit")}>Edit Dashboard</MenuItem>
        <MenuItem onClick={() => handleMenuAction("rename")}>Rename Dashboard</MenuItem>
        <MenuItem onClick={() => handleMenuAction("clone")}>Clone Dashboard</MenuItem>
        <MenuItem onClick={() => handleMenuAction("permission")}>Dashboard Permission</MenuItem>
      </Menu>

      <CreateHomePageDrawer open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} isDark={isDark} />
    </div>
  );
}

// ---------------------------------------------
//  Import Panel
// ---------------------------------------------
function ImportPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleImport = () => {
    if (!file) {
      alert("Please select a file to import");
      return;
    }
    console.log("Importing file:", file.name);
    alert(`File "${file.name}" imported successfully!`);
    setFile(null);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <div className={`flex-1 flex flex-col overflow-auto ${isDark ? "bg-[#0A0A0A]" : "bg-[#EFF6FF]"}`}>
      <div className="px-8 py-6 border-b flex-shrink-0" style={{ borderColor: isDark ? "#27272A" : "#E3ECFC" }}>
        <h1 className={`m-0 text-[24px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Import Data</h1>
        <p className={`text-[13px] mt-1 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>Upload CSV or Excel files to import records</p>
      </div>

      <div className="flex-1 p-8">
        <div className={`max-w-md rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDark
            ? "border-[#27272A] bg-[#18181B] hover:bg-[#27272A]"
            : "border-[#E3ECFC] bg-white hover:bg-[#F9FBFF]"
        }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-[#27272A]" : "bg-[#EFF6FF]"}`}>
            <Upload size={32} color={isDark ? "#64748B" : "#1D4ED8"} weight="duotone" />
          </div>

          <h3 className={`text-[15px] font-bold mb-2 ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Upload file</h3>
          <p className={`text-[12px] mb-4 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
            {file ? file.name : "CSV, Excel, or JSON formats"}
          </p>

          <label className={`inline-block px-4 py-2 rounded-lg font-medium text-[13px] cursor-pointer transition-colors ${
            isDark
              ? "bg-[#1D4ED8] text-white hover:bg-[#1640B8]"
              : "bg-[#1D4ED8] text-white hover:bg-[#1640B8]"
          }`}>
            Choose file
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.json"
            />
          </label>
        </div>

        {file && (
          <div className={`mt-6 p-4 rounded-lg border ${isDark ? "bg-[#18181B] border-[#27272A]" : "bg-[#F9FBFF] border-[#E3ECFC]"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[13px] font-medium ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>{file.name}</p>
                <p className={`text-[12px] mt-1 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (input) input.value = "";
                }}
                className={`text-[12px] px-3 py-1 rounded-lg transition-colors ${isDark ? "text-[#9CA3AF] hover:bg-[#27272A]" : "text-slate-500 hover:bg-[#E3ECFC]"}`}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file}
          className={`mt-6 w-full px-4 py-2.5 rounded-lg font-medium text-[13px] transition-colors ${
            file
              ? isDark
                ? "bg-[#1D4ED8] text-white hover:bg-[#1640B8]"
                : "bg-[#1D4ED8] text-white hover:bg-[#1640B8]"
              : isDark
                ? "bg-[#27272A] text-[#71717A] cursor-not-allowed"
                : "bg-[#E3ECFC] text-[#94A3B8] cursor-not-allowed"
          }`}
        >
          Import Records
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------
//  Placeholder
// ---------------------------------------------
function PlaceholderPanel({ label }: { label: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`flex-1 flex items-center justify-center ${isDark ? "bg-[#0A0A0A]" : "bg-[#EFF6FF]"}`}>
      <div className="text-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-[#18181B]" : "bg-[#EFF6FF]"}`}>
          <Gear size={22} color={isDark ? "#9CA3AF" : "#94A3B8"} weight="duotone" />
        </div>
        <div className={`text-[15px] font-bold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>{label}</div>
        <div className={`text-[12px] mt-1 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>This section is coming soon.</div>
      </div>
    </div>
  );
}

// ---------------------------------------------
//  Settings sub-sidebar
// ---------------------------------------------
function SettingsSidebar({ activeItem, setActiveItem, isDark = false }: {
  activeItem: string; setActiveItem: (k: string) => void; isDark?: boolean;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className={`w-full md:w-[240px] flex-shrink-0 border-b md:border-b-0 md:border-r flex flex-col overflow-y-auto max-h-[260px] md:max-h-none transition-colors duration-300 ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-[#f9fbff] border-[#E3ECFC]"}`}>
      <div className={`px-4 pt-5 pb-4 border-b transition-colors duration-300 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#1D4ED8] flex items-center justify-center shadow-sm flex-shrink-0">
            <Gear size={15} color="#fff" weight="duotone" />
          </div>
          <div>
            <div className={`font-heading text-[14px] font-bold leading-tight ${isDark ? "text-[#FFFFFF]" : "text-slate-900"}`}>Settings</div>
            <div className="text-[12px] text-slate-400 leading-tight">Manage workspace</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1">
        {SECTIONS.map(section => {
          const isOpen = !collapsed[section.key];
          return (
            <div key={section.key}>
              <button onClick={() => toggle(section.key)}
                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg transition-colors group min-h-[32px] outline-none ${isDark ? "hover:bg-[#1D4ED8]/15" : "hover:bg-[#EFF6FF]"}`}>
                <span className={`font-heading text-[13px] font-bold uppercase tracking-widest transition-colors truncate ${isDark ? "text-[#475569] group-hover:text-[#64748B]" : "text-slate-400 group-hover:text-slate-500"}`}>
                  {section.label}
                </span>
                {isOpen ? <CaretUp size={10} color={isDark ? "#475569" : "#E2E8F0"} weight="bold" /> : <CaretDown size={10} color={isDark ? "#475569" : "#E2E8F0"} weight="bold" />}
              </button>

              {isOpen && (
                <div className="space-y-0.5 mb-1.5">
                  {section.items.map(item => {
                    const IIcon = item.icon;
                    const isActive = activeItem === item.key;
                    return (
                      <button key={item.key}
                        onClick={(e) => { setActiveItem(item.key); e.currentTarget.blur(); }}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        className={`relative flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all min-h-[36px] outline-none focus:outline-none focus:bg-none focus-visible:ring-2 ${
                          isDark ? "focus-visible:ring-[#3B82F6]" : "focus-visible:ring-[#1D4ED8]"
                        } ${
                          isActive
                            ? isDark ? "bg-[#27272A] text-[#F4F4F5] font-semibold" : "bg-[#EFF6FF] text-[#1D4ED8] font-semibold"
                            : isDark ? "text-[#9CA3AF] hover:bg-[#27272A] hover:text-[#FFFFFF]" : "text-slate-500 hover:bg-[#EFF6FF]/60 hover:text-slate-700"
                        }`}>
                        {isActive && <span className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full ${isDark ? "bg-[#9CA3AF]" : "bg-[#1D4ED8]"}`} />}
                        <IIcon size={13} color={isActive ? (isDark ? "#6B8BA3" : "#1D4ED8") : "#94A3B8"} weight="duotone" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// ---------------------------------------------
//  Page
// ---------------------------------------------
export default function SettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const searchParams = useSearchParams();

  const [activeItem, setActiveItem] = useState(searchParams.get("tab") || "personal");
  const activeLabel = SECTIONS.flatMap(s => s.items).find(i => i.key === activeItem)?.label ?? "";

  // Keep the active section in sync when navigated to via a link/router.push with a
  // different ?tab= (e.g. "Module Permission" in a row menu), not just on first mount.
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeItem) setActiveItem(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const content = () => {
    switch (activeItem) {
      case "personal":     return <PersonalSettingsPanel />;
      case "users":        return <UsersPanel />;
      case "organization": return <OrganizationPanel />;
      case "roles":        return <RolesPanel />;
      case "permission":   return <PermissionPanel />;
      case "modules":      return <ModulesAndFieldsPanel />;
      case "homepage":     return <CustomizeHomepagePanel />;
      case "import":       return <ImportPanel />;
      default:             return <PlaceholderPanel label={activeLabel} />;
    }
  };

  return (
    <div className={`sidebar-content flex-1 flex min-h-screen overflow-hidden font-sans ${isDark ? "bg-[#000000]" : "bg-[#EFF6FF]"}`}>
      <div className="relative flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        <SettingsSidebar activeItem={activeItem} setActiveItem={setActiveItem} isDark={isDark} />
        {content()}
      </div>
    </div>
  );
}

