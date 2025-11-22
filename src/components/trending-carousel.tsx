"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Ticket, Calendar, MapPin } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: Date | string;
  imageUrl: string;
  price: string;
  location: string;
  isTrending?: boolean;
}

interface TrendingCarouselProps {
  events: Event[];
}

export function TrendingCarousel({ events }: TrendingCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[150vh] bg-black py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
      
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="container mx-auto px-6 mb-12 relative z-10">
          <motion.div 
            style={{ opacity }}
            className="flex items-end justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white uppercase tracking-wider mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Trending Now
              </div>
              <h2 className="text-5xl md:text-7xl font-bungee text-white tracking-tight">
                Hot <span className="text-zinc-600">Tickets</span>
              </h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-zinc-400 max-w-xs text-sm">
                Swipe through the most anticipated events in the Web3 ecosystem.
              </p>
            </div>
          </motion.div>
        </div>

        {/* 3D Carousel Track */}
        <div className="relative w-full pl-6 md:pl-24">
          <motion.div 
            style={{ x }}
            className="flex gap-8 md:gap-16 w-max px-12"
          >
            {events.map((event, index) => (
              <Card key={event.id} event={event} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Card({ event, index }: { event: Event; index: number }) {
  return (
    <Link href={`/events/${event.id}`} className="group relative block w-[300px] md:w-[400px] perspective-1000">
      <motion.div
        whileHover={{ scale: 1.05, rotateY: 5 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl"
      >
        {/* Image */}
        <div className="absolute inset-0">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white">
                {event.price}
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(event.date), "MMM d")}
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bungee text-white mb-2 leading-tight">
              {event.title}
            </h3>
            
            <div className="flex items-center text-zinc-400 text-sm mb-6">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              Get Tickets <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Reflection Effect */}
      <div className="absolute -bottom-8 left-0 right-0 h-24 bg-gradient-to-b from-white/5 to-transparent transform scale-y-[-1] opacity-20 blur-sm rounded-3xl pointer-events-none" />
    </Link>
  );
}
