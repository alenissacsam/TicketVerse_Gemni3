"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TicketFusion } from "@/components/gamification/ticket-fusion";
import { BountyBoard } from "@/components/gamification/bounty-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Target } from "lucide-react";

export default function RewardsPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-28 px-6 pb-24 pl-28 bg-gradient-to-br from-zinc-900 to-black">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bungee text-white"
                    >
                        Rewards Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-zinc-400 max-w-2xl"
                    >
                        Complete missions to earn XP and fuse your tickets into legendary collectibles.
                    </motion.p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="fusion" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-zinc-900/50 border border-white/10 mb-8">
                        <TabsTrigger value="fusion" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Fusion Lab
                        </TabsTrigger>
                        <TabsTrigger value="bounties" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            <Target className="w-4 h-4 mr-2" />
                            Bounty Board
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="fusion" className="mt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <TicketFusion />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="bounties" className="mt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <BountyBoard />
                        </motion.div>
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
}
