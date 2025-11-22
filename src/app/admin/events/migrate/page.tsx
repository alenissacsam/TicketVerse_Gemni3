"use client";

import { useState } from "react";
import { Loader2, Trash2, RefreshCcw, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TICKET_NFT_ADDRESS } from "@/lib/config";

export default function EventMigrationPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecreating, setIsRecreating] = useState(false);
  const [status, setStatus] = useState<string>("");

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL events? This cannot be undone!")) {
      return;
    }

    setIsDeleting(true);
    setStatus("Deleting all events...");

    try {
      const response = await fetch("/api/admin/events/deleteAll", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete events");
      }

      const data = await response.json();
      setStatus(`Deleted ${data.count} events successfully`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecreateAll = async () => {
    setIsRecreating(true);
    setStatus("Recreating events with new contract address...");

    try {
      const response = await fetch("/api/admin/events/recreate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractAddress: TICKET_NFT_ADDRESS }),
      });

      if (!response.ok) {
        throw new Error("Failed to recreate events");
      }

      const data = await response.json();
      setStatus(`Created ${data.count} events successfully`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsRecreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bungee mb-8">Event Migration</h1>

        <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-bold mb-1">Warning: Destructive Operation</p>
              <p>The old events reference the old contract address. You need to delete them and recreate them with the new contract: <code className="bg-black/30 px-1 rounded">{TICKET_NFT_ADDRESS || "Not Set"}</code></p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Step 1: Delete Old Events</h2>
              <p className="text-zinc-400 mb-4 text-sm">This will delete all events from the database.</p>
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting || isRecreating}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete All Events
                  </>
                )}
              </button>
            </div>

            <div className="h-px bg-white/10" />

            <div>
              <h2 className="text-xl font-bold mb-2">Step 2: Recreate Events</h2>
              <p className="text-zinc-400 mb-4 text-sm">This will create the 5 sample events with the new contract address.</p>
              <button
                onClick={handleRecreateAll}
                disabled={isDeleting || isRecreating}
                className="px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isRecreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4" />
                    Recreate All Events
                  </>
                )}
              </button>
            </div>
          </div>

          {status && (
            <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
              <p className="text-sm font-mono">{status}</p>
            </div>
          )}
        </div>

        <div className="text-sm text-zinc-500">
          <p>New Contract Address: <code className="bg-zinc-800 px-2 py-1 rounded">{TICKET_NFT_ADDRESS || "Not configured"}</code></p>
        </div>
      </div>
    </div>
  );
}
