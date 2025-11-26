"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FusionTicket {
    id: string;
    name: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    image: string;
}

const MOCK_INVENTORY: FusionTicket[] = [
    { id: "1", name: "Neon City Access", rarity: "common", image: "https://images.unsplash.com/photo-1514525253440-b393452e3383?w=400&h=400&fit=crop" },
    { id: "2", name: "Neon City Access", rarity: "common", image: "https://images.unsplash.com/photo-1514525253440-b393452e3383?w=400&h=400&fit=crop" },
    { id: "3", name: "Neon City Access", rarity: "common", image: "https://images.unsplash.com/photo-1514525253440-b393452e3383?w=400&h=400&fit=crop" },
    { id: "4", name: "Cyber Club Pass", rarity: "common", image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400&h=400&fit=crop" },
    { id: "5", name: "Cyber Club Pass", rarity: "common", image: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400&h=400&fit=crop" },
];

export function TicketFusion() {
    const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
    const [isFusing, setIsFusing] = useState(false);
    const [fusedTicket, setFusedTicket] = useState<FusionTicket | null>(null);

    const handleSelect = (id: string) => {
        if (selectedTickets.includes(id)) {
            setSelectedTickets(selectedTickets.filter(tid => tid !== id));
        } else {
            if (selectedTickets.length < 3) {
                setSelectedTickets([...selectedTickets, id]);
            } else {
                toast.error("Max 3 tickets for fusion");
            }
        }
    };

    const handleFusion = () => {
        if (selectedTickets.length < 3) return;

        setIsFusing(true);

        // Simulate fusion process
        setTimeout(() => {
            setIsFusing(false);
            setFusedTicket({
                id: "new-1",
                name: "Neon City VIP Access",
                rarity: "rare",
                image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop"
            });
            setSelectedTickets([]);
            toast.success("Fusion Successful! Item Crafted.");
        }, 3000);
    };

    const reset = () => {
        setFusedTicket(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Inventory Selection */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 h-[500px] flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-zinc-400" />
                        Select Materials (3)
                    </h3>

                    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 flex-1">
                        {MOCK_INVENTORY.map((ticket) => (
                            <motion.div
                                key={ticket.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(ticket.id)}
                                className={cn(
                                    "relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all",
                                    selectedTickets.includes(ticket.id)
                                        ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                        : "border-white/5 hover:border-white/20"
                                )}
                            >
                                <img src={ticket.image} alt={ticket.name} className="w-full h-32 object-cover" />
                                <div className="p-2 bg-zinc-900">
                                    <p className="text-xs font-bold text-white truncate">{ticket.name}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase">{ticket.rarity}</p>
                                </div>
                                {selectedTickets.includes(ticket.id) && (
                                    <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                                        <Sparkles className="w-3 h-3" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Fusion Core */}
                <div className="relative h-[500px] bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden">

                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

                    <AnimatePresence mode="wait">
                        {!fusedTicket ? (
                            <motion.div
                                key="core"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative z-10 flex flex-col items-center"
                            >
                                {/* Slots */}
                                <div className="flex gap-4 mb-12">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="w-20 h-28 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center bg-white/5">
                                            {selectedTickets[i] ? (
                                                <motion.img
                                                    layoutId={selectedTickets[i]}
                                                    src={MOCK_INVENTORY.find(t => t.id === selectedTickets[i])?.image}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            ) : (
                                                <span className="text-zinc-700 text-2xl font-bold">{i + 1}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Fusion Button */}
                                <div className="relative">
                                    {isFusing && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-purple-500 blur-xl"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        />
                                    )}
                                    <Button
                                        size="lg"
                                        disabled={selectedTickets.length < 3 || isFusing}
                                        onClick={handleFusion}
                                        className={cn(
                                            "relative z-10 h-20 w-20 rounded-full border-4 transition-all duration-500",
                                            selectedTickets.length === 3
                                                ? "bg-white text-black border-purple-500 hover:scale-110 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                                                : "bg-zinc-800 text-zinc-500 border-zinc-700"
                                        )}
                                    >
                                        <Zap className={cn("w-8 h-8", isFusing && "animate-spin")} />
                                    </Button>
                                </div>

                                <p className="mt-8 text-zinc-400 font-mono text-sm">
                                    {isFusing ? "FUSION IN PROGRESS..." : "INSERT 3 ITEMS TO FUSE"}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <div className="relative mb-6 group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <img
                                        src={fusedTicket.image}
                                        alt={fusedTicket.name}
                                        className="relative w-64 h-64 object-cover rounded-xl border-2 border-white/20 shadow-2xl"
                                    />
                                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-xs shadow-lg transform rotate-12">
                                        NEW!
                                    </div>
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-2">{fusedTicket.name}</h2>
                                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm font-bold uppercase tracking-wider mb-8">
                                    {fusedTicket.rarity}
                                </div>

                                <Button onClick={reset} variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                                    Fuse Another
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
