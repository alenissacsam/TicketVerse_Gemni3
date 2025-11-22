"use client";

import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface EventCardProps {
  id: string;
  name: string;
  date: Date;
  location: string;
  imageUrl?: string | null;
  price?: number;
  index?: number;
}

export function EventCard({ id, name, date, location, imageUrl, price, index = 0 }: EventCardProps) {
  return (
    <Link href={`/events/${id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="group relative h-full glass-premium rounded-2xl overflow-hidden"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={name}
              className="object-cover w-full h-full"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7 }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-zinc-700">
              <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center">
                <span className="text-2xl font-bold font-bungee">TV</span>
              </div>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />

          {/* Price Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/50 backdrop-blur-md text-white border border-white/10 group-hover:border-white/30 transition-colors">
              {price ? `${price} USDC` : "Free"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 relative">
          <h3 className="text-xl font-bungee text-white mb-3 line-clamp-2 group-hover:text-zinc-300 transition-colors">
            {name}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
              <CalendarIcon className="w-4 h-4 mr-2.5 text-zinc-500 flex-shrink-0" />
              <span className="font-medium">{format(new Date(date), "MMM d, yyyy • h:mm a")}</span>
            </div>
            <div className="flex items-center text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
              <MapPinIcon className="w-4 h-4 mr-2.5 text-zinc-500 flex-shrink-0" />
              <span className="font-medium line-clamp-1">{location}</span>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 group-hover:ring-white/10 transition-all duration-500 pointer-events-none" />
        </div>
      </motion.div>
    </Link>
  );
}
