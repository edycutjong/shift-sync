"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ReactFlow,
  type Node,
  type Edge,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { Maximize } from "lucide-react";
import { MappingNode, type MappingNodeData } from "./mapping-node";
import { ConfidenceEdge } from "./mapping-edge";
import type { MappingResponse } from "@/lib/schemas";
import { targetSchema } from "@/lib/schemas";

interface MappingGraphProps {
  mapping: MappingResponse;
  sourceHeaders: string[];
}

const nodeTypes = { mapping: MappingNode };
const edgeTypes = { confidence: ConfidenceEdge };

function MappingGraphInner({ mapping, sourceHeaders }: MappingGraphProps) {
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    const mappedSourceCols = new Set(mapping.mappings.map((m) => m.source));
    const mappedTargetCols = new Set(mapping.mappings.map((m) => m.target));

    // Source nodes (left side) — all CSV headers
    const sourceNodes: Node[] = sourceHeaders.map((header, index) => ({
      id: `source-${header}`,
      type: "mapping",
      position: { x: 0, y: index * 80 },
      sourcePosition: Position.Right,
      data: {
        label: header,
        type: "source",
        isUnmapped: !mappedSourceCols.has(header),
        confidence: mapping.mappings.find((m) => m.source === header)?.confidence,
      } satisfies MappingNodeData,
    }));

    // Target nodes (right side) — all schema fields
    const targetFields = Object.entries(targetSchema);
    const targetNodes: Node[] = targetFields.map(([key, config], index) => ({
      id: `target-${key}`,
      type: "mapping",
      position: { x: 650, y: index * 80 },
      targetPosition: Position.Left,
      data: {
        label: key,
        type: "target",
        fieldType: config.type,
        required: config.required,
        isUnmapped: !mappedTargetCols.has(key) && config.required,
      } satisfies MappingNodeData,
    }));

    // Edges from mappings
    const mappingEdges: Edge[] = mapping.mappings.map((m, index) => ({
      id: `edge-${index}`,
      source: `source-${m.source}`,
      target: `target-${m.target}`,
      type: "confidence",
      data: {
        confidence: m.confidence,
      },
      animated: true,
    }));

    return {
      nodes: [...sourceNodes, ...targetNodes],
      edges: mappingEdges,
    };
  }, [mapping, sourceHeaders]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full min-h-[500px] rounded-2xl border border-border bg-[oklch(0.10_0.02_265)] overflow-hidden relative shadow-[inset_0_4px_40px_rgba(0,0,0,0.2)] group"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,oklch(0.14_0.02_265),transparent_70%)] opacity-80 pointer-events-none z-0" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent! z-10"
      />
      
      {/* Interactive Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => fitView({ padding: 0.15, duration: 800, maxZoom: 1 })}
          className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.15_0.02_265/80%)] hover:bg-[oklch(0.2_0.03_265)] shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-md text-xs font-semibold text-foreground/80 hover:text-foreground rounded-lg border border-border/50 transition-colors cursor-pointer"
        >
          <Maximize className="w-3.5 h-3.5" />
          Reset View
        </button>
      </div>
    </motion.div>
  );
}

export function MappingGraph(props: MappingGraphProps) {
  return (
    <ReactFlowProvider>
      <MappingGraphInner {...props} />
    </ReactFlowProvider>
  );
}
