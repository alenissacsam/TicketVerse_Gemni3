"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const LiquidButton = ({ children, className, ...props }: LiquidButtonProps) => {
  return (
    <motion.button
      className={cn(
        "relative px-10 py-5 font-bold text-black bg-white/90 backdrop-blur-md rounded-full overflow-hidden transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] hover:bg-white group border border-white/20",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props as any}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      
      {/* Subtle Shine Effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Inner Glow */}
      <div className="absolute inset-0 z-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] opacity-50" />
    </motion.button>
  );
};
