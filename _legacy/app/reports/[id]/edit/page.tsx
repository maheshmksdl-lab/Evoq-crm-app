"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import ModuleGraphBuilder, { ReportFieldsConfig } from "@/components/reports/ModuleGraphBuilder";
import ReportPreviewModal from "@/components/reports/ReportPreviewModal";
import { ModuleType } from "@/lib/moduleRelationships";
import { GraphValidationResult } from "@/lib/reportGraphValidator";
import { serializeGraph, saveReportConfig, loadReportConfig, ReportGraphConfig } from "@/lib/reportGraphSerializer";
import { buildSampleReportConfig } from "@/lib/sampleReportSeeds";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Node, Edge } from "reactflow";
import { CaretLeft, Check, Eye } from "@phosphor-icons/react";

export default function ReportEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isNewReport = id === "new";
  // Built-in sample reports (r1, r2, ...) are static demo data, not editable
  // report configs — never load or save over their id, always fork a copy.
  const isStaticSampleId = /^r\d+$/.test(id);

  const [existingConfig, setExistingConfig] = useState<ReportGraphConfig | null | undefined>(undefined);
  const [reportName, setReportName] = useState(isNewReport ? "Untitled Report" : "");
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphEdges, setGraphEdges] = useState<Edge[]>([]);
  const [primaryModule, setPrimaryModule] = useState<ModuleType | null>(null);
  const [fieldsConfig, setFieldsConfig] = useState<ReportFieldsConfig>({ selectedFields: {}, filters: [] });
  const [validation, setValidation] = useState<GraphValidationResult>({
    isValid: false,
    errors: [],
    orphanNodeIds: [],
    invalidEdgeIds: [],
    circularNodeIds: [],
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load the saved report config (if editing an existing custom report) before the builder mounts
  useEffect(() => {
    if (isNewReport) {
      setExistingConfig(null);
      setReportName("Untitled Report");
      return;
    }
    if (isStaticSampleId) {
      // Built-in sample reports have no saved config — seed the canvas with the
      // module/fields the report actually shows instead of opening it blank.
      const seeded = buildSampleReportConfig(id);
      setExistingConfig(seeded);
      setReportName(seeded?.name ?? "Untitled Report");
      return;
    }
    const config = loadReportConfig(id);
    setExistingConfig(config);
    if (config) {
      setReportName(config.name);
    } else {
      setReportName("Untitled Report");
    }
  }, [id, isNewReport, isStaticSampleId]);

  const configReady = existingConfig !== undefined;

  const handleGraphChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setGraphNodes(nodes);
    setGraphEdges(edges);
  }, []);

  const handlePrimaryModuleChange = useCallback((module: ModuleType | null) => {
    setPrimaryModule(module);
  }, []);

  const totalFieldsSelected = Object.values(fieldsConfig.selectedFields).reduce((sum, f) => sum + f.length, 0);
  const canProceed = validation.isValid && totalFieldsSelected > 0 && reportName.trim().length > 0;
  const blockReason = !validation.isValid
    ? validation.errors[0]?.message
    : totalFieldsSelected === 0
      ? "Select at least one field to include in the report"
      : reportName.trim().length === 0
        ? "Give this report a name"
        : undefined;

  const handleSave = () => {
    if (!canProceed || !primaryModule) return;

    setSaving(true);
    const reportId = isNewReport || isStaticSampleId ? `report-${Date.now()}` : id;
    const config = serializeGraph(
      reportId,
      reportName.trim(),
      graphNodes,
      graphEdges,
      primaryModule,
      fieldsConfig.selectedFields,
      fieldsConfig.filters,
      existingConfig?.createdAt
    );
    saveReportConfig(config);

    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      router.push("/reports");
    }, 900);
  };

  return (
    <div className={`sidebar-content flex h-screen flex-col font-sans transition-colors duration-300 ${isDark ? "bg-[#000000]" : "bg-[#EFF6FF]"}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? "hover:bg-[#27272A]" : "hover:bg-[#F0F9FF]"}`}
            >
              <CaretLeft size={18} weight="duotone" color={isDark ? "#9CA3AF" : "#64748B"} />
            </button>
            <div className="min-w-0 flex-1">
              <input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Untitled Report"
                className={`w-full text-base sm:text-lg md:text-[20px] font-bold bg-transparent outline-none border-b-2 border-transparent focus:border-[#1D4ED8] transition-colors truncate ${
                  isDark ? "text-[#F4F4F5] placeholder-[#52525B]" : "text-slate-900 placeholder-slate-300"
                }`}
              />
              <p className={`text-[11px] sm:text-[12px] ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
                {isNewReport ? "Create a new report" : "Edit report"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Tooltip title={!canProceed ? "Configure modules and fields first" : ""}>
              <span>
                <Button
                  onClick={() => setPreviewOpen(true)}
                  disabled={!canProceed}
                  startIcon={<Eye size={16} weight="duotone" />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: !canProceed ? (isDark ? "#52525B" : "#D1D5DB") : isDark ? "#D4D4D8" : "#0C2472",
                    "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" },
                    "&.Mui-disabled": {
                      color: isDark ? "#52525B" : "#D1D5DB",
                    },
                  }}
                >
                  Preview
                </Button>
              </span>
            </Tooltip>
            <Button
              onClick={() => router.back()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                color: isDark ? "#D4D4D8" : "#0C2472",
                "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" },
              }}
            >
              Cancel
            </Button>
            <Tooltip title={!canProceed ? blockReason ?? "" : ""}>
              <span>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  disabled={!canProceed || saving}
                  startIcon={<Check size={16} weight="bold" />}
                  sx={{
                    bgcolor: !canProceed ? "#9CA3AF" : "#1D4ED8",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    borderRadius: "9px",
                    boxShadow: "0 1px 8px #1D4ED833",
                    "&:hover": { bgcolor: !canProceed ? "#9CA3AF" : "#2563EB" },
                  }}
                >
                  {saving ? "Saving…" : "Save Report"}
                </Button>
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {configReady && (
          <ModuleGraphBuilder
            isDark={isDark}
            initialConfig={existingConfig}
            onGraphChange={handleGraphChange}
            onPrimaryModuleChange={handlePrimaryModuleChange}
            onValidationChange={setValidation}
            onFieldsConfigChange={setFieldsConfig}
          />
        )}
      </div>

      {/* Preview Modal */}
      <ReportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        primaryModule={primaryModule}
        nodes={graphNodes}
        selectedFields={fieldsConfig.selectedFields}
        filters={fieldsConfig.filters}
        isDark={isDark}
      />

      {/* Save Success Toast */}
      <Snackbar open={saveSuccess} autoHideDuration={900}>
        <Alert severity="success" variant="filled" sx={{ fontWeight: 600, borderRadius: "9px" }}>
          Report saved — redirecting to Reports…
        </Alert>
      </Snackbar>
    </div>
  );
}
