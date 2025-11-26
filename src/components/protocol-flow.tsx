"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Zap, RefreshCw, Box, Layers, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { TracingBeam } from "./ui/tracing-beam";
import { CrystalCard } from "./ui/crystal-card";
import ColorBends from "./ui/ColorBends";

const items = [
  {
    title: "NFT Minting Engine",
    description: "Every ticket is a unique ERC-721 token, guaranteeing absolute ownership and authenticity on the blockchain.",
    icon: <Zap className="w-8 h-8 text-yellow-300" />,
    header: <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <Zap className="w-16 h-16 text-yellow-200 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
    </div>,
    className: "md:col-span-1",
  },
  {
    title: "Zero-Knowledge Privacy",
    description: "Personal data is encrypted off-chain. Only ownership proofs are public.",
    icon: <Lock className="w-8 h-8 text-cyan-300" />,
    header: <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <Lock className="w-16 h-16 text-cyan-200 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
    </div>,
    className: "md:col-span-1",
  },
  {
    title: "Smart Escrow",
    description: "Funds held in contract until event verification.",
    icon: <Shield className="w-8 h-8 text-emerald-300" />,
    header: <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <Shield className="w-16 h-16 text-emerald-200 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
    </div>,
    className: "md:col-span-1",
  },
  {
    title: "Royalty Standard",
    description: "Automated secondary market royalties for creators enforced by smart contracts.",
    icon: <RefreshCw className="w-8 h-8 text-purple-300" />,
    header: <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <RefreshCw className="w-16 h-16 text-purple-200 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
    </div>,
    className: "md:col-span-1",
  },
];

export function ProtocolFlow() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Living Background */}
      <div className="absolute inset-0 z-0">
         <ColorBends
          rotation={120}
          speed={0.4}
          scale={1.2}
          frequency={0.8}
          autoRotate={0.5}
          warpStrength={0.8}
          mouseInfluence={0.5}
          parallax={0.2}
          noise={0.02}
          transparent={false}
          colors={["#0f172a", "#334155", "#1e293b", "#0f172a", "#312e81", "#4c1d95"]} // Deep rich palette
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" /> {/* Overlay to ensure text readability */}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            <Cpu className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Protocol V2.0</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 mb-6 tracking-tight drop-shadow-2xl"
          >
            The Crystal Engine
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-2xl mx-auto text-xl font-light leading-relaxed"
          >
            A masterpiece of decentralized engineering. Transparent, immutable, and beautiful.
          </motion.p>
        </div>

        <TracingBeam className="px-6">
          <div className="flex flex-col gap-16 max-w-4xl mx-auto pt-10 pb-20">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "flex flex-col md:flex-row gap-8 items-center",
                  i % 2 === 1 && "md:flex-row-reverse"
                )}
              >
                {/* Visual Side */}
                <div className="w-full md:w-1/2">
                    <CrystalCard className="p-2">
                        {item.header}
                    </CrystalCard>
                </div>

                {/* Text Side */}
                <div className={cn("w-full md:w-1/2 flex flex-col space-y-4", i % 2 === 1 ? "md:items-end md:text-right" : "md:items-start")}>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 w-fit backdrop-blur-md">
                        {item.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{item.title}</h3>
                    <p className="text-lg text-white/70 leading-relaxed font-light">
                        {item.description}
                    </p>
                </div>
              </motion.div>
            ))}
          </div>
        </TracingBeam>
      </div>
    </section>
  );
}
