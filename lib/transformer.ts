import type { MappingItem, TransformResult } from "./schemas";

/**
 * Apply mapping transforms to all data rows.
 * The AI only generates the mapping config — this engine does the actual work.
 */
export function applyTransforms(
  rows: string[][],
  headers: string[],
  mappings: MappingItem[]
): TransformResult {
  const errors: TransformResult["errors"] = [];

  const transformedRows = rows.map((row, rowIndex) => {
    const result: Record<string, string> = {};

    for (const mapping of mappings) {
      const sourceIndex = headers.indexOf(mapping.source);
      if (sourceIndex === -1) continue;

      let value = row[sourceIndex] ?? "";
      const transforms = mapping.transform
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      for (const transform of transforms) {
        switch (transform) {
          case "trim":
            value = value.trim();
            break;
          case "lowercase":
            value = value.toLowerCase();
            break;
          case "uppercase":
            value = value.toUpperCase();
            break;
          case "parse_date":
            value = parseDate(value);
            if (value === "__INVALID_DATE__") {
              errors.push({
                rowIndex,
                field: mapping.target,
                message: `Could not parse date: "${row[sourceIndex]}"`,
              });
              value = row[sourceIndex] ?? "";
            }
            break;
          case "validate_email":
            if (value && !isValidEmail(value)) {
              errors.push({
                rowIndex,
                field: mapping.target,
                message: `Invalid email: "${value}"`,
              });
            }
            break;
        }
      }

      result[mapping.target] = value;
    }

    return result;
  });

  return { transformedRows, errors };
}

/**
 * Attempt to parse various date formats into YYYY-MM-DD.
 */
function parseDate(value: string): string {
  if (!value || !value.trim()) return "";

  const trimmed = value.trim();

  // Try ISO format first
  const isoDate = new Date(trimmed);
  if (!isNaN(isoDate.getTime()) && isoDate.getFullYear() > 1900) {
    return isoDate.toISOString().split("T")[0];
  }

  // Try DD/MM/YYYY
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  }

  return "__INVALID_DATE__";
}

/**
 * Simple email validation regex.
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
