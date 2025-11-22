"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Factory, CreditCard, Ticket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    {
        icon: ShieldCheck,
        title: "Identity (Hub)",
        description: "Centralized UserVerification contract handles KYC and anti-bot protection.",
        details: ["Soulbound", "Sybil Resistance", "Tiered Access"],
        color: "from-zinc-400 to-white"
    },
    {
        icon: Factory,
        title: "Orchestration",
        description: "EventFactory deploys isolated Event Spokes via minimal proxy clones.",
        details: ["EIP-1167", "Gas Efficient", "Isolated State"],
        color: "from-zinc-400 to-white"
    },
    {
        icon: CreditCard,
        title: "Settlement",
        description: "TicketMarketplace handles secure pull payments and royalty distribution.",
        details: ["Pull Payments", "Royalties", "Instant Payouts"],
        color: "from-zinc-400 to-white"
    },
    {
        icon: Ticket,
        title: "Ownership (Spoke)",
        description: "EventTicket handles NFT minting, rentals, and cryptographic check-in.",
        details: ["ERC-721", "ERC-4907 Rentals", "Dynamic Metadata"],
        color: "from-zinc-400 to-white"
    }
];

// Deterministic random number generator
const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export function ProtocolWorkflowV2() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax transforms
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -600]);

    return (
        <div ref={containerRef} className="relative py-32 bg-black overflow-hidden min-h-screen">
            {/* Parallax Starfield Background - Boosted Visibility */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Layer 1: Distant Stars (Slow) */}
                <motion.div style={{ y: y1 }} className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-white/40 rounded-full blur-[1px]" />
                    <div className="absolute top-1/3 left-3/4 w-2 h-2 bg-white/30 rounded-full blur-[1px]" />
                    <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-white/40 rounded-full blur-[1px]" />
                    <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-white/30 rounded-full blur-[1px]" />
                    <div className="absolute top-10 left-1/2 w-1.5 h-1.5 bg-white/40 rounded-full blur-[1px]" />
                    {/* Random scattered dust - Deterministic */}
                    {[...Array(20)].map((_, i) => (
                        <div 
                            key={`l1-${i}`}
                            className="absolute w-[3px] h-[3px] bg-white/30 rounded-full"
                            style={{
                                top: `${(pseudoRandom(i) * 100).toFixed(4)}%`,
                                left: `${(pseudoRandom(i + 100) * 100).toFixed(4)}%`,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Layer 2: Midground Stars (Medium) */}
                <motion.div style={{ y: y2 }} className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/20 rounded-full blur-sm" />
                    <div className="absolute top-1/4 left-3/4 w-3 h-3 bg-white/10 rounded-full blur-sm" />
                    <div className="absolute top-3/4 left-1/4 w-3 h-3 bg-white/10 rounded-full blur-sm" />
                    {[...Array(10)].map((_, i) => (
                        <div 
                            key={`l2-${i}`}
                            className="absolute w-1.5 h-1.5 bg-white/20 rounded-full blur-[0.5px]"
                            style={{
                                top: `${(pseudoRandom(i + 200) * 100).toFixed(4)}%`,
                                left: `${(pseudoRandom(i + 300) * 100).toFixed(4)}%`,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Layer 3: Foreground Flares (Fast) */}
                <motion.div style={{ y: y3 }} className="absolute inset-0">
                    <div className="absolute top-1/3 left-10 w-48 h-48 bg-white/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={`l3-${i}`}
                            className="absolute w-2 h-2 bg-white/10 rounded-full blur-[2px]"
                            style={{
                                top: `${(pseudoRandom(i + 400) * 100).toFixed(4)}%`,
                                left: `${(pseudoRandom(i + 500) * 100).toFixed(4)}%`,
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            <div className="container max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-premium text-xs font-bold text-white uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <Sparkles className="w-3 h-3 text-white fill-white" />
                        Hub & Spoke Architecture
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bungee text-white mb-6"
                    >
                        Protocol <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Flow</span>
                    </motion.h2>
                </div>

                <div className="relative">
                    {/* Central Line Container */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 md:translate-x-0" />
                    
                    {/* Liquid Light Line - Pure White/Silver */}
                    <motion.div
                        style={{ scaleY, transformOrigin: "top" }}
                        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white via-zinc-400 to-transparent -translate-x-1/2 md:translate-x-0 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    />

                    <div className="space-y-24">
                        {steps.map((step, index) => (
                            <WorkflowNode key={index} step={step} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function WorkflowNode({ step, index }: { step: any; index: number }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            className={cn(
                "relative flex items-center gap-8 md:gap-16",
                "flex-col md:flex-row", // Stack on mobile
                isEven ? "md:flex-row" : "md:flex-row-reverse"
            )}
        >
            {/* Content Side */}
            <div className={cn(
                "flex-1 w-full md:w-auto pl-12 md:pl-0", // Add padding on mobile for line
                isEven ? "md:text-right" : "md:text-left"
            )}>
                <motion.div 
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="group relative inline-block w-full md:w-auto"
                >
                    {/* Glass Card - Premium Monochrome */}
                    <div className="glass-premium p-8 rounded-3xl relative overflow-hidden border-white/10 hover:border-white/20 transition-colors">
                        {/* Subtle White Glow on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-white/20 to-transparent transition-opacity duration-500" />
                        
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-bungee text-white mb-3 group-hover:text-white transition-all drop-shadow-lg">
                                {step.title}
                            </h3>
                            <p className="text-zinc-400 text-base md:text-lg mb-6 leading-relaxed group-hover:text-zinc-300 transition-colors">
                                {step.description}
                            </p>
                            <div className={cn(
                                "flex gap-2 flex-wrap",
                                isEven ? "md:justify-end" : "md:justify-start"
                            )}>
                                {step.details.map((detail: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-zinc-300 backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                                        {detail}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Center Node - Standard Icon */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex-shrink-0 z-20">
                <motion.div 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black border-4 border-zinc-800 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] relative group cursor-pointer hover:border-white/50 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
                >
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10 blur-md" />
                    <step.icon className="w-5 h-5 md:w-6 md:h-6 text-zinc-500 group-hover:text-white transition-colors relative z-10" />
                </motion.div>
            </div>

            {/* Empty Side for Layout Balance */}
            <div className="hidden md:block flex-1" />
        </motion.div>
    );
}
