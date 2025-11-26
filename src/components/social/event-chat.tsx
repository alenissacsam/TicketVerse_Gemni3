"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isVerified?: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    user: "CryptoKing",
    avatar: "https://i.pravatar.cc/150?u=1",
    text: "Anyone going to the afterparty?",
    timestamp: "10:42 AM",
    isVerified: true,
  },
  {
    id: "2",
    user: "Alice_WAGMI",
    avatar: "https://i.pravatar.cc/150?u=2",
    text: "Just minted my VIP pass! 🚀",
    timestamp: "10:43 AM",
  },
  {
    id: "3",
    user: "TicketMaster99",
    text: "Prices are mooning right now.",
    timestamp: "10:45 AM",
  },
];

export function EventChat({ eventId, isTicketHolder = false }: { eventId: string; isTicketHolder?: boolean }) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      user: "You",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVerified: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  if (!isTicketHolder) {
    return (
      <div className="h-[600px] w-full max-w-md bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-white/40" />
        </div>
        <h3 className="text-xl font-bold text-white">Token Gated Chat</h3>
        <p className="text-zinc-400 text-sm">
          You must hold a ticket for this event to join the conversation.
        </p>
        <Button className="bg-white text-black hover:bg-zinc-200">
          Buy Ticket to Join
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full max-w-md bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-bold text-white">Live Chat</h3>
          <span className="text-xs text-zinc-500 ml-2">{messages.length} online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" ref={scrollRef}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-3",
              msg.user === "You" ? "flex-row-reverse" : ""
            )}
          >
            <Avatar className="w-8 h-8 border border-white/10">
              <AvatarImage src={msg.avatar} />
              <AvatarFallback className="bg-zinc-800 text-xs">{msg.user[0]}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex flex-col max-w-[80%]",
              msg.user === "You" ? "items-end" : "items-start"
            )}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-medium text-zinc-400">{msg.user}</span>
                {msg.isVerified && <ShieldCheck className="w-3 h-3 text-blue-400" />}
                <span className="text-[10px] text-zinc-600">{msg.timestamp}</span>
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm",
                msg.user === "You" 
                  ? "bg-white text-black rounded-tr-none" 
                  : "bg-zinc-800 text-zinc-200 rounded-tl-none"
              )}>
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Say something..."
            className="bg-black/20 border-white/10 focus:border-white/30 text-white placeholder:text-zinc-600"
          />
          <Button type="submit" size="icon" className="bg-white text-black hover:bg-zinc-200">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
