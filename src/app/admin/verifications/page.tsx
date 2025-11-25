"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCheck, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface User {
    id: string;
    email: string;
    walletAddress: string;
    role: string;
    isVip: boolean;
    createdAt: string;
}

export default function VerifiedUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVerifiedUsers();
    }, []);

    const fetchVerifiedUsers = async () => {
        try {
            const res = await fetch("/api/admin/users?isVerified=true");
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Error fetching verified users:", error);
        } finally {
            setLoading(false);
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
                        <h1 className="text-4xl font-bold mb-2">Verified Users</h1>
                        <p className="text-zinc-400">List of all users with verified status.</p>
                    </div>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                            Total Verified: {users.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zinc-500">No verified users found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {users.map((user) => (
                                    <div key={user.id} className="p-4 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                                <UserCheck className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-mono text-sm text-zinc-300">{user.walletAddress}</p>
                                                    {user.isVip && (
                                                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">
                                                            VIP
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5">
                                                Verified
                                            </Badge>
                                            <p className="text-[10px] text-zinc-600 mt-1">
                                                Since {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
