"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
}

export function MarketplaceLayout({ children, sidebar }: MarketplaceLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-black text-white pt-20">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:block sticky top-20 h-[calc(100vh-5rem)] border-r border-zinc-800 transition-all duration-300 ease-in-out bg-black/50 backdrop-blur-xl z-30",
                    isSidebarOpen ? "w-80" : "w-0 border-none"
                )}
            >
                <div className={cn("h-full overflow-hidden", !isSidebarOpen && "hidden")}>
                    <ScrollArea className="h-full px-4 py-6">
                        {sidebar}
                    </ScrollArea>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="p-6 space-y-6">
                    {/* Mobile Filter Trigger & Desktop Toggle */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex hover:bg-zinc-800"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden gap-2">
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
