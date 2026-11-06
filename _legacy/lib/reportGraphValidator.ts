import { Node, Edge } from "reactflow";
import { ModuleType, MODULE_CONFIG } from "@/lib/moduleRelationships";

export interface GraphValidationError {
  type: "orphan" | "invalid-connection" | "circular" | "no-primary";
  message: string;
  nodeIds?: string[];
  edgeId?: string;
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: GraphValidationError[];
  orphanNodeIds: string[];
  invalidEdgeIds: string[];
  circularNodeIds: string[];
}

// Two modules can be connected if either lists the other in relatedModules
export function isValidConnection(sourceModule: ModuleType, targetModule: ModuleType): boolean {
  if (sourceModule === targetModule) return false;
  const sourceConfig = MODULE_CONFIG[sourceModule];
  const targetConfig = MODULE_CONFIG[targetModule];
  return (
    sourceConfig.relatedModules.includes(targetModule) ||
    targetConfig.relatedModules.includes(sourceModule)
  );
}

// Nodes with zero connections (and more than one node exists) are orphaned
function findOrphanNodes(nodes: Node[], edges: Edge[]): string[] {
  if (nodes.length <= 1) return [];
  const connected = new Set<string>();
  edges.forEach((e) => {
    connected.add(e.source);
    connected.add(e.target);
  });
  return nodes.filter((n) => !connected.has(n.id)).map((n) => n.id);
}

// Detect connections between modules not allowed by MODULE_CONFIG
function findInvalidEdges(nodes: Node[], edges: Edge[]): { edgeId: string; message: string }[] {
  const nodeModuleMap = new Map<string, ModuleType>();
  nodes.forEach((n) => nodeModuleMap.set(n.id, n.data.module));

  const invalid: { edgeId: string; message: string }[] = [];
  edges.forEach((e) => {
    const sourceModule = nodeModuleMap.get(e.source);
    const targetModule = nodeModuleMap.get(e.target);
    if (!sourceModule || !targetModule) return;
    if (!isValidConnection(sourceModule, targetModule)) {
      invalid.push({
        edgeId: e.id,
        message: `${sourceModule} and ${targetModule} cannot be connected directly`,
      });
    }
  });
  return invalid;
}

// Detect cycles using DFS (treats edges as undirected for join graphs, but
// a true cycle in an undirected sense is >=1 alternate path between two nodes)
function findCircularNodes(nodes: Node[], edges: Edge[]): string[] {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));
  edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
    adjacency.get(e.target)?.push(e.source);
  });

  const visited = new Set<string>();
  const cyclic = new Set<string>();

  function dfs(nodeId: string, parent: string | null, stack: string[]): void {
    visited.add(nodeId);
    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (neighbor === parent) continue;
      if (stack.includes(neighbor)) {
        // Found a cycle — mark every node in the cycle segment
        const cycleStart = stack.indexOf(neighbor);
        stack.slice(cycleStart).forEach((id) => cyclic.add(id));
        cyclic.add(nodeId);
        continue;
      }
      if (!visited.has(neighbor)) {
        dfs(neighbor, nodeId, [...stack, nodeId]);
      }
    }
  }

  nodes.forEach((n) => {
    if (!visited.has(n.id)) dfs(n.id, null, []);
  });

  return Array.from(cyclic);
}

export function validateGraph(
  nodes: Node[],
  edges: Edge[],
  primaryModule: ModuleType | null
): GraphValidationResult {
  const errors: GraphValidationError[] = [];

  if (!primaryModule) {
    errors.push({ type: "no-primary", message: "Select a primary module to continue" });
  }

  const orphanNodeIds = findOrphanNodes(nodes, edges);
  orphanNodeIds.forEach((id) => {
    const node = nodes.find((n) => n.id === id);
    errors.push({
      type: "orphan",
      message: `${node?.data?.label ?? "Module"} has no connections`,
      nodeIds: [id],
    });
  });

  const invalidEdges = findInvalidEdges(nodes, edges);
  invalidEdges.forEach(({ edgeId, message }) => {
    errors.push({ type: "invalid-connection", message, edgeId });
  });

  const circularNodeIds = findCircularNodes(nodes, edges);
  if (circularNodeIds.length > 0) {
    errors.push({
      type: "circular",
      message: "Circular relationship detected between modules",
      nodeIds: circularNodeIds,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    orphanNodeIds,
    invalidEdgeIds: invalidEdges.map((e) => e.edgeId),
    circularNodeIds,
  };
}
