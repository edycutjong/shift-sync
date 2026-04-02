import { targetSchema } from "./schemas";
import type { ValidationResult } from "./schemas";

/**
 * Validate all transformed rows against the target schema.
 * Returns valid rows, invalid rows with error messages, and a summary.
 */
export function validateRows(rows: Record<string, string>[]): ValidationResult {
  const validRows: Record<string, string>[] = [];
  const invalidRows: ValidationResult["invalidRows"] = [];
  const errorsByField: Record<string, number> = {};

  rows.forEach((row, rowIndex) => {
    const errors: string[] = [];

    for (const [field, config] of Object.entries(targetSchema)) {
      const value = row[field];

      // Required field check
      if (config.required && (!value || value.trim() === "")) {
        errors.push(`${config.label} is required`);
        errorsByField[field] = (errorsByField[field] || 0) + 1;
        continue;
      }

      // Skip further validation for empty optional fields
      if (!value || value.trim() === "") continue;

      // Type-specific validation
      switch (config.type) {
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`Invalid email: "${value}"`);
            errorsByField[field] = (errorsByField[field] || 0) + 1;
          }
          break;

        case "date": {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`Invalid date: "${value}"`);
            errorsByField[field] = (errorsByField[field] || 0) + 1;
          }
          break;
        }
      }
    }

    if (errors.length > 0) {
      invalidRows.push({ row, rowIndex, errors });
    } else {
      validRows.push(row);
    }
  });

  return {
    validRows,
    invalidRows,
    summary: {
      total: rows.length,
      valid: validRows.length,
      invalid: invalidRows.length,
      errorsByField,
    },
  };
}
