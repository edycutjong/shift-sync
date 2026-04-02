import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { MappingResponseSchema, targetSchema } from "@/lib/schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { headers, sampleRows } = await req.json();

    if (!headers || !sampleRows) {
      return NextResponse.json({ error: "Missing headers or sampleRows" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn("No OPENAI_API_KEY found, falling back to client-side demo data.");
      return NextResponse.json({ error: "No API Key" }, { status: 500 });
    }

    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `You are an expert data engineer. Map the provided CSV columns to the target database schema.
          
Target Schema:
${JSON.stringify(targetSchema, null, 2)}

Rules:
1. Map as many source columns to target fields as possible.
2. Provide a confidence score (0.0 to 1.0).
3. Specify necessary transforms (e.g., 'trim', 'lowercase', 'parse_date', 'validate_email'). Comma-separated.
4. Any CSV column that doesn't match a target field goes into unmapped_source.
5. Any required target field that doesn't have a source match goes into missing_target.`,
        },
        {
          role: "user",
          content: `CSV Headers: ${JSON.stringify(headers)}
Sample Row 1: ${JSON.stringify(sampleRows[0] || [])}
Sample Row 2: ${JSON.stringify(sampleRows[1] || [])}`,
        },
      ],
      response_format: zodResponseFormat(MappingResponseSchema, "mapping_response"),
    });

    const mapping = completion.choices[0].message.parsed;
    return NextResponse.json(mapping);

  } catch (error) {
    console.error("Mapping Error:", error);
    return NextResponse.json({ error: "Failed to generate mapping" }, { status: 500 });
  }
}
