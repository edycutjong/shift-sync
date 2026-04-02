import { z } from "zod";

/* ─── Target CRM Schema (the "SaaS product" database) ─── */

export const targetSchema = {
  first_name: { type: "text", required: true, label: "First Name" },
  last_name: { type: "text", required: true, label: "Last Name" },
  email: { type: "email", required: true, label: "Email" },
  phone: { type: "text", required: false, label: "Phone" },
  company: { type: "text", required: false, label: "Company" },
  title: { type: "text", required: false, label: "Job Title" },
  date_of_birth: { type: "date", required: false, label: "Date of Birth" },
} as const;

export type TargetFieldKey = keyof typeof targetSchema;

export const targetFieldKeys = Object.keys(targetSchema) as TargetFieldKey[];

/* ─── AI Mapping Response Schema ─── */

export const MappingItemSchema = z.object({
  source: z.string().describe("The column header from the uploaded CSV"),
  target: z.string().describe("The matching field in the target database schema"),
  confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
  transform: z.string().describe("Comma-separated transforms: trim, lowercase, parse_date, validate_email"),
});

export const MappingResponseSchema = z.object({
  mappings: z.array(MappingItemSchema),
  unmapped_source: z.array(z.string()).describe("Source columns with no matching target field"),
  missing_target: z.array(z.string()).describe("Required target fields with no source match"),
});

export type MappingItem = z.infer<typeof MappingItemSchema>;
export type MappingResponse = z.infer<typeof MappingResponseSchema>;

/* ─── Parsed Data Types ─── */

export type ParsedData = {
  headers: string[];
  rows: string[][];
  totalRows: number;
  fileName: string;
};

/* ─── Validation Types ─── */

export type RowError = {
  rowIndex: number;
  field: string;
  message: string;
};

export type TransformResult = {
  transformedRows: Record<string, string>[];
  errors: RowError[];
};

export type ValidationResult = {
  validRows: Record<string, string>[];
  invalidRows: { row: Record<string, string>; rowIndex: number; errors: string[] }[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    errorsByField: Record<string, number>;
  };
};

/* ─── Hardcoded Fallback Mapping (for demo reliability) ─── */

export const fallbackMapping: MappingResponse = {
  mappings: [
    { source: "client_fname", target: "first_name", confidence: 0.95, transform: "trim" },
    { source: "client_lname", target: "last_name", confidence: 0.95, transform: "trim" },
    { source: "emaill", target: "email", confidence: 0.85, transform: "lowercase,trim,validate_email" },
    { source: "dob", target: "date_of_birth", confidence: 0.72, transform: "parse_date" },
    { source: "company_name", target: "company", confidence: 0.90, transform: "trim" },
    { source: "jobtitle", target: "title", confidence: 0.88, transform: "trim" },
    { source: "phone_num", target: "phone", confidence: 0.92, transform: "trim" },
  ],
  unmapped_source: ["legacy_id", "notes"],
  missing_target: [],
};
