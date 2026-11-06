import { Node, Edge } from "reactflow";
import { ModuleType } from "@/lib/moduleRelationships";
import type { ReportFilter } from "@/components/reports/GraphPropertiesPanel";

export interface ReportGraphConfig {
  id: string;
  name: string;
  primaryModule: ModuleType;
  nodes: { id: string; module: ModuleType; isPrimary: boolean; position: { x: number; y: number } }[];
  edges: { id: string; source: string; target: string }[];
  selectedFields: Record<string, string[]>;
  filters: ReportFilter[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_PREFIX = "report-config-";
const INDEX_KEY = "report-config-index";

export function serializeGraph(
  id: string,
  name: string,
  nodes: Node[],
  edges: Edge[],
  primaryModule: ModuleType,
  selectedFields: Record<string, string[]>,
  filters: ReportFilter[],
  existingCreatedAt?: string
): ReportGraphConfig {
  return {
    id,
    name,
    primaryModule,
    nodes: nodes.map((n) => ({
      id: n.id,
      module: n.data.module,
      isPrimary: !!n.data.isPrimary,
      position: n.position,
    })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    selectedFields,
    filters,
    createdAt: existingCreatedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function saveReportConfig(config: ReportGraphConfig): void {
  localStorage.setItem(`${STORAGE_PREFIX}${config.id}`, JSON.stringify(config));

  const raw = localStorage.getItem(INDEX_KEY);
  const index: string[] = raw ? JSON.parse(raw) : [];
  if (!index.includes(config.id)) {
    localStorage.setItem(INDEX_KEY, JSON.stringify([...index, config.id]));
  }
}

export function loadReportConfig(id: string): ReportGraphConfig | null {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReportGraphConfig;
  } catch {
    return null;
  }
}
