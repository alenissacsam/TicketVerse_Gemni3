"use client";

import { useState, useEffect } from "react";
import { useUser } from "@account-kit/react";
import { createPublicClient, http, formatEther, parseAbi } from "viem";
import { sepolia } from "viem/chains";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, Shield, Ticket, UserCheck } from "lucide-react";
import { USDC_ADDRESS } from "@/lib/config";
import { SellTicketModal } from "@/components/resale/sell-ticket-modal";
import { CancelListingButton } from "@/components/resale/cancel-listing-button";

// VIP NFT Contract (Placeholder - replace with actual if known, or use config)
const VIP_NFT_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Update

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

            // 3. Fetch VIP Status (Mock for now if address unknown)
            // const vipData = await client.readContract({ ... });
            // setIsVip(Number(vipData) > 0);
            setIsVip(false); // Default to false for now

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
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Connect Wallet</h1>
                    <p className="text-zinc-400">Connect your wallet to view your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold mb-2">User Dashboard</h1>
                    <p className="text-zinc-400">Manage your account, tickets, and status.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Wallet Balance */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-zinc-200">Wallet Balance</CardTitle>
                            <Wallet className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{ethBalance.slice(0, 6)} ETH</div>
                            <p className="text-xs text-zinc-500 mt-1">{usdcBalance} USDC</p>
                            <p className="text-xs text-zinc-600 mt-2 truncate">{user.address}</p>
                        </CardContent>
                    </Card>

                    {/* VIP Status */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-zinc-200">VIP Status</CardTitle>
                            <Shield className={`h-5 w-5 ${isVip ? "text-yellow-500" : "text-zinc-600"}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`text-2xl font-bold ${isVip ? "text-yellow-400" : "text-zinc-500"}`}>
                                    {isVip ? "VIP Member" : "Standard"}
                                </div>
                                {isVip && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Active</Badge>}
                            </div>

                            {!isVip && (
                                <Button
                                    onClick={() => handleRequestVerification("VIP")}
                                    disabled={requesting}
                                    variant="outline"
                                    className="w-full border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 h-8 text-sm mb-2"
                                >
                                    {requesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                    Request VIP Status
                                </Button>
                            )}

                            <p className="text-xs text-zinc-500">
                                {isVip ? "You have access to exclusive events." : "Unlock exclusive perks and early access."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Verification Status */}
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-zinc-200">Organizer Status</CardTitle>
                            <UserCheck className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xl font-bold ${verificationStatus === "VERIFIED" ? "text-green-400" :
                                        verificationStatus === "PENDING" ? "text-yellow-400" : "text-zinc-400"
                                        }`}>
                                        {verificationStatus === "NONE" ? "Not Verified" :
                                            verificationStatus.charAt(0) + verificationStatus.slice(1).toLowerCase()}
                                    </span>
                                </div>

                                {verificationStatus === "NONE" && (
                                    <Button
                                        onClick={() => handleRequestVerification("ORGANIZER")}
                                        disabled={requesting}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm"
                                    >
                                        {requesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                        Request Organizer Access
                                    </Button>
                                )}

                                {verificationStatus === "PENDING" && (
                                    <p className="text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                        Your request is under review by admins.
                                    </p>
                                )}
                                {verificationStatus === "VERIFIED" && (
                                    <p className="text-xs text-green-500/80 bg-green-500/10 p-2 rounded border border-green-500/20">
                                        You can now create and manage events.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* My Tickets Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Ticket className="h-6 w-6 text-purple-500" />
                        <h2 className="text-2xl font-bold">My Tickets</h2>
                    </div>

                    {tickets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tickets.map((ticket) => (
                                <Card key={ticket.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                                    <div className="h-32 bg-zinc-800 relative">
                                        {/* Use event image if available */}
                                        {ticket.event?.coverImageUrl && (
                                            <img
                                                src={ticket.event.coverImageUrl}
                                                alt={ticket.event.name}
                                                className="w-full h-full object-cover opacity-50"
                                            />
                                        )}
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-white">{ticket.event?.name || "Event Ticket"}</CardTitle>
                                        <CardDescription>{ticket.ticketType?.name || "General Admission"}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between text-sm text-zinc-400 mb-4">
                                            <span>Date: {new Date(ticket.event?.date).toLocaleDateString()}</span>
                                            {ticket.listing?.status === 'ACTIVE' && (
                                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Listed</Badge>
                                            )}
                                        </div>
                                        {ticket.listing?.status === 'ACTIVE' ? (
                                            <div className="space-y-2">
                                                <Button variant="outline" className="w-full border-zinc-700 text-zinc-300" disabled>
                                                    Listed for {Number(ticket.listing.price)} USDC
                                                </Button>
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
                                            <SellTicketModal 
                                                ticketId={ticket.id} 
                                                tokenId={ticket.tokenId} 
                                                onSuccess={() => fetchUserData(user.address!)}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                            <p className="text-zinc-500">You haven't purchased any tickets yet.</p>
                            <Button variant="link" className="text-purple-400 mt-2">Browse Events</Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
