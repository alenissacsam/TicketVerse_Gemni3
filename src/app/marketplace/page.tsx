"use client";

import { useState, useEffect } from "react";
import { MarketplaceLayout } from "@/components/marketplace/marketplace-layout";
import { ListingCard } from "@/components/resale/listing-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Loader2, Store, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      // API returns {listings: [...]}
      setListings(data.listings || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter((l) => {
    if (!search) return true;
    const eventName = l?.ticket?.event?.name || "";
    const ticketType = l?.ticket?.ticketType?.name || "";
    return eventName.toLowerCase().includes(search.toLowerCase()) ||
      ticketType.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <MarketplaceLayout sidebar={<MarketplaceFilters />}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-6xl font-bungee mb-3">
          <span className="text-white">Marketplace</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Buy and sell NFT tickets on the secondary market
        </p>
      </motion.div>

      {/* Search & Sort */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-6 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 rounded-2xl backdrop-blur-sm focus:border-purple-500/50 focus:ring-purple-500/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <Select defaultValue="recent">
          <SelectTrigger className="w-full md:w-[200px] bg-zinc-900/50 border-white/10 rounded-2xl h-[52px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Listed</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
      >
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Active Listings</p>
          <p className="text-2xl font-bold text-white">{listings.length}</p>
        </div>
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-white">1,240 USDC</p>
        </div>
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Floor Price</p>
          <p className="text-2xl font-bold text-white">
            {listings.length > 0 ? `${Math.min(...listings.map(l => Number(l.price)))} USDC` : "N/A"}
          </p>
        </div>
        <div className="glass-premium p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 uppercase font-medium mb-1">24h Sales</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </motion.div>

      {/* Trending Events */}
      {listings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-purple-400 w-6 h-6" />
            <h2 className="text-2xl font-bungee text-white">Trending Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer glass-premium">
                <img
                  src={`https://images.unsplash.com/photo-${i === 1 ? "1540039155795-c205c3371640" : i === 2 ? "1501281668745-13bc6a60fe3d" : "1459749411175-04bf5292ceea"}?w=800&q=80`}
                  alt="Event"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-white mb-1">Trending Event</h3>
                  <p className="text-sm text-zinc-300">Floor: 50 USDC</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : filteredListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 glass-premium rounded-3xl"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bungee text-white mb-3">
            {search ? "No listings found" : "No active listings"}
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            {search
              ? "Try adjusting your search query"
              : "Be the first to list a ticket on the marketplace"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bungee text-white mb-6 flex items-center gap-3">
            All Listings
            <span className="text-lg text-zinc-500 font-normal">({filteredListings.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ListingCard listing={listing} onPurchase={fetchListings} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </MarketplaceLayout>
  );
}
