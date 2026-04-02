import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShiftSync — AI-Powered Data Onboarding",
  description:
    "Map, validate, and ingest messy client data into any strict database schema in seconds. Enterprise data onboarding powered by AI Structured Outputs.",
  openGraph: {
    title: "ShiftSync — Enterprise Data Onboarding in 30 Seconds",
    description:
      "Drag a CSV. AI maps columns visually. Clean data flows into your database.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={200}>
          {children}
        </TooltipProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.18 0.02 265)",
              border: "1px solid oklch(0.3 0.03 265 / 40%)",
              color: "oklch(0.95 0.01 250)",
            },
          }}
        />
      </body>
    </html>
  );
}
