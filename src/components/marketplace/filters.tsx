"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

import { ActivityFeed } from "@/components/activity-feed";

export function MarketplaceFilters() {
  return (
    <div className="space-y-6">
      <ActivityFeed />
      <Separator />
      
      <div className="flex items-center gap-2 text-zinc-400 font-medium">
        <Filter size={20} />
        Filters
      </div>
      
      <Separator />

      <Accordion type="multiple" defaultValue={["status", "price", "type"]} className="w-full">
        <AccordionItem value="status" className="border-zinc-800">
          <AccordionTrigger className="text-sm hover:no-underline">Status</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="buy-now" />
                <Label htmlFor="buy-now">Buy Now</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="auction" />
                <Label htmlFor="auction">On Auction</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="new" />
                <Label htmlFor="new">New</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-zinc-800">
          <AccordionTrigger className="text-sm hover:no-underline">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-zinc-900 rounded-md p-2 border border-zinc-800">
                <span className="text-xs text-zinc-500 block mb-1">Min (ETH)</span>
                <input type="number" placeholder="0" className="w-full bg-transparent text-sm outline-none" />
              </div>
              <div className="bg-zinc-900 rounded-md p-2 border border-zinc-800">
                <span className="text-xs text-zinc-500 block mb-1">Max (ETH)</span>
                <input type="number" placeholder="10" className="w-full bg-transparent text-sm outline-none" />
              </div>
              <Button variant="secondary" className="col-span-2 mt-2 w-full">Apply</Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type" className="border-zinc-800">
          <AccordionTrigger className="text-sm hover:no-underline">Event Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="music" />
                <Label htmlFor="music">Music</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="sports" />
                <Label htmlFor="sports">Sports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="arts" />
                <Label htmlFor="arts">Arts</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
