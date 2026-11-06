"use client";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { ModuleType, MODULE_CONFIG, getModuleFields } from "@/lib/moduleRelationships";
import { MODULE_ICON, MODULE_COLOR } from "@/lib/moduleVisuals";
import { validateGraph, isValidConnection, GraphValidationResult } from "@/lib/reportGraphValidator";
import { ReportGraphConfig } from "@/lib/reportGraphSerializer";
import ModuleNode from "./ModuleNode";
import EdgeComponent from "./EdgeComponent";
import GraphSettingsPanel from "./GraphSettingsPanel";
import GraphPropertiesPanel, { ReportFilter } from "./GraphPropertiesPanel";
import "@/styles/graph-builder.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { X } from "@phosphor-icons/react";
import IconButton from "@mui/material/IconButton";

export interface ReportFieldsConfig {
  selectedFields: Record<string, string[]>; // keyed by ModuleType
  filters: ReportFilter[];
}

interface ModuleGraphBuilderProps {
  isDark: boolean;
  initialConfig?: ReportGraphConfig | null;
  onGraphChange?: (nodes: Node[], edges: Edge[]) => void;
  onPrimaryModuleChange?: (module: ModuleType | null) => void;
  onValidationChange?: (validation: GraphValidationResult) => void;
  onFieldsConfigChange?: (config: ReportFieldsConfig) => void;
}

const nodeTypes = { module: ModuleNode };
const edgeTypes = { default: EdgeComponent };

function GraphCanvas({
  isDark,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
}: {
  isDark: boolean;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (conn: Connection) => void;
  onNodeClick: NodeMouseHandler;
  onPaneClick: () => void;
}) {
  return (
    <div className="h-[55vh] md:h-auto flex-shrink-0 md:flex-1 min-h-0 flex flex-col overflow-hidden relative">
      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className={`text-center max-w-sm ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
            <div className={`text-[32px] mb-3 ${isDark ? "text-[#52525B]" : "text-slate-300"}`}>📊</div>
            <h3 className={`text-[16px] font-semibold mb-1 ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>
              Start by Adding a Module
            </h3>
            <p className="text-[13px]">Select a primary data source to begin building your report</p>
          </div>
        </div>
      )}

      {/* ReactFlow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        style={{ width: "100%", height: "100%" }}
        className={isDark ? "dark-theme" : "light-theme"}
      >
        <Background color={isDark ? "#27272A" : "#E3ECFC"} />
        <Controls />
        {nodes.length > 0 && <MiniMap style={{ background: isDark ? "#111113" : "#f9fbff" }} />}
      </ReactFlow>
    </div>
  );
}

function GraphBuilderContent({
  isDark,
  initialConfig,
  onGraphChange,
  onPrimaryModuleChange,
  onValidationChange,
  onFieldsConfigChange,
}: ModuleGraphBuilderProps) {
  const buildInitialNodes = (): Node[] => {
    if (!initialConfig) return [];
    return initialConfig.nodes.map((n) => ({
      id: n.id,
      type: "module",
      position: n.position,
      data: {
        label: MODULE_CONFIG[n.module].label,
        module: n.module,
        isPrimary: n.isPrimary,
        icon: MODULE_ICON[n.module],
        color: MODULE_COLOR[n.module],
        isDark,
        isOrphan: false,
      },
    }));
  };
  const buildInitialEdges = (): Edge[] => {
    if (!initialConfig) return [];
    return initialConfig.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "default",
      data: { isValid: true },
    }));
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(buildInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildInitialEdges());
  const [primaryModule, setPrimaryModule] = useState<ModuleType | null>(initialConfig?.primaryModule ?? null);
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(initialConfig?.primaryModule ?? null);
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>(initialConfig?.selectedFields ?? {});
  const [filters, setFilters] = useState<ReportFilter[]>(initialConfig?.filters ?? []);

  const validation = useMemo(
    () => validateGraph(nodes, edges, primaryModule),
    [nodes, edges, primaryModule]
  );

  // Apply orphan/invalid visual state onto nodes & edges without causing infinite loops
  useEffect(() => {
    setNodes((nds) => {
      let changed = false;
      const next = nds.map((n) => {
        const isOrphan = validation.orphanNodeIds.includes(n.id);
        if (n.data.isOrphan === isOrphan) return n;
        changed = true;
        return { ...n, data: { ...n.data, isOrphan } };
      });
      return changed ? next : nds;
    });
    setEdges((eds) => {
      let changed = false;
      const next = eds.map((e) => {
        const isValid = !validation.invalidEdgeIds.includes(e.id);
        if (e.data?.isValid === isValid) return e;
        changed = true;
        return { ...e, data: { ...e.data, isValid } };
      });
      return changed ? next : eds;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.orphanNodeIds.join(","), validation.invalidEdgeIds.join(",")]);

  // Guard against propagating no-op churn (e.g. ReactFlow re-measuring node
  // dimensions internally, which changes node/edge object references without
  // changing anything we actually care about) — this can otherwise cascade
  // into an infinite render loop between this component and its parent.
  const graphSignatureRef = useRef<string>("");
  useEffect(() => {
    const signature = JSON.stringify({
      nodes: nodes.map((n) => ({ id: n.id, position: n.position, module: n.data.module, isPrimary: n.data.isPrimary, isOrphan: n.data.isOrphan })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, isValid: e.data?.isValid })),
    });
    if (signature === graphSignatureRef.current) return;
    graphSignatureRef.current = signature;
    onGraphChange?.(nodes, edges);
  }, [nodes, edges, onGraphChange]);

  useEffect(() => {
    onPrimaryModuleChange?.(primaryModule);
  }, [primaryModule, onPrimaryModuleChange]);

  const validationSignatureRef = useRef<string>("");
  useEffect(() => {
    const signature = JSON.stringify(validation);
    if (signature === validationSignatureRef.current) return;
    validationSignatureRef.current = signature;
    onValidationChange?.(validation);
  }, [validation, onValidationChange]);

  useEffect(() => {
    onFieldsConfigChange?.({ selectedFields, filters });
  }, [selectedFields, filters, onFieldsConfigChange]);

  // Handle new connection — block invalid connections outright
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (sourceNode && targetNode) {
        const valid = isValidConnection(sourceNode.data.module, targetNode.data.module);
        if (!valid) {
          // Still add it so the user gets visible feedback (red dashed line)
          setEdges((eds) => addEdge({ ...connection, type: "default", data: { isValid: false } }, eds));
          return;
        }
      }
      setEdges((eds) => addEdge({ ...connection, type: "default", data: { isValid: true } }, eds));
    },
    [nodes, setEdges]
  );

  // Remove a node
  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const removed = nds.find((n) => n.id === nodeId);
        setSelectedModule((current) => (removed && current === removed.data.module ? null : current));
        if (removed) {
          setSelectedFields((prev) => {
            const next = { ...prev };
            delete next[removed.data.module];
            return next;
          });
          setFilters((prev) => prev.filter((f) => f.module !== removed.data.module));
        }
        return nds.filter((n) => n.id !== nodeId);
      });
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Re-designate which added module acts as the primary/root module
  const handleSetPrimaryModule = useCallback(
    (module: ModuleType) => {
      setPrimaryModule(module);
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isPrimary: n.data.module === module } })));
    },
    [setNodes]
  );

  // Nodes restored from a saved config are built before handleRemoveNode exists — patch it in
  useEffect(() => {
    setNodes((nds) => {
      let changed = false;
      const next = nds.map((n) => {
        if (n.data.onRemove === handleRemoveNode) return n;
        changed = true;
        return { ...n, data: { ...n.data, onRemove: handleRemoveNode } };
      });
      return changed ? next : nds;
    });
  }, [handleRemoveNode, setNodes]);

  // Add a new module node
  const handleAddModule = (module: ModuleType) => {
    const newNodeId = `${module}-${Date.now()}`;
    const moduleConfig = MODULE_CONFIG[module];

    const nodeCount = nodes.length;
    const xOffset = (nodeCount % 3) * 250;
    const yOffset = Math.floor(nodeCount / 3) * 200;
    const isFirstNode = nodes.length === 0;

    const newNode: Node = {
      id: newNodeId,
      type: "module",
      position: { x: 100 + xOffset, y: 100 + yOffset },
      data: {
        label: moduleConfig.label,
        module,
        isPrimary: isFirstNode,
        icon: MODULE_ICON[module],
        color: MODULE_COLOR[module],
        isDark,
        isOrphan: false,
        onRemove: handleRemoveNode,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (isFirstNode) {
      setPrimaryModule(module);
    }

    // Default-select the first 3 fields for this module and focus it in the properties panel
    setSelectedFields((prev) => ({
      ...prev,
      [module]: getModuleFields(module).slice(0, 3).map((f) => f.name),
    }));
    setSelectedModule(module);

    setAddModuleOpen(false);
  };

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedModule(node.data.module);
  }, []);

  const handleToggleField = useCallback((fieldName: string) => {
    if (!selectedModule) return;
    setSelectedFields((prev) => {
      const current = prev[selectedModule] ?? [];
      const next = current.includes(fieldName)
        ? current.filter((f) => f !== fieldName)
        : [...current, fieldName];
      return { ...prev, [selectedModule]: next };
    });
  }, [selectedModule]);

  const handleAddFilter = useCallback((filter: Omit<ReportFilter, "id">) => {
    setFilters((prev) => [...prev, { ...filter, id: `filter-${Date.now()}` }]);
  }, []);

  const handleRemoveFilter = useCallback((id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className={`flex flex-col md:flex-row h-full min-h-0 overflow-y-auto md:overflow-hidden ${isDark ? "bg-[#000000]" : "bg-[#EFF6FF]"}`}>
      {/* Settings Panel */}
      <GraphSettingsPanel
        primaryModule={primaryModule}
        nodes={nodes}
        onSetPrimaryModule={handleSetPrimaryModule}
        moduleCount={nodes.length}
        onAddModule={() => setAddModuleOpen(true)}
        isDark={isDark}
        validation={validation}
      />

      {/* Canvas Area */}
      <GraphCanvas
        isDark={isDark}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setSelectedModule(null)}
      />

      {/* Properties Panel — Fields & Filters */}
      <GraphPropertiesPanel
        module={selectedModule}
        selectedFields={selectedModule ? selectedFields[selectedModule] ?? [] : []}
        onToggleField={handleToggleField}
        filters={filters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        isDark={isDark}
      />

      {/* Add Module Dialog */}
      <Dialog
        open={addModuleOpen}
        onClose={() => setAddModuleOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            bgcolor: isDark ? "#1C1C1E" : "#fff",
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(12,36,114,0.10)",
          },
        }}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-[#27272A]" : "border-[#E3ECFC]"}`}>
          <span className={`font-heading text-[16px] font-bold tracking-tight ${isDark ? "text-[#F4F4F5]" : "text-slate-900"}`}>
            Add Module
          </span>
          <IconButton
            size="small"
            onClick={() => setAddModuleOpen(false)}
            sx={{
              borderRadius: "9px",
              border: `1.5px solid ${isDark ? "#3F3F46" : "#E3ECFC"}`,
              "&:hover": { bgcolor: isDark ? "#27272A" : "#EFF6FF" },
            }}
          >
            <X size={16} color={isDark ? "#71717A" : "#64748B"} weight="duotone" />
          </IconButton>
        </div>

        <DialogContent sx={{ p: 4 }}>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(MODULE_CONFIG) as ModuleType[]).map((module) => {
              const config = MODULE_CONFIG[module];
              const Icon = MODULE_ICON[module];
              const color = MODULE_COLOR[module];
              const isAlreadyAdded = nodes.some((n) => n.data.module === module);

              return (
                <button
                  key={module}
                  onClick={() => !isAlreadyAdded && handleAddModule(module)}
                  disabled={isAlreadyAdded}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isAlreadyAdded
                      ? isDark
                        ? "border-[#27272A] bg-[#0A0A0A]/50 opacity-50 cursor-not-allowed"
                        : "border-[#E3ECFC] bg-[#f9fbff]/50 opacity-50 cursor-not-allowed"
                      : isDark
                        ? "border-[#27272A] hover:border-[#3F3F46] hover:bg-[#111113]"
                        : "border-[#E3ECFC] hover:border-[#93C5FD] hover:bg-[#F0F9FF]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color + "20" }}
                    >
                      <Icon size={12} color={color} weight="duotone" />
                    </div>
                    <span className={`text-[12px] font-semibold ${isDark ? "text-[#D4D4D8]" : "text-slate-700"}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className={`text-[11px] ml-8 ${isDark ? "text-[#9CA3AF]" : "text-slate-500"}`}>
                    {config.fields.length} fields
                  </p>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ModuleGraphBuilder(props: ModuleGraphBuilderProps) {
  return (
    <ReactFlowProvider>
      <GraphBuilderContent {...props} />
    </ReactFlowProvider>
  );
}
