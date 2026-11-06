"use client";
import { memo } from "react";
import { Handle, Position } from "reactflow";
import { ModuleType } from "@/lib/moduleRelationships";
import { Trash } from "@phosphor-icons/react";

interface ModuleNodeProps {
  data: {
    label: string;
    module: ModuleType;
    isPrimary: boolean;
    icon: React.ElementType;
    color: string;
    onRemove?: (id: string) => void;
    isDark: boolean;
    isOrphan?: boolean;
  };
  id: string;
  selected: boolean;
}

const ModuleNode = memo(({ data, id, selected }: ModuleNodeProps) => {
  const { label, isPrimary, icon: Icon, color, onRemove, isDark, isOrphan } = data;

  const borderClass = isOrphan
    ? "border-red-500"
    : selected
      ? isDark
        ? "border-[#93C5FD] shadow-lg shadow-blue-500/20"
        : "border-[#1D4ED8] shadow-lg shadow-blue-500/20"
      : isDark
        ? `border-[#27272A] ${isPrimary ? "border-[#F59E0B]" : ""}`
        : `border-[#E3ECFC] ${isPrimary ? "border-[#F59E0B]" : ""}`;

  return (
    <div
      className={`group px-4 py-3 rounded-xl border-2 transition-all ${borderClass} ${
        isDark ? "bg-[#1C1C1E]" : "bg-white"
      } cursor-grab active:cursor-grabbing min-w-[180px]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: color + "20" }}
          >
            <Icon size={14} color={color} weight="duotone" />
          </div>
          <span className={`text-[13px] font-semibold truncate ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
            {label}
          </span>
        </div>

        {/* Remove Button */}
        {!isPrimary && onRemove && (
          <button
            onClick={() => onRemove(id)}
            className={`ml-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              isDark ? "hover:bg-red-500/20" : "hover:bg-red-100"
            }`}
          >
            <Trash size={14} color="#EF4444" weight="fill" />
          </button>
        )}
      </div>

      {/* Primary Badge */}
      {isPrimary && (
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? "text-[#F59E0B]" : "text-[#D97706]"}`}>
          Primary
        </div>
      )}

      {/* Description */}
      {isOrphan ? (
        <div className="text-[11px] font-semibold text-red-500">⚠ No connections</div>
      ) : (
        <div className={`text-[11px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
          Data source module
        </div>
      )}

      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

ModuleNode.displayName = "ModuleNode";

export default ModuleNode;
