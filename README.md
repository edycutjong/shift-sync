# ShiftSync

ShiftSync is a modern, AI-powered tool for intelligent data ingestion, schema mapping, and validation.

## Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Copy the example environment file and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
   *You'll need an OpenAI API key (`OPENAI_API_KEY`) for the AI mapping feature to work properly. If it is omitted, the app will gracefully fall back to a hardcoded demo response.*

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Features
- **AI-Powered Mapping**: Automatically matches CSV columns to complex database schemas using GPT-4o.
- **Visual Node Graph**: Interactive, sleek node-based visualization built with React Flow to review and edit schema links.
- **Client-side Parsing**: Lightning fast local parsing of messy CSVs using PapaParse.
- **Schema Validation**: Row-by-row validation using Zod.

## Technology Stack
- Next.js 15 (App Router)
- React 19 + Framer Motion
- Tailwind CSS (v4)
- React Flow (for node graphs)
- OpenAI SDK
