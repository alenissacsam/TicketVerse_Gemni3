"use client";

import { useState, useEffect } from "react";
import { useUser } from "@account-kit/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Calendar, DollarSign, Users, Activity, TrendingUp, MapPin, Ticket } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/organizer/stat-card";
import { RevenueChart } from "@/components/organizer/revenue-chart";
import { RealTimeFeed } from "@/components/organizer/real-time-feed";

export default function OrganizerDashboard() {
  const user = useUser();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.address) {
      fetchEvents(user.address);
    }
  }, [user?.address]);

  const fetchEvents = async (address: string) => {
    try {
      const res = await fetch(`/api/organizer/events?organizerAddress=${address}`);
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bungee mb-4">Organizer Access</h1>
          <p className="text-zinc-400">Please connect your wallet to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const totalRevenue = events.reduce((acc, e) => acc + (e.totalRevenue || 0), 0);
  const totalTickets = events.reduce((acc, e) => acc + (e.totalSold || 0), 0);
  const activeEvents = events.filter(e => e.status === 'PUBLISHED').length;

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 pb-24 pl-28 bg-gradient-to-br from-zinc-900 to-black">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-green-500 tracking-widest uppercase">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
              Command Center
            </h1>
            <p className="text-zinc-400 mt-2 font-light">Welcome back, Organizer. Here is your mission status.</p>
          </div>
          <Link href="/organizer/create">
            <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Initialize Event
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`${totalRevenue.toFixed(2)} ETH`} 
            change="+12.5%" 
            trend="up"
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatCard 
            title="Tickets Sold" 
            value={totalTickets.toString()} 
            change="+8.2%" 
            trend="up"
            icon={<Ticket className="h-6 w-6" />} // Changed from Users to Ticket to fix icon import
          />
          <StatCard 
            title="Active Events" 
            value={activeEvents.toString()} 
            trend="neutral"
            icon={<Activity className="h-6 w-6" />}
          />
          <StatCard 
            title="Avg. Check-in" 
            value="94%" 
            change="-2.1%" 
            trend="down"
            icon={<QrCode className="h-6 w-6" />}
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Analytics & Events (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Revenue Chart */}
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Revenue Analytics
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Real-time sales performance over the last 24h</p>
                </div>
                <div className="flex gap-2">
                  {['1H', '24H', '7D', '30D'].map((period) => (
                    <button 
                      key={period}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${period === '24H' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <RevenueChart />
            </GlassCard>

            {/* Events List */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Active Missions
              </h2>

              {loading ? (
                <div className="text-zinc-500">Loading mission data...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/10 border-dashed">
                  <p className="text-zinc-500 mb-4">No active missions found.</p>
                  <Link href="/organizer/create">
                    <Button variant="outline">Initialize First Mission</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <GlassCard key={event.id} className="p-4 flex flex-col md:flex-row gap-6 items-center group hover:border-white/20 transition-colors">
                      <div className="h-24 w-24 rounded-xl overflow-hidden shrink-0 relative">
                        {event.coverImageUrl ? (
                          <img src={event.coverImageUrl} alt={event.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">No IMG</div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                          <h3 className="text-lg font-bold truncate">{event.name}</h3>
                          <Badge className={event.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-zinc-400">
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{event.totalSold} / {event.ticketTypes.reduce((acc: any, t: any) => acc + t.supply, 0)} Sold</span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <Link href={`/organizer/scan/${event.id}`} className="flex-1 md:flex-none">
                          <Button size="sm" variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white">
                            <QrCode className="mr-2 h-4 w-4" /> Scan
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}`} className="flex-1 md:flex-none">
                          <Button size="sm" variant="ghost" className="w-full hover:bg-white/5">
                            View
                          </Button>
                        </Link>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Feed & Map (1/3 width) */}
          <div className="space-y-8">
            
            {/* Live Feed */}
            <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  Live Feed
                </h3>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="p-4">
                <RealTimeFeed />
              </div>
            </div>

            {/* Geo Map Mock */}
            <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md overflow-hidden p-6 relative min-h-[300px] flex flex-col">
              <h3 className="font-bold flex items-center gap-2 mb-4 z-10 relative">
                <MapPin className="h-4 w-4 text-cyan-500" />
                Global Presence
              </h3>
              
              {/* Abstract Map Graphic */}
              <div className="absolute inset-0 opacity-30">
                 <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                    <path d="M0,30 Q25,80 50,30 T100,80" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
                    <circle cx="20" cy="40" r="1" fill="white" className="animate-ping" />
                    <circle cx="60" cy="70" r="1" fill="white" className="animate-ping" style={{ animationDelay: "1s" }} />
                    <circle cx="80" cy="20" r="1" fill="white" className="animate-ping" style={{ animationDelay: "2s" }} />
                 </svg>
              </div>
              
              <div className="mt-auto relative z-10 grid grid-cols-2 gap-4">
                 <div>
                    <div className="text-xs text-zinc-500 uppercase">Top Region</div>
                    <div className="text-lg font-bold">North America</div>
                 </div>
                 <div>
                    <div className="text-xs text-zinc-500 uppercase">Active Users</div>
                    <div className="text-lg font-bold">1,204</div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
