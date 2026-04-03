"use client";

import { motion, Variants, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Upload, GitBranch, CheckCircle2, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 16, mass: 0.8 },
  },
};

const iconContainerVariants: Variants = {
  hidden: { scale: 0, rotate: -45 },
  show: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 12, delay: 0.15 },
  },
};

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const accentColors = [
    "oklch(0.65 0.2 250)",  // Electric blue
    "oklch(0.6 0.2 285)",   // Purple
    "oklch(0.7 0.18 160)",  // Emerald
  ];
  const accent = accentColors[index];

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ y: -6 }}
      className="relative h-full group cursor-default"
    >
      {/* Animated gradient border */}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animated-border-glow" />

      {/* Mouse-follow spotlight */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) => `radial-gradient(circle 200px at ${x}% ${y}%, oklch(0.65 0.2 250 / 8%), transparent)`
          ),
        }}
      />

      <div className="glass-card h-full flex flex-col rounded-2xl p-6 relative overflow-hidden">
        {/* Corner accent line */}
        <div
          className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-all duration-700"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />

        <div className="flex items-center gap-3 mb-4">
          {/* Animated icon container */}
          <motion.div
            variants={iconContainerVariants}
            className="relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300"
            style={{ background: `color-mix(in oklch, ${accent} 12%, transparent)` }}
          >
            {/* Pulse ring on hover */}
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-hover:animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_1]"
              style={{ background: `color-mix(in oklch, ${accent} 15%, transparent)` }}
            />
            <feature.icon
              className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:scale-110"
              style={{ color: accent }}
            />
          </motion.div>

          {/* Animated step label */}
          <motion.span
            className="text-xs font-mono tracking-wider"
            style={{ color: "oklch(0.5 0.02 250)" }}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            STEP {feature.step}
          </motion.span>
        </div>

        {/* Title with hover gradient */}
        <h3 className="text-lg font-semibold text-white mb-2 transition-all duration-300 group-hover:tracking-wide">
          {feature.title}
        </h3>

        <p className="text-sm text-[oklch(0.55_0.02_250)] leading-relaxed flex-1">
          {feature.description}
        </p>

      </div>
    </motion.div>
  );
}

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
              className="cta-shimmer h-13 px-8 text-base font-semibold bg-[oklch(0.65_0.2_250)] hover:bg-[oklch(0.6_0.22_250)] hover:scale-105 text-white rounded-xl shadow-[0_0_30px_oklch(0.65_0.2_250/25%)] hover:shadow-[0_0_40px_oklch(0.65_0.2_250/35%)] transition-all duration-300"
            >
              Try It Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={container}
          className="mt-24 w-full max-w-5xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch relative">
            {/* Connecting lines in gaps between cards (desktop only) */}
            {/* Gap 1 (between Card 1 & 2) */}
            <div className="hidden md:block absolute top-[46px] left-[calc(33.333%-16px)] w-6 z-0 pointer-events-none">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.5, ease: "easeInOut" }}
                className="h-px origin-left"
                style={{ background: "linear-gradient(90deg, oklch(0.65 0.2 250 / 80%), oklch(0.6 0.2 285 / 80%))" }}
              />
            </div>
            {/* Gap 2 (between Card 2 & 3) */}
            <div className="hidden md:block absolute top-[46px] left-[calc(66.666%-8px)] w-6 z-0 pointer-events-none">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.7, ease: "easeInOut" }}
                className="h-px origin-left"
                style={{ background: "linear-gradient(90deg, oklch(0.6 0.2 285 / 80%), oklch(0.7 0.18 160 / 80%))" }}
              />
            </div>
            {features.map((feature, index) => (
              <FeatureCard key={feature.step} feature={feature} index={index} />
            ))}
          </div>
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
