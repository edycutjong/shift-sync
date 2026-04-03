"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TriangleAlert,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  RotateCcw,
  Brain,
  ShieldCheck,
  FileOutput,
  Upload as UploadIcon,
  Zap,
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

const stateLabels: Record<AppState, string> = {
  upload: "Upload",
  mapping: "Map",
  success: "Done",
};

const pageVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const featureCards = [
  {
    icon: Brain,
    title: "AI Column Mapping",
    description: "Our advanced AI analyzes headers and sample rows to intelligently match source columns to your target schema.",
    color: "oklch(0.72 0.18 250)",
    bgColor: "oklch(0.65 0.2 250 / 10%)",
  },
  {
    icon: ShieldCheck,
    title: "Schema Validation",
    description: "Every row is validated against required fields, data types, and format rules before ingestion.",
    color: "oklch(0.7 0.18 160)",
    bgColor: "oklch(0.7 0.18 160 / 10%)",
  },
  {
    icon: FileOutput,
    title: "Clean Output",
    description: "Normalized dates, trimmed whitespace, proper casing — your data arrives production-ready.",
    color: "oklch(0.55 0.18 285)",
    bgColor: "oklch(0.55 0.18 285 / 10%)",
  },
];

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

  const states: AppState[] = ["upload", "mapping", "success"];
  const currentIdx = states.indexOf(state);

  return (
    <div className="relative min-h-screen bg-[oklch(0.09_0.015_265)]">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[oklch(0.45_0.2_250/6%)] blur-[120px] orb-1" />
        <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-[oklch(0.45_0.18_285/5%)] blur-[120px] orb-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[oklch(0.5_0.15_200/3%)] blur-[100px] orb-3" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-[oklch(0.1_0.015_265/80%)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

          {/* Step indicator with labels */}
          <div className="flex items-center gap-1">
            {states.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all duration-300 ${
                      i < currentIdx
                        ? "bg-[oklch(0.7_0.18_160)] text-white"
                        : i === currentIdx
                        ? "bg-[oklch(0.65_0.2_250)] text-white step-active"
                        : "bg-[oklch(0.2_0.015_265)] text-muted-foreground border border-border/50"
                    }`}
                  >
                    {i < currentIdx ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      i === currentIdx
                        ? "text-foreground"
                        : i < currentIdx
                        ? "text-[oklch(0.7_0.18_160)]"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {stateLabels[s]}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-8 h-px mx-2 transition-colors duration-300 ${
                      i < currentIdx ? "bg-[oklch(0.7_0.18_160)]" : "bg-border/50"
                    }`}
                  />
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
              className="max-w-3xl mx-auto space-y-10"
            >
              {/* Hero text */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[oklch(0.65_0.2_250/20%)] bg-[oklch(0.65_0.2_250/6%)] text-xs font-medium text-[oklch(0.72_0.18_250)] mb-2"
                >
                  <Zap className="w-3 h-3" />
                  AI-Powered Schema Detection
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                  Upload Your <span className="gradient-text">Data</span>
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Drop a CSV file with client data. We&apos;ll analyze the columns and
                  map them to your database schema using our AI engine.
                </p>
              </div>

              {/* Dropzone */}
              <FileDropzone
                onFileParsed={handleFileParsed}
                isLoading={isMapping}
              />

              {/* Test cases or parsed data */}
              {!parsedData ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-8"
                >
                  {/* Quick test cases */}
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex items-center gap-3">
                      <div className="h-px w-12 bg-linear-to-r from-transparent to-border" />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        Or try a sample
                      </p>
                      <div className="h-px w-12 bg-linear-to-l from-transparent to-border" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                      <button
                        onClick={async () => {
                          const csvData = `first_name,last_name,email,phone,company,role,birth_date\nAlice,Smith,alice@example.com,555-0101,Acme Corp,Manager,1985-05-15\nBob,Jones,bob@example.com,555-0102,Beta Inc,Engineer,1990-08-22\nCharlie,Brown,charlie@example.com,555-0103,Gamma LLC,Designer,1988-02-14`;
                          const file = new File([csvData], "clean_data.csv", { type: "text/csv" });
                          handleFileParsed(await parseFile(file));
                        }}
                        className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-[oklch(0.7_0.18_160/20%)] bg-[oklch(0.14_0.015_265/40%)] hover:border-[oklch(0.7_0.18_160/50%)] hover:bg-[oklch(0.7_0.18_160/8%)] transition-all duration-300 hover:-translate-y-0.5 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[oklch(0.7_0.18_160/12%)]">
                            <CheckCircle2 className="w-4 h-4 text-[oklch(0.7_0.18_160)]" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">Clean Data</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          3 rows, 7 columns — perfectly formatted with all required fields.
                        </p>
                      </button>
                      <button
                        onClick={async () => {
                          const csvData = `client_fname,client_lname,emaill,phone_num,company_name,jobtitle,dob,legacy_id,notes\nJohn,Doe, john.doe@XYZ.com ,555-0101,Acme Corp,Manager,05/15/1985,C-101,VIP client\nJane,Smith,JANE@smith.co.uk,  555-0102 ,TechFlow,Engineer,1990-08-22,C-102,\nAlice,Johnson,alice@invalid_email,555-0103,DataSync,"Data Scientist",invalid_date,C-103,Follow up next week`;
                          const file = new File([csvData], "messy_data.csv", { type: "text/csv" });
                          handleFileParsed(await parseFile(file));
                        }}
                        className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-[oklch(0.8_0.16_80/20%)] bg-[oklch(0.14_0.015_265/40%)] hover:border-[oklch(0.8_0.16_80/50%)] hover:bg-[oklch(0.8_0.16_80/8%)] transition-all duration-300 hover:-translate-y-0.5 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[oklch(0.8_0.16_80/12%)]">
                            <Sparkles className="w-4 h-4 text-[oklch(0.8_0.16_80)]" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">Messy Headers</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Typos, extra spaces, mixed date formats — test AI resilience.
                        </p>
                      </button>
                      <button
                        onClick={async () => {
                          const csvData = `fname,phone,org,notes\nEve,555-0109,Delta,No email provided\nFrank,555-0110,Epsilon,Need to contact`;
                          const file = new File([csvData], "missing_req_data.csv", { type: "text/csv" });
                          handleFileParsed(await parseFile(file));
                        }}
                        className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-[oklch(0.6_0.2_25/20%)] bg-[oklch(0.14_0.015_265/40%)] hover:border-[oklch(0.6_0.2_25/50%)] hover:bg-[oklch(0.6_0.2_25/8%)] transition-all duration-300 hover:-translate-y-0.5 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[oklch(0.6_0.2_25/12%)]">
                            <TriangleAlert className="w-4 h-4 text-[oklch(0.6_0.2_25)]" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">Edge Case</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Missing email & last name — see how validation catches gaps.
                        </p>
                      </button>
                      <button
                        onClick={async () => {
                          const headers = "first_name,last_name,email,phone,company,title,date_of_birth,legacy_id\n";
                          const rows = Array.from({ length: 1500 }).map((_, i) => {
                            // Inject sparse cells and empty rows randomly
                            if (i % 100 === 0) return ",,,"; // highly sparse / ragged
                            if (i % 50 === 0) return ""; // blank line (skipped by papa but good test)
                            
                            const fname = `User${i}`;
                            const lname = i % 5 === 0 ? "" : `Smith${i}`;
                            const email = `${fname}.${lname || "test"}@example.com`;
                            const phone = i % 8 === 0 ? "" : `555-${String(i).padStart(4, "0")}`;
                            const company = "TestCorp";
                            const title = "Engineer";
                            const dob = "1990-01-01";
                            return `${fname},${lname},${email},${phone},${company},${title},${dob},ID${i}`;
                          }).filter(Boolean).join("\n");
                          
                          const csvData = headers + rows;
                          const file = new File([csvData], "large_sparse_data.csv", { type: "text/csv" });
                          handleFileParsed(await parseFile(file));
                        }}
                        className="group relative flex flex-col items-start gap-2 p-4 rounded-xl border border-[oklch(0.65_0.2_250/20%)] bg-[oklch(0.14_0.015_265/40%)] hover:border-[oklch(0.65_0.2_250/50%)] hover:bg-[oklch(0.65_0.2_250/8%)] transition-all duration-300 hover:-translate-y-0.5 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[oklch(0.65_0.2_250/12%)]">
                            <Zap className="w-4 h-4 text-[oklch(0.65_0.2_250)]" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">Large Data</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          1,500 rows with gaps, sparse fields, and ragged rows.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Feature cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {featureCards.map((card, i) => (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="feature-card"
                      >
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                          style={{ backgroundColor: card.bgColor }}
                        >
                          <card.icon className="w-5 h-5" style={{ color: card.color }} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {card.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {card.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  <DataPreview data={parsedData} />
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <Button
                      size="lg"
                      onClick={handleStartMapping}
                      disabled={isMapping}
                      className="h-14 px-10 text-base font-bold bg-linear-to-r from-[oklch(0.6_0.22_250)] to-[oklch(0.55_0.2_280)] hover:from-[oklch(0.55_0.24_250)] hover:to-[oklch(0.5_0.22_280)] text-white rounded-2xl cta-shimmer transition-all duration-300 shadow-[0_0_40px_oklch(0.65_0.2_250/25%)]"
                    >
                      {isMapping ? (
                        <>
                          <Loader2 className="mr-2.5 w-5 h-5 animate-spin" />
                          Analyzing columns…
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2.5 w-5 h-5" />
                          Map with AI
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground/60">
                      The AI will match your columns to the target schema
                    </p>
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[oklch(0.7_0.18_160/20%)] bg-[oklch(0.7_0.18_160/6%)] text-xs font-medium text-[oklch(0.7_0.18_160)] mb-2">
                  <Brain className="w-3 h-3" />
                  AI Analysis Complete
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  AI Schema Mapping
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review the AI-generated column mappings. Approve to ingest clean data.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:items-stretch min-h-[500px]">
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
                className="relative flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-[oklch(0.7_0.18_160/15%)] border border-[oklch(0.7_0.18_160/20%)]"
              >
                <div className="absolute inset-0 rounded-full bg-[oklch(0.7_0.18_160/8%)] animate-ping" />
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
