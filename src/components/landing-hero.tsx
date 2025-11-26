"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ColorBends from "@/components/ui/ColorBends";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { LiquidButton } from "@/components/ui/liquid-button";
import { useIntro } from "@/components/intro-provider";

export const LandingHero = () => {
  const { introComplete } = useIntro();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white will-change-transform">
      {/* Background - ColorBends with specified settings */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <ColorBends
          rotation={0}
          speed={0.6}
          scale={1}
          frequency={1}
          autoRotate={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={2}
          noise={0.01}
          transparent={false}
        />
      </div>

      <AnimatePresence>
        {introComplete && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto space-y-8"
          >
            {/* Tagline - Static after intro */}
            <div className="mb-4 h-8">
              <span className="text-sm md:text-base font-medium text-white/80 tracking-wide font-mono">
                Experience the next generation of ticketing.
              </span>
            </div>

            {/* Main Heading - Static */}
            <div className="relative cursor-default">
              <h1 className="text-7xl md:text-9xl font-display tracking-tight text-white drop-shadow-2xl">
                TICKET VERSE
              </h1>
            </div>

            {/* Subtitle - Fade In */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-2xl mx-auto leading-relaxed"
            >
              <span className="text-lg md:text-xl text-white font-medium">
                Secure. Transparent. Unforgettable.
              </span>
            </motion.div>

            {/* CTA Buttons - Pop In */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-8"
            >
              <Link href="/events">
                <LiquidButton className="px-10 py-5 text-lg">
                    Explore Events
                    <ArrowRight className="ml-2 w-5 h-5" />
                </LiquidButton>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
