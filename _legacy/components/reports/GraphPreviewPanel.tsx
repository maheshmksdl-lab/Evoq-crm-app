"use client";
import { memo } from "react";
import { Node, Edge } from "reactflow";
import { ModuleType, MODULE_CONFIG, getModuleFields } from "@/lib/moduleRelationships";
import { MODULE_ICON, MODULE_COLOR } from "@/lib/moduleVisuals";
import { ArrowRight } from "@phosphor-icons/react";
import type { ReportFilter } from "./GraphPropertiesPanel";

interface GraphPreviewPanelProps {
  nodes: Node[];
  edges: Edge[];
  selectedFields: Record<string, string[]>;
  filters: ReportFilter[];
  isDark: boolean;
}

const GraphPreviewPanel = memo(
  ({ nodes, edges, selectedFields, filters, isDark }: GraphPreviewPanelProps) => {
    if (nodes.length === 0) {
      return (
        <div
          className={`w-80 border-l flex flex-col items-center justify-center px-6 text-center overflow-hidden ${
            isDark ? "border-[#27272A] bg-[#0A0A0A] text-[#71717A]" : "border-[#E3ECFC] bg-white text-slate-400"
          }`}
        >
          <p className="text-[12px]">Add modules to see the report structure</p>
        </div>
      );
    }

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const allFilters = filters;

    return (
      <div
        className={`w-80 border-l flex flex-col overflow-hidden transition-colors ${
          isDark ? "border-[#27272A] bg-[#0A0A0A]" : "border-[#E3ECFC] bg-white"
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <h2 className={`m-0 text-[13px] font-bold ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
            📊 Preview
          </h2>
          <p className={`text-[11px] mt-1 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
            Report structure & configuration
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Module Flow */}
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
              Module Flow
            </label>
            <div className="space-y-2">
              {nodes.map((node, idx) => {
                const module = node.data.module as ModuleType;
                const Icon = MODULE_ICON[module];
                const color = MODULE_COLOR[module];
                const hasOutgoing = edges.some(e => e.source === node.id);
                const hasIncoming = edges.some(e => e.target === node.id);

                return (
                  <div key={node.id} className="space-y-2">
                    {/* Module Card */}
                    <div
                      className={`px-3 py-2.5 rounded-lg border flex items-center gap-2 ${
                        node.data.isPrimary
                          ? isDark
                            ? "border-[#F59E0B]/50 bg-[#F59E0B]/10"
                            : "border-[#F59E0B]/30 bg-[#FEF3C7]"
                          : isDark
                            ? "border-[#3F3F46] bg-[#18181B]"
                            : "border-[#E3ECFC] bg-[#F9FBFF]"
                      }`}
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "20" }}>
                        <Icon size={12} color={color} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[12px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-900"}`}>
                          {module}
                          {node.data.isPrimary && (
                            <span className={`ml-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-[#F59E0B]" : "text-[#D97706]"}`}>
                              Primary
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
                          {selectedFields[module]?.length ?? 0} of {getModuleFields(module).length} fields
                        </p>
                      </div>
                    </div>

                    {/* Connection Arrow */}
                    {idx < nodes.length - 1 && edges.some(e => e.source === node.id) && (
                      <div className="flex justify-center">
                        <ArrowRight size={14} color={isDark ? "#52525B" : "#CBD5E1"} weight="bold" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Fields */}
          <div>
            <label className={`text-[11px] font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
              Selected Fields
            </label>
            <div className="space-y-2">
              {nodes.map((node) => {
                const module = node.data.module as ModuleType;
                const fields = selectedFields[module] || [];
                const allModuleFields = getModuleFields(module);

                return fields.length > 0 ? (
                  <div key={module} className="space-y-1">
                    <p className={`text-[11px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>
                      {module}
                    </p>
                    <ul className={`text-[11px] space-y-0.5 ml-2 pl-2 border-l-2 ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                      {fields.map((fieldName) => {
                        const field = allModuleFields.find(f => f.name === fieldName);
                        return (
                          <li key={fieldName} className={isDark ? "text-[#A1A1AA]" : "text-slate-600"}>
                            {field?.label ?? fieldName}{" "}
                            <span className={`text-[10px] uppercase font-semibold ${isDark ? "text-[#52525B]" : "text-slate-300"}`}>
                              [{field?.type ?? "unknown"}]
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Filters */}
          {allFilters.length > 0 && (
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-widest mb-2 block ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
                Active Filters
              </label>
              <div className="space-y-1.5">
                {allFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] leading-snug ${
                      isDark ? "bg-[#1D4ED8]/20 text-[#93C5FD]" : "bg-[#1D4ED8]/10 text-[#1D4ED8]"
                    }`}
                  >
                    <b>{filter.module}</b>
                    <br />
                    {filter.fieldName} {filter.operator} "{filter.value}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div
            className={`px-3 py-3 rounded-lg border text-[11px] space-y-1 ${
              isDark ? "border-[#27272A] bg-[#18181B]" : "border-[#E3ECFC] bg-[#F9FBFF]"
            }`}
          >
            <div className={isDark ? "text-[#D4D4D8]" : "text-slate-700"}>
              <b>{nodes.length}</b> module{nodes.length !== 1 ? "s" : ""}
            </div>
            <div className={isDark ? "text-[#D4D4D8]" : "text-slate-700"}>
              <b>{edges.length}</b> connection{edges.length !== 1 ? "s" : ""}
            </div>
            <div className={isDark ? "text-[#D4D4D8]" : "text-slate-700"}>
              <b>{Object.values(selectedFields).reduce((sum, f) => sum + f.length, 0)}</b> field{Object.values(selectedFields).reduce((sum, f) => sum + f.length, 0) !== 1 ? "s" : ""}
            </div>
            {allFilters.length > 0 && (
              <div className={isDark ? "text-[#D4D4D8]" : "text-slate-700"}>
                <b>{allFilters.length}</b> filter{allFilters.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

GraphPreviewPanel.displayName = "GraphPreviewPanel";

export default GraphPreviewPanel;
