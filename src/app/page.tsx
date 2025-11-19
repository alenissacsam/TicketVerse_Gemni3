"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const UnicornEmbed = dynamic(
  () => import("@/components/unicorn-embed").then((mod) => mod.UnicornEmbed),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-black/5">
        <div className="animate-pulse text-gray-400">
          Loading visual experience...
        </div>
      </div>
    ),
  }
);

import { HeroActions } from "@/components/hero-actions";
import { StatsCounter } from "@/components/stats-counter";
import { EventSlider } from "@/components/event-slider";
import { FeatureTimeline } from "@/components/feature-timeline";

import { GridPattern } from "@/components/ui/grid-pattern";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#fcfcfc]">
      {/* Hero Section - Full Screen */}
      <div className="h-screen w-full relative overflow-hidden">
        <UnicornEmbed projectId="LiPMvM06lfD0dgOETUwP" />

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-px h-12 bg-gradient-to-b from-slate-400 to-transparent"
          />
        </motion.div>
      </div>

      {/* Content Section - Below the fold */}
      <div className="relative z-10 bg-[#fcfcfc] overflow-hidden">
        <GridPattern
          width={50}
          height={50}
          x={-1}
          y={-1}
          className="absolute inset-0 h-full w-full opacity-[0.03] text-slate-900"
          squares={[
            [4, 4], [5, 10], [10, 5], [15, 15], [20, 8], [25, 20], [8, 25]
          ]}
        />

        {/* Intro Text */}
        <div className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif text-slate-800 mb-6 leading-tight"
          >
            The Future of Ticketing is <span className="italic text-slate-500">Here</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg md:text-xl font-light leading-relaxed"
          >
            Join the revolution. Create events, mint NFT tickets, and connect with your community like never before.
          </motion.p>
        </div>

        <div className="pb-32">
          <HeroActions />
        </div>
      </div>
    </main>
  );
}
