// Seed graph configs for the built-in sample reports (r1-r4) shown on the Reports
// listing page. These ids are static demo data with no localStorage-saved config,
// so without a seed the report builder opens to a blank "Untitled Report" canvas.
// This gives Edit a populated module + fields graph that mirrors what the report
// actually displays, matching the shape ModuleGraphBuilder expects (ReportGraphConfig).
import { ModuleType } from "@/lib/moduleRelationships";
import { ReportGraphConfig } from "@/lib/reportGraphSerializer";

export const SAMPLE_REPORT_NAMES: Record<string, string> = {
  r1: "Deal 30",
  r2: "Deal with Stage",
  r3: "Deal List",
  r4: "Account Wise Deal Summary",
  r5: "Account List",
};

interface SampleReportSeed {
  primaryModule: ModuleType;
  fields: string[];
}

const SAMPLE_REPORT_SEEDS: Record<string, SampleReportSeed> = {
  r1: { primaryModule: "Deals", fields: ["dealName", "amount", "stage", "account", "contact", "probability"] },
  r2: { primaryModule: "Deals", fields: ["dealName", "stage", "amount", "closingDate", "probability"] },
  r3: { primaryModule: "Deals", fields: ["dealName", "amount", "stage", "account", "closingDate", "probability", "createdDate"] },
  r4: { primaryModule: "Accounts", fields: ["accountName", "industry", "revenue", "employees", "website"] },
  r5: { primaryModule: "Accounts", fields: ["accountName", "industry", "revenue", "employees", "createdDate"] },
};

export function isSampleReportId(id: string): boolean {
  return id in SAMPLE_REPORT_SEEDS;
}

// Builds a synthetic ReportGraphConfig for a sample report id so the Edit canvas
// opens with the module already added and its fields pre-selected, instead of blank.
export function buildSampleReportConfig(id: string): ReportGraphConfig | null {
  const seed = SAMPLE_REPORT_SEEDS[id];
  if (!seed) return null;
  const nodeId = `${seed.primaryModule}-seed`;
  const now = new Date().toISOString();
  return {
    id,
    name: SAMPLE_REPORT_NAMES[id] ?? "Untitled Report",
    primaryModule: seed.primaryModule,
    nodes: [{ id: nodeId, module: seed.primaryModule, isPrimary: true, position: { x: 100, y: 100 } }],
    edges: [],
    selectedFields: { [seed.primaryModule]: seed.fields },
    filters: [],
    createdAt: now,
    updatedAt: now,
  };
}
