"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, ShoppingCart, TrendingUp, Users, Ticket } from "lucide-react";

interface DashboardData {
  overview: {
    totalEvents: number;
    activeEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    activeUsers: number;
  };
  recentActivity: {
    purchases: any[];
    listings: any[];
  };
  topEvents: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/metrics");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Events"
          value={data.overview.totalEvents}
          icon={Calendar}
          description={`${data.overview.activeEvents} active`}
        />
        <MetricCard
          title="Tickets Sold"
          value={data.overview.totalTicketsSold}
          icon={Ticket}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${data.overview.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Active Users"
          value={data.overview.activeUsers}
          icon={Users}
        />
        <MetricCard
          title="Avg. Ticket Price"
          value={
            data.overview.totalTicketsSold > 0
              ? `$${(data.overview.totalRevenue / data.overview.totalTicketsSold).toFixed(2)}`
              : "$0"
          }
          icon={TrendingUp}
        />
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList className="bg-zinc-900 border-zinc-800">
          <TabsTrigger value="purchases">Recent Purchases</TabsTrigger>
          <TabsTrigger value="listings">Recent Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Ticket Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivity.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {purchase.ticket.event.name}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {purchase.ticket.ticketType.name} - {purchase.to.walletAddress.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${Number(purchase.price)} USDC</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Marketplace Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivity.listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {listing.ticket.event.name}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {listing.ticket.ticketType.name} - {listing.seller.walletAddress.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${Number(listing.price)} USDC</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Events Leaderboard */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Top Events by Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topEvents.map((event, index) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-zinc-600">#{index + 1}</div>
                  <div>
                    <p className="text-white font-medium">{event.name}</p>
                    <p className="text-sm text-zinc-400">
                      Organizer: {event.organizer.walletAddress.slice(0, 10)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${event.revenue.toLocaleString()} USDC</p>
                  <p className="text-sm text-zinc-400">{event._count.tickets} tickets sold</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
