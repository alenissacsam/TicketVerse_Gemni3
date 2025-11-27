"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/event-card";
import Link from "next/link";
import { PlusIcon, Sparkles, Search, Calendar, MapPin, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  venue: string;
  coverImageUrl: string | null;
  isTrending: boolean;
  ticketTypes: { price: number | string }[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      // API returns array directly, not wrapped in object
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Music", "Sports", "Art", "Tech", "Gaming", "Other"];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All";
    return matchesSearch && matchesCategory;
  });

  const featuredEvent = events.find((e) => e.isTrending) || events[0];
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) > new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.date) <= new Date());

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_40%)]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white font-bungee mb-4">
              Discover <span className="text-white">Events</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl">
              Explore the future of live experiences. Book tickets for the most exclusive events in Web3.
            </p>
          </div>
          <Link
            href="/events/create"
            className="group inline-flex items-center px-8 py-4 text-sm font-bold text-black bg-gradient-to-r from-white to-zinc-100 rounded-full hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Create Event
          </Link>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search events or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 rounded-2xl backdrop-blur-sm focus:border-purple-500/50 focus:ring-purple-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                showFilters
                  ? "bg-purple-500/20 text-purple-400 border-2 border-purple-500/50"
                  : "bg-zinc-900/50 text-zinc-400 border-2 border-white/10 hover:border-white/20"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Pills */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-3"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Featured Event Hero */}
        {featuredEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16 relative group rounded-[2rem] overflow-hidden glass-premium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-20 p-8 md:p-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  Featured Event
                </div>
                <h2 className="text-4xl md:text-6xl font-bungee text-white leading-tight">
                  {featuredEvent.name}
                </h2>
                <p className="text-zinc-300 line-clamp-3 text-lg leading-relaxed">
                  {featuredEvent.description}
                </p>
                
                {/* Event Meta */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredEvent.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    {featuredEvent.venue}
                  </div>
                </div>

                <Link
                  href={`/events/${featuredEvent.id}`}
                  className="inline-block px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-105"
                >
                  Get Tickets
                </Link>
              </div>
              <div className="hidden lg:block h-full min-h-[500px] relative rounded-2xl overflow-hidden">
                {featuredEvent.coverImageUrl && (
                  <img
                    src={featuredEvent.coverImageUrl}
                    alt={featuredEvent.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </div>
            </div>
            {/* Background Image for Mobile */}
            {featuredEvent.coverImageUrl && (
              <img
                src={featuredEvent.coverImageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm lg:hidden"
              />
            )}
          </motion.div>
        )}

        {/* Upcoming Events */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 glass-premium rounded-3xl"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bungee text-white mb-3">No events found</h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "The metaverse is quiet... for now. Be the first to create an event on TicketVerse."}
            </p>
            {!searchQuery && (
              <Link
                href="/events/create"
                className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Create First Event
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bungee text-white mb-8 flex items-center gap-3"
                >
                  <Calendar className="w-8 h-8 text-purple-400" />
                  Upcoming Events
                  <span className="text-lg text-zinc-500 font-normal">({upcomingEvents.length})</span>
                </motion.h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {upcomingEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <EventCard
                        id={event.id}
                        name={event.name}
                        date={event.date}
                        location={event.venue}
                        imageUrl={event.coverImageUrl}
                        price={event.ticketTypes[0]?.price ? Number(event.ticketTypes[0].price) : undefined}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bungee text-zinc-500 mb-8 flex items-center gap-3"
                >
                  Past Events
                  <span className="text-lg text-zinc-600 font-normal">({pastEvents.length})</span>
                </motion.h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-60">
                  {pastEvents.map((event, index) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      name={event.name}
                      date={event.date}
                      location={event.venue}
                      imageUrl={event.coverImageUrl}
                      price={event.ticketTypes[0]?.price ? Number(event.ticketTypes[0].price) : undefined}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
