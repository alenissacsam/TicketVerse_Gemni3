"use client";

import { useState, useEffect } from "react";
import { useUser } from "@account-kit/react";
import { createPublicClient, http, formatEther, parseAbi } from "viem";
import { sepolia } from "viem/chains";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, Shield, Ticket, UserCheck, ArrowRight } from "lucide-react";
import { USDC_ADDRESS } from "@/lib/config";
import { SellTicketModal } from "@/components/resale/sell-ticket-modal";
import { TransferTicketModal } from "@/components/resale/transfer-ticket-modal";
import { CancelListingButton } from "@/components/resale/cancel-listing-button";
import { CometCard } from "@/components/ui/comet-card";
import { motion } from "framer-motion";
import Link from "next/link";

export default function UserDashboard() {
    const user = useUser();
    const [ethBalance, setEthBalance] = useState("0");
    const [usdcBalance, setUsdcBalance] = useState("0");
    const [isVip, setIsVip] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState("NONE");
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        if (user?.address) {
            fetchUserData(user.address);
        }
    }, [user?.address]);

    const fetchUserData = async (address: string) => {
        setLoading(true);
        try {
            const client = createPublicClient({
                chain: sepolia,
                transport: http(),
            });

            // 1. Fetch ETH Balance
            const balance = await client.getBalance({ address: address as `0x${string}` });
            setEthBalance(formatEther(balance));

            // 2. Fetch USDC Balance
            const usdcAbi = parseAbi(["function balanceOf(address) view returns (uint256)"]);
            const usdcData = await client.readContract({
                address: USDC_ADDRESS as `0x${string}`,
                abi: usdcAbi,
                functionName: "balanceOf",
                args: [address as `0x${string}`],
            });
            setUsdcBalance((Number(usdcData) / 1000000).toFixed(2)); // USDC has 6 decimals

            // 3. Fetch VIP Status (Mock for now)
            setIsVip(false);

            // 4. Fetch Verification Status from DB
            const res = await fetch(`/api/user/me?walletAddress=${address}`);
            const data = await res.json();
            if (data.user) {
                setVerificationStatus(data.user.verificationStatus);
            }

            // 5. Fetch Tickets
            const ticketsRes = await fetch(`/api/tickets?ownerAddress=${address}`);
            const ticketsData = await ticketsRes.json();
            if (ticketsData.tickets) {
                setTickets(ticketsData.tickets);
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestVerification = async (type: "VIP" | "ORGANIZER") => {
        if (!user?.address) return;
        setRequesting(true);
        try {
            const res = await fetch("/api/user/request-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress: user.address, type }),
            });
            const data = await res.json();
            if (data.success) {
                setVerificationStatus("PENDING");
            }
        } catch (error) {
            console.error("Error requesting verification:", error);
        } finally {
            setRequesting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bungee mb-4">Connect Wallet</h1>
                    <p className="text-zinc-400 max-w-md mx-auto">Connect your smart wallet to view your tickets and manage your account.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 px-6 pb-24">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bungee mb-4 text-white">Dashboard</h1>
                        <p className="text-zinc-400 text-lg">Manage your digital assets and identity.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-full border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                            {user.address.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="pr-4">
                            <div className="text-xs text-zinc-500 uppercase font-bold">Connected as</div>
                            <div className="font-mono text-sm">{user.address.slice(0, 6)}...{user.address.slice(-4)}</div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Wallet Balance */}
                    <div className="p-8 rounded-3xl glass-premium">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Balance</div>
                            <Wallet className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">{ethBalance.slice(0, 6)} ETH</div>
                        <div className="text-sm text-zinc-500 font-mono">{usdcBalance} USDC</div>
                    </div>

                    {/* VIP Status */}
                    <div className="p-8 rounded-3xl glass-premium">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Status</div>
                            <Shield className={`h-5 w-5 ${isVip ? "text-yellow-500" : "text-zinc-600"}`} />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`text-3xl font-bold ${isVip ? "text-yellow-400" : "text-white"}`}>
                                {isVip ? "VIP Member" : "Standard"}
                            </div>
                            {isVip && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Active</Badge>}
                        </div>
                        {!isVip && (
                            <button
                                onClick={() => handleRequestVerification("VIP")}
                                disabled={requesting}
                                className="text-xs text-yellow-500 hover:text-yellow-400 underline decoration-yellow-500/30 underline-offset-4 transition-colors"
                            >
                                Request VIP Upgrade
                            </button>
                        )}
                    </div>

                    {/* Organizer Status */}
                    <div className="p-8 rounded-3xl glass-premium">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Role</div>
                            <UserCheck className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-3">
                            {verificationStatus === "NONE" ? "User" :
                                verificationStatus.charAt(0) + verificationStatus.slice(1).toLowerCase()}
                        </div>
                        {verificationStatus === "NONE" && (
                            <button
                                onClick={() => handleRequestVerification("ORGANIZER")}
                                disabled={requesting}
                                className="text-xs text-blue-500 hover:text-blue-400 underline decoration-blue-500/30 underline-offset-4 transition-colors"
                            >
                                Become an Organizer
                            </button>
                        )}
                    </div>
                </div>

                {/* My Tickets Section */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <Ticket className="h-6 w-6 text-white" />
                        <h2 className="text-3xl font-bungee text-white">My Tickets</h2>
                    </div>

                    {tickets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tickets.map((ticket, i) => (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <CometCard className="h-full aspect-[3/4]">
                                        <div className="relative h-full w-full bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/10 flex flex-col">
                                            {/* Image */}
                                            <div className="h-1/2 relative overflow-hidden">
                                                {ticket.event?.coverImageUrl && (
                                                    <img
                                                        src={ticket.event.coverImageUrl}
                                                        alt={ticket.event.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-black/50 backdrop-blur text-white border-white/20">
                                                        #{ticket.tokenId}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{ticket.event?.name}</h3>
                                                    <p className="text-zinc-400 text-sm mb-4">{ticket.ticketType?.name}</p>

                                                    <div className="space-y-2 text-sm text-zinc-500">
                                                        <div className="flex justify-between">
                                                            <span>Date</span>
                                                            <span className="text-zinc-300">{new Date(ticket.event?.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Venue</span>
                                                            <span className="text-zinc-300 truncate max-w-[150px]">{ticket.event?.venue}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-6 border-t border-white/5">
                                                    {ticket.listing?.status === 'ACTIVE' ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-blue-400">Listed for Sale</span>
                                                                <span className="font-bold text-white">{Number(ticket.listing.price)} USDC</span>
                                                            </div>
                                                            <CancelListingButton
                                                                listingId={ticket.listing.id}
                                                                ticketId={ticket.id}
                                                                contractAddress={ticket.event.contractAddress}
                                                                price={ticket.listing.price}
                                                                deadline={ticket.listing.deadline}
                                                                onSuccess={() => fetchUserData(user.address!)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <SellTicketModal
                                                                ticketId={ticket.id}
                                                                tokenId={ticket.tokenId}
                                                                onSuccess={() => fetchUserData(user.address!)}
                                                            />
                                                            <TransferTicketModal
                                                                ticketId={ticket.id}
                                                                tokenId={ticket.tokenId}
                                                                onSuccess={() => fetchUserData(user.address!)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CometCard>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/30 border border-white/10 rounded-3xl p-16 text-center backdrop-blur-sm">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Ticket className="w-8 h-8 text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No tickets yet</h3>
                            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                                You haven't purchased any tickets. Explore upcoming events to get started.
                            </p>
                            <Link href="/events">
                                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 font-bold text-lg">
                                    Explore Events <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
