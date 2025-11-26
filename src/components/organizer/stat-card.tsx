"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: ReactNode;
    className?: string;
}

export function StatCard({ title, value, change, trend = "neutral", icon, className }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
                "relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-6 group",
                className
            )}
        >
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/30" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/30" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/30" />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white font-mono tracking-tight">{value}</h3>

                    {change && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded w-fit",
                            trend === "up" ? "bg-green-500/10 text-green-400" :
                                trend === "down" ? "bg-red-500/10 text-red-400" :
                                    "bg-zinc-500/10 text-zinc-400"
                        )}>
                            {trend === "up" && "▲"}
                            {trend === "down" && "▼"}
                            <span>{change}</span>
                        </div>
                    )}
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-white/70 group-hover:text-white group-hover:border-white/20 transition-colors">
                    {icon}
                </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
}
