"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from "framer-motion";
import { wrap } from "@motionone/utils";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: Date | string;
  imageUrl: string;
  price: string;
  location: string;
  isTrending?: boolean;
  category?: string;
  lowestPrice?: string;
}

interface CurvedCarouselProps {
  events: Event[];
}

interface ParallaxProps {
  children: React.ReactNode;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
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
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
      <motion.div className="flex whitespace-nowrap gap-8" style={{ x }}>
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export function PolaroidTicker({ events }: CurvedCarouselProps) {
  return (
    <section className="relative py-32 bg-slate-50 overflow-hidden">
      <div className="mb-16 px-6 md:px-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-4 py-1.5 mb-6 text-xs font-medium text-slate-800 bg-slate-100 rounded-full uppercase tracking-widest border border-slate-200"
        >
          Don't Miss Out
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-serif text-slate-900 mb-6 tracking-tight">
          Trending <span className="italic text-slate-600">Now</span>
        </h2>
      </div>

      <div className="relative w-full">
        <ParallaxText baseVelocity={-2}>
          {events.map((event) => (
            <div key={event.id} className="relative w-[300px] h-[420px] flex-shrink-0 p-4 bg-white shadow-xl shadow-slate-200/50 rotate-1 hover:rotate-0 transition-transform duration-300 border border-slate-100">
              <div className="relative w-full h-[300px] bg-slate-100 mb-4 overflow-hidden">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover transition-all duration-500"
                />
              </div>
              <div className="flex flex-col justify-between h-[80px]">
                <h3 className="font-serif text-xl text-slate-900 leading-tight line-clamp-2">
                  {event.title}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {format(new Date(event.date), "MMM d")}
                  </span>
                  <span className="font-bold text-slate-900">{event.price || 'Free'}</span>
                </div>
              </div>
              <Link href={`/events/${event.id}`} className="absolute inset-0 z-10" />
            </div>
          ))}
        </ParallaxText>
      </div>
    </section>
  );
}
