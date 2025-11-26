"use client";

import { useUser } from "@account-kit/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Wallet, Ticket, ArrowRight, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { PortfolioChart } from "@/components/user/portfolio-chart";
import { Separator } from "@/components/ui/separator";

export default function UserDashboard() {
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bungee mb-4">User Access</h1>
          <p className="text-zinc-400">Please connect your wallet to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 pb-24 pl-28 bg-gradient-to-br from-zinc-900 to-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
              My Dashboard
            </h1>
            <p className="text-zinc-400 mt-2 font-light">Welcome back, {user.address?.slice(0, 6)}...{user.address?.slice(-4)}</p>
          </div>
          <Link href="/marketplace">
            <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
              Explore Events <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
              <Ticket size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider">Tickets Held</p>
              <p className="text-3xl font-bold font-mono">12</p>
            </div>
          </GlassCard>
          <GlassCard className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider">Portfolio Value</p>
              <p className="text-3xl font-bold font-mono">2.4 ETH</p>
            </div>
          </GlassCard>
          <GlassCard className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20 text-green-400">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-400 uppercase tracking-wider">Events Attended</p>
              <p className="text-3xl font-bold font-mono">5</p>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Portfolio & Tickets (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Portfolio Chart */}
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-500" />
                  Portfolio Growth
                </h3>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  +12.5% this month
                </Badge>
              </div>
              <PortfolioChart />
            </GlassCard>

            {/* Recent Tickets */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-500" />
                My Tickets
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <GlassCard key={i} className="p-4 flex items-center gap-4 group hover:border-white/20 transition-colors">
                    <div className="h-16 w-16 rounded-lg bg-zinc-800 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold">Neon Nights VIP Pass</h3>
                      <p className="text-sm text-zinc-400">Dec 12, 2025 • New York, NY</p>
                    </div>
                    <Button variant="outline" size="sm">View Ticket</Button>
                  </GlassCard>
                ))}
                <Link href="/tickets" className="block text-center text-sm text-zinc-500 hover:text-white mt-4">
                  View all tickets
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Upcoming Events (1/3) */}
          <div className="space-y-8">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Upcoming Events
              </h3>
              
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="relative pl-6 border-l border-white/10 pb-6 last:pb-0">
                    <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-black" />
                    <p className="text-xs text-green-400 font-mono mb-1">TOMORROW • 8:00 PM</p>
                    <h4 className="font-bold text-lg mb-1">Cyber Rave 2077</h4>
                    <p className="text-sm text-zinc-400 mb-3">Cyberpunk Arena, Tokyo</p>
                    <Button size="sm" className="w-full bg-white/10 hover:bg-white/20">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 text-center">
              <h3 className="font-bold mb-2">Want to host an event?</h3>
              <p className="text-sm text-zinc-400 mb-4">Become an organizer and start selling tickets today.</p>
              <Link href="/organizer/create">
                <Button variant="outline" className="w-full">Create Event</Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
