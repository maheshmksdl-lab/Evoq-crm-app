"use client";
import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Edge as EdgeType,
  useReactFlow,
} from "reactflow";

interface EdgeComponentProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  source: string;
  target: string;
  data?: {
    isValid?: boolean;
    label?: string;
  };
}

const EdgeComponent = memo(({ id, sourceX, sourceY, targetX, targetY, data }: EdgeComponentProps) => {
  const { getEdge } = useReactFlow();
  const edge = getEdge(id) as EdgeType | undefined;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const isValid = data?.isValid !== false;
  const strokeColor = isValid ? "#1D4ED8" : "#EF4444";
  const strokeDasharray = isValid ? "0" : "5,5";

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: strokeColor, strokeWidth: 2, strokeDasharray }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="absolute text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1D4ED8] text-white pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

EdgeComponent.displayName = "EdgeComponent";

export default EdgeComponent;
