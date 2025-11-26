"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Tag, Zap, Activity, Ticket, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "buy" | "list" | "mint";

interface ActivityEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: number;
  user: string;
  amount?: string;
  timeAgo: string;
}

const MOCK_USERS = ["0x71...3A", "0x92...1B", "CryptoKing", "NFT_Whale", "Alice.eth", "Bob.sol"];
const MOCK_EVENTS = [
  "Neon Nights VIP",
  "Cyber Rave 2077",
  "EthGlobal Hackathon",
  "Tomorrowland Pass",
  "Bored Ape Yacht Party",
];

const generateEvent = (): ActivityEvent => {
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
      message = `minted ${eventName}`;
      break;
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message,
    timestamp: Date.now(),
    user,
    amount,
    timeAgo: "Just now"
  };
};

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const initialEvents = Array.from({ length: 4 }, generateEvent);
    setEvents(initialEvents);

    const interval = setInterval(() => {
      setEvents((prev) => [generateEvent(), ...prev.slice(0, 5)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-md overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          Live Activity
        </h3>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      <div className="p-2 space-y-2">
        <AnimatePresence mode="popLayout">
          {events.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "p-1 rounded-md bg-opacity-20",
                    event.type === "buy" ? "bg-green-500 text-green-400" :
                    event.type === "list" ? "bg-blue-500 text-blue-400" :
                    "bg-purple-500 text-purple-400"
                  )}>
                    {event.type === "buy" && <ShoppingCart size={12} />}
                    {event.type === "list" && <Tag size={12} />}
                    {event.type === "mint" && <Zap size={12} />}
                  </span>
                  <span className="text-xs font-bold text-white/90">{event.user}</span>
                </div>
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  <Clock size={10} />
                  {event.timeAgo}
                </span>
              </div>
              
              <p className="text-xs text-white/70 leading-relaxed mb-1">
                {event.message}
              </p>
              
              {event.amount && (
                <div className="flex justify-end">
                  <span className="text-xs font-mono font-medium text-white/90 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                    {event.amount}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
