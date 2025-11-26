"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CheckCircle2, AlertCircle, Rocket, UserCheck, Settings, Database, Calendar, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PlatformStats } from "@/components/admin/platform-stats";
import { UserTable } from "@/components/admin/user-table";

export default function AdminDashboard() {
  const [isClearing, setIsClearing] = useState(false);
  const [clearStatus, setClearStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleClearDatabase = async () => {
    if (!confirm("Are you sure you want to delete ALL events and related data? This action cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    setClearStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/clear-events", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clear database");
      }

      setClearStatus("success");
      alert("Database cleared successfully!");
    } catch (error: unknown) {
      setClearStatus("error");
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(message);
      alert(`Error: ${message}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 px-6 pb-24 pl-28 bg-gradient-to-br from-zinc-900 to-black">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono text-blue-500 tracking-widest uppercase">System Administrator</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
            Platform Overview
          </h1>
          <p className="text-zinc-400 text-lg font-light">
            Manage your events, users, and platform settings.
          </p>
        </div>

        {/* Platform Stats */}
        <PlatformStats />

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Requests Section */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/organizers/requests" className="group">
              <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-blue-500/50 transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-white group-hover:text-blue-400 transition-colors">
                    <Rocket className="h-8 w-8" />
                    Organizer Requests
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-base">
                    Review and approve pending organizer applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Review Requests
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/verifications/requests" className="group">
              <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-green-500/50 transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-white group-hover:text-green-400 transition-colors">
                    <UserCheck className="h-8 w-8" />
                    Verification Requests
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-base">
                    Review pending VIP and user verification requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                    Review Requests
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* User Management Table */}
        <UserTable />

        {/* Secondary Actions / Danger Zone */}
        <div className="space-y-4 pt-8 border-t border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-zinc-400" />
            System Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/30 border-zinc-800 md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Database className="h-5 w-5 text-red-400" />
                  Database Cleanup
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Remove all event data. Irreversible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleClearDatabase}
                  disabled={isClearing}
                  variant="destructive"
                  className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Events
                    </>
                  )}
                </Button>

                {clearStatus === "success" && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Cleared successfully
                  </div>
                )}

                {clearStatus === "error" && (
                  <div className="flex items-start gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/30 border-zinc-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Network</div>
                    <div className="mt-1 text-white font-mono">Sepolia</div>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">IPFS</div>
                    <div className="mt-1 text-green-400 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Configured
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 col-span-2">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Admin Address</div>
                    <div className="mt-1 text-white font-mono text-sm truncate">
                      0x3706a57b29615f9af745470990e52f420ffd1fb5
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
