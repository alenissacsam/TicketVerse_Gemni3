"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSmartAccountClient, useUser } from "@account-kit/react";
import { TICKET_MARKETPLACE_ADDRESS, TICKET_NFT_ADDRESS, TicketMarketplaceABI, USDC_ADDRESS } from "@/lib/config";
import { encodeFunctionData, parseAbi, formatUnits } from "viem";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BuyTicketModalProps {
    listing: any;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function BuyTicketModal({ listing, onSuccess, trigger }: BuyTicketModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "APPROVING" | "BUYING" | "SUCCESS" | "ERROR">("IDLE");
    const [errorMessage, setErrorMessage] = useState("");

    const user = useUser();
    const { client } = useSmartAccountClient({ type: "LightAccount" });

    const handleBuy = async () => {
        if (!client || !user) return;

        setLoading(true);
        setStatus("APPROVING");
        setErrorMessage("");

        try {
            const priceInUSDC = BigInt(Math.floor(Number(listing.price) * 1000000));

            // 1. Approve USDC
            const usdcAbi = parseAbi([
                "function approve(address spender, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)"
            ]);

            const allowance = await client.readContract({
                address: USDC_ADDRESS as `0x${string}`,
                abi: usdcAbi,
                functionName: "allowance",
                args: [user.address as `0x${string}`, TICKET_MARKETPLACE_ADDRESS]
            }) as bigint;

            if (allowance < priceInUSDC) {
                const approveData = encodeFunctionData({
                    abi: usdcAbi,
                    functionName: "approve",
                    args: [TICKET_MARKETPLACE_ADDRESS, priceInUSDC]
                });

                const hash = await client.sendTransaction({
                    to: USDC_ADDRESS as `0x${string}`,
                    data: approveData,
                    chain: null
                });

                await client.waitForTransactionReceipt({ hash });
            }

            // 2. Execute Buy Transaction
            setStatus("BUYING");

            const sig = listing.signature as `0x${string}`;
            const r = sig.slice(0, 66) as `0x${string}`;
            const s = ("0x" + sig.slice(66, 130)) as `0x${string}`;
            const v = parseInt(sig.slice(130, 132), 16);

            const buyHash = await client.sendTransaction({
                to: TICKET_MARKETPLACE_ADDRESS,
                data: encodeFunctionData({
                    abi: TicketMarketplaceABI,
                    functionName: "buyTicket",
                    args: [
                        TICKET_NFT_ADDRESS,
                        BigInt(listing.ticket.tokenId),
                        priceInUSDC,
                        BigInt(Math.floor(new Date(listing.deadline).getTime() / 1000)),
                        listing.seller.walletAddress as `0x${string}`,
                        v,
                        r,
                        s
                    ]
                }),
                chain: null
            });

            await client.waitForTransactionReceipt({ hash: buyHash });

            setStatus("SUCCESS");
            setTimeout(() => {
                setOpen(false);
                onSuccess();
            }, 2000);

        } catch (error: any) {
            console.error("Error buying ticket:", error);
            setStatus("ERROR");
            setErrorMessage(error.message || "Failed to purchase ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Now
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Purchase</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        You are about to purchase a ticket for {listing.ticket.event.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        {listing.ticket.event.coverImageUrl && (
                            <img
                                src={listing.ticket.event.coverImageUrl}
                                alt={listing.ticket.event.name}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                        )}
                        <div>
                            <h4 className="font-bold text-white">{listing.ticket.event.name}</h4>
                            <p className="text-sm text-zinc-400">{listing.ticket.ticketType.name} • #{listing.ticket.tokenId}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Ticket Price</span>
                            <span>{Number(listing.price).toFixed(2)} USDC</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Service Fee (2.5%)</span>
                            <span>{(Number(listing.price) * 0.025).toFixed(2)} USDC</span>
                        </div>
                        <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{(Number(listing.price) * 1.025).toFixed(2)} USDC</span>
                        </div>
                    </div>

                    {status === "ERROR" && (
                        <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {status === "SUCCESS" && (
                        <Alert className="bg-green-900/20 border-green-900/50 text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>Ticket purchased successfully.</AlertDescription>
                        </Alert>
                    )}
                </div>

                <Button
                    onClick={handleBuy}
                    disabled={loading || status === "SUCCESS"}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {status === "APPROVING" ? "Approving USDC..." : "Confirming Purchase..."}
                        </>
                    ) : status === "SUCCESS" ? (
                        "Purchased!"
                    ) : (
                        "Confirm Purchase"
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
