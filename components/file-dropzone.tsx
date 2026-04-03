"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import type { ParsedData } from "@/lib/schemas";
import { parseFile } from "@/lib/parser";

interface FileDropzoneProps {
  onFileParsed: (data: ParsedData) => void;
  isLoading?: boolean;
}

export function FileDropzone({ onFileParsed, isLoading }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      try {
        const parsed = await parseFile(file);
        onFileParsed(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file");
        setFileName(null);
      }
    },
    [onFileParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const reset = useCallback(() => {
    setFileName(null);
    setError(null);
    /* istanbul ignore next */
    if (inputRef.current) {
       inputRef.current.value = "";
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !fileName && inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center w-full min-h-[260px] rounded-2xl cursor-pointer transition-all duration-300 ${
          isDragging ? "dropzone-active" : "dropzone-idle"
        } ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
      >
        {/* Scanning line effect */}
        <div className="dropzone-scan-line opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Floating data particles */}
        {!fileName && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            {[
              { left: '15%', bottom: '20%', duration: '3.5s', delay: '0s' },
              { left: '35%', bottom: '30%', duration: '4.2s', delay: '0.8s' },
              { left: '55%', bottom: '15%', duration: '3.8s', delay: '1.4s' },
              { left: '75%', bottom: '25%', duration: '4.5s', delay: '0.3s' },
              { left: '25%', bottom: '40%', duration: '3.2s', delay: '2.0s' },
              { left: '65%', bottom: '35%', duration: '4.0s', delay: '1.0s' },
            ].map((p, i) => (
              <div
                key={i}
                className="data-particle"
                style={{
                  left: p.left,
                  bottom: p.bottom,
                  '--duration': p.duration,
                  '--delay': p.delay,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {fileName ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 z-10"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[oklch(0.65_0.2_250/12%)] border border-[oklch(0.65_0.2_250/20%)]">
                <FileSpreadsheet className="w-6 h-6 text-[oklch(0.72_0.18_250)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{fileName}</p>
                <p className="text-xs text-muted-foreground">File loaded — ready to map</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="ml-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center z-10"
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[oklch(0.65_0.2_250/10%)] border border-[oklch(0.65_0.2_250/15%)] group-hover:bg-[oklch(0.65_0.2_250/15%)] group-hover:border-[oklch(0.65_0.2_250/25%)] transition-all duration-300">
                <Upload className="w-7 h-7 text-[oklch(0.65_0.18_250)] group-hover:text-[oklch(0.72_0.2_250)] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  Drag & drop your CSV file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse · CSV up to 10MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 text-sm text-destructive text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
