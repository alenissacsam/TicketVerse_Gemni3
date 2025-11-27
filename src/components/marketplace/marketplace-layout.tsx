"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketplaceLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function MarketplaceLayout({ children, sidebar }: MarketplaceLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white pt-24 pl-28">
            {/* Main Content */}
            <main className="w-full">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Mobile Filter Trigger */}
                    <div className="lg:hidden mb-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="gap-2 bg-zinc-900/50 border-white/10 hover:bg-zinc-800/50">
                                    <Filter size={16} />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 bg-zinc-950 border-zinc-800 p-0">
                                <ScrollArea className="h-full px-4 py-6">
                                    {sidebar}
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
