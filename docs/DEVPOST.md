# 🚀 Devpost / DoraHacks Submission Pitch

*Copy and paste the sections below directly into your hackathon submission portal.*

---

## 💡 Inspiration
Did you know that **80% of enterprise data onboarding time is wasted writing custom regex and parsing scripts?** Every time a client, vendor, or internal team sends a CSV, the headers are slightly different, the dates are formatted uniquely, and the data is a mess. 

We realized that developers were spending their weekends point-to-point mapping spreadsheets. We built **ShiftSync** to completely eliminate this process. We wanted to create an experience where anyone—regardless of technical ability—could simply drag-and-drop a disorganized spreadsheet and watch an AI magically route, map, and clean the data into a strict database schema in seconds.

## ⚙️ What it does
ShiftSync is an AI-powered data harmonizer that turns messy CSVs into clean database rows instantly. 

1. **Client-Side Parsing:** Users drop a CSV into our glowing glassmorphism Dropzone. We parse it locally in chunks using PapaParse to keep the UI buttery smooth.
2. **AI Schema Mapping:** Instead of guessing columns, we pass a sample of the data to OpenAI's robust **Structured Outputs (GPT-4o + Zod)**. This guarantees deterministic schema generation and completely avoids hallucinated AI responses.
3. **Interactive Visual UI:** The AI generates an interactive node-based graph using React Flow. If the AI is unsure about a column, the user can manually drag connections to correct the mapping visually!
4. **Serverless Privacy:** PII and sensitive data are transformed entirely within the browser. We don't save or leak raw spreadsheets to a permanent database during the validation phase.

## 🛠 How we built it
- **Core Framework:** Next.js 15 (App Router) keeping the application blisteringly fast.
- **UI/UX Aesthetics:** Tailwind CSS v4, Framer Motion, and Radix UI primitives. We focused heavily on achieving a premium, dark-mode, glassmorphic aesthetic because enterprise tools shouldn't have to look boring.
- **The Engine:** OpenAI API leveraging strict JSON-schema Zod definitions to force the LLM to output precise relational mappings.
- **Visuals:** React Flow powers the interactive node-mapping system, giving users complete visual control over their data pipeline.

## 🤕 Challenges we ran into
Getting an LLM to reliably map data without deviating into conversational text was a nightmare until we implemented strict **Structured Outputs** via Zod schemas. 

Furthermore, integrating React Flow into a fluid flexbox layout where users could both scroll through data rows *and* interact with a canvas was a massive CSS/architectural challenge. We had to ensure the parsing of heavy CSVs on the client side didn't block the React main thread, which would have ruined our smooth glowing animations.

## 🏆 Accomplishments that we're proud of
We're incredibly proud of the **"Serverless Privacy"** architecture. By utilizing the user's browser for the heavy lifting (parsing, validating, and mapping), we created a highly secure flow where confidential financial or healthcare CSVs aren't being permanently cached on our servers. 

We're also extremely proud of the UI. Hackathon projects often sacrifice aesthetics for functionality, but we successfully built a tool that looks like it's straight out of a Series B hyper-growth startup.

## 🚀 What's next for ShiftSync
We want to introduce **Custom Schema Uploads**, allowing users to upload a `schema.prisma` file directly so the AI can build a dynamic UI and mapping logic specifically for their localized database. We also plan to build direct connectors so that once the data is "Approved", it gets pushed directly via webhook into Postgres, Snowflake, or Supabase.
