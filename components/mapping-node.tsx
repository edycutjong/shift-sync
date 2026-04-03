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
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 min-w-[200px] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        ${isUnmapped ? "pulse-unmapped" : ""}
        ${
          isSource
            ? "bg-[oklch(0.16_0.025_265)] border-[oklch(0.3_0.03_265/50%)] hover:border-[oklch(0.65_0.2_250/50%)] hover:shadow-[0_0_30px_oklch(0.65_0.2_250/15%)]"
            : "bg-[oklch(0.14_0.02_280)] border-[oklch(0.3_0.03_280/50%)] hover:border-[oklch(0.55_0.18_285/50%)] hover:shadow-[0_0_30px_oklch(0.55_0.18_285/15%)]"
        }`}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-linear-to-tr from-transparent via-[oklch(1_1_1/2%)] to-transparent pointer-events-none" />
      
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-xl z-10 transition-transform duration-500 group-hover:scale-110 ${
          isSource
            ? "bg-[oklch(0.65_0.2_250/12%)] text-[oklch(0.72_0.18_250)] shadow-[inset_0_0_12px_oklch(0.65_0.2_250/10%)]"
            : "bg-[oklch(0.55_0.18_285/12%)] text-[oklch(0.65_0.18_285)] shadow-[inset_0_0_12px_oklch(0.55_0.18_285/10%)]"
        }`}
      >
        {isSource ? (
          <FileSpreadsheet className="w-4 h-4" />
        ) : (
          <Database className="w-4 h-4" />
        )}
      </div>

      {/* Label + metadata */}
      <div className="flex-1 min-w-0 z-10">
        <p className="text-[13px] font-bold text-foreground font-mono truncate transition-colors duration-300 group-hover:text-white">
          {nodeData.label}
        </p>
        {nodeData.fieldType && (
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium tracking-wide">
            {nodeData.fieldType}
            {nodeData.required && <span className="text-[oklch(0.6_0.2_25)] font-semibold ml-1">• req</span>}
          </p>
        )}
      </div>

      {/* Confidence dot */}
      {nodeData.confidence !== undefined && (
        <div
          className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px_currentColor] z-10"
          style={{ backgroundColor: getConfidenceColor(), color: getConfidenceColor() }}
        />
      )}

      {/* Handles */}
      {isSource && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3.5! h-3.5! ring-4 ring-[oklch(0.16_0.025_265)] group-hover:ring-[oklch(0.65_0.2_250/20%)] transition-all duration-300 border-2! border-[oklch(0.65_0.2_250)]! bg-[oklch(0.16_0.025_265)]! right-[-6px]!"
        />
      )}
      {!isSource && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3.5! h-3.5! ring-4 ring-[oklch(0.14_0.02_280)] group-hover:ring-[oklch(0.55_0.18_285/20%)] transition-all duration-300 border-2! border-[oklch(0.55_0.18_285)]! bg-[oklch(0.14_0.02_280)]! left-[-6px]!"
        />
      )}
    </div>
  );
}

export const MappingNode = memo(MappingNodeInner);
