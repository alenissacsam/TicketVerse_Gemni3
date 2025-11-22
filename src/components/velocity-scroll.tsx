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

interface ParallaxProps {
  children: string;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

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
        className="scroller font-bungee font-bold uppercase text-9xl flex whitespace-nowrap flex-nowrap"
        style={{ x }}
      >
        <span className="block mr-8 text-[12rem] leading-[0.85] tracking-tighter text-zinc-800/50">{children} </span>
        <span className="block mr-8 text-[12rem] leading-[0.85] tracking-tighter text-zinc-800/50">{children} </span>
        <span className="block mr-8 text-[12rem] leading-[0.85] tracking-tighter text-zinc-800/50">{children} </span>
        <span className="block mr-8 text-[12rem] leading-[0.85] tracking-tighter text-zinc-800/50">{children} </span>
      </motion.div>
    </div>
  );
}

export function VelocityScroll() {
  return (
    <section className="py-20 overflow-hidden">
      <ParallaxText baseVelocity={-2}>Secure • Transparent •</ParallaxText>
      <ParallaxText baseVelocity={2}>Live • Exclusive •</ParallaxText>
    </section>
  );
}
