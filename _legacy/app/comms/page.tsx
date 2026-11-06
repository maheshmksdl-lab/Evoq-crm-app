"use client";
import { ChatTeardropText } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

export default function CustomerCommsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`sidebar-content flex-1 flex items-center justify-center min-h-screen transition-colors duration-300 ${isDark ? "bg-[#000000]" : "bg-[#EFF6FF]"}`}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-[#18181B]" : "bg-white"}`}>
          <ChatTeardropText size={26} weight="duotone" color={isDark ? "#60A5FA" : "#1D4ED8"} />
        </div>
        <h1 className={`m-0 text-[17px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>Customer Comms</h1>
        <p className={`text-[13px] max-w-[280px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>This section is coming soon.</p>
      </div>
    </div>
  );
}
