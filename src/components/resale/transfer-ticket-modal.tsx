"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { useSmartAccountClient, useUser } from "@account-kit/react";
import { TICKET_NFT_ADDRESS, TicketNFTABI } from "@/lib/config";
import { encodeFunctionData } from "viem";

interface TransferTicketModalProps {
    ticketId: string; // Database ID
    tokenId: string; // On-chain Token ID
    onSuccess: () => void;
}

export function TransferTicketModal({ ticketId, tokenId, onSuccess }: TransferTicketModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"IDLE" | "TRANSFERRING" | "UPDATING">("IDLE");

    const user = useUser();
    const { client } = useSmartAccountClient({ type: "LightAccount" });

    const handleTransfer = async () => {
        if (!client || !user || !recipient) return;

        setLoading(true);
        try {
            // 1. Transfer NFT on-chain
            setStep("TRANSFERRING");

            const transferData = encodeFunctionData({
                abi: TicketNFTABI,
                functionName: "transferFrom",
                args: [user.address as `0x${string}`, recipient as `0x${string}`, BigInt(tokenId)]
            });

            const hash = await client.sendTransaction({
                to: TICKET_NFT_ADDRESS,
                data: transferData,
                chain: null
            });

            await client.waitForTransactionReceipt({ hash });

            // 2. Update Backend
            setStep("UPDATING");

            const res = await fetch("/api/tickets/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketId,
                    fromAddress: user.address,
                    toAddress: recipient,
                    transactionHash: hash
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update ticket ownership");
            }

            setIsOpen(false);
            onSuccess();
        } catch (error) {
            console.error("Error transferring ticket:", error);
            alert("Failed to transfer ticket. Please check the address and try again.");
        } finally {
            setLoading(false);
            setStep("IDLE");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    <Send className="mr-2 h-4 w-4" />
                    Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Transfer Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Recipient Address</Label>
                        <Input
                            placeholder="0x..."
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white font-mono"
                        />
                        <p className="text-xs text-zinc-500">
                            Ensure the address is correct. Transfers are irreversible.
                        </p>
                    </div>

                    <Button
                        onClick={handleTransfer}
                        disabled={loading || !recipient || !recipient.startsWith("0x") || recipient.length !== 42}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {step === "TRANSFERRING" ? "Transferring NFT..." : "Updating Records..."}
                            </>
                        ) : (
                            "Confirm Transfer"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
