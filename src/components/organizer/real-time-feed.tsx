"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Ticket, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  type: "scan" | "sale";
  message: string;
  timestamp: string;
  value?: string;
}

const MOCK_FEED: FeedItem[] = [
  { id: "1", type: "scan", message: "Ticket #4092 scanned at Gate A", timestamp: "Just now" },
  { id: "2", type: "sale", message: "VIP Pass sold to 0x82...91", timestamp: "2 min ago", value: "+0.5 ETH" },
  { id: "3", type: "scan", message: "Ticket #1122 scanned at VIP Entrance", timestamp: "5 min ago" },
  { id: "4", type: "sale", message: "General Admission sold to 0x11...22", timestamp: "8 min ago", value: "+0.1 ETH" },
];

export function RealTimeFeed() {
  const [items, setItems] = useState<FeedItem[]>(MOCK_FEED);

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem: FeedItem = Math.random() > 0.5 
        ? { 
            id: Math.random().toString(), 
            type: "scan", 
            message: `Ticket #${Math.floor(Math.random() * 9000) + 1000} scanned at Gate ${["A", "B", "C"][Math.floor(Math.random() * 3)]}`, 
            timestamp: "Just now" 
          }
        : { 
            id: Math.random().toString(), 
            type: "sale", 
            message: `Ticket sold to 0x${Math.floor(Math.random() * 10000)}...`, 
            timestamp: "Just now",
            value: `+${(Math.random() * 0.5).toFixed(2)} ETH`
          };
      
      setItems(prev => [newItem, ...prev.slice(0, 4)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-md",
                item.type === "scan" ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"
              )}>
                {item.type === "scan" ? <Scan size={16} /> : <DollarSign size={16} />}
              </div>
              <div>
                <p className="text-sm text-white/90 font-medium">{item.message}</p>
                <p className="text-xs text-white/50">{item.timestamp}</p>
              </div>
            </div>
            {item.value && (
              <span className="text-sm font-mono text-green-400 font-bold">{item.value}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
