"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CheckCircle2, AlertCircle, Rocket, UserCheck, Settings, Database, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PlatformStats } from "@/components/admin/platform-stats";
import { UserTable } from "@/components/admin/user-table";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-black text-white pt-28 px-6 pb-24 pl-28 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_40%)]" />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 border-b border-white/10 pb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-mono text-purple-400 tracking-widest uppercase">System Administrator</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bungee mb-3 text-white">
            Admin Center
          </h1>
          <p className="text-zinc-400 text-lg">
            Manage platform operations, review requests, and monitor system health.
          </p>
        </motion.div>

        {/* Platform Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PlatformStats />
        </motion.div>

        {/* Main Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Organizer Requests */}
          <Link href="/admin/organizers/requests" className="group">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-purple-500/50 transition-all duration-300 h-full glass-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-white group-hover:text-purple-400 transition-colors">
                  <div className="p-3 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Rocket className="h-7 w-7" />
                  </div>
                  Organizer Requests
                </CardTitle>
                <CardDescription className="text-zinc-400 text-base mt-2">
                  Review and approve pending organizer applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl h-12 shadow-lg shadow-purple-500/20">
                  Review Requests
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Verification Requests */}
          <Link href="/admin/verifications/requests" className="group">
            <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-blue-500/50 transition-all duration-300 h-full glass-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-white group-hover:text-blue-400 transition-colors">
                  <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <UserCheck className="h-7 w-7" />
                  </div>
                  Verification Requests
                </CardTitle>
                <CardDescription className="text-zinc-400 text-base mt-2">
                  Review pending VIP and user verification requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl h-12 shadow-lg shadow-blue-500/20">
                  Review Requests
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* User Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UserTable />
        </motion.div>

        {/* System Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 pt-8 border-t border-white/10"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bungee text-white">System Management</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Database Cleanup */}
            <Card className="glass-premium border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Database className="h-5 w-5 text-red-400" />
                  Database Cleanup
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Remove all event data. This action is irreversible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleClearDatabase}
                  disabled={isClearing}
                  variant="destructive"
                  className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 h-11 rounded-xl font-semibold"
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
                  <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Cleared successfully
                  </div>
                )}

                {clearStatus === "error" && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="glass-premium border-zinc-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Network</div>
                    <div className="text-white font-semibold">Sepolia</div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">IPFS</div>
                    <div className="text-green-400 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Active
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 col-span-2">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Admin Address</div>
                    <div className="text-white font-mono text-sm truncate">
                      0x3706...fd1fb5
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link href="/admin/events" className="group">
            <div className="p-6 rounded-2xl glass-premium border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">0</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Events</div>
            </div>
          </Link>
          <Link href="/admin/users" className="group">
            <div className="p-6 rounded-2xl glass-premium border-zinc-800 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">0</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Users</div>
            </div>
          </Link>
          <Link href="/admin/transactions" className="group">
            <div className="p-6 rounded-2xl glass-premium border-zinc-800 hover:border-green-500/50 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">0</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Transactions</div>
            </div>
          </Link>
          <Link href="/admin/analytics" className="group">
            <div className="p-6 rounded-2xl glass-premium border-zinc-800 hover:border-yellow-500/50 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">$0</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Revenue</div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
