import Papa from "papaparse";
import type { ParsedData } from "./schemas";

/**
 * Parse a CSV file client-side using Papa Parse.
 * Returns normalized headers + rows.
 */
export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as string[][];

        if (data.length < 2) {
          reject(new Error("File must contain a header row and at least one data row"));
          return;
        }

        const headers = data[0].map((h) => h.trim());
        const rows = data
          .slice(1)
          .filter((row) => row.some((cell) => cell.trim() !== ""));

        resolve({
          headers,
          rows,
          totalRows: rows.length,
          fileName: file.name,
        });
      },
      error: (error: Error) => reject(error),
    });
  });
}

/**
 * Parse an uploaded file (CSV only for MVP).
 * Validates file type and size before parsing.
 */
export async function parseFile(file: File): Promise<ParsedData> {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (file.size > MAX_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv" || file.type === "text/csv") {
    return parseCSV(file);
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a CSV file.`);
}

/**
 * Extract headers + first N sample rows for AI mapping.
 */
export function extractSampleData(
  parsed: ParsedData,
  sampleSize: number = 5
): { headers: string[]; sampleRows: string[][] } {
  return {
    headers: parsed.headers,
    sampleRows: parsed.rows.slice(0, sampleSize),
  };
}
