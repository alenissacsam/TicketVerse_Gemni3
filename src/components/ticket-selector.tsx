"use client";

import { useState } from "react";
import { useUser, useSmartAccountClient, useAuthModal, useSignerStatus } from "@account-kit/react";
import { encodeFunctionData, formatUnits, decodeEventLog } from "viem";
import { Loader2, Ticket, Users, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TicketNFTArtifact from "@/lib/contracts/TicketNFT.json";
import ERC20Artifact from "@/lib/contracts/ERC20.json";
import { GAS_POLICY_ID, USDC_ADDRESS, TICKET_MARKETPLACE_ADDRESS, EventTicketABI } from "@/lib/config";

interface TicketType {
  id: string;
  name: string;
  price: number;
  capacity: number;
  ticketsSold: number;
}

interface TicketSelectorProps {
  eventId: string;
  contractAddress: string;
  ticketTypes: TicketType[];
}

export function TicketSelector({ eventId, contractAddress, ticketTypes }: TicketSelectorProps) {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const { isConnected } = useSignerStatus();
  const signerStatus = useSignerStatus();
  const { client } = useSmartAccountClient({
    type: "LightAccount",
    policyId: GAS_POLICY_ID,
  });

  console.log("TicketSelector Debug:", { user, signerStatus, client });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState<"idle" | "approving" | "minting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketId);

  const handleBuy = async () => {
    if (!client || !user || !selectedTicket) {
      return;
    }

    setIsMinting(true);
    setStatus("minting");
    setErrorMessage("");

    try {
      const price = BigInt(Math.floor(selectedTicket.price * 10 ** 6)); // USDC has 6 decimals

      // 0. Check USDC Balance
      if (price > BigInt(0)) {
        const balance = await client.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20Artifact.abi,
          functionName: "balanceOf",
          args: [user.address as `0x${string}`],
        }) as bigint;

        console.log('USDC Balance:', balance.toString(), 'Required:', price.toString());

        if (balance < price) {
          throw new Error(`Insufficient USDC balance. Required: ${(Number(price) / 10**6).toFixed(2)} USDC, Balance: ${(Number(balance) / 10**6).toFixed(2)} USDC`);
        }
      }

      // 1. Check USDC Allowance for TicketMarketplace
      if (price > BigInt(0)) {
        setStatus("approving");
        const allowance = await client.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20Artifact.abi,
          functionName: "allowance",
          args: [user.address as `0x${string}`, TICKET_MARKETPLACE_ADDRESS],
        }) as bigint;

        if (allowance < price) {
          console.log("Approving USDC for Marketplace...");
          const approveData = encodeFunctionData({
            abi: ERC20Artifact.abi,
            functionName: "approve",
            args: [TICKET_MARKETPLACE_ADDRESS, price],
          });

          const approveTxHash = await client.sendTransaction({
            to: USDC_ADDRESS as `0x${string}`,
            data: approveData,
            chain: null,
          });

          await client.waitForTransactionReceipt({ hash: approveTxHash });
          console.log("USDC Approved");
        }
      }

      setStatus("minting");

      // 2. Mint Ticket
      const seatNumber = `GA-${Math.floor(Math.random() * 1000)}`;
      // Find the tier index (0-based) of the selected ticket
      const tierId = ticketTypes.findIndex(t => t.id === selectedTicket.id); 

      const mintData = encodeFunctionData({
        abi: EventTicketABI,
        functionName: "mint",
        args: [BigInt(tierId), seatNumber],
      });

      const txHash = await client.sendTransaction({
        to: contractAddress as `0x${string}`,
        data: mintData,
        chain: null,
      });

      console.log("Transaction sent:", txHash);

      await client.waitForTransactionReceipt({ hash: txHash });

      // 3. Save to Database
      const receipt = await client.getTransactionReceipt({ hash: txHash });

      let tokenId = "0";

      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: EventTicketABI,
            data: log.data,
            topics: log.topics,
          });

          if (decodedLog.eventName === "TicketMinted") {
            tokenId = ((decodedLog.args as unknown) as { tokenId: bigint }).tokenId.toString();
            break;
          }
        } catch (e) {
          // Ignore
        }
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenId,
          eventId,
          ticketTypeId: selectedTicket.id,
          ownerAddress: user.address,
          transactionHash: txHash,
          price: selectedTicket.price
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save ticket to database");
      }

      setStatus("success");
      setSelectedTicketId(null);

    } catch (error: any) {
      console.error("Minting error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to mint ticket");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
      <h3 className="text-2xl font-bungee text-white mb-6 flex items-center gap-2">
        <Ticket className="w-6 h-6" />
        Get Tickets
      </h3>

      <div className="space-y-4 mb-8">
        {ticketTypes.map((ticket) => {
          const isSoldOut = ticket.ticketsSold >= ticket.capacity;
          const isSelected = selectedTicketId === ticket.id;

          return (
            <div
              key={ticket.id}
              onClick={() => !isSoldOut && setSelectedTicketId(ticket.id)}
              className={`group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${isSelected
                ? "border-white bg-white/10"
                : "border-white/10 bg-black/40 hover:bg-white/5"
                } ${isSoldOut ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`font-bold transition-colors ${isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                  {ticket.name}
                </div>
                <div className="text-lg font-bold text-white">
                  {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  {isSoldOut ? "Sold Out" : `${ticket.capacity - ticket.ticketsSold} left`}
                </div>
                <div>+ Gas</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Messages */}
      <AnimatePresence mode="wait">
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Ticket minted successfully!
          </motion.div>
        )}
        {status === "approving" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Approving USDC...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      {!user ? (
        <button
          onClick={openAuthModal}
          className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </button>
      ) : (
        <button
          onClick={handleBuy}
          disabled={!selectedTicketId || isMinting || !client}
          className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isMinting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {status === "approving" ? "Approving..." : "Minting..."}
            </>
          ) : !client ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initializing...
            </>
          ) : (
            "Buy Ticket"
          )}
        </button>
      )}

      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Your Smart Account</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-black/30 p-2 rounded text-xs font-mono text-zinc-300 break-all">
            {user?.address || "Connecting..."}
          </code>
          <button
            onClick={() => {
              if (user?.address) {
                navigator.clipboard.writeText(user.address);
                // Optional: Show toast
              }
            }}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Copy Address"
          >
            <Wallet className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2">
          Note: This is a Smart Account. Deposit USDC here to purchase.
        </p>
      </div>

      <p className="text-xs text-center text-zinc-600 mt-4">
        Powered by Alchemy Account Kit
      </p>
    </div>
  );
}
