"use client";

import { useState } from "react";
import { useUser } from "@account-kit/react";
import { EVENT_FACTORY_ADDRESS } from "@/lib/config";
import EventFactoryABI from "@/lib/contracts/EventFactory.json";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import { alchemy } from "@account-kit/infra";

export default function OrganizersPage() {
    const user = useUser();
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState<"whitelist" | "blacklist">("whitelist");
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (message: string) => {
        setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const detectAddress = async () => {
        try {
            addLog("Detecting smart account address...");
            
            if (!user?.address) {
                addLog("❌ No user logged in");
                return;
            }

            setAddress(user.address);
            addLog(`✅ Detected: ${user.address}`);
        } catch (error: any) {
            addLog(`❌ Detection error: ${error.message}`);
        }
    };

    const setOrganizerStatus = async () => {
        if (!address) {
            addLog("❌ Please enter an address");
            return;
        }

        setLoading(true);
        try {
            addLog(`Setting organizer status for ${address}...`);

            // Check if ethereum is available
            if (!(window as any).ethereum) {
                throw new Error("Please install MetaMask or another Web3 wallet");
            }

            // Request account access
            addLog("Requesting wallet connection...");
            const accounts = await (window as any).ethereum.request({
                method: "eth_requestAccounts",
            });

            if (!accounts || accounts.length === 0) {
                throw new Error("No wallet accounts found");
            }

            const account = accounts[0];
            addLog(`Using wallet: ${account}`);

            // Create wallet client
            const walletClient = createWalletClient({
                chain: sepolia,
                transport: custom((window as any).ethereum),
            });

            // Call setOrganizerStatus
            const hash = await walletClient.writeContract({
                address: EVENT_FACTORY_ADDRESS,
                abi: EventFactoryABI.abi,
                functionName: "setOrganizerStatus",
                args: [address, status === "whitelist"],
                account: account as `0x${string}`,
            });

            addLog(`Transaction submitted: ${hash}`);

            // Wait for confirmation
            const publicClient = createPublicClient({
                chain: sepolia,
                transport: http(),
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === "success") {
                addLog(`✅ Successfully ${status === "whitelist" ? "whitelisted" : "blacklisted"} ${address}`);
            } else {
                addLog(`❌ Transaction failed`);
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black py-12">
            <div className="container max-w-4xl mx-auto px-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bungee text-white mb-2">Organizer Management</h1>
                    <p className="text-zinc-400">Whitelist addresses to allow event creation</p>
                </div>

                {/* Main Form */}
                <div className="glass-premium p-8 rounded-2xl mb-6">
                    <div className="space-y-6">
                        {/* Address Input */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">
                                Organizer Address
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                                />
                                <button
                                    onClick={detectAddress}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-all"
                                >
                                    🔍 Detect
                                </button>
                            </div>
                        </div>

                        {/* Status Selection */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">
                                Action
                            </label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStatus("whitelist")}
                                    className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                                        status === "whitelist"
                                            ? "bg-green-500/20 border-2 border-green-500 text-green-400"
                                            : "bg-black/50 border border-white/10 text-zinc-400 hover:border-white/30"
                                    }`}
                                >
                                    ✅ Whitelist
                                </button>
                                <button
                                    onClick={() => setStatus("blacklist")}
                                    className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                                        status === "blacklist"
                                            ? "bg-red-500/20 border-2 border-red-500 text-red-400"
                                            : "bg-black/50 border border-white/10 text-zinc-400 hover:border-white/30"
                                    }`}
                                >
                                    ❌ Blacklist
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={setOrganizerStatus}
                            disabled={loading || !address}
                            className="w-full px-8 py-4 bg-gradient-to-r from-white to-zinc-300 text-black font-bungee text-lg rounded-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : "Update Status"}
                        </button>
                    </div>
                </div>

                {/* Status Log */}
                <div className="glass-premium p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">Activity Log</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No activity yet...</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="text-sm text-zinc-300 font-mono">
                                    {log}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 glass-premium p-6 rounded-2xl border border-blue-500/20">
                    <h3 className="text-lg font-bold text-blue-400 mb-2">ℹ️ Important</h3>
                    <ul className="text-sm text-zinc-400 space-y-2">
                        <li>• Only whitelisted addresses can create events via EventFactory</li>
                        <li>• Use "Detect" to auto-fill your current smart account address</li>
                        <li>• You must be the factory owner to call this function</li>
                        <li>• Make sure MetaMask or your wallet is connected</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
