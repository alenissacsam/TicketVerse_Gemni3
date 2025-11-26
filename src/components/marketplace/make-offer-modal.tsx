"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface MakeOfferModalProps {
  ticketName: string;
  floorPrice?: string;
  trigger?: React.ReactNode;
}

export function MakeOfferModal({ ticketName, floorPrice = "0.5", trigger }: MakeOfferModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [duration, setDuration] = useState("3");

  const handleOffer = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setIsOpen(false);
    // Show success toast here
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex-1 h-12 text-lg font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
            Make Offer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Item</Label>
            <div className="font-medium text-lg">{ticketName}</div>
            <div className="text-sm text-zinc-500">Floor Price: {floorPrice} ETH</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Offer Amount (ETH)</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="bg-zinc-900 border-zinc-800 pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                ETH
              </div>
            </div>
            <div className="text-xs text-zinc-500 text-right">
              Balance: 1.45 ETH
            </div>
          </div>

          <div className="space-y-2">
            <Label>Offer Expiration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleOffer} 
            disabled={!offerAmount || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Make Offer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
