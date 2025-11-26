"use client";

import { motion } from "framer-motion";
import { Lock, Unlock, Shield, CheckCircle2, Globe, ArrowRight } from "lucide-react";
import { LayoutGrid } from "./ui/layout-grid";
import { cn } from "@/lib/utils";

const SkeletonOne = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Ticket Minting
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        NFT tickets are minted directly on the blockchain, ensuring unique, verifiable ownership.
      </p>
    </div>
  );
};

const SkeletonTwo = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Private User Data
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Personal information like names and emails are stored securely off-chain with encryption.
      </p>
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Smart Contract Escrow
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Payment is held in escrow until event verification, protecting both buyers and sellers.
      </p>
    </div>
  );
};

const SkeletonFour = () => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Transfer & Resale
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Secondary market transactions are transparent and recorded on-chain with royalty enforcement.
      </p>
    </div>
  );
};

const cards = [
  {
    id: 1,
    content: <SkeletonOne />,
    className: "md:col-span-2",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=3540&auto=format&fit=crop", // Cyberpunk/Tech abstract
  },
  {
    id: 2,
    content: <SkeletonTwo />,
    className: "col-span-1",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=3540&auto=format&fit=crop", // Secure/Lock abstract
  },
  {
    id: 3,
    content: <SkeletonThree />,
    className: "col-span-1",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=3540&auto=format&fit=crop", // Blockchain/Contract abstract
  },
  {
    id: 4,
    content: <SkeletonFour />,
    className: "md:col-span-2",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3540&auto=format&fit=crop", // Global/Network abstract
  },
];

export function ProtocolTransparency() {
  return (
    <div className="relative w-full py-32 overflow-hidden bg-black">
      {/* Aurora Background Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-zinc-500/10 rounded-full blur-[100px] opacity-20" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h3 className="text-5xl md:text-7xl font-bold text-white mb-8 font-bungee tracking-tight">
            Protocol Transparency
          </h3>
          <p className="text-zinc-400 max-w-2xl mx-auto text-xl font-light leading-relaxed">
            Every transaction is cryptographically secure. <br className="hidden md:block" />
            <span className="text-white font-medium">Full visibility</span> on what happens on-chain and what stays private.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="h-screen py-20 w-full">
          <LayoutGrid cards={cards} />
        </div>

        {/* Simplified Flow Visualization */}
        <div className="mt-10 relative border-t border-white/5 pt-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />

            {["User Action", "Smart Contract", "Blockchain Consensus", "Verification"].map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-4 bg-black/50 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {i + 1}
                </div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
