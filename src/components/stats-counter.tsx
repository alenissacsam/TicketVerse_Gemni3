"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ value, label, prefix = "", suffix = "" }: { value: number; label: string; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => `${prefix}${Math.round(current).toLocaleString()}${suffix}`);

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return (
    <div ref={ref} className="flex flex-col items-center p-6">
      <motion.span className="text-4xl md:text-5xl font-serif text-slate-800 font-bold mb-2">
        {display}
      </motion.span>
      <span className="text-slate-500 text-sm uppercase tracking-widest font-medium">{label}</span>
    </div>
  );
}

export function StatsCounter() {
  return (
    <div className="w-full py-20 border-y border-slate-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <Counter value={12500} label="Tickets Sold" />
        <Counter value={850} label="Active Events" />
        <Counter value={2400000} label="Total Volume" prefix="$" />
      </div>
    </div>
  );
}
