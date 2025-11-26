"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function MarketplaceFilters() {
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");

    return (
        <div className="space-y-6">
            <div className="font-semibold text-lg">Filters</div>

            <Accordion type="multiple" defaultValue={["status", "price", "event-type"]} className="w-full">
                {/* Status Filter */}
                <AccordionItem value="status" className="border-zinc-800">
                    <AccordionTrigger className="hover:no-underline">Status</AccordionTrigger>
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

                {/* Price Filter */}
                <AccordionItem value="price" className="border-zinc-800">
                    <AccordionTrigger className="hover:no-underline">Price</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                                <span className="text-zinc-500">to</span>
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                            </div>
                            <Button className="w-full bg-white text-black hover:bg-zinc-200">Apply</Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Event Type Filter */}
                <AccordionItem value="event-type" className="border-zinc-800">
                    <AccordionTrigger className="hover:no-underline">Event Type</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="concert" />
                                <Label htmlFor="concert">Concert</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="sports" />
                                <Label htmlFor="sports">Sports</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="theater" />
                                <Label htmlFor="theater">Theater</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="festival" />
                                <Label htmlFor="festival">Festival</Label>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
