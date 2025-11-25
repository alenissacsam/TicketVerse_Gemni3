import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket, Users, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TicketSelector } from "@/components/ticket-selector";
import { TICKET_NFT_ADDRESS } from "@/lib/config";

// Force dynamic rendering since we're fetching specific event data
export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: true,
      ticketTypes: {
        orderBy: {
          createdAt: 'asc'
        }
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {event.coverImageUrl ? (
          <>
            <div className="absolute inset-0">
              <img
                src={event.coverImageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
            <Ticket className="w-32 h-32 text-zinc-800" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <div className="container max-w-7xl mx-auto">
            <Link 
              href="/events" 
              className="inline-flex items-center text-zinc-400 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Events
            </Link>
            <h1 className="text-5xl md:text-8xl font-bold font-bungee text-white mb-6 leading-none tracking-tight">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-lg text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white" />
                {format(new Date(event.date), "PPP 'at' p")}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-white" />
                {event.venue}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Description & Details */}
          <div className="lg:col-span-8 space-y-12">
            <div className="prose prose-invert prose-lg max-w-none">
              <h3 className="text-2xl font-bungee text-white mb-4">About Event</h3>
              <p className="text-zinc-400 leading-relaxed text-xl">
                {event.description}
              </p>
            </div>



            {/* Contract Info */}
            <div className="p-8 rounded-3xl border border-white/10 bg-zinc-900/30">
              <h3 className="text-xl font-bungee text-white mb-6 flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-zinc-500" />
                Smart Contract
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Address</div>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${event.contractAddress || TICKET_NFT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white hover:text-zinc-300 transition-colors flex items-center gap-2"
                  >
                    {(event.contractAddress || TICKET_NFT_ADDRESS).slice(0, 6)}...{(event.contractAddress || TICKET_NFT_ADDRESS).slice(-4)}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </div>
                {/* ... */}
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-xl">
                {event.organizer.email ? event.organizer.email[0].toUpperCase() : "O"}
              </div>
              <div>
                <div className="text-sm text-zinc-500">Organized by</div>
                <div className="text-white font-medium">
                  {event.organizer.email || "Anonymous Organizer"}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Ticket Selection */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <TicketSelector 
                eventId={event.id} 
                contractAddress={event.contractAddress || TICKET_NFT_ADDRESS} 
                ticketTypes={event.ticketTypes.map(t => ({
                  ...t,
                  price: Number(t.price)
                }))} 
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
