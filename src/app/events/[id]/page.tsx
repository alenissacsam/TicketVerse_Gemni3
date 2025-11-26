import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TicketSelector } from "@/components/ticket-selector";
import { TICKET_NFT_ADDRESS } from "@/lib/config";
import { ParallaxImage } from "@/components/ui/parallax-image";
import { GlassCard } from "@/components/ui/GlassCard";
import * as motion from "framer-motion/client";
import { EventChat } from "@/components/social/event-chat";
import { SquadBuilder } from "@/components/social/squad-builder";

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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section with Parallax */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        {event.coverImageUrl ? (
          <div className="absolute inset-0">
            <ParallaxImage
              src={event.coverImageUrl}
              alt={event.name}
              className="w-full h-full"
              aspectRatio="16/9"
              offset={100}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
            <Ticket className="w-32 h-32 text-zinc-800" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <div className="container max-w-7xl mx-auto">
            <Link
              href="/events"
              className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors group backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Events
            </Link>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-8xl font-bold font-bungee text-white mb-8 leading-none tracking-tight drop-shadow-2xl"
            >
              {event.name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex flex-wrap gap-6 text-lg text-zinc-300"
            >
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="font-medium">{format(new Date(event.date), "PPP")}</span>
                <span className="text-zinc-500">at</span>
                <span className="font-medium">{format(new Date(event.date), "p")}</span>
              </div>
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{event.venue}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Description & Details */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <GlassCard className="p-10">
                <h3 className="text-3xl font-bungee text-white mb-6">About Event</h3>
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-zinc-300 leading-relaxed text-xl font-light">
                    {event.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>

            {/* Smart Contract Info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <GlassCard className="p-8 bg-zinc-900/50">
                <h3 className="text-xl font-bungee text-white mb-6 flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-500" />
                  Smart Contract
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Contract Address</div>
                    <a
                      href={`https://sepolia.etherscan.io/address/${event.contractAddress || TICKET_NFT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/5 group"
                    >
                      <span className="truncate">
                        {event.contractAddress || TICKET_NFT_ADDRESS}
                      </span>
                      <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-bold">Network</div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Sepolia Testnet
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-6 p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg">
                  {event.organizer.email ? event.organizer.email[0].toUpperCase() : "O"}
                </div>
                <div>
                  <div className="text-sm text-zinc-400 font-medium uppercase tracking-wider mb-1">Organized by</div>
                  <div className="text-2xl text-white font-bold font-serif italic">
                    {event.organizer.email || "Anonymous Organizer"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Community Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              <h3 className="text-3xl font-bungee text-white">Community</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white">Join the Squad</h4>
                  <p className="text-zinc-400">Team up with friends to get seats together.</p>
                  <SquadBuilder />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white">Live Chat</h4>
                  <p className="text-zinc-400">Connect with other attendees.</p>
                  <EventChat eventId={event.id} isTicketHolder={true} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sticky Ticket Selection */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <TicketSelector
                  eventId={event.id}
                  contractAddress={event.contractAddress || TICKET_NFT_ADDRESS}
                  ticketTypes={event.ticketTypes.map(t => ({
                    ...t,
                    price: Number(t.price)
                  }))}
                />
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
