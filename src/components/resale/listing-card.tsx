"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyTicketModal } from "./buy-ticket-modal";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/marketplace/cart-provider";
import { RarityBadge } from "@/components/marketplace/rarity-badge";

interface ListingCardProps {
  listing: any;
  onPurchase: () => void;
}

export function ListingCard({ listing, onPurchase }: ListingCardProps) {
  const { addItem } = useCart();
  // Mock contract address for now
  const contractAddress = "0x1234567890abcdef1234567890abcdef12345678";
  const assetUrl = `/assets/${contractAddress}/${listing.ticket.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: listing.id,
      price: Number(listing.price),
      ticket: listing.ticket
    });
  };

  return (
    <Card className="group relative bg-zinc-900 border-zinc-800 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-zinc-700">
      {/* Image Section */}
      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
        <Link href={assetUrl} className="block w-full h-full">
          {listing.ticket.event.coverImageUrl ? (
            <img
              src={listing.ticket.event.coverImageUrl}
              alt={listing.ticket.event.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
              No Image
            </div>
          )}
        </Link>

        {/* Overlay Actions (Visible on Hover) */}
        {/* Overlay Actions (Visible on Hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 pointer-events-none">
          <div className="pointer-events-auto flex gap-2">
            <BuyTicketModal
              listing={listing}
              onSuccess={onPurchase}
              trigger={
                <Button className="bg-white text-black hover:bg-zinc-200 font-semibold">
                  Buy Now
                </Button>
              }
            />
            <Button size="icon" variant="secondary" onClick={handleAddToCart} className="bg-zinc-800/80 backdrop-blur-sm text-white hover:bg-zinc-700">
              <ShoppingCart size={18} />
            </Button>
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80">
            #{listing.ticket.id.slice(0, 4)}
          </Badge>
        </div>

        <div className="absolute top-3 right-3 pointer-events-auto">
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 hover:text-red-500">
            <Heart size={16} />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <Link href={assetUrl} className="block flex-1 min-w-0">
            <h3 className="font-bold text-white truncate pr-2 hover:text-blue-400 transition-colors">{listing.ticket.event.name}</h3>
            <p className="text-xs text-zinc-400">{listing.ticket.event.location}</p>
          </Link>
          <div className="flex gap-2">
            <RarityBadge rarity={listing.ticket.rarity || "Common"} />
            <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] px-2 py-0.5 h-5 shrink-0">
              {listing.ticket.ticketType.name}
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800 flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-white">{Number(listing.price).toFixed(2)}</span>
              <span className="text-xs text-zinc-400">USDC</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500">Last Sale</p>
            <p className="text-xs text-zinc-300">--</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
