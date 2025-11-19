import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

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
      ticketTypes: true,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Image */}
          <div className="space-y-8">
            <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative group">
              {event.coverImageUrl ? (
                <img
                  src={event.coverImageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <Ticket className="w-24 h-24" />
                </div>
              )}
              
              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Contract Info */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                Contract Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Address</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${event.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 font-mono transition-colors"
                  >
                    {event.contractAddress.slice(0, 6)}...{event.contractAddress.slice(-4)}
                  </a>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Network</span>
                  <span className="text-white">Sepolia Testnet</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Standard</span>
                  <span className="text-white">ERC-1155</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {event.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  {format(new Date(event.date), "PPP 'at' p")}
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  {event.venue}
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-300 leading-relaxed text-lg">
                {event.description}
              </p>
            </div>

            {/* Ticket Selection Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                Select Tickets
              </h3>

              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-medium text-white group-hover:text-purple-400 transition-colors">
                        {ticket.name}
                      </div>
                      <div className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {ticket.capacity - ticket.ticketsSold} / {ticket.capacity} available
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        + Gas fees
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Mint Ticket (Coming Soon)
              </button>
              <p className="text-xs text-center text-zinc-500">
                Powered by Alchemy Account Kit & Paymaster
              </p>
            </div>

            {/* Organizer Info */}
            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {event.organizer.email ? event.organizer.email[0].toUpperCase() : "O"}
              </div>
              <div>
                <div className="text-sm text-zinc-400">Organized by</div>
                <div className="text-white font-medium">
                  {event.organizer.email || "Anonymous Organizer"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
