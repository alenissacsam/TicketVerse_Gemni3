"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Copy, Check, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface SquadMember {
  id: string;
  name: string;
  avatar?: string;
  isLeader?: boolean;
  status: "ready" | "pending";
}

const MOCK_FRIENDS = [
  { id: "2", name: "Alice", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: "3", name: "Bob", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: "4", name: "Charlie", avatar: "https://i.pravatar.cc/150?u=4" },
];

export function SquadBuilder() {
  const [squad, setSquad] = useState<SquadMember[]>([
    { id: "1", name: "You", isLeader: true, status: "ready" }
  ]);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  const handleInvite = (friend: typeof MOCK_FRIENDS[0]) => {
    if (squad.find(m => m.id === friend.id)) return;
    setSquad([...squad, { ...friend, isLeader: false, status: "pending" }]);
    toast.success(`Invited ${friend.name} to squad`);
  };

  const handleRemove = (id: string) => {
    setSquad(squad.filter(m => m.id !== id));
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://ticketverse.app/squad/join/123");
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
    toast.success("Invite link copied!");
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Squad Builder
            </h3>
            <p className="text-zinc-400 text-sm">Assemble your crew for group seating.</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium">
            {squad.length}/5 Members
          </div>
        </div>

        {/* Squad Grid */}
        <div className="grid grid-cols-5 gap-2">
          <AnimatePresence>
            {squad.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-zinc-800 group-hover:border-purple-500/50 transition-colors">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-zinc-800 text-xs">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  {member.isLeader && (
                    <div className="absolute -top-2 -right-1 bg-yellow-500 text-black p-[2px] rounded-full">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                  {member.status === "pending" && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                      <span className="text-[10px] text-white/80">...</span>
                    </div>
                  )}
                  {!member.isLeader && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-center mt-1 text-zinc-400 truncate w-full">
                  {member.name}
                </p>
              </motion.div>
            ))}
            
            {/* Add Button */}
            {squad.length < 5 && (
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/30 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Invite Friends</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {MOCK_FRIENDS.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{friend.name}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInvite(friend)}
                          disabled={squad.some(m => m.id === friend.id)}
                          className="border-white/10 hover:bg-white/10"
                        >
                          {squad.some(m => m.id === friend.id) ? "Invited" : "Invite"}
                        </Button>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/10">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between text-zinc-400 hover:text-white"
                        onClick={copyInviteLink}
                      >
                        <span>Copy Invite Link</span>
                        {inviteLinkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </div>

        {/* Action */}
        <div className="pt-4 border-t border-white/10">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-6">
            Buy {squad.length} Tickets Together
          </Button>
          <p className="text-center text-xs text-zinc-500 mt-2">
            Seats will be reserved side-by-side.
          </p>
        </div>
      </div>
    </div>
  );
}
