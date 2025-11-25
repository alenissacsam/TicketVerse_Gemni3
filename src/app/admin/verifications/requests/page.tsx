"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, X, UserCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Request {
    id: string;
    user: {
        id: string;
        email: string;
        walletAddress: string;
    };
    type: "VIP";
    status: "PENDING";
    createdAt: string;
}

export default function PendingVerificationRequests() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkProcessing, setBulkProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/requests?type=VIP&status=PENDING");
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

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(requests.map(r => r.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkAction = async (action: "APPROVE" | "REJECT") => {
        if (selectedIds.size === 0) return;
        
        setBulkProcessing(true);
        try {
            const res = await fetch("/api/admin/requests/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    ids: Array.from(selectedIds), 
                    action 
                }),
            });

            const data = await res.json();
            if (data.success) {
                setRequests(prev => prev.filter(r => !selectedIds.has(r.id)));
                setSelectedIds(new Set());
            } else {
                alert(data.error || `Batch ${action.toLowerCase()} failed`);
            }
        } catch (error) {
            console.error(`Bulk ${action.toLowerCase()} error:`, error);
            alert(`Bulk ${action.toLowerCase()} failed. Please try again.`);
        } finally {
            setBulkProcessing(false);
        }
    };

    const allSelected = requests.length > 0 && selectedIds.size === requests.length;

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-2">Pending Verification Requests</h1>
                        <p className="text-zinc-400">Review and approve user verification requests.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <p className="text-zinc-500">No pending verification requests.</p>
                    </div>
                ) : (
                    <>
                        {/* Bulk Actions Bar */}
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <Checkbox 
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                />
                                <span className="text-sm text-zinc-400">
                                    {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
                                </span>
                            </div>
                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-3">
                                    <Button 
                                        onClick={() => handleBulkAction("REJECT")}
                                        disabled={bulkProcessing}
                                        variant="ghost" 
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject Selected ({selectedIds.size})
                                    </Button>
                                    <Button 
                                        onClick={() => handleBulkAction("APPROVE")}
                                        disabled={bulkProcessing}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {bulkProcessing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Approve Selected ({selectedIds.size})
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Request List */}
                        <div className="grid gap-4">
                            {requests.map((req) => (
                                <Card key={req.id} className="bg-zinc-900 border-zinc-800">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Checkbox 
                                                checked={selectedIds.has(req.id)}
                                                onCheckedChange={(checked) => handleSelectOne(req.id, checked as boolean)}
                                                aria-label={`Select ${req.user.email}`}
                                            />
                                            <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                                                <UserCheck className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg">Verification Request</h3>
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
                    </>
                )}
            </div>
        </div>
    );
}
