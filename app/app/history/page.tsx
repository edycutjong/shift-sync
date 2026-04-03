"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Calendar, FileText, Database, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryEntry {
  id: string;
  date: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  mappedFieldsCount: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem("shiftsync_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not load history from local storage", e);
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem("shiftsync_history");
    setHistory([]);
  }, []);

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div className="relative min-h-screen bg-[oklch(0.09_0.015_265)]">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[oklch(0.45_0.2_250/5%)] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[oklch(0.45_0.18_285/4%)] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-[oklch(0.1_0.015_265/80%)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-sm font-semibold gradient-text">ShiftSync History</h1>
          </div>
          {history.length > 0 && (
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={handleClearHistory}
               className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Ingestion <span className="gradient-text">History</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            View all past file ingestions mapping to your target schema.
          </p>
        </div>

        {history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed border-border bg-[oklch(0.12_0.015_265/40%)]"
          >
            <div className="w-16 h-16 rounded-2xl bg-[oklch(0.12_0.015_265)] flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No history yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Upload your first dataset on the main page to see it appear here.
            </p>
            <Link href="/app">
              <Button>Start Upload</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {history.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl border border-[oklch(0.7_0.18_160/10%)] bg-[oklch(0.14_0.015_265/40%)] hover:border-[oklch(0.7_0.18_160/30%)] transition-colors gap-6"
                >
                  <div className="flex items-start gap-4">
                     <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[oklch(0.7_0.18_160/10%)] text-[oklch(0.7_0.18_160)] shrink-0">
                       <FileText className="w-5 h-5" />
                     </div>
                     <div>
                       <h3 className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                         {entry.fileName}
                       </h3>
                       <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                         <div className="flex items-center gap-1">
                           <Calendar className="w-3 h-3" />
                           {new Date(entry.date).toLocaleString()}
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:flex items-center gap-4 md:gap-8 w-full md:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Status</span>
                      {entry.invalidRows === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[oklch(0.7_0.18_160/15%)] text-[oklch(0.7_0.18_160)] border border-[oklch(0.7_0.18_160/30%)]">
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[oklch(0.8_0.16_80/15%)] text-[oklch(0.8_0.16_80)] border border-[oklch(0.8_0.16_80/30%)]">
                          Partial
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Rows</span>
                      <span className="text-sm font-medium text-foreground">{entry.validRows} / {entry.totalRows}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Mapped</span>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                        {entry.mappedFieldsCount} fields
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
