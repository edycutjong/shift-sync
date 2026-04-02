"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database, FileSpreadsheet } from "lucide-react";

export type MappingNodeData = {
  label: string;
  type: "source" | "target";
  fieldType?: string;
  required?: boolean;
  confidence?: number;
  isUnmapped?: boolean;
};

function MappingNodeInner({ data }: NodeProps) {
  const nodeData = data as unknown as MappingNodeData;
  const isSource = nodeData.type === "source";
  const isUnmapped = nodeData.isUnmapped;

  const getConfidenceColor = () => {
    if (isUnmapped) return "oklch(0.6 0.2 25)";
    if (!nodeData.confidence) return "oklch(0.5 0.02 250)";
    if (nodeData.confidence >= 0.9) return "oklch(0.7 0.18 160)";
    if (nodeData.confidence >= 0.7) return "oklch(0.8 0.16 80)";
    return "oklch(0.6 0.2 25)";
  };

  return (
    <div
      className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 min-w-[180px]
        ${isUnmapped ? "pulse-unmapped" : ""}
        ${
          isSource
            ? "bg-[oklch(0.16_0.025_265)] border-[oklch(0.3_0.03_265/50%)] hover:border-[oklch(0.65_0.2_250/50%)]"
            : "bg-[oklch(0.14_0.02_280)] border-[oklch(0.3_0.03_280/50%)] hover:border-[oklch(0.55_0.18_285/50%)]"
        }`}
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-lg ${
          isSource
            ? "bg-[oklch(0.65_0.2_250/12%)] text-[oklch(0.72_0.18_250)]"
            : "bg-[oklch(0.55_0.18_285/12%)] text-[oklch(0.65_0.18_285)]"
        }`}
      >
        {isSource ? (
          <FileSpreadsheet className="w-4 h-4" />
        ) : (
          <Database className="w-4 h-4" />
        )}
      </div>

      {/* Label + metadata */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground font-mono truncate">
          {nodeData.label}
        </p>
        {nodeData.fieldType && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {nodeData.fieldType}
            {nodeData.required && " • required"}
          </p>
        )}
      </div>

      {/* Confidence dot */}
      {nodeData.confidence !== undefined && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: getConfidenceColor() }}
        />
      )}

      {/* Handles */}
      {isSource && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5! h-2.5! border-2! border-[oklch!(0.65_0.2_250)] bg-[oklch!(0.16_0.025_265)] right-[-5px]!"
        />
      )}
      {!isSource && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5! h-2.5! border-2! border-[oklch!(0.55_0.18_285)] bg-[oklch!(0.14_0.02_280)] left-[-5px]!"
        />
      )}
    </div>
  );
}

export const MappingNode = memo(MappingNodeInner);
