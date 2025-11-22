"use client";

import { useState, useEffect } from "react";
import { useSmartAccountClient, useUser } from "@account-kit/react";
import { encodeFunctionData } from "viem";
import { Loader2, UserPlus, Clock, AlertCircle, CheckCircle2, X } from "lucide-react";
import { GAS_POLICY_ID, EventTicketABI } from "@/lib/config";

interface RentalManagerProps {
    tokenId: string;
    contractAddress: string;
}

export function RentalManager({ tokenId, contractAddress }: RentalManagerProps) {
    const user = useUser();
    const { client } = useSmartAccountClient({
        type: "LightAccount",
        policyId: GAS_POLICY_ID,
    });

    const [renter, setRenter] = useState<string | null>(null);
    const [expires, setExpires] = useState<bigint | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingUser, setIsSettingUser] = useState(false);
    const [status, setStatus] = useState<"idle" | "setting" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Form state
    const [newRenter, setNewRenter] = useState("");
    const [durationDays, setDurationDays] = useState("1");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (client && contractAddress && tokenId) {
            fetchRentalStatus();
        }
    }, [client, contractAddress, tokenId]);

    const fetchRentalStatus = async () => {
        if (!client) return;
        setIsLoading(true);
        try {
            const userOf = await client.readContract({
                address: contractAddress as `0x${string}`,
                abi: EventTicketABI,
                functionName: "userOf",
                args: [BigInt(tokenId)],
            }) as string;

            const userExpires = await client.readContract({
                address: contractAddress as `0x${string}`,
                abi: EventTicketABI,
                functionName: "userExpires",
                args: [BigInt(tokenId)],
            }) as bigint;

            if (userOf !== "0x0000000000000000000000000000000000000000") {
                setRenter(userOf);
                setExpires(userExpires);
            } else {
                setRenter(null);
                setExpires(null);
            }
        } catch (error) {
            console.error("Error fetching rental status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetUser = async () => {
        if (!client || !user || !newRenter) return;

        setIsSettingUser(true);
        setStatus("setting");
        setErrorMessage("");

        try {
            const durationSeconds = BigInt(Math.floor(Number(durationDays) * 24 * 60 * 60));
            const expiryTimestamp = BigInt(Math.floor(Date.now() / 1000)) + durationSeconds;

            const data = encodeFunctionData({
                abi: EventTicketABI,
                functionName: "setUser",
                args: [BigInt(tokenId), newRenter as `0x${string}`, expiryTimestamp],
            });

            const txHash = await client.sendTransaction({
                to: contractAddress as `0x${string}`,
                data: data,
                chain: null,
            });

            console.log("SetUser transaction sent:", txHash);

            await client.waitForTransactionReceipt({ hash: txHash });

            setStatus("success");
            setShowForm(false);
            setNewRenter("");
            fetchRentalStatus(); // Refresh status

        } catch (error: any) {
            console.error("SetUser error:", error);
            setStatus("error");
            setErrorMessage(error.message || "Failed to set user");
        } finally {
            setIsSettingUser(false);
        }
    };

    const isRented = renter && expires && expires > BigInt(Math.floor(Date.now() / 1000));

    return (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Rental Status
                </h4>
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
            </div>

            {isRented ? (
                <div className="text-xs text-zinc-400 space-y-1">
                    <div className="flex justify-between">
                        <span>Renter:</span>
                        <span className="font-mono text-white">{renter?.slice(0, 6)}...{renter?.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Expires:</span>
                        <span className="text-white">
                            {new Date(Number(expires) * 1000).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-xs text-zinc-500 italic">
                    Not currently rented
                </div>
            )}

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors text-left"
                >
                    {isRented ? "Update Rental" : "Rent Ticket"}
                </button>
            ) : (
                <div className="space-y-3 mt-2 border-t border-white/10 pt-3">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Renter Address</label>
                        <input
                            type="text"
                            value={newRenter}
                            onChange={(e) => setNewRenter(e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Duration (Days)</label>
                        <input
                            type="number"
                            value={durationDays}
                            onChange={(e) => setDurationDays(e.target.value)}
                            min="1"
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {status === "error" && (
                        <div className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleSetUser}
                            disabled={isSettingUser || !newRenter}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSettingUser ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
