"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ReactFlow,
  type Node,
  type Edge,
  Position,
  ReactFlowProvider,
} from "@xyflow/react";
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
      position: { x: 500, y: index * 80 },
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
      className="w-full h-[500px] rounded-2xl border border-border bg-[oklch(0.11_0.015_265)] overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent!"
      />
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
