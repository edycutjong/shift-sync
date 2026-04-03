"use client";

import { motion } from "framer-motion";
import { CheckCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-card rounded-2xl p-6 lg:p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:border-[oklch(0.3_0.03_265)] transition-all duration-500 h-full flex flex-col"
    >
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[oklch(0.72_0.18_250/5%)] rounded-full blur-[50px] pointer-events-none group-hover:bg-[oklch(0.72_0.18_250/10%)] transition-colors duration-500 z-0" />
      
      <div className="flex items-center gap-3 relative z-10 shrink-0">
        <div className="p-2 rounded-xl bg-[oklch(0.65_0.2_250/15%)] text-[oklch(0.72_0.18_250)]">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground tracking-tight">Mapping Summary</h3>
      </div>

      <Separator className="bg-border/60" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <StatCard
          label="Fields Mapped"
          value={`${totalMappings}/${totalMappings + mapping.unmapped_source.length}`}
          color="oklch(0.72_0.18_250)"
        />
        <StatCard
          label="Avg Confidence"
          value={`${Math.round(avgConfidence * 100)}%`}
          color={avgConfidence >= 0.85 ? "oklch(0.7 0.18 160)" : "oklch(0.8 0.16 80)"}
        />
      </div>

      {/* Confidence breakdown */}
      <div className="space-y-2 relative z-10">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Confidence Breakdown</p>
        <div className="space-y-1">
          <ConfidenceRow label="High (≥90%)" count={highConfidence} color="oklch(0.7 0.18 160)" />
          <ConfidenceRow label="Medium (70-90%)" count={mediumConfidence} color="oklch(0.8 0.16 80)" />
          <ConfidenceRow label="Low (<70%)" count={lowConfidence} color="oklch(0.6 0.2 25)" />
        </div>
      </div>

      {/* Unmapped columns */}
      {mapping.unmapped_source.length > 0 && (
        <div className="space-y-2 relative z-10">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Unmapped Columns</p>
          <div className="flex flex-wrap gap-1.5">
            {mapping.unmapped_source.map((col) => (
              <Badge key={col} variant="outline" className="text-[11px] font-mono px-2 py-0.5 bg-background/50 text-muted-foreground border-border/60">
                {col}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Validation results */}
      {validation && (
        <div className="relative z-10 pt-2">
          <Separator className="mb-4 bg-border/60" />
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Validation</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[oklch(0.7_0.18_160)]" />
                <span className="text-sm font-semibold text-foreground">
                  {validation.summary.valid} <span className="text-muted-foreground font-medium">/ {validation.summary.total} valid</span>
                </span>
              </div>
            </div>
            {/* Custom styled progress to stand out */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-border focus-visible:outline-none">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(validation.summary.valid / validation.summary.total) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-[oklch(0.7_0.18_160)] rounded-full"
                style={{ boxShadow: "0 0 10px oklch(0.7 0.18 160 / 50%)" }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="group/stat rounded-2xl bg-[oklch(0.13_0.015_265)] p-4 border border-border/50 hover:border-border transition-colors duration-300">
      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold font-mono mt-2 transition-transform duration-300 group-hover/stat:scale-105 origin-left" style={{ color, textShadow: `0 0 15px ${color}` }}>
        {value}
      </p>
    </div>
  );
}

function ConfidenceRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-3 py-1 hover:translate-x-1.5 transition-transform duration-300 group/row">
      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} />
      <span className="text-sm font-medium text-foreground/80 flex-1 group-hover/row:text-foreground transition-colors">{label}</span>
      <span className="text-sm font-mono font-bold text-foreground">{count}</span>
    </div>
  );
}
