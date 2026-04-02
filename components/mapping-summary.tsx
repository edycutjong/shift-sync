"use client";

import { motion } from "framer-motion";
import { CheckCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { MappingResponse, ValidationResult } from "@/lib/schemas";

interface MappingSummaryProps {
  mapping: MappingResponse;
  validation: ValidationResult | null;
}

export function MappingSummary({ mapping, validation }: MappingSummaryProps) {
  const totalMappings = mapping.mappings.length;
  const highConfidence = mapping.mappings.filter((m) => m.confidence >= 0.9).length;
  const mediumConfidence = mapping.mappings.filter(
    (m) => m.confidence >= 0.7 && m.confidence < 0.9
  ).length;
  const lowConfidence = mapping.mappings.filter((m) => m.confidence < 0.7).length;
  const avgConfidence =
    mapping.mappings.reduce((sum, m) => sum + m.confidence, 0) / totalMappings;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-[oklch(0.72_0.18_250)]" />
        <h3 className="text-sm font-semibold text-foreground">Mapping Summary</h3>
      </div>

      <Separator />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Fields Mapped"
          value={`${totalMappings}/${totalMappings + mapping.unmapped_source.length}`}
          color="oklch(0.72_0.18_250)"
        />
        <StatCard
          label="Avg. Confidence"
          value={`${Math.round(avgConfidence * 100)}%`}
          color={avgConfidence >= 0.85 ? "oklch(0.7 0.18 160)" : "oklch(0.8 0.16 80)"}
        />
      </div>

      {/* Confidence breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Confidence Breakdown</p>
        <ConfidenceRow label="High (≥90%)" count={highConfidence} color="oklch(0.7 0.18 160)" />
        <ConfidenceRow label="Medium (70-90%)" count={mediumConfidence} color="oklch(0.8 0.16 80)" />
        <ConfidenceRow label="Low (<70%)" count={lowConfidence} color="oklch(0.6 0.2 25)" />
      </div>

      {/* Unmapped columns */}
      {mapping.unmapped_source.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Unmapped Source Columns</p>
          <div className="flex flex-wrap gap-1.5">
            {mapping.unmapped_source.map((col) => (
              <Badge key={col} variant="outline" className="text-[10px] font-mono text-muted-foreground">
                {col}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Validation results */}
      {validation && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Validation Results</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-[oklch(0.7_0.18_160)]" />
              <span className="text-xs text-foreground">
                {validation.summary.valid} / {validation.summary.total} rows valid
              </span>
            </div>
            <Progress
              value={(validation.summary.valid / validation.summary.total) * 100}
              className="h-1.5"
            />
          </div>
        </>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-[oklch(0.13_0.015_265)] p-3 border border-border/50">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-bold font-mono mt-0.5" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function ConfidenceRow({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-foreground/80 flex-1">{label}</span>
      <span className="text-xs font-mono font-medium text-foreground">{count}</span>
    </div>
  );
}
