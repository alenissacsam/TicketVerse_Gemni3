"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "./cart-provider";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
  const { items, removeItem, isOpen, setIsOpen, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    // Simulate checkout
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    clearCart();
    setIsOpen(false);
    // Show success toast
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-zinc-800 text-white flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-white">Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 my-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                  <div className="h-16 w-16 bg-zinc-800 rounded-md overflow-hidden shrink-0">
                    <img 
                      src={item.ticket.event.coverImageUrl} 
                      alt={item.ticket.event.name}
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.ticket.event.name}</h4>
                    <p className="text-sm text-zinc-400">{item.ticket.ticketType.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold">{item.price} ETH</span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span>{total.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Service Fee (2.5%)</span>
              <span>{(total * 0.025).toFixed(4)} ETH</span>
            </div>
            <Separator className="my-2 bg-zinc-800" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{(total * 1.025).toFixed(4)} ETH</span>
            </div>
          </div>

          <Button 
            onClick={handleCheckout}
            disabled={items.length === 0 || loading}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Checkout"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
