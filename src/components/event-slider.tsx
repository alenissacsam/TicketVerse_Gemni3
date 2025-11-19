"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";

const MOCK_EVENTS = [
  {
    id: 1,
    title: "Neon Nights Festival",
    date: "Oct 24, 2025",
    location: "Cyber City, VR",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    price: "0.5 ETH"
  },
  {
    id: 2,
    title: "Crypto Art Summit",
    date: "Nov 12, 2025",
    location: "Meta Gallery",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
    price: "0.2 ETH"
  },
  {
    id: 3,
    title: "Future Bass Experience",
    date: "Dec 05, 2025",
    location: "Sonic Dome",
    image: "https://images.unsplash.com/photo-1514525253440-b393452e3383?w=800&q=80",
    price: "0.8 ETH"
  },
  {
    id: 4,
    title: "Web3 Developer Conference",
    date: "Jan 15, 2026",
    location: "Innovation Hub",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    price: "0.1 ETH"
  },
  {
    id: 5,
    title: "Digital Fashion Week",
    date: "Feb 20, 2026",
    location: "Paris Metaverse",
    image: "https://images.unsplash.com/photo-1537832816519-689ad163238b?w=800&q=80",
    price: "1.2 ETH"
  }
];

export function EventSlider() {
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-3xl md:text-5xl font-serif text-slate-800 mb-4">Trending Events</h2>
          <p className="text-slate-500 text-lg font-light">Discover what's happening in the metaverse.</p>
        </div>
        <div className="hidden md:block text-slate-400 text-sm font-mono uppercase tracking-widest">
          Drag to explore
        </div>
      </div>

      <motion.div 
        ref={carouselRef} 
        className="cursor-grab active:cursor-grabbing pl-6 md:pl-[max(2rem,calc((100vw-80rem)/2))]"
      >
        <motion.div 
          drag="x" 
          dragConstraints={carouselRef}
          className="flex gap-8 w-max pr-24"
        >
          {MOCK_EVENTS.map((event) => (
            <motion.div
              key={event.id}
              className="relative w-[300px] md:w-[400px] aspect-[3/4] rounded-3xl overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white mb-4 border border-white/10">
                  {event.price}
                </div>
                <h3 className="text-2xl font-serif text-white mb-2">{event.title}</h3>
                <div className="flex items-center text-white/70 text-sm space-x-4">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {event.date}</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {event.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
