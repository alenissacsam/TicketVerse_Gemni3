"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Camera, RefreshCw } from "lucide-react";
import { useUser } from "@account-kit/react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { TICKET_NFT_ADDRESS, TicketNFTABI } from "@/lib/config";

// Dynamically import QrReader to avoid SSR issues
const QrReader = dynamic(() => import("react-qr-reader").then((mod) => mod.QrReader), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-black flex items-center justify-center text-zinc-500">Loading Camera...</div>
});

export default function ScannerPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const user = useUser();

    const [data, setData] = useState<string | null>(null);
    const [status, setStatus] = useState<"IDLE" | "VERIFYING" | "VALID" | "INVALID" | "ALREADY_SCANNED">("IDLE");
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (result: any, error: any) => {
        if (!!result && status === "IDLE") {
            setData(result?.text);
            verifyTicket(result?.text);
        }
        if (!!error) {
            console.info(error);
        }
    };

    const verifyTicket = async (qrData: string) => {
        setStatus("VERIFYING");
        try {
            // 1. Parse QR Data
            const payload = JSON.parse(qrData);
            const { tokenId, contractAddress, eventId: qrEventId, ownerAddress, timestamp } = payload;

            if (qrEventId !== eventId) {
                throw new Error("Ticket is for a different event");
            }

            if (contractAddress.toLowerCase() !== TICKET_NFT_ADDRESS.toLowerCase()) {
                throw new Error("Invalid contract address");
            }

            // 2. Verify Ownership On-Chain
            const client = createPublicClient({
                chain: sepolia,
                transport: http(),
            });

            const owner = await client.readContract({
                address: TICKET_NFT_ADDRESS,
                abi: TicketNFTABI,
                functionName: "ownerOf",
                args: [BigInt(tokenId)],
            });

            if ((owner as string).toLowerCase() !== ownerAddress.toLowerCase()) {
                throw new Error("Ticket ownership mismatch");
            }

            // 3. Check Redemption Status in DB
            const res = await fetch("/api/organizer/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokenId, eventId }),
            });

            const verifyResult = await res.json();

            if (!res.ok) {
                if (verifyResult.code === "ALREADY_SCANNED") {
                    setStatus("ALREADY_SCANNED");
                    setTicketDetails(verifyResult.ticket);
                    return;
                }
                throw new Error(verifyResult.error || "Verification failed");
            }

            setStatus("VALID");
            setTicketDetails(verifyResult.ticket);

        } catch (err: any) {
            console.error("Verification error:", err);
            setStatus("INVALID");
            setError(err.message);
        }
    };

    const resetScanner = () => {
        setData(null);
        setStatus("IDLE");
        setTicketDetails(null);
        setError(null);
    };

    if (!user) {
        return <div className="p-8 text-center text-white">Please login as an organizer.</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bungee mb-2">Ticket Scanner</h1>
                    <p className="text-zinc-400">Event ID: {eventId}</p>
                </div>

                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                    <CardContent className="p-0 relative aspect-square bg-black">
                        {status === "IDLE" && (
                            <QrReader
                                onResult={handleScan}
                                constraints={{ facingMode: "environment" }}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {status === "VERIFYING" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                <p className="text-xl font-bold">Verifying...</p>
                            </div>
                        )}

                        {status === "VALID" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/90 backdrop-blur-sm">
                                <CheckCircle className="w-20 h-20 text-green-400 mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">VALID</h2>
                                <p className="text-green-200">Admit One</p>
                                {ticketDetails && (
                                    <div className="mt-4 text-center">
                                        <p className="font-bold">{ticketDetails.ticketType.name}</p>
                                        <p className="text-sm opacity-75">#{ticketDetails.tokenId}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {status === "INVALID" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-sm">
                                <XCircle className="w-20 h-20 text-red-400 mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">INVALID</h2>
                                <p className="text-red-200 px-6 text-center">{error}</p>
                            </div>
                        )}

                        {status === "ALREADY_SCANNED" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-900/90 backdrop-blur-sm">
                                <XCircle className="w-20 h-20 text-yellow-400 mb-4" />
                                <h2 className="text-3xl font-bold text-white mb-2">USED</h2>
                                <p className="text-yellow-200">Already Scanned</p>
                                {ticketDetails && (
                                    <div className="mt-2 text-sm text-yellow-200/70">
                                        at {new Date(ticketDetails.scannedAt).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {status !== "IDLE" && (
                    <Button
                        onClick={resetScanner}
                        className="w-full h-16 text-xl font-bold bg-white text-black hover:bg-zinc-200"
                    >
                        <RefreshCw className="mr-2 h-6 w-6" />
                        Scan Next
                    </Button>
                )}
            </div>
        </div>
    );
}
