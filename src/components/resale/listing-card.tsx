"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useSmartAccountClient, useUser } from "@account-kit/react";
import { TICKET_MARKETPLACE_ADDRESS, TICKET_NFT_ADDRESS, TicketMarketplaceABI, USDC_ADDRESS } from "@/lib/config";
import { encodeFunctionData, parseAbi } from "viem";

interface ListingCardProps {
  listing: any;
  onPurchase: () => void;
}

export function ListingCard({ listing, onPurchase }: ListingCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "APPROVING" | "BUYING">("IDLE");
  
  const user = useUser();
  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const handleBuy = async () => {
    if (!client || !user) return;
    
    setLoading(true);
    try {
      const priceInUSDC = BigInt(Math.floor(Number(listing.price) * 1000000));
      
      // 1. Approve USDC
      setStatus("APPROVING");
      const usdcAbi = parseAbi([
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ]);

      const allowance = await client.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: usdcAbi,
        functionName: "allowance",
        args: [user.address as `0x${string}`, TICKET_MARKETPLACE_ADDRESS]
      });

      if (!client.chain) throw new Error("Client chain not found");

      if (allowance < priceInUSDC) {
        const hash = await client.sendTransaction({
          to: USDC_ADDRESS as `0x${string}`,
          data: encodeFunctionData({
            abi: usdcAbi,
            functionName: "approve",
            args: [TICKET_MARKETPLACE_ADDRESS, priceInUSDC]
          })
        });
        await client.waitForTransactionReceipt({ hash });
      }

      // 2. Execute Buy Transaction
      setStatus("BUYING");
      
      // Parse signature (assuming it's hex string, need to split v, r, s)
      // If signature is 65 bytes: r (32) + s (32) + v (1)
      const sig = listing.signature as `0x${string}`;
      const r = sig.slice(0, 66) as `0x${string}`;
      const s = ("0x" + sig.slice(66, 130)) as `0x${string}`;
      const v = parseInt(sig.slice(130, 132), 16);

      const buyHash = await client.sendTransaction({
        to: TICKET_MARKETPLACE_ADDRESS,
        data: encodeFunctionData({
          abi: TicketMarketplaceABI,
          functionName: "buyTicket",
          args: [
            TICKET_NFT_ADDRESS,
            BigInt(listing.ticket.tokenId),
            priceInUSDC,
            BigInt(Math.floor(new Date(listing.deadline).getTime() / 1000)),
            listing.seller.walletAddress as `0x${string}`,
            v,
            r,
            s
          ]
        })
      });

      await client.waitForTransactionReceipt({ hash: buyHash });
      
      // 3. Update UI (optimistic or callback)
      onPurchase();
      
    } catch (error) {
      console.error("Error buying ticket:", error);
      alert("Failed to purchase ticket. Please try again.");
    } finally {
      setLoading(false);
      setStatus("IDLE");
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
      <div className="h-32 bg-zinc-800 relative">
        {listing.ticket.event.coverImageUrl && (
          <img
            src={listing.ticket.event.coverImageUrl}
            alt={listing.ticket.event.name}
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <Badge className="absolute top-2 right-2 bg-blue-600">
          {listing.ticket.ticketType.name}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-white text-lg truncate">{listing.ticket.event.name}</CardTitle>
        <CardDescription>
          Seller: {listing.seller.email || listing.seller.walletAddress.slice(0, 6) + "..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-zinc-400 text-sm">Price</span>
          <span className="text-xl font-bold text-white">{Number(listing.price).toFixed(2)} USDC</span>
        </div>
        <Button 
          onClick={handleBuy} 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {status === "APPROVING" ? "Approving USDC..." : "Buying..."}
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
