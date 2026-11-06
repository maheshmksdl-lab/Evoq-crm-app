"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { ListIcon, MagnifyingGlass, Bell, Command, UserCircleIcon, SignOutIcon, Sun, Moon } from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";

const EXPANDED_W = "260px";
const COLLAPSED_W = "68px";
const MOBILE_BP = 1024;

const PATH_TITLES: Record<string, string> = {
  "/":         "Dashboard",
  "/leads":    "Leads",
  "/deals":    "Deals",
  "/contacts": "Contacts",
  "/accounts": "Accounts",
  "/tasks":    "Tasks",
  "/reports":  "Reports",
  "/settings": "Settings",
};

function UserMenu({
  anchor, onClose, router, isDark,
}: {
  anchor: HTMLElement | null;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
  isDark: boolean;
}) {
  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={onClose}
      onClick={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            mt: 1.5, minWidth: 220,
            borderRadius: "16px",
            border: `1px solid ${isDark ? "#27272A" : "#E8EEFB"}`,
            bgcolor: isDark ? "#18181B" : "#ffffff",
            boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* User info */}
      <div className="px-5 pt-4 pb-3">
        <p className={`text-[15px] font-bold leading-tight ${isDark ? "text-[#F4F4F5]" : "text-[#0C2472]"}`}>PM SDL</p>
        <p className={`text-[12px] mt-0.5 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Super Admin</p>
      </div>

      <Divider sx={{ borderColor: isDark ? "#27272A" : "#F1F5F9", mx: 0 }} />

      <div className="py-1.5 px-1.5">
        <MenuItem
          onClick={() => router.push("/settings")}
          sx={{
            gap: 2, px: "14px", py: "10px", fontSize: "0.875rem", fontWeight: 500,
            color: isDark ? "#D4D4D8" : "#334155", borderRadius: "10px",
            "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF", color: isDark ? "#60A5FA" : "#1D4ED8" },
          }}
        >
          <UserCircleIcon size={18} weight="duotone" />
          My Account
        </MenuItem>

        <MenuItem
          onClick={() => router.push("/login")}
          sx={{
            gap: 2, px: "14px", py: "10px", fontSize: "0.875rem", fontWeight: 500,
            color: isDark ? "#F87171" : "#EF4444", borderRadius: "10px",
            "&:hover": { bgcolor: isDark ? "#27272A" : "#FEF2F2", color: isDark ? "#FCA5A5" : "#DC2626" },
          }}
        >
          <SignOutIcon size={18} weight="duotone" />
          Log out
        </MenuItem>
      </div>
    </Menu>
  );
}

function ThemeToggleButton({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <Tooltip title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}>
      <IconButton
        onClick={onToggle}
        size="small"
        aria-label="Toggle dark mode"
        sx={{
          borderRadius: "9px",
          border: `1.5px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
          bgcolor: isDark ? "#0A0A0A" : "#f9fbff",
          "&:hover": { bgcolor: isDark ? "#18181B" : "#EFF6FF" },
          transition: "all 0.2s ease",
        }}
      >
        {isDark
          ? <Sun size={17} color="#FBBF24" weight="duotone" />
          : <Moon size={17} color="#64748B" weight="duotone" />
        }
      </IconButton>
    </Tooltip>
  );
}

export default function AppHeader() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [collapsed, setCollapsed]         = useState(false);
  const [isMobile, setIsMobile]           = useState(false);
  const [search, setSearch]               = useState("");
  const [avatarAnchor, setAvatarAnchor]   = useState<HTMLElement | null>(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    // Desktop: restore persisted collapsed state
    const stored    = localStorage.getItem("sidebar-collapsed");
    const isCollapsed = stored === "true";
    setCollapsed(isCollapsed);

    const applyDesktopWidth = (c: boolean) =>
      document.documentElement.style.setProperty("--sidebar-w", c ? COLLAPSED_W : EXPANDED_W);

    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);

    const onMqChange = () => {
      setIsMobile(mq.matches);
      if (mq.matches) {
        // Mobile: sidebar doesn't push content
        document.documentElement.style.setProperty("--sidebar-w", "0px");
      } else {
        // Desktop: restore sidebar push width
        const c = localStorage.getItem("sidebar-collapsed") === "true";
        applyDesktopWidth(c);
      }
    };

    onMqChange();
    mq.addEventListener("change", onMqChange);
    return () => mq.removeEventListener("change", onMqChange);
  }, []);

  const toggle = () => {
    if (isMobile) {
      // Mobile: signal the drawer to open/close
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { action: "drawer" } }));
    } else {
      // Desktop: collapse / expand persistent sidebar
      const next = !collapsed;
      setCollapsed(next);
      localStorage.setItem("sidebar-collapsed", String(next));
      document.documentElement.style.setProperty("--sidebar-w", next ? COLLAPSED_W : EXPANDED_W);
      window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { collapsed: next } }));
    }
  };

  const title = PATH_TITLES[pathname] ?? "";

  /* ─── Mobile header ─── */
  if (isMobile) {
    return (
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "64px", zIndex: 60,
          backgroundColor: isDark ? "#0A0A0A" : "#ffffff",
          borderBottom: `1px solid ${isDark ? "#27272A" : "#f1f5f9"}`,
          display: "flex", alignItems: "center",
          padding: "0 16px", gap: "12px",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <button
          onClick={toggle}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 ${
            isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#262626]" : "text-slate-500 hover:text-[#1D4ED8] hover:bg-[#EFF6FF]"
          }`}
          aria-label="Open menu"
        >
          <ListIcon size={20} weight="bold" />
        </button>

        <span className="flex-1" />

        {/* Dark / Light toggle */}
        <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />

        {/* Notifications */}
        <Tooltip title="3 unread notifications">
          <IconButton size="small" sx={{ borderRadius: "10px", "&:hover": { bgcolor: isDark ? "#262626" : "#F1F5F9" } }}>
            <Badge
              badgeContent={3}
              color="error"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.55rem", height: 16, minWidth: 16, padding: "0 4px" } }}
            >
              <Bell size={20} color={isDark ? "#9CA3AF" : "#64748B"} weight="duotone" />
            </Badge>
          </IconButton>
        </Tooltip>

        <Avatar
          src={OWNER_AVATARS["PM SDL"]}
          onClick={e => setAvatarAnchor(e.currentTarget)}
          sx={{
            width: 34, height: 34,
            bgcolor: "#1D4ED8", fontSize: "0.6rem", fontWeight: 800,
            cursor: "pointer", border: `2px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
          }}
        >PM</Avatar>

        <UserMenu anchor={avatarAnchor} onClose={() => setAvatarAnchor(null)} router={router} isDark={isDark} />
      </header>
    );
  }

  /* ─── Desktop header ─── */
  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "72px", zIndex: 60,
        backgroundColor: isDark ? "#0A0A0A" : "#E3ECFC",
        borderBottom: `1px solid ${isDark ? "#27272A" : "rgba(0,0,0,0.04)"}`,
        display: "flex", alignItems: "center",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Left: hamburger + logo — fixed 260px matching expanded sidebar */}
      <div
        style={{
          width: "260px", flexShrink: 0,
          display: "flex", alignItems: "center",
          padding: "0 12px", gap: "12px",
        }}
      >
        <button
          onClick={toggle}
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
            isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#262626]" : "text-slate-500 hover:text-[#1D4ED8] hover:bg-[#EFF6FF]"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ListIcon size={18} weight="bold" />
        </button>
        <img
          src="/logo.png"
          alt="Social DNA Labs"
          style={{ height: "28px", width: "auto", display: "block", flexShrink: 0 }}
        />
      </div>

      {/* Right: title + controls */}
      <div className="flex flex-1 items-center gap-8 px-8 min-w-0">
        <div className="flex-1 min-w-0">
          {/*{title ? (
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <h1 className="text-[18px] font-extrabold text-[#0C2472] leading-none tracking-tight m-0">{title}</h1>
              <span className="text-[11.5px] text-slate-400 font-medium">· {today}</span>
            </div>
          ) : (
            <p className="text-[12px] text-slate-400 font-medium whitespace-nowrap m-0">{today}</p>
          )} */}
        </div>

        {/* Search */}
        <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 w-60 transition-all ${
          isDark
            ? "bg-[#0A0A0A] border-[#27272A] focus-within:border-[#60A5FA] focus-within:border-2 focus-within:shadow-[0_0_0_2px_rgba(96,165,250,0.3)]"
            : "bg-[#f9fbff] border-[#E3ECFC] focus-within:border-[#1D4ED8] focus-within:border-2 focus-within:shadow-[0_0_0_2px_#93C5FD]"
        }`}>
          <MagnifyingGlass size={15} color={isDark ? "#71717A" : "#94A3B8"} weight="duotone" />
          <InputBase
            placeholder="Search leads, deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              flex: 1, fontSize: "0.78rem", color: isDark ? "#D4D4D8" : "#334155",
              "& input::placeholder": { color: isDark ? "#71717A" : "#94A3B8", opacity: 1 },
            }}
          />
          <Tooltip title="⌘K">
            <Command size={13} color={isDark ? "#52525B" : "#CBD5E1"} weight="duotone" />
          </Tooltip>
        </div>

        {/* Dark / Light toggle */}
        <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />

        {/* Notifications */}
        <Tooltip title="3 unread notifications">
          <IconButton size="small" sx={{ borderRadius: "8px", "&:hover": { bgcolor: isDark ? "#262626" : "#EFF6FF" } }}>
            <Badge
              badgeContent={3}
              color="error"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.58rem", height: 15, minWidth: 15, padding: "0 3px" } }}
            >
              <Bell size={20} color={isDark ? "#9CA3AF" : "#64748B"} weight="duotone" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Avatar */}
        <Avatar
          src={OWNER_AVATARS["PM SDL"]}
          onClick={e => setAvatarAnchor(e.currentTarget)}
          sx={{ width: 32, height: 32, bgcolor: "#1D4ED8", fontSize: "0.6rem", fontWeight: 800, cursor: "pointer" }}
          className={`ring-2 ring-transparent transition-all ${isDark ? "hover:ring-[#3F3F46]" : "hover:ring-[#93C5FD]"}`}
        >PM</Avatar>

        <UserMenu anchor={avatarAnchor} onClose={() => setAvatarAnchor(null)} router={router} isDark={isDark} />
      </div>
    </header>
  );
}
