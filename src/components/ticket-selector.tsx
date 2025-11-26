"use client";

import { useState } from "react";
import { useUser, useSmartAccountClient, useAuthModal, useSignerStatus } from "@account-kit/react";
import { encodeFunctionData, formatUnits, decodeEventLog } from "viem";
import { Loader2, Ticket, Users, Wallet, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TicketNFTArtifact from "@/lib/contracts/TicketNFT.json";
import ERC20Artifact from "@/lib/contracts/ERC20.json";
import { GAS_POLICY_ID, USDC_ADDRESS, TICKET_MARKETPLACE_ADDRESS, EventTicketABI } from "@/lib/config";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

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

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState<"idle" | "approving" | "minting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketId);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

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

        if (balance < price) {
          throw new Error(`Insufficient USDC balance. Required: ${(Number(price) / 10**6).toFixed(2)} USDC`);
        }
      }

      // 1. Check USDC Allowance
      if (price > BigInt(0)) {
        setStatus("approving");
        const allowance = await client.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20Artifact.abi,
          functionName: "allowance",
          args: [user.address as `0x${string}`, TICKET_MARKETPLACE_ADDRESS],
        }) as bigint;

        if (allowance < price) {
          const approveData = encodeFunctionData({
            abi: ERC20Artifact.abi,
            functionName: "approve",
            args: [TICKET_MARKETPLACE_ADDRESS, price],
          });

          const txHash = await client.sendTransaction({
            to: USDC_ADDRESS as `0x${string}`,
            data: approveData,
            chain: null,
          });

          await client.waitForTransactionReceipt({ hash: txHash });
        }
      }

      setStatus("minting");

      // 2. Mint Ticket
      const seatNumber = `GA-${Math.floor(Math.random() * 1000)}`;
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
        } catch (e) { /* Ignore */ }
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

      if (!response.ok) throw new Error("Failed to save ticket");

      setStatus("success");
      setSelectedTicketId(null);
      triggerConfetti();

    } catch (error: any) {
      console.error("Minting error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to mint ticket");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="relative overflow-hidden p-8 rounded-[2rem] border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-2xl">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="text-2xl font-bungee text-white mb-8 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
            <Ticket className="w-5 h-5" />
          </div>
          Get Tickets
        </h3>

        <div className="space-y-4 mb-8">
          {ticketTypes.map((ticket) => {
            const isSoldOut = ticket.ticketsSold >= ticket.capacity;
            const isSelected = selectedTicketId === ticket.id;

            return (
              <motion.div
                key={ticket.id}
                onClick={() => !isSoldOut && setSelectedTicketId(ticket.id)}
                whileHover={!isSoldOut ? { scale: 1.02 } : {}}
                whileTap={!isSoldOut ? { scale: 0.98 } : {}}
                className={cn(
                  "group p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden",
                  isSelected
                    ? "border-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    : "border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/10",
                  isSoldOut && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={cn(
                    "font-bold text-lg transition-colors",
                    isSelected ? "text-white" : "text-zinc-400 group-hover:text-white"
                  )}>
                    {ticket.name}
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {isSoldOut ? "Sold Out" : `${ticket.capacity - ticket.ticketsSold} left`}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Gas optimized
                  </div>
                </div>
              </motion.div>
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
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMessage}
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3"
            >
              <div className="p-1 rounded-full bg-green-500/20">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <div className="font-bold">Ticket Minted!</div>
                <div className="text-xs opacity-80">Check your dashboard to view it.</div>
              </div>
            </motion.div>
          )}
          {status === "approving" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-center gap-3"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Approving USDC...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        {!user ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAuthModal}
            className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuy}
            disabled={!selectedTicketId || isMinting || !client}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-white to-zinc-200 text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 relative overflow-hidden"
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
              <>
                Buy Ticket
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </>
            )}
          </motion.button>
        )}

        <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Smart Account</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-bold">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/50 p-2.5 rounded-lg text-xs font-mono text-zinc-400 break-all border border-white/5">
              {user?.address || "Connecting..."}
            </code>
            <button
              onClick={() => {
                if (user?.address) {
                  navigator.clipboard.writeText(user.address);
                }
              }}
              className="p-2.5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 bg-white/5"
              title="Copy Address"
            >
              <Wallet className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
