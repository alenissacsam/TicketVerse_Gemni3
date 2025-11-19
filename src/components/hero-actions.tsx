"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Plus, Compass } from "lucide-react";
import { MouseEvent } from "react";
import { useAuthModal, useUser } from "@account-kit/react";

function SpotlightCard({ 
  children, 
  href, 
  onClick,
  className = "" 
}: { 
  children: React.ReactNode; 
  href: string; 
  onClick?: (e: MouseEvent) => void;
  className?: string 
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative block h-full rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:shadow-xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(147, 51, 234, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full overflow-hidden rounded-3xl">
        {children}
      </div>
    </Link>
  );
}

export function HeroActions() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();

  const handleAuthAction = (e: MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Event Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <SpotlightCard href="/events/create" onClick={handleAuthAction}>
            <div className="relative h-full p-8 flex flex-col justify-between min-h-[320px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Plus className="w-40 h-40 text-purple-600 rotate-12" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-mono text-slate-500 uppercase tracking-wider">ERC-721</span>
                    <span className="px-2 py-1 rounded-md bg-green-50 text-[10px] font-mono text-green-600 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-3 tracking-tight group-hover:text-purple-700 transition-colors">
                  Create Event
                </h2>
                <p className="text-slate-500 text-base font-light leading-relaxed max-w-sm group-hover:text-slate-600 mb-6">
                  Deploy smart contracts instantly. No code required. Full ownership of your ticketing infrastructure.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Gas Fee</div>
                    <div className="text-sm font-mono text-slate-600">Sponsored (0 ETH)</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Deployment</div>
                    <div className="text-sm font-mono text-slate-600">~2.4 Seconds</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-slate-800 font-medium tracking-wide mt-auto group-hover:translate-x-2 transition-transform duration-300 pt-6 border-t border-slate-100">
                START CREATING <ArrowRight className="ml-2 w-5 h-5 text-purple-600" />
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Discover Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <SpotlightCard href="/events" onClick={handleAuthAction}>
            <div className="relative h-full p-8 flex flex-col justify-between min-h-[320px]">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Compass className="w-40 h-40 text-blue-600 -rotate-12" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Live Feed</span>
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-[10px] font-mono text-blue-600 uppercase tracking-wider">
                      Global
                    </span>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-3 tracking-tight group-hover:text-blue-700 transition-colors">
                  Discover
                </h2>
                <p className="text-slate-500 text-base font-light leading-relaxed max-w-sm group-hover:text-slate-600 mb-6">
                  Explore a curated feed of Web3 events. Real-time availability and instant secondary market access.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Events</div>
                    <div className="text-sm font-mono text-slate-600">1,204 Active</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Volume</div>
                    <div className="text-sm font-mono text-slate-600">450.2 ETH</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-slate-800 font-medium tracking-wide mt-auto group-hover:translate-x-2 transition-transform duration-300 pt-6 border-t border-slate-100">
                EXPLORE EVENTS <ArrowRight className="ml-2 w-5 h-5 text-blue-600" />
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  );
}
