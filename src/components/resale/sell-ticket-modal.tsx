"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Tag } from "lucide-react";
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
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"IDLE" | "APPROVING" | "SIGNING" | "LISTING">("IDLE");
  
  const user = useUser();
  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const handleSell = async () => {
    if (!client || !user || !price) return;
    
    setLoading(true);
    try {
      const priceInUSDC = Number(price) * 1000000; // 6 decimals
      const deadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now

      // 1. Approve Marketplace to spend NFT
      setStep("APPROVING");
      // Check allowance first (optimization)
      const approvedAddress = await client.readContract({
        address: TICKET_NFT_ADDRESS,
        abi: TicketNFTABI,
        functionName: "getApproved",
        args: [BigInt(tokenId)]
      });

      const isApprovedForAll = await client.readContract({
        address: TICKET_NFT_ADDRESS,
        abi: TicketNFTABI,
        functionName: "isApprovedForAll",
        args: [user.address as `0x${string}`, TICKET_MARKETPLACE_ADDRESS]
      });

      if (approvedAddress !== TICKET_MARKETPLACE_ADDRESS && !isApprovedForAll) {
        const hash = await client.sendTransaction({
          to: TICKET_NFT_ADDRESS,
          data: encodeFunctionData({
            abi: TicketNFTABI,
            functionName: "approve",
            args: [TICKET_MARKETPLACE_ADDRESS, BigInt(tokenId)]
          })
        });
        await client.waitForTransactionReceipt({ hash });
      }

      // 2. Sign EIP-712 Message
      setStep("SIGNING");
      
      if (!client.chain) throw new Error("Client chain not found");

      // Domain Separator
      const domain = {
        name: "TicketMarketplace",
        version: "1",
        chainId: client.chain.id,
        verifyingContract: TICKET_MARKETPLACE_ADDRESS,
      } as const;

      // Types
      const types = {
        Listing: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      } as const;

      // Message
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
      });

      // 3. Create Listing in Backend
      setStep("LISTING");
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          sellerId: user.address, // Using wallet address as ID for now, backend should handle lookup
          price: Number(price),
          deadline,
          signature
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
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>List Ticket for Sale</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Price (USDC)</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-xs text-zinc-500">
              Platform fee: 2.5%
            </p>
          </div>
          
          <Button 
            onClick={handleSell} 
            disabled={loading || !price}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === "APPROVING" ? "Approving NFT..." : 
                 step === "SIGNING" ? "Signing Listing..." : 
                 "Creating Listing..."}
              </>
            ) : (
              "List Ticket"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
