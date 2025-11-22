"use client";

import { useState } from "react";
import { useSmartAccountClient, useUser } from "@account-kit/react";
import { encodeFunctionData } from "viem";
import { Loader2, RefreshCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { GAS_POLICY_ID, EventTicketABI } from "@/lib/config";

interface RefundButtonProps {
  tokenId: string;
  contractAddress: string;
  onRefundSuccess?: () => void;
}

export function RefundButton({ tokenId, contractAddress, onRefundSuccess }: RefundButtonProps) {
  const user = useUser();
  const { client } = useSmartAccountClient({
    type: "LightAccount",
    policyId: GAS_POLICY_ID,
  });

  const [isRefunding, setIsRefunding] = useState(false);
  const [status, setStatus] = useState<"idle" | "refunding" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRefund = async () => {
    if (!client || !user) return;

    if (!confirm("Are you sure you want to refund this ticket? This action cannot be undone.")) {
      return;
    }

    setIsRefunding(true);
    setStatus("refunding");
    setErrorMessage("");

    try {
      const refundData = encodeFunctionData({
        abi: EventTicketABI,
        functionName: "refundTicket",
        args: [BigInt(tokenId)],
      });

      const txHash = await client.sendTransaction({
        to: contractAddress as `0x${string}`,
        data: refundData,
        chain: null,
      });

      console.log("Refund transaction sent:", txHash);

      await client.waitForTransactionReceipt({ hash: txHash });

      // Update database to mark ticket as refunded/deleted
      // Note: In a real app, we might want to keep a record, but for now we'll just delete or update status
      // Assuming we have an API endpoint for this, or we just rely on the chain state.
      // For the UI to update, we should probably call the API.
      
      // Let's assume we have a DELETE endpoint or similar. 
      // Actually, the `api/tickets` endpoint might need a DELETE method or PATCH.
      // For now, we'll just trigger the callback.

      setStatus("success");
      if (onRefundSuccess) {
        onRefundSuccess();
      }

    } catch (error: any) {
      console.error("Refund error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to refund ticket");
    } finally {
      setIsRefunding(false);
    }
  };

  if (status === "success") {
    return (
      <div className="text-green-400 text-sm flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Refunded
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRefund}
        disabled={isRefunding || !client}
        className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRefunding ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <RefreshCcw className="w-3 h-3" />
        )}
        {isRefunding ? "Refunding..." : "Refund Ticket"}
      </button>
      
      {status === "error" && (
        <div className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </div>
      )}
    </div>
  );
}
