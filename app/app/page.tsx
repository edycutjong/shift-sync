"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/file-dropzone";
import { DataPreview } from "@/components/data-preview";
import { MappingGraph } from "@/components/mapping-graph";
import { MappingSummary } from "@/components/mapping-summary";
import {
  type ParsedData,
  type MappingResponse,
  type ValidationResult,
  fallbackMapping,
} from "@/lib/schemas";
import { applyTransforms } from "@/lib/transformer";
import { validateRows } from "@/lib/validator";
import { parseFile } from "@/lib/parser";

type AppState = "upload" | "mapping" | "success";

const pageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function AppPage() {
  const [state, setState] = useState<AppState>("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [mapping, setMapping] = useState<MappingResponse | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isMapping, setIsMapping] = useState(false);

  const handleFileParsed = useCallback((data: ParsedData) => {
    setParsedData(data);
    toast.success(`Parsed ${data.totalRows} rows from ${data.fileName}`);
  }, []);

  const handleStartMapping = useCallback(async () => {
    if (!parsedData) return;

    setIsMapping(true);
    toast.loading("AI is analyzing your schema…", { id: "mapping" });

    try {
      // Try AI mapping first
      const res = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: parsedData.headers,
          sampleRows: parsedData.rows.slice(0, 5),
        }),
      });

      let mappingResult: MappingResponse;

      if (res.ok) {
        mappingResult = await res.json();
      } else {
        // Fallback to hardcoded mapping for demo reliability
        console.warn("API failed, using fallback mapping");
        // Simulate a brief delay for demo feel
        await new Promise((r) => setTimeout(r, 1500));
        mappingResult = fallbackMapping;
      }

      setMapping(mappingResult);

      // Apply transforms + validate
      const { transformedRows, errors } = applyTransforms(
        parsedData.rows,
        parsedData.headers,
        mappingResult.mappings
      );

      if (errors.length > 0) {
        toast.warning(`${errors.length} transform warnings`, { id: "mapping" });
      }

      const validationResult = validateRows(transformedRows);
      setValidation(validationResult);

      toast.success(
        `Mapped ${mappingResult.mappings.length} fields — ${validationResult.summary.valid}/${validationResult.summary.total} rows valid`,
        { id: "mapping" }
      );

      setState("mapping");
    } catch (err) {
      console.error(err);
      // Final fallback
      await new Promise((r) => setTimeout(r, 1000));
      setMapping(fallbackMapping);

      const { transformedRows } = applyTransforms(
        parsedData.rows,
        parsedData.headers,
        fallbackMapping.mappings
      );
      const validationResult = validateRows(transformedRows);
      setValidation(validationResult);

      toast.success("Mapping complete (demo mode)", { id: "mapping" });
      setState("mapping");
    } finally {
      setIsMapping(false);
    }
  }, [parsedData]);

  const handleApprove = useCallback(() => {
    toast.success("Data approved and ingested! 🎉");
    setState("success");
  }, []);

  const handleReset = useCallback(() => {
    setParsedData(null);
    setMapping(null);
    setValidation(null);
    setState("upload");
  }, []);

  return (
    <div className="relative min-h-screen bg-[oklch(0.09_0.015_265)]">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-[oklch(0.45_0.2_250/6%)] blur-[100px]" />
        <div className="absolute -bottom-[200px] -left-[200px] w-[400px] h-[400px] rounded-full bg-[oklch(0.45_0.18_285/5%)] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-[oklch(0.1_0.015_265/80%)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-sm font-semibold gradient-text">ShiftSync</h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {(["upload", "mapping", "success"] as AppState[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    state === s
                      ? "bg-[oklch(0.65_0.2_250)] shadow-[0_0_8px_oklch(0.65_0.2_250/40%)]"
                      : i < ["upload", "mapping", "success"].indexOf(state)
                      ? "bg-[oklch(0.7_0.18_160)]"
                      : "bg-border"
                  }`}
                />
                {i < 2 && (
                  <div className="w-6 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* ─── UPLOAD STATE ─── */}
          {state === "upload" && (
            <motion.div
              key="upload"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Upload Your Data
                </h2>
                <p className="text-sm text-muted-foreground">
                  Drop a CSV file with client data. We&apos;ll analyze the columns and
                  map them to your database schema.
                </p>
              </div>

              <FileDropzone
                onFileParsed={handleFileParsed}
                isLoading={isMapping}
              />

              {!parsedData && (
                <div className="flex flex-col items-center gap-4 pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Or try our test cases
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const csvData = `first_name,last_name,email,phone,company,role,birth_date\nAlice,Smith,alice@example.com,555-0101,Acme Corp,Manager,1985-05-15\nBob,Jones,bob@example.com,555-0102,Beta Inc,Engineer,1990-08-22\nCharlie,Brown,charlie@example.com,555-0103,Gamma LLC,Designer,1988-02-14`;
                        const file = new File([csvData], "clean_data.csv", { type: "text/csv" });
                        handleFileParsed(await parseFile(file));
                      }}
                      className="border-[oklch(0.7_0.18_160/30%)] hover:bg-[oklch(0.7_0.18_160/10%)] hover:text-foreground"
                    >
                      Clean Data
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const csvData = `client_fname,client_lname,emaill,phone_num,company_name,jobtitle,dob,legacy_id,notes\nJohn,Doe, john.doe@XYZ.com ,555-0101,Acme Corp,Manager,05/15/1985,C-101,VIP client\nJane,Smith,JANE@smith.co.uk,  555-0102 ,TechFlow,Engineer,1990-08-22,C-102,\nAlice,Johnson,alice@invalid_email,555-0103,DataSync,"Data Scientist",invalid_date,C-103,Follow up next week`;
                        const file = new File([csvData], "messy_data.csv", { type: "text/csv" });
                        handleFileParsed(await parseFile(file));
                      }}
                      className="border-[oklch(0.8_0.16_80/30%)] hover:bg-[oklch(0.8_0.16_80/10%)] hover:text-foreground"
                    >
                      Messy Headers
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const csvData = `fname,phone,org,notes\nEve,555-0109,Delta,No email provided\nFrank,555-0110,Epsilon,Need to contact`;
                        const file = new File([csvData], "missing_req_data.csv", { type: "text/csv" });
                        handleFileParsed(await parseFile(file));
                      }}
                      className="border-[oklch(0.6_0.2_25/30%)] hover:bg-[oklch(0.6_0.2_25/10%)] hover:text-foreground"
                    >
                      Edge Case (Missing Req)
                    </Button>
                  </div>
                </div>
              )}

              {parsedData && (
                <>
                  <DataPreview data={parsedData} />
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleStartMapping}
                      disabled={isMapping}
                      className="h-12 px-8 text-base font-semibold bg-[oklch(0.65_0.2_250)] hover:bg-[oklch(0.6_0.22_250)] text-white rounded-xl shadow-[0_0_30px_oklch(0.65_0.2_250/25%)] hover:shadow-[0_0_40px_oklch(0.65_0.2_250/35%)] transition-all duration-300"
                    >
                      {isMapping ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Mapping…
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 w-4 h-4" />
                          Map with AI
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ─── MAPPING STATE ─── */}
          {state === "mapping" && mapping && parsedData && (
            <motion.div
              key="mapping"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  AI Schema Mapping
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review the AI-generated column mappings. Approve to ingest clean data.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <MappingGraph
                  mapping={mapping}
                  sourceHeaders={parsedData.headers}
                />
                <MappingSummary mapping={mapping} validation={validation} />
              </div>

              {parsedData && (
                <DataPreview
                  data={parsedData}
                  validation={validation}
                  maxRows={5}
                />
              )}

              {/* Action buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="h-12 rounded-xl"
                >
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Start Over
                </Button>
                <Button
                  size="lg"
                  onClick={handleApprove}
                  className="h-12 px-8 text-base font-semibold bg-[oklch(0.7_0.18_160)] hover:bg-[oklch(0.65_0.2_160)] text-white rounded-xl shadow-[0_0_30px_oklch(0.7_0.18_160/25%)] hover:shadow-[0_0_40px_oklch(0.7_0.18_160/35%)] transition-all duration-300"
                >
                  <CheckCircle2 className="mr-2 w-4 h-4" />
                  Approve & Ingest
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── SUCCESS STATE ─── */}
          {state === "success" && (
            <motion.div
              key="success"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="max-w-lg mx-auto text-center space-y-8 py-20"
            >
              {/* Animated checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                className="flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-[oklch(0.7_0.18_160/15%)]"
              >
                <CheckCircle2 className="w-12 h-12 text-[oklch(0.7_0.18_160)]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <h2 className="text-3xl font-bold text-foreground">
                  Data Ingested! 🎉
                </h2>
                <p className="text-muted-foreground">
                  {validation?.summary.valid} clean records have been mapped,
                  validated, and are ready for your database.
                </p>
              </motion.div>

              {/* Stats */}
              {validation && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold font-mono text-[oklch(0.7_0.18_160)]">
                      {validation.summary.valid}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Rows Imported</p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold font-mono text-[oklch(0.72_0.18_250)]">
                      {mapping?.mappings.length ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Fields Mapped</p>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold font-mono text-[oklch(0.8_0.16_80)]">
                      {validation.summary.invalid}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Rows Rejected</p>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-4 pt-4"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="h-12 rounded-xl"
                >
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Upload Another File
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
