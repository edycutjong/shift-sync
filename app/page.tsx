"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Upload, GitBranch, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Upload,
    title: "Drop Your Data",
    description: "Drag any messy CSV into the widget. Client-side parsing — your data never leaves the browser.",
    step: "01",
  },
  {
    icon: GitBranch,
    title: "AI Maps Columns",
    description: "OpenAI Structured Outputs analyze headers and sample data, then generate a visual mapping graph.",
    step: "02",
  },
  {
    icon: CheckCircle2,
    title: "Approve & Ingest",
    description: "Review the mapping, fix flagged errors, click Approve — clean data flows into your database.",
    step: "03",
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.09_0.015_265)]">
      {/* ─── Animated gradient orbs ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb-1 absolute -top-[300px] -left-[200px] w-[700px] h-[700px] rounded-full bg-[oklch(0.45_0.2_250/12%)] blur-[120px]" />
        <div className="orb-2 absolute -bottom-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[oklch(0.45_0.18_285/10%)] blur-[120px]" />
        <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[oklch(0.5_0.15_250/6%)] blur-[100px]" />
      </div>

      {/* ─── Content ─── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20"
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-[oklch(0.65_0.2_250/10%)] text-[oklch(0.72_0.18_250)] border border-[oklch(0.65_0.2_250/20%)]">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Data Onboarding
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-center max-w-5xl leading-[1.05] tracking-tight"
        >
          <span className="text-white">Enterprise Data</span>
          <br />
          <span className="gradient-text">Onboarding in 30s</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="mt-6 text-lg md:text-xl text-[oklch(0.6_0.02_250)] text-center max-w-2xl leading-relaxed"
        >
          Drop a messy CSV. AI maps columns visually. Clean data flows into your
          database — no custom ETL scripts, no $50K tools.
        </motion.p>

        {/* CTA */}
        <motion.div variants={item} className="mt-10 flex gap-4">
          <Link href="/app">
            <Button
              size="lg"
              className="h-13 px-8 text-base font-semibold bg-[oklch(0.65_0.2_250)] hover:bg-[oklch(0.6_0.22_250)] text-white rounded-xl shadow-[0_0_30px_oklch(0.65_0.2_250/25%)] hover:shadow-[0_0_40px_oklch(0.65_0.2_250/35%)] transition-all duration-300"
            >
              Try It Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={container}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full items-stretch"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.step}
              variants={item}
              className="glass-card h-full flex flex-col rounded-2xl p-6 transition-all duration-300 group cursor-default"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[oklch(0.65_0.2_250/12%)] text-[oklch(0.72_0.18_250)] group-hover:bg-[oklch(0.65_0.2_250/20%)] transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-[oklch(0.5_0.02_250)] tracking-wider">
                  STEP {feature.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[oklch(0.55_0.02_250)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom glow line */}
        <motion.div
          variants={item}
          className="mt-20 w-full max-w-xl mx-auto h-px bg-linear-to-r from-transparent via-[oklch(0.65_0.2_250/30%)] to-transparent"
        />

        {/* Footer tagline */}
        <motion.p
          variants={item}
          className="mt-6 text-sm text-[oklch(0.4_0.02_250)] font-mono tracking-wide"
        >
          Built for DevHouse Global 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
