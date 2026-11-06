"use client";
import { useRouter } from "next/navigation";
import { CalendarBlank, User, LinkSimple, Tag } from "@phosphor-icons/react";
import { useTheme } from "@/components/ThemeContext";

type TaskStatus   = "To-Do" | "In Progress" | "Backlog" | "Completed" | "";
type TaskPriority = "High" | "Medium" | "Low" | "";
type TaskType     = "Task" | "Quote" | "Call" | "Email" | "";

interface TaskRecord {
  id: number;
  type: TaskType;
  subject: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  contact: string;
  relatedTo: string;
  taskOwner: string;
}

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; bgDark: string; textDark: string; dotDark: string }> = {
  "To-Do":       { bg: "#EFF6FF", text: "#0C2472", dot: "#3B82F6", bgDark: "rgba(113,113,122,0.15)", textDark: "#A1A1AA", dotDark: "#71717A" },
  "In Progress": { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", bgDark: "rgba(245,158,11,0.15)",  textDark: "#FCD34D", dotDark: "#F59E0B" },
  "Backlog":     { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8", bgDark: "rgba(148,163,184,0.15)", textDark: "#94A3B8", dotDark: "#64748B" },
  "Completed":   { bg: "#DCFCE7", text: "#166534", dot: "#10B981", bgDark: "rgba(16,185,129,0.15)",  textDark: "#34D399", dotDark: "#10B981" },
};

const PRIORITY_CFG: Record<string, { bg: string; text: string; bgDark: string; textDark: string }> = {
  "High":   { bg: "#FEF2F2", text: "#DC2626", bgDark: "rgba(239,68,68,0.15)",  textDark: "#F87171" },
  "Medium": { bg: "#FEF3C7", text: "#D97706", bgDark: "rgba(245,158,11,0.15)", textDark: "#FBBF24" },
  "Low":    { bg: "#F0FDF4", text: "#16A34A", bgDark: "rgba(16,185,129,0.15)", textDark: "#34D399" },
};

const PASTELS = [
  { fill: "#D6E4F9", deep: "#2F6FED" },
  { fill: "#D0E5E0", deep: "#2E9E7B" },
  { fill: "#FAE3D0", deep: "#E0883F" },
  { fill: "#F5D9E1", deep: "#DB5E8C" },
  { fill: "#D2DFF0", deep: "#5B6CB5" },
];

const DARK_PASTELS = [
  { fill: "#1E2235", deep: "#4F8EF7" },
  { fill: "#1A2820", deep: "#34D399" },
  { fill: "#2A1F18", deep: "#F59E0B" },
  { fill: "#28181F", deep: "#F472B6" },
  { fill: "#1B1E2D", deep: "#818CF8" },
];

interface Props { tasks: TaskRecord[] }

export default function TaskGridView({ tasks }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (tasks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${isDark ? "text-[#9CA3AF]" : "text-slate-400"}`}>
        <p className="font-heading text-sm font-semibold">No tasks found</p>
        <p className="text-xs mt-1">Adjust filters or create a new task</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {tasks.map((task, i) => {
        const colored = i % 2 === 0;
        const pal     = isDark ? DARK_PASTELS : PASTELS;
        const baseT   = isDark ? { fill: "#1C1C1E", deep: "#4F8EF7" } : { fill: "#f9fbff", deep: "#3B82F6" };
        const cardT   = colored ? pal[(i / 2) % pal.length] : baseT;
        const statusCfg   = task.status ? STATUS_CFG[task.status] : null;
        const priorityCfg = task.priority ? PRIORITY_CFG[task.priority] : null;

        return (
          <div
            key={task.id}
            onClick={() => router.push(`/tasks/${task.id}`)}
            className={`rounded-xl sm:rounded-2xl border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group overflow-hidden ${
              isDark ? "border-[#27272A] hover:border-[#3F3F46]" : colored ? "border-white/50" : "border-[#E3ECFC]"
            }`}
            style={{
              backgroundColor: cardT.fill,
              boxShadow: isDark ? "0 6px 24px rgba(0,0,0,0.3)" : "0 6px 24px rgba(15,23,42,0.06)",
            }}
          >
            <div className="p-3 sm:p-4">
              {/* Type + Subject */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  {task.type && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
                      <Tag size={10} weight="duotone" />
                      {task.type}
                    </span>
                  )}
                  <h3 className={`m-0 font-heading text-[14px] font-bold truncate leading-tight ${isDark ? "text-[#D4D4D8]" : "text-[#0C2472]"}`}>
                    {task.subject}
                  </h3>
                </div>
              </div>

              {/* Status + Priority */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {statusCfg && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isDark ? statusCfg.bgDark : statusCfg.bg, color: isDark ? statusCfg.textDark : statusCfg.text }}>
                    <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: isDark ? statusCfg.dotDark : statusCfg.dot }} />
                    {task.status}
                  </span>
                )}
                {priorityCfg && (
                  <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isDark ? priorityCfg.bgDark : priorityCfg.bg, color: isDark ? priorityCfg.textDark : priorityCfg.text }}>
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Due date + Contact + Related To */}
              <div className="space-y-1.5">
                {task.dueDate && (
                  <div className={`flex items-center gap-1.5 text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>
                    <CalendarBlank size={11} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate">Due {task.dueDate}</span>
                  </div>
                )}
                {task.contact && (
                  <div className={`flex items-center gap-1.5 text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>
                    <User size={11} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate">{task.contact}</span>
                  </div>
                )}
                {task.relatedTo && (
                  <div className={`flex items-center gap-1.5 text-[12px] ${isDark ? "text-[#71717A]" : "text-slate-600"}`}>
                    <LinkSimple size={11} color={cardT.deep} weight="duotone" className="flex-shrink-0" />
                    <span className="truncate">{task.relatedTo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer: owner */}
            <div className={`flex items-center px-3 sm:px-4 py-2.5 border-t ${isDark ? "border-[#27272A] bg-black/20" : "border-white/50 bg-[#f9fbff]/30"}`}>
              <span className={`text-[12px] truncate ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>{task.taskOwner}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
