"use client";
import { useState, useRef, useEffect } from "react";
import Badge from "@mui/material/Badge";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { MagnifyingGlass, Bell, Command, Sun, Moon, List, User, SignOut } from "@phosphor-icons/react";
import { OWNER_AVATARS } from "@/lib/avatars";
import { useTheme } from "@/components/ThemeContext";
import { useSidebar } from "@/components/SidebarContext";
import { useRouter } from "next/navigation";

export default function TopBar({ title }: { title?: string }) {
  const [search,      setSearch]      = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const { openMobile } = useSidebar();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    document.cookie = "crm_auth=; path=/; max-age=0";
    localStorage.removeItem("crm_auth");
    router.push("/login");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className={`sticky top-0 z-40 border-b px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 lg:py-6 h-auto flex items-center gap-2 sm:gap-3 lg:gap-8 transition-colors duration-300 ${isDark ? "bg-[#0A0A0A] border-[#27272A]" : "bg-[#E3ECFC] border-[#E3ECFC]"}`}>

      {/* Mobile hamburger - hidden on desktop */}
      <button
        onClick={openMobile}
        className={`lg:hidden flex-shrink-0 w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center rounded-lg transition-all ${isDark ? "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#262626]" : "text-slate-500 hover:bg-[#EFF6FF]"}`}
        aria-label="Open navigation"
      >
        <List size={18} weight="bold" />
      </button>

      {/* Left - page title / date */}
      <div className="flex-1 min-w-0">
        {title ? (
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <h1 className={`text-base sm:text-h1 tracking-tight m-0 ${isDark ? "text-white" : "text-[#0C2472]"}`}>{title}</h1>
            <span className="hidden sm:inline text-[10px] sm:text-caption text-slate-400">&middot; {today}</span>
          </div>
        ) : (
          <p className="m-0 hidden sm:block text-caption text-slate-400 whitespace-nowrap">{today}</p>
        )}
      </div>

      {/* Search - hidden on mobile, visible md+ */}
      <div className={`hidden md:flex items-center gap-2 border rounded-xl px-2.5 sm:px-3 py-1.5 w-56 lg:w-60 group transition-all ${isDark ? "bg-[#0A0A0A] border-[#27272A] focus-within:border-[#D4D4D8] focus-within:border-2 focus-within:shadow-[0_0_0_2px_rgba(212,212,216,0.2)]" : "bg-[#f9fbff] border-[#E3ECFC] focus-within:border-[#1D4ED8] focus-within:border-2 focus-within:shadow-[0_0_0_2px_#4A7AE8]"}`}>
        <MagnifyingGlass size={14} color={isDark ? "#9CA3AF" : "#737373"} weight="duotone" />
        <InputBase
          placeholder="Search leads, deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            fontSize: "0.8rem",
            color: isDark ? "#D4D4D8" : "#334155",
            "& input::placeholder": { color: "#94A3B8", opacity: 1 },
          }}
        />
        <Tooltip title="Cmd+K">
          <Command size={12} color="#E2E8F0" weight="duotone" />
        </Tooltip>
      </div>

      {/* Dark / Light toggle */}
      <Tooltip title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}>
        <IconButton
          onClick={toggle}
          size="small"
          sx={{
            borderRadius: "8px",
            border: `1.5px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
            bgcolor: isDark ? "#0A0A0A" : "#f9fbff",
            "&:hover": { bgcolor: isDark ? "#18181B" : "#EFF6FF" },
            transition: "all 0.2s ease",
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            padding: 0.5,
          }}
        >
          {isDark
            ? <Sun size={16} color="#FBBF24" weight="duotone" />
            : <Moon size={16} color="#64748B" weight="duotone" />
          }
        </IconButton>
      </Tooltip>

      {/* Notifications - hidden on mobile */}
      <Tooltip title="3 unread notifications">
        <IconButton size="small" sx={{ borderRadius: "8px", "&:hover": { bgcolor: isDark ? "#262626" : "#EFF6FF" }, display: { xs: "none", sm: "inline-flex" } }}>
          <Badge
            badgeContent={3}
            color="error"
            sx={{ "& .MuiBadge-badge": { fontSize: "0.58rem", height: 15, minWidth: 15, padding: "0 3px" } }}
          >
            <Bell size={18} color={isDark ? "#9CA3AF" : "#64748B"} weight="duotone" />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Avatar + dropdown */}
      <div ref={profileRef} className="relative flex-shrink-0">
        <Avatar
          src={OWNER_AVATARS["PM SDL"]}
          onClick={() => setProfileOpen(p => !p)}
          sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: isDark ? "#27272A" : "#E3ECFC", fontSize: "0.55rem", fontWeight: 800, cursor: "pointer" }}
          className={`ring-2 transition-all ${profileOpen ? (isDark ? "ring-[#D4D4D8]" : "ring-[#4A7AE8]") : "ring-transparent"} ${isDark ? "hover:ring-[#D4D4D8]" : "hover:ring-[#4A7AE8]"}`}
        >
          PM
        </Avatar>

        {profileOpen && (
          <div
            className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-2xl overflow-hidden z-50"
            style={{
              background: isDark ? "#18181B" : "white",
              border: `1px solid ${isDark ? "#27272A" : "#E3ECFC"}`,
              boxShadow: isDark
                ? "0 16px 40px rgba(0,0,0,0.6)"
                : "0 16px 40px rgba(29,78,216,0.12), 0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Profile info */}
            <div className={`px-4 py-3 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
              <p className={`m-0 text-label ${isDark ? "text-[#F4F4F5]" : "text-slate-800"}`}>PM SDL</p>
              <p className={`m-0 text-caption mt-0.5 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>Super Admin</p>
            </div>

            {/* My Account */}
            <button
              onClick={() => { setProfileOpen(false); router.push("/settings"); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-button transition-colors ${
                isDark ? "text-[#D4D4D8] hover:bg-[#27272A]" : "text-slate-700 hover:bg-[#EFF6FF]"
              }`}
            >
              <User size={15} weight="duotone" className={isDark ? "text-[#71717A]" : "text-slate-400"} />
              My Account
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-button transition-colors border-t ${
                isDark
                  ? "text-red-400 hover:bg-[#27272A] border-[#27272A]"
                  : "text-red-500 hover:bg-red-50 border-[#E3ECFC]"
              }`}
            >
              <SignOut size={15} weight="duotone" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
