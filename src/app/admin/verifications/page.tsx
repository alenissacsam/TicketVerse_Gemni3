"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Shield, UserCheck } from "lucide-react";

interface Request {
    id: string;
    user: {
        id: string;
        email: string;
        walletAddress: string;
    };
    type: "ORGANIZER" | "VIP";
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
}

export default function AdminVerifications() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/requests");
            const data = await res.json();
            if (data.requests) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, action: "APPROVE" | "REJECT") => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/requests/${id}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (data.success) {
                // Remove from list
                setRequests(prev => prev.filter(r => r.id !== id));
            } else {
                alert(data.error || "Action failed");
            }
        } catch (error) {
            console.error("Error resolving request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Verification Requests</h1>
                    <p className="text-zinc-400">Manage VIP and Organizer access requests.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <p className="text-zinc-500">No pending requests.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <Card key={req.id} className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${
                                            req.type === "VIP" ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"
                                        }`}>
                                            {req.type === "VIP" ? <Shield className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{req.type} Request</h3>
                                                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </Badge>
                                            </div>
                                            <p className="text-zinc-400 font-mono text-sm mt-1">
                                                {req.user.walletAddress}
                                            </p>
                                            <p className="text-zinc-500 text-xs">
                                                {req.user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button 
                                            onClick={() => handleResolve(req.id, "REJECT")}
                                            disabled={processingId === req.id}
                                            variant="ghost" 
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            Reject
                                        </Button>
                                        <Button 
                                            onClick={() => handleResolve(req.id, "APPROVE")}
                                            disabled={processingId === req.id}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            {processingId === req.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Approve
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
