"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Share2, MoreHorizontal, RefreshCw, Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MakeOfferModal } from "@/components/marketplace/make-offer-modal";
import { RarityBadge } from "@/components/marketplace/rarity-badge";

const mockHistoryData = [
  { date: "Oct 10", price: 0.2 },
  { date: "Oct 15", price: 0.25 },
  { date: "Oct 20", price: 0.22 },
  { date: "Oct 25", price: 0.35 },
  { date: "Nov 01", price: 0.4 },
  { date: "Nov 05", price: 0.38 },
  { date: "Nov 10", price: 0.5 },
];

export default function AssetDetailsPage({ params }: { params: { contract: string; tokenId: string } }) {
  // Mock data for now - will fetch real data later
  const ticket = {
    id: params.tokenId,
    name: "VIP Access Pass #124",
    collection: "Neon Nights Festival 2024",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    owner: "0x1234...5678",
    price: "0.5",
    currency: "ETH",
    fiatPrice: "$1,250.00",
    description: "This VIP pass grants exclusive access to the backstage lounge, meet & greet with artists, and premium seating areas.",
    attributes: [
      { trait_type: "Section", value: "VIP Lounge" },
      { trait_type: "Row", value: "A" },
      { trait_type: "Seat", value: "12" },
      { trait_type: "Access", value: "All Areas" },
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left Column: Media */}
          <div className="space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 relative group">
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-white border-white/10">
                  <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-3 h-3 mr-1" alt="ETH" />
                  Ethereum
                </Badge>
              </div>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white">
                  <Heart size={20} />
                </Button>
              </div>
              <img
                src={ticket.image}
                alt={ticket.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Properties Accordion (Desktop) */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Properties
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticket.attributes.map((attr, i) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center hover:border-blue-500/50 transition-colors">
                      <p className="text-xs text-blue-400 uppercase font-bold mb-1">{attr.trait_type}</p>
                      <p className="text-sm text-white font-medium">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-4">{ticket.name}</h1>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>Owned by</span>
                  <span className="text-blue-400 hover:text-blue-300 cursor-pointer">{ticket.owner}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="border-zinc-800 hover:bg-zinc-800">
                  <Share2 size={18} />
                </Button>
                <Button size="icon" variant="outline" className="border-zinc-800 hover:bg-zinc-800">
                  <MoreHorizontal size={18} />
                </Button>
              </div>
            </div>

            {/* Price Card */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-zinc-400 text-sm">Current Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-white">{ticket.price} {ticket.currency}</span>
                    <span className="text-zinc-500">{ticket.fiatPrice}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                    Buy Now
                  </Button>
                  <MakeOfferModal ticketName={ticket.name} floorPrice={ticket.price} />
                </div>
              </CardContent>
            </Card>

            {/* Activity / History Tabs */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="w-full bg-zinc-900 border-b border-zinc-800 rounded-none p-0 h-12 justify-start">
                <TabsTrigger value="history" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent">
                  Price History
                </TabsTrigger>
                <TabsTrigger value="listings" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent">
                  Listings
                </TabsTrigger>
                <TabsTrigger value="offers" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent">
                  Offers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="p-6 bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-xl min-h-[200px] flex items-center justify-center text-zinc-500">
                <div className="w-full h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockHistoryData}>
                      <XAxis 
                        dataKey="date" 
                        stroke="#52525b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#52525b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value} ETH`} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                        cursor={{ stroke: "#3f3f46" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ fill: "#3b82f6", strokeWidth: 2 }} 
                        activeDot={{ r: 6, fill: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="listings" className="p-0 bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-xl">
                {/* Listings Table Placeholder */}
                <div className="p-4 text-center text-zinc-500">No active listings</div>
              </TabsContent>
              <TabsContent value="offers" className="p-0 bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-xl">
                {/* Offers Table Placeholder */}
                <div className="p-4 text-center text-zinc-500">No offers yet</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
