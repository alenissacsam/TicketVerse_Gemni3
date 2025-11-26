"use client";

import * as React from "react";
import { Search, Command, User, Ticket, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  // Mock results
  const results = {
    events: [
      { id: "1", name: "Neon Nights Festival", type: "Music" },
      { id: "2", name: "Crypto Art Summit", type: "Conference" },
    ],
    tickets: [
      { id: "101", name: "VIP Pass #124", event: "Neon Nights" },
      { id: "102", name: "General Admission #55", event: "Crypto Art" },
    ],
    users: [
      { id: "u1", name: "CryptoFan_99", address: "0x123...456" },
      { id: "u2", name: "TicketMaster_Web3", address: "0xabc...def" },
    ]
  };

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-64 justify-start text-zinc-500 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-400">
          <Search className="mr-2 h-4 w-4" />
          Search TicketVerse...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-zinc-950 border-zinc-800 text-white gap-0 sm:max-w-[550px]">
        <div className="flex items-center border-b border-zinc-800 px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Type a command or search..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[300px] p-2">
          {query && (
            <div className="space-y-4">
              {/* Events */}
              <div className="px-2">
                <h3 className="text-xs font-medium text-zinc-500 mb-2 px-2">Events</h3>
                {results.events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleSelect(`/events/${event.id}`)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-zinc-900 text-left"
                  >
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span>{event.name}</span>
                    <span className="ml-auto text-xs text-zinc-600">{event.type}</span>
                  </button>
                ))}
              </div>

              {/* Tickets */}
              <div className="px-2">
                <h3 className="text-xs font-medium text-zinc-500 mb-2 px-2">Tickets</h3>
                {results.tickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelect(`/assets/mock-contract/${ticket.id}`)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-zinc-900 text-left"
                  >
                    <Ticket className="h-4 w-4 text-zinc-500" />
                    <span>{ticket.name}</span>
                    <span className="ml-auto text-xs text-zinc-600">{ticket.event}</span>
                  </button>
                ))}
              </div>

              {/* Users */}
              <div className="px-2">
                <h3 className="text-xs font-medium text-zinc-500 mb-2 px-2">Users</h3>
                {results.users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(`/profile/${user.address}`)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-zinc-900 text-left"
                  >
                    <User className="h-4 w-4 text-zinc-500" />
                    <span>{user.name}</span>
                    <span className="ml-auto text-xs text-zinc-600 font-mono">{user.address.slice(0, 6)}...</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {!query && (
            <div className="py-14 text-center text-sm text-zinc-500">
              Type to search across events, collections, and users.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
