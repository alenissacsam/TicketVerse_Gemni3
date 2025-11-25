"use client";

import { useState, useEffect } from "react";
import { useUser } from "@account-kit/react";
import { EVENT_FACTORY_ADDRESS } from "@/lib/config";
import EventFactoryABI from "@/lib/contracts/EventFactory.json";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

interface User {
    id: string;
    email: string;
    walletAddress: string;
    role: string;
    createdAt: string;
    _count: {
        events: number;
    };
}

export default function OrganizersPage() {
    const user = useUser();
    const [organizers, setOrganizers] = useState<User[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    
    // Manual Whitelist State
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState<"whitelist" | "blacklist">("whitelist");
    const [logs, setLogs] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchOrganizers();
    }, []);

    const fetchOrganizers = async () => {
        try {
            const res = await fetch("/api/admin/users?role=ORGANIZER");
            const data = await res.json();
            if (data.users) {
                setOrganizers(data.users);
            }
        } catch (error) {
            console.error("Error fetching organizers:", error);
        } finally {
            setLoadingList(false);
        }
    };

    const addLog = (message: string) => {
        setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const setOrganizerStatus = async () => {
        if (!address) return;
        setProcessing(true);
        try {
            addLog(`Setting status for ${address}...`);
            if (!(window as any).ethereum) throw new Error("No wallet found");

            const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
            const account = accounts[0];
            
            const walletClient = createWalletClient({
                chain: sepolia,
                transport: custom((window as any).ethereum),
            });

            const hash = await walletClient.writeContract({
                address: EVENT_FACTORY_ADDRESS,
                abi: EventFactoryABI.abi,
                functionName: "setOrganizerStatus",
                args: [address, status === "whitelist"],
                account: account as `0x${string}`,
            });

            addLog(`Tx submitted: ${hash}`);
            
            const publicClient = createPublicClient({ chain: sepolia, transport: http() });
            await publicClient.waitForTransactionReceipt({ hash });
            
            addLog(`✅ Success! ${address} is now ${status}ed`);
            fetchOrganizers(); // Refresh list
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Organizer Management</h1>
                        <p className="text-zinc-400">View current organizers and manually whitelist addresses.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    Active Organizers ({organizers.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingList ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                    </div>
                                ) : organizers.length === 0 ? (
                                    <p className="text-zinc-500 text-center py-8">No organizers found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {organizers.map((org) => (
                                            <div key={org.id} className="p-4 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="font-mono text-sm text-zinc-300">{org.walletAddress}</p>
                                                    <p className="text-xs text-zinc-500">{org.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                                                        {org._count.events} Events
                                                    </div>
                                                    <p className="text-xs text-zinc-600">
                                                        Since {new Date(org.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Manual Action Section */}
                    <div className="space-y-6">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-lg text-white">Manual Override</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full px-3 py-2 bg-black border border-zinc-700 rounded text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => setStatus("whitelist")}
                                        variant={status === "whitelist" ? "default" : "outline"}
                                        className={`flex-1 ${status === "whitelist" ? "bg-blue-600 hover:bg-blue-700" : "border-zinc-700 text-zinc-400"}`}
                                    >
                                        Whitelist
                                    </Button>
                                    <Button 
                                        onClick={() => setStatus("blacklist")}
                                        variant={status === "blacklist" ? "destructive" : "outline"}
                                        className={`flex-1 ${status === "blacklist" ? "" : "border-zinc-700 text-zinc-400"}`}
                                    >
                                        Blacklist
                                    </Button>
                                </div>
                                <Button 
                                    onClick={setOrganizerStatus}
                                    disabled={processing || !address}
                                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
                                >
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Execute"}
                                </Button>

                                {/* Mini Logs */}
                                <div className="mt-4 p-3 bg-black rounded border border-zinc-800 h-32 overflow-y-auto text-xs font-mono text-zinc-500">
                                    {logs.length === 0 ? "Ready..." : logs.map((l, i) => <div key={i}>{l}</div>)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
