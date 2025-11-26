"use client";

import { useState, useEffect } from "react";
import { MarketplaceLayout } from "@/components/marketplace/marketplace-layout";
import { ListingCard } from "@/components/resale/listing-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, TrendingUp, Loader2 } from "lucide-react";
import { GlobalSearch } from "@/components/global-search";

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter(l => 
    l.ticket.event.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MarketplaceLayout sidebar={<MarketplaceFilters />}>
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="w-full md:w-auto flex-1">
          <GlobalSearch />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select defaultValue="recent">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Listed</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-white">1,240 ETH</p>
        </div>
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Floor Price</p>
          <p className="text-2xl font-bold text-white">0.05 ETH</p>
        </div>
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Listed</p>
          <p className="text-2xl font-bold text-white">8%</p>
        </div>
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Owners</p>
          <p className="text-2xl font-bold text-white">3.2K</p>
        </div>
      </div>

      {/* Trending Events */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-500" />
          <h2 className="text-2xl font-bold">Trending Events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer">
              <img 
                src={`https://images.unsplash.com/photo-${i === 1 ? "1540039155795-c205c3371640" : i === 2 ? "1501281668745-13bc6a60fe3d" : "1459749411175-04bf5292ceea"}?w=800&q=80`} 
                alt="Event" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-1">Neon Nights Festival</h3>
                <p className="text-sm text-zinc-300">Floor: 0.5 ETH</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
          <p className="text-zinc-500">No active listings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              onPurchase={fetchListings}
            />
          ))}
        </div>
      )}
    </MarketplaceLayout>
  );
}
