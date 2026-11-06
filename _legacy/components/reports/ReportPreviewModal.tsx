"use client";
import { memo, useMemo } from "react";
import { Node } from "reactflow";
import { ModuleType, getModuleFields, SAMPLE_DATA } from "@/lib/moduleRelationships";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { X, Download } from "@phosphor-icons/react";
import type { ReportFilter } from "./GraphPropertiesPanel";

interface ReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  primaryModule: ModuleType | null;
  nodes: Node[];
  selectedFields: Record<string, string[]>;
  filters: ReportFilter[];
  isDark: boolean;
}

const ReportPreviewModal = memo(
  ({ open, onClose, primaryModule, nodes, selectedFields, filters, isDark }: ReportPreviewModalProps) => {
    const previewData = useMemo(() => {
      if (!primaryModule) return { rows: [], columns: [] };

      const fields = selectedFields[primaryModule] || [];
      const allModuleFields = getModuleFields(primaryModule);
      const sampleRows = SAMPLE_DATA[primaryModule] || [];

      // Apply filters
      const filteredRows = sampleRows.filter((row: any) => {
        return filters.every((filter) => {
          if (filter.module !== primaryModule) return true;
          const value = row[filter.fieldName];
          if (!value) return false;
          switch (filter.operator) {
            case "equals":
              return value === filter.value;
            case "contains":
              return String(value).toLowerCase().includes(filter.value.toLowerCase());
            case "starts with":
              return String(value).toLowerCase().startsWith(filter.value.toLowerCase());
            case "ends with":
              return String(value).toLowerCase().endsWith(filter.value.toLowerCase());
            case "is empty":
              return !value;
            case "is not empty":
              return !!value;
            default:
              return true;
          }
        });
      });

      const columns = fields
        .map((fieldName) => {
          const field = allModuleFields.find((f) => f.name === fieldName);
          return { name: fieldName, label: field?.label || fieldName, type: field?.type || "text" };
        })
        .slice(0, 8); // Limit to 8 columns for display

      return { rows: filteredRows.slice(0, 10), columns }; // Show first 10 rows
    }, [primaryModule, selectedFields, filters]);

    const handleExportPDF = () => {
      // Placeholder for PDF export
      console.log("Export to PDF clicked", { primaryModule, selectedFields, filters });
      alert("PDF export will be implemented - select date range and export format");
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            bgcolor: isDark ? "#1C1C1E" : "#fff",
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)",
          },
        }}
      >
        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <DialogTitle sx={{ p: 0, fontWeight: 700, fontSize: "16px" }}>📊 Report Preview</DialogTitle>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              borderRadius: "9px",
              border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`,
              "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" },
            }}
          >
            <X size={16} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
          {!primaryModule ? (
            <div className={`text-center py-8 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
              <p className="text-[14px]">Select a primary module to preview data</p>
            </div>
          ) : previewData.columns.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
              <p className="text-[14px]">Select fields from {primaryModule} to preview</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info Bar */}
              <div
                className={`px-4 py-3 rounded-lg border flex items-center justify-between gap-2 flex-wrap ${
                  isDark ? "border-[#27272A] bg-[#18181B]" : "border-[#E3ECFC] bg-[#F9FBFF]"
                }`}
              >
                <div className={`text-[13px] ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>
                  <b>{previewData.rows.length}</b> sample rows from <b>{primaryModule}</b> {filters.length > 0 && `(${filters.length} filter${filters.length !== 1 ? "s" : ""} applied)`}
                </div>
                <Button
                  startIcon={<Download size={14} weight="bold" />}
                  onClick={handleExportPDF}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "#1D4ED8",
                    "&:hover": { bgcolor: "#1D4ED8/10" },
                  }}
                >
                  Export PDF
                </Button>
              </div>

              {/* Table */}
              <div className={`border rounded-lg overflow-x-auto ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className={isDark ? "bg-[#18181B]" : "bg-[#F9FBFF]"}>
                      {previewData.columns.map((col) => (
                        <th
                          key={col.name}
                          className={`px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide ${
                            isDark ? "text-[#9CA3AF] border-b border-[#27272A]" : "text-slate-600 border-b border-[#E3ECFC]"
                          }`}
                        >
                          {col.label}
                          <br />
                          <span className={`text-[10px] font-normal ${isDark ? "text-[#52525B]" : "text-slate-400"}`}>
                            [{col.type}]
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row: any, idx: number) => (
                      <tr key={idx} className={`border-b ${isDark ? "hover:bg-[#18181B] border-[#27272A]" : "hover:bg-[#F9FBFF] border-[#E3ECFC]"}`}>
                        {previewData.columns.map((col) => (
                          <td key={col.name} className={`px-4 py-3 text-[13px] ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>
                            {row[col.name] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Note */}
              <div className={`px-4 py-2 rounded-lg text-[12px] ${isDark ? "bg-[#18181B] text-[#9CA3AF]" : "bg-[#F9FBFF] text-slate-500"}`}>
                💡 This is sample data. Final report will include all data matching your filters and date range.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

ReportPreviewModal.displayName = "ReportPreviewModal";

export default ReportPreviewModal;
