"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  status: "active" | "completed" | "claimed";
  deadline?: string;
}

const MOCK_BOUNTIES: Bounty[] = [
  {
    id: "1",
    title: "Social Butterfly",
    description: "Attend 3 different events this month.",
    reward: "500 XP + 'Party Animal' Badge",
    progress: 2,
    total: 3,
    status: "active",
    deadline: "2 days left"
  },
  {
    id: "2",
    title: "Early Bird",
    description: "Mint a ticket within the first hour of sale.",
    reward: "Rare Mystery Box",
    progress: 1,
    total: 1,
    status: "completed"
  },
  {
    id: "3",
    title: "Squad Leader",
    description: "Create a squad and buy 5 tickets together.",
    reward: "1000 XP + 10% Discount Token",
    progress: 0,
    total: 5,
    status: "active"
  },
  {
    id: "4",
    title: "Collector",
    description: "Own 5 tickets from different organizers.",
    reward: "Legendary Frame",
    progress: 5,
    total: 5,
    status: "claimed"
  }
];

export function BountyBoard() {
  const [bounties, setBounties] = useState<Bounty[]>(MOCK_BOUNTIES);

  const handleClaim = (id: string) => {
    setBounties(bounties.map(b => 
      b.id === id ? { ...b, status: "claimed" } : b
    ));
    toast.success("Reward Claimed!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Total XP</p>
            <p className="text-2xl font-bold text-white">12,450</p>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Active Missions</p>
            <p className="text-2xl font-bold text-white">2</p>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-white">15</p>
          </div>
        </div>
      </div>

      {/* Bounties List */}
      <div className="space-y-4">
        {bounties.map((bounty, index) => (
          <motion.div
            key={bounty.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-6 transition-all",
              bounty.status === "completed" 
                ? "bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/50" 
                : "bg-zinc-900/30 border-white/5 hover:border-white/10"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              {/* Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{bounty.title}</h3>
                  {bounty.deadline && (
                    <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {bounty.deadline}
                    </span>
                  )}
                </div>
                <p className="text-zinc-400">{bounty.description}</p>
                <div className="flex items-center gap-2 text-sm text-purple-300 font-medium">
                  <Trophy className="w-4 h-4" />
                  Reward: {bounty.reward}
                </div>
              </div>

              {/* Progress & Action */}
              <div className="w-full md:w-64 space-y-3">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Progress</span>
                  <span>{bounty.progress} / {bounty.total}</span>
                </div>
                <Progress value={(bounty.progress / bounty.total) * 100} className="h-2 bg-zinc-800" />
                
                {bounty.status === "active" && (
                  <Button disabled variant="outline" className="w-full border-white/10 text-zinc-500">
                    In Progress
                  </Button>
                )}
                {bounty.status === "completed" && (
                  <Button 
                    onClick={() => handleClaim(bounty.id)}
                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                  >
                    Claim Reward
                  </Button>
                )}
                {bounty.status === "claimed" && (
                  <Button disabled variant="ghost" className="w-full text-green-500 bg-green-500/10">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Claimed
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
