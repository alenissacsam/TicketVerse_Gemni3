"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Tag, Zap, Activity, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "buy" | "list" | "mint";

interface PulseEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: number;
  user: string;
  amount?: string;
  image?: string;
}

const MOCK_USERS = ["0x71...3A", "0x92...1B", "CryptoKing", "NFT_Whale", "Alice.eth", "Bob.sol"];
const MOCK_EVENTS = [
  "Neon Nights VIP",
  "Cyber Rave 2077",
  "EthGlobal Hackathon",
  "Tomorrowland Pass",
  "Bored Ape Yacht Party",
];

const generateEvent = (): PulseEvent => {
  const type = Math.random() > 0.6 ? "buy" : Math.random() > 0.3 ? "list" : "mint";
  const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
  const eventName = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
  
  let message = "";
  let amount = "";

  switch (type) {
    case "buy":
      amount = `${(Math.random() * 2).toFixed(2)} ETH`;
      message = `purchased ${eventName}`;
      break;
    case "list":
      amount = `${(Math.random() * 3).toFixed(2)} ETH`;
      message = `listed ${eventName}`;
      break;
    case "mint":
      message = `minted a ticket for ${eventName}`;
      break;
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message,
    timestamp: Date.now(),
    user,
    amount,
  };
};

export function LivePulse() {
  const [events, setEvents] = useState<PulseEvent[]>([]);

  useEffect(() => {
    // Initial population
    const initialEvents = Array.from({ length: 5 }, generateEvent);
    setEvents(initialEvents);

    // Live updates
    const interval = setInterval(() => {
      setEvents((prev) => [generateEvent(), ...prev.slice(0, 9)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-14 flex items-center overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      {/* Gradient Line at Top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Label Section */}
      <div className="relative z-20 flex items-center gap-3 px-6 h-full bg-black/20 backdrop-blur-md border-r border-white/10 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
        </div>
        <span className="text-sm font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 uppercase drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
          Live Pulse
        </span>
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 overflow-hidden relative mask-linear-fade">
        <motion.div 
          className="flex items-center gap-12 px-4 whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 30,
          }}
        >
          {[...events, ...events, ...events].map((event, i) => (
            <div key={`${event.id}-${i}`} className="flex items-center gap-3 group">
              <div className={cn(
                "p-1.5 rounded-lg transition-colors duration-300",
                event.type === "buy" ? "bg-green-500/10 text-green-400 group-hover:bg-green-500/20 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]" :
                event.type === "list" ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]" :
                "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              )}>
                {event.type === "buy" && <ShoppingCart size={14} />}
                {event.type === "list" && <Tag size={14} />}
                {event.type === "mint" && <Zap size={14} />}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-white/90 group-hover:text-white transition-colors">{event.user}</span>
                <span className="text-white/50 group-hover:text-white/70 transition-colors">{event.message}</span>
                {event.amount && (
                  <span className="font-mono font-medium text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/80 group-hover:border-white/20 group-hover:text-white transition-all">
                    {event.amount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Fade Overlay Right */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-black/50 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
