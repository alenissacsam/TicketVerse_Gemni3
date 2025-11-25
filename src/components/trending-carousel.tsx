"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { CometCard } from "./ui/comet-card";

gsap.registerPlugin(ScrollTrigger);

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Raw motion value for drag
  const x = useMotionValue(0);
  
  // Motion value for wheel target
  const wheelX = useMotionValue(0);
  
  // Smooth spring for wheel
  const smoothX = useSpring(wheelX, {
    stiffness: 50,
    damping: 20,
    mass: 0.5
  });

  // Sync x with smoothX when not dragging
  useEffect(() => {
    const unsubscribe = smoothX.on("change", (v) => {
      if (!isDragging) {
        x.set(v);
      }
    });
    return unsubscribe;
  }, [smoothX, isDragging, x]);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [events]);

  // GSAP Header Animation - Fast Split Text (triggers earlier)
  useEffect(() => {
    if (!headerRef.current) return;

    const chars = headerRef.current.querySelectorAll(".hot-ticket-char");

    const ctx = gsap.context(() => {
      gsap.fromTo(chars,
        {
          y: 60,
          opacity: 0,
          rotateX: -90
        },
        {
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 95%", // Trigger earlier so animation completes before scrolling past
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
          y: 0,
          opacity: 1,
          rotateX: 0,
          stagger: 0.02,
          duration: 0.5,
          ease: "back.out(1.4)",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Mouse Wheel Horizontal Scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (e: WheelEvent) => {
      // Only capture if we have scrollable width
      if (width <= 0) return;

      // Check if we are scrolling vertically
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const currentX = wheelX.get();

        // Check if we're at the boundaries
        const isAtStart = currentX >= 0;
        const isAtEnd = currentX <= -width;

        // If scrolling down and at the end, or scrolling up and at start, allow page scroll
        if ((e.deltaY > 0 && isAtEnd) || (e.deltaY < 0 && isAtStart)) {
          // Allow normal page scroll
          return;
        }

        // Otherwise, capture scroll for horizontal carousel movement
        e.preventDefault();
        e.stopPropagation();

        // Update target wheelX - spring will smooth it out
        const newX = Math.max(Math.min(currentX - e.deltaY * 1.5, 0), -width);
        wheelX.set(newX);
      }
    };

    // Add passive: false to allow preventDefault
    carousel.addEventListener("wheel", handleWheel, { passive: false });
    return () => carousel.removeEventListener("wheel", handleWheel);
  }, [width, wheelX]);

  return (
    <section ref={sectionRef} className="relative bg-black py-24 z-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />

      <div ref={headerRef} className="container mx-auto px-6 mb-12 relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white uppercase tracking-wider mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Trending Now
            </div>
            <h2 className="text-5xl md:text-7xl font-bungee text-white tracking-tight overflow-hidden">
              <span className="inline-block mr-4">
                {"Hot".split("").map((char, i) => (
                  <span key={i} className="inline-block hot-ticket-char origin-bottom">{char}</span>
                ))}
              </span>
              <span className="inline-block text-zinc-600">
                {"Tickets".split("").map((char, i) => (
                  <span key={i} className="inline-block hot-ticket-char origin-bottom">{char}</span>
                ))}
              </span>
            </h2>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-zinc-400 max-w-xs text-sm">
              Scroll or drag to explore the most anticipated events.
            </p>
          </div>
        </div>
      </div>

      {/* Draggable Carousel Track - Boosted z-index */}
      <div className="relative w-full z-30">
        <motion.div
          ref={carouselRef}
          className="cursor-grab active:cursor-grabbing overflow-visible"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            style={{ x }}
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
              // Sync wheelX to current drag position so spring doesn't jump back
              wheelX.set(x.get());
            }}
            dragElastic={0.1}
            dragTransition={{ power: 0.3, timeConstant: 200 }}
            className="flex gap-6 w-max px-6 pb-24 will-change-transform"
          >
            {events.map((event, index) => (
              <Card
                key={event.id}
                event={event}
                index={index}
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
                isDragging={isDragging}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Card({
  event,
  index,
  hoveredIndex,
  setHoveredIndex,
  isDragging
}: {
  event: Event;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  isDragging: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

  // Scroll-linked fade-in animation - NO time dependency
  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
        },
        {
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 95%",
            end: "top 60%",
            scrub: true, // Instantly responsive to scroll - NO time delay
          },
          y: 0,
          opacity: 1,
          scale: 1,
          ease: "none",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative block w-[280px] md:w-[340px] flex-shrink-0 transition-all duration-500 ${isDimmed ? '!opacity-30 scale-95 grayscale-[0.5]' : '!opacity-100'}`}
      style={{ zIndex: hoveredIndex === index ? 60 : 1 }}
      onMouseEnter={() => !isDragging && setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className={isDragging ? "pointer-events-none" : ""}>
        <CometCard
          className="w-full h-full aspect-[3/4]"
          rotateDepth={10} // Reduced from default 17.5
        >
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-zinc-900/50 border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_30px_60px_rgba(255,255,255,0.15)] hover:border-white/30">
            {/* Image with Animated Zoom */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                draggable={false}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              {/* Top Tags */}
              <div className="flex justify-between items-start translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div className="glass-premium px-3 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Selling Fast
                </div>
              </div>

              {/* Bottom Info */}
              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                {/* Price & Date Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="glass-premium px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="text-zinc-400">$</span>
                    {event.price}
                  </div>
                  <div className="glass-premium px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {format(new Date(event.date), "MMM d")}
                  </div>
                </div>

                <h3 className="text-2xl font-serif italic font-medium text-white mb-2 leading-tight drop-shadow-lg">
                  {event.title}
                </h3>

                <div className="flex items-center text-zinc-300 text-sm mb-6 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                {/* Quick Buy Button - NOW THE ONLY LINK */}
                <Link
                  href={`/events/${event.id}`}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative z-50"
                  onClick={(e) => isDragging && e.preventDefault()}
                >
                  Get Tickets <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </CometCard>
      </div>
    </div>
  );
}
