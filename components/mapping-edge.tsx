"use client";

import { memo } from "react";
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export type ConfidenceEdgeData = {
  confidence: number;
  label?: string;
};

function ConfidenceEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
  markerStart,
  interactionWidth,
}: EdgeProps) {
  const edgeData = data as unknown as ConfidenceEdgeData;
  const confidence = edgeData?.confidence ?? 0.5;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.4,
  });

  const getColor = () => {
    if (confidence >= 0.9) return "oklch(0.7 0.18 160)";   // green
    if (confidence >= 0.7) return "oklch(0.8 0.16 80)";    // amber
    return "oklch(0.6 0.2 25)";                             // red
  };

  const color = getColor();
  const percent = Math.round(confidence * 100);

  const baseEdgeProps = {
    id,
    markerEnd,
    markerStart,
    interactionWidth,
  };

  return (
    <>
      {/* Glow effect */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: 4,
          strokeOpacity: 0.15,
          filter: "blur(4px)",
          ...style,
        }}
        {...baseEdgeProps}
      />
      {/* Main edge */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: 2,
          strokeOpacity: 0.8,
          ...style,
        }}
        {...baseEdgeProps}
      />
      {/* Animated dash overlay */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: 2,
          strokeDasharray: "6 4",
          strokeDashoffset: 0,
          strokeOpacity: 0.4,
          animation: "dashdraw 1.5s linear infinite",
          ...style,
        }}
        {...baseEdgeProps}
      />
      {/* Confidence label */}
      <foreignObject
        x={labelX - 20}
        y={labelY - 10}
        width={40}
        height={20}
        className="pointer-events-none"
      >
        <div
          className="flex items-center justify-center w-full h-full rounded-md text-[10px] font-mono font-semibold"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
            color: color,
          }}
        >
          {percent}%
        </div>
      </foreignObject>

      <style jsx global>{`
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </>
  );
}

export const ConfidenceEdge = memo(ConfidenceEdgeInner);
