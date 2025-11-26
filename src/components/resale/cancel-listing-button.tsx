"use client";

import { useState } from "react";
import { useSmartAccountClient } from "@account-kit/react";
import { encodeFunctionData } from "viem";
import { TICKET_MARKETPLACE_ADDRESS, TicketMarketplaceABI } from "@/lib/config";

interface CancelListingButtonProps {
  listingId: string;
  ticketId: string;
  contractAddress: string; // Event's NFT contract address
  price: string;
  deadline: number;
  onSuccess?: () => void;
}

export function CancelListingButton({
  listingId,
  ticketId,
  contractAddress,
  price,
  deadline,
  onSuccess,
}: CancelListingButtonProps) {
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!client) return;

    try {
      setLoading(true);

      if (!client.chain) throw new Error("Client chain not found");

      // Call cancelListing on the contract
      const data = encodeFunctionData({
        abi: TicketMarketplaceABI,
        functionName: "cancelListing",
        args: [
          contractAddress as `0x${string}`,
          BigInt(ticketId),
          BigInt(price),
          BigInt(deadline),
        ],
      });

      const hash = await client.sendTransaction({
        to: TICKET_MARKETPLACE_ADDRESS as `0x${string}`,
        data,
        chain: null,
      });



      // Update backend to mark listing as cancelled
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel listing in database");
      }

      alert("Listing cancelled successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error cancelling listing:", error);
      alert("Failed to cancel listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Cancelling..." : "Cancel Listing"}
    </button>
  );
}

