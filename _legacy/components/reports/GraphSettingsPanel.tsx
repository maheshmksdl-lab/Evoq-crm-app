"use client";
import { memo } from "react";
import { Node } from "reactflow";
import { ModuleType, MODULE_CONFIG } from "@/lib/moduleRelationships";
import { MODULE_ICON, MODULE_COLOR } from "@/lib/moduleVisuals";
import { GraphValidationResult } from "@/lib/reportGraphValidator";
import { Plus, Warning, CheckCircle, CaretDown } from "@phosphor-icons/react";
import Button from "@mui/material/Button";

interface GraphSettingsPanelProps {
  primaryModule: ModuleType | null;
  nodes: Node[];
  onSetPrimaryModule: (module: ModuleType) => void;
  moduleCount: number;
  onAddModule: () => void;
  isDark: boolean;
  validation: GraphValidationResult;
}

const GraphSettingsPanel = memo(
  ({ primaryModule, nodes, onSetPrimaryModule, moduleCount, onAddModule, isDark, validation }: GraphSettingsPanelProps) => {
    const PrimaryIcon = primaryModule ? MODULE_ICON[primaryModule] : null;
    const primaryColor = primaryModule ? MODULE_COLOR[primaryModule] : null;
    const primaryLabel = primaryModule ? MODULE_CONFIG[primaryModule].label : null;

    // Distinct modules currently on the canvas, available to re-designate as primary
    const availableModules = Array.from(new Map(nodes.map((n) => [n.data.module as ModuleType, n])).keys());

    return (
      <div
        className={`w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r flex flex-col max-h-[40vh] md:max-h-none overflow-hidden transition-colors ${
          isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-white"
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <h2 className={`m-0 text-[14px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
            Report Builder
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {/* Primary Module Section */}
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
              Primary Module
            </label>
            {PrimaryIcon && primaryColor ? (
              <div
                className={`relative px-3 py-2 rounded-lg border flex items-center gap-2 ${
                  isDark ? "border-[#F59E0B] bg-[#F59E0B]/10" : "border-[#F59E0B] bg-[#FEF3C7]"
                }`}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor + "20" }}
                >
                  <PrimaryIcon size={12} color={primaryColor} weight="duotone" />
                </div>
                <span className={`text-[12px] font-semibold flex-1 ${isDark ? "text-[#FFFFFF]" : "text-slate-900"}`}>
                  {primaryLabel}
                </span>
                {availableModules.length > 1 && (
                  <CaretDown size={12} weight="bold" color={isDark ? "#FCD34D" : "#92400E"} />
                )}
                {availableModules.length > 1 && (
                  <select
                    value={primaryModule ?? ""}
                    onChange={(e) => onSetPrimaryModule(e.target.value as ModuleType)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Change primary module"
                  >
                    {availableModules.map((m) => (
                      <option key={m} value={m}>
                        {MODULE_CONFIG[m].label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className={`text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
                No module selected
              </div>
            )}
            {availableModules.length > 1 && (
              <p className={`text-[10px] mt-1.5 ${isDark ? "text-[#71717A]" : "text-slate-400"}`}>
                Click to switch which module is primary
              </p>
            )}
          </div>

          {/* Modules Added */}
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
              Modules Connected ({moduleCount})
            </label>
            <div
              className={`px-3 py-2 rounded-lg text-[12px] text-center font-medium ${
                moduleCount > 0
                  ? isDark
                    ? "bg-[#1D4ED8]/20 text-[#93C5FD]"
                    : "bg-[#1D4ED8]/10 text-[#1D4ED8]"
                  : isDark
                    ? "bg-[#27272A] text-[#9CA3AF]"
                    : "bg-[#EFF6FF] text-slate-500"
              }`}
            >
              {moduleCount === 0 ? "Add related modules" : `${moduleCount} connected`}
            </div>
          </div>

          {/* Validation Status */}
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
              Status
            </label>
            <div
              className={`px-3 py-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 ${
                validation.isValid
                  ? isDark
                    ? "bg-[#10B981]/20 text-[#6EE7B7]"
                    : "bg-[#10B981]/10 text-[#059669]"
                  : isDark
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {validation.isValid ? (
                <>
                  <CheckCircle size={14} weight="fill" /> Ready
                </>
              ) : (
                <>
                  <Warning size={14} weight="fill" /> {validation.errors.length} issue
                  {validation.errors.length !== 1 ? "s" : ""}
                </>
              )}
            </div>

            {/* Error List */}
            {!validation.isValid && (
              <div className="mt-2 space-y-1.5">
                {validation.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] leading-snug ${
                      isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {err.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Module Button */}
        <div className={`px-4 py-4 border-t ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <Button
            fullWidth
            onClick={onAddModule}
            variant="contained"
            startIcon={<Plus size={16} weight="bold" />}
            sx={{
              bgcolor: "#1D4ED8",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13px",
              borderRadius: "9px",
              boxShadow: "0 1px 8px #1D4ED833",
              "&:hover": { bgcolor: "#2563EB" },
            }}
          >
            Add Module
          </Button>
        </div>
      </div>
    );
  }
);

GraphSettingsPanel.displayName = "GraphSettingsPanel";

export default GraphSettingsPanel;
