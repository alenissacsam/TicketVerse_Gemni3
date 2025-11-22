import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/event-card";
import Link from "next/link";
import { PlusIcon, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      ticketTypes: {
        select: { price: true },
        take: 1,
        orderBy: { price: "asc" },
      },
    },
  });

  const featuredEvent = events.find(e => e.isTrending) || events[0];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_40%)] pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white font-bungee mb-4">
              Discover <span className="text-zinc-500">Events</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl">
              Explore the future of live experiences. Book tickets for the most exclusive events in Web3.
            </p>
          </div>
          <Link
            href="/events/create"
            className="inline-flex items-center px-6 py-3 text-sm font-bold text-black bg-white rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </div>

        {/* Featured Event Hero (if available) */}
        {featuredEvent && (
          <div className="mb-16 relative group rounded-3xl overflow-hidden glass-premium">
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-20 p-8 md:p-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Featured Event
                </div>
                <h2 className="text-4xl md:text-6xl font-bungee text-white leading-tight">
                  {featuredEvent.name}
                </h2>
                <p className="text-zinc-300 line-clamp-3 text-lg">
                  {featuredEvent.description}
                </p>
                <Link 
                  href={`/events/${featuredEvent.id}`}
                  className="inline-block px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Get Tickets
                </Link>
              </div>
              <div className="hidden lg:block h-full min-h-[400px] relative rounded-2xl overflow-hidden">
                 {featuredEvent.coverImageUrl && (
                   <img 
                     src={featuredEvent.coverImageUrl} 
                     alt={featuredEvent.name}
                     className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                 )}
              </div>
            </div>
            {/* Background Image for Mobile/Blur */}
            {featuredEvent.coverImageUrl && (
              <img 
                src={featuredEvent.coverImageUrl} 
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm lg:hidden"
              />
            )}
          </div>
        )}

        {/* Event Grid */}
        {events.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
            <h3 className="text-xl font-bungee text-white mb-2">No events found</h3>
            <p className="text-zinc-500">Be the first to create an event on TicketVerse.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event, index) => (
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
        )}
      </div>
    </div>
  );
}
