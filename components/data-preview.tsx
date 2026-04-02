"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { ParsedData, ValidationResult } from "@/lib/schemas";

interface DataPreviewProps {
  data: ParsedData;
  validation?: ValidationResult | null;
  maxRows?: number;
}

export function DataPreview({ data, validation, maxRows = 10 }: DataPreviewProps) {
  const displayRows = data.rows.slice(0, maxRows);

  // Build a set of invalid row indices for highlighting
  const invalidRowIndices = new Set(
    validation?.invalidRows.map((r) => r.rowIndex) ?? []
  );

  // Build a map of rowIndex -> errors for tooltip
  const errorMap = new Map<number, string[]>();
  validation?.invalidRows.forEach((r) => {
    errorMap.set(r.rowIndex, r.errors);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Data Preview</h3>
          <Badge variant="secondary" className="text-xs">
            {data.totalRows.toLocaleString()} rows
          </Badge>
        </div>
        {maxRows < data.totalRows && (
          <span className="text-xs text-muted-foreground">
            Showing first {maxRows} rows
          </span>
        )}
      </div>

      {/* Table */}
      <ScrollArea className="w-full rounded-xl border border-border bg-card/50">
        <div className="min-w-[600px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-10">
                  #
                </th>
                {data.headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left text-xs font-semibold text-[oklch(0.72_0.18_250)] font-mono"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, rowIdx) => {
                const isInvalid = invalidRowIndices.has(rowIdx);
                const rowErrors = errorMap.get(rowIdx);

                return (
                  <tr
                    key={rowIdx}
                    className={`border-b border-border/50 transition-colors ${
                      isInvalid
                        ? "bg-destructive/8 hover:bg-destructive/12"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-3 py-2 text-xs text-muted-foreground font-mono">
                      <div className="flex items-center gap-1.5">
                        {isInvalid && (
                          <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
                        )}
                        {rowIdx + 1}
                      </div>
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-3 py-2 text-xs text-foreground/80 font-mono max-w-[200px] truncate"
                      >
                        {cell || (
                          <span className="text-muted-foreground/50 italic">
                            empty
                          </span>
                        )}
                      </td>
                    ))}
                    {/* Show error tooltip on last cell */}
                    {isInvalid && rowErrors && (
                      <td className="px-3 py-2 text-xs">
                        <span className="text-destructive text-[10px]">
                          {rowErrors[0]}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  );
}
