"use client";

import { wrap } from "@motionone/utils";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: string;
  baseVelocity: number;
  className?: string;
}

function ParallaxText({ children, baseVelocity = 100, className }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  // Skew effect based on velocity - Reduced intensity significantly
  const skewX = useTransform(smoothVelocity, [-1000, 1000], [-5, 5]);

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="parallax overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
      <motion.div
        className="scroller font-bungee font-bold uppercase flex whitespace-nowrap flex-nowrap will-change-transform"
        style={{ x, skewX }}
      >
        <span className={cn("block mr-12 text-6xl md:text-9xl leading-[0.85] tracking-tighter", className)}>{children} </span>
        <span className={cn("block mr-12 text-6xl md:text-9xl leading-[0.85] tracking-tighter", className)}>{children} </span>
        <span className={cn("block mr-12 text-6xl md:text-9xl leading-[0.85] tracking-tighter", className)}>{children} </span>
        <span className={cn("block mr-12 text-6xl md:text-9xl leading-[0.85] tracking-tighter", className)}>{children} </span>
      </motion.div>
    </div>
  );
}

export function VelocityScroll() {
  return (
    <section className="py-24 overflow-hidden bg-black relative z-10">
      {/* Gradient masks for smooth fade in/out */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-20" />

      <div className="space-y-8">
        <ParallaxText baseVelocity={-2} className="text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.5)] opacity-50">
          Secure • Transparent • Immutable •
        </ParallaxText>
        <ParallaxText baseVelocity={2} className="text-white opacity-90">
          Live • Exclusive • Verified •
        </ParallaxText>
      </div>
    </section>
  );
}
