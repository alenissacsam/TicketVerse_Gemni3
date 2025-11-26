"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Tag, Gavel, Clock } from "lucide-react";
import { useSmartAccountClient, useUser } from "@account-kit/react";
import { TICKET_MARKETPLACE_ADDRESS, TICKET_NFT_ADDRESS, TicketMarketplaceABI, TicketNFTABI } from "@/lib/config";
import { encodeFunctionData } from "viem";

interface SellTicketModalProps {
  ticketId: string; // Database ID
  tokenId: string; // On-chain Token ID
  onSuccess: () => void;
}

export function SellTicketModal({ ticketId, tokenId, onSuccess }: SellTicketModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [listingType, setListingType] = useState("fixed");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("7");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"IDLE" | "APPROVING" | "SIGNING" | "LISTING">("IDLE");

  const user = useUser();
  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const handleSell = async () => {
    if (!client || !user || !price) return;

    setLoading(true);
    try {
      const priceInUSDC = Number(price) * 1000000; // 6 decimals
      const deadline = Math.floor(Date.now() / 1000) + Number(duration) * 24 * 60 * 60;

      // 1. Approve Marketplace to spend NFT
      setStep("APPROVING");
      const isApprovedForAll = await client.readContract({
        address: TICKET_NFT_ADDRESS,
        abi: TicketNFTABI,
        functionName: "isApprovedForAll",
        args: [user.address as `0x${string}`, TICKET_MARKETPLACE_ADDRESS]
      }) as boolean;

      if (!isApprovedForAll) {
        const approveData = encodeFunctionData({
          abi: TicketNFTABI,
          functionName: "setApprovalForAll",
          args: [TICKET_MARKETPLACE_ADDRESS, true]
        });

        const hash = await client.sendTransaction({
          to: TICKET_NFT_ADDRESS,
          data: approveData,
          chain: null
        });

        await client.waitForTransactionReceipt({ hash });
      }

      // 2. Sign EIP-712 Message
      setStep("SIGNING");

      if (!client.chain) throw new Error("Client chain not found");

      const domain = {
        name: "TicketMarketplace",
        version: "1",
        chainId: client.chain.id,
        verifyingContract: TICKET_MARKETPLACE_ADDRESS,
      } as const;

      const types = {
        Listing: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      } as const;

      const message = {
        nftContract: TICKET_NFT_ADDRESS,
        tokenId: BigInt(tokenId),
        price: BigInt(priceInUSDC),
        deadline: BigInt(deadline),
      } as const;

      const signature = await client.signTypedData({
        domain,
        types,
        primaryType: "Listing",
        message,
      } as any);

      // 3. Create Listing in Backend
      setStep("LISTING");
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          sellerId: user.address,
          price: Number(price),
          deadline,
          signature,
          type: listingType // 'fixed' or 'auction'
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create listing");
      }

      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error listing ticket:", error);
      alert("Failed to list ticket. Please try again.");
    } finally {
      setLoading(false);
      setStep("IDLE");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <Tag className="mr-2 h-4 w-4" />
          Sell Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>List Ticket for Sale</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="fixed" onValueChange={setListingType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger value="fixed" className="data-[state=active]:bg-zinc-800">Fixed Price</TabsTrigger>
            <TabsTrigger value="auction" className="data-[state=active]:bg-zinc-800">Timed Auction</TabsTrigger>
          </TabsList>

          <div className="py-6 space-y-6">
            <TabsContent value="fixed" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Price (USDC)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white pl-10"
                  />
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="auction" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Starting Price (USDC)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white pl-10"
                  />
                  <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
                Highest bidder wins at the end of the auction period.
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Service Fee</span>
                <span className="text-zinc-400">2.5%</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total Potential Earnings</span>
                <span>{price ? (Number(price) * 0.975).toFixed(4) : "0.00"} USDC</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSell}
            disabled={loading || !price}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === "APPROVING" ? "Approving NFT..." :
                  step === "SIGNING" ? "Signing Listing..." :
                    "Creating Listing..."}
              </>
            ) : (
              listingType === "fixed" ? "Complete Listing" : "Start Auction"
            )}
          </Button>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
