"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/resale/listing-card";
import { Copy, Share2, Settings, Grid, List } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfilePage({ params }: { params: { address: string } }) {
  // Mock data
  const user = {
    address: params.address,
    username: "CryptoFan_99",
    bio: "Collector of rare concert tickets and backstage passes.",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
    banner: "https://images.unsplash.com/photo-1514525253440-b393452e8d03?w=1600&q=80",
    joined: "November 2024"
  };

  const collectedItems = [
    {
      id: "1",
      price: "0.5",
      ticket: {
        id: "101",
        ticketType: { name: "VIP" },
        event: {
          name: "Neon Nights Festival",
          location: "Miami, FL",
          coverImageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80"
        }
      }
    },
    // Add more mock items as needed
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Banner */}
      <div className="h-64 md:h-80 w-full relative bg-zinc-900 overflow-hidden group">
        <img 
          src={user.banner} 
          alt="Profile Banner" 
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 mb-8 gap-6">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black overflow-hidden bg-zinc-800">
              <Avatar className="w-full h-full">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pb-2">
            <h1 className="text-3xl font-bold truncate">{user.username}</h1>
            <div className="flex items-center gap-2 text-zinc-400 mt-1">
              <span className="font-mono text-sm bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 flex items-center gap-2">
                {user.address.slice(0, 6)}...{user.address.slice(-4)}
                <Copy size={12} className="cursor-pointer hover:text-white" />
              </span>
              <span className="text-sm">Joined {user.joined}</span>
            </div>
          </div>

          <div className="flex gap-2 pb-2">
            <Button variant="outline" size="icon" className="border-zinc-800 hover:bg-zinc-800">
              <Share2 size={18} />
            </Button>
            <Button variant="outline" size="icon" className="border-zinc-800 hover:bg-zinc-800">
              <Settings size={18} />
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="collected" className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-800">
            <TabsList className="bg-transparent h-12 p-0 space-x-6">
              <TabsTrigger 
                value="collected" 
                className="h-full rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-zinc-400 data-[state=active]:text-white text-base"
              >
                Collected <span className="ml-2 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">12</span>
              </TabsTrigger>
              <TabsTrigger 
                value="created" 
                className="h-full rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-zinc-400 data-[state=active]:text-white text-base"
              >
                Created <span className="ml-2 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">5</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="h-full rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent text-zinc-400 data-[state=active]:text-white text-base"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:flex gap-2">
              <Button variant="ghost" size="icon" className="text-white bg-zinc-900"><Grid size={18} /></Button>
              <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white"><List size={18} /></Button>
            </div>
          </div>

          <TabsContent value="collected" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collectedItems.map((item) => (
                <ListingCard 
                  key={item.id} 
                  listing={item} 
                  onPurchase={() => {}} 
                />
              ))}
              {/* Duplicate for demo */}
              {collectedItems.map((item) => (
                <ListingCard 
                  key={item.id + "dup"} 
                  listing={{...item, id: item.id + "dup"}} 
                  onPurchase={() => {}} 
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="created" className="mt-6">
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
              No created events yet.
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
             <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
              No recent activity.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
