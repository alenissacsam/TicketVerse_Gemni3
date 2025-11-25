"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Filter, Search } from "lucide-react";

interface Transaction {
  id: string;
  type: "PRIMARY" | "SECONDARY";
  price: string;
  transactionHash: string;
  createdAt: string;
  ticket: {
    tokenId: string;
    event: {
      name: string;
      organizer: {
        walletAddress: string;
      };
    };
    ticketType: {
      name: string;
    };
  };
  from: {
    walletAddress: string;
  };
  to: {
    walletAddress: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    userAddress: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filters.type && { type: filters.type }),
        ...(filters.userAddress && { userAddress: filters.userAddress }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`/api/admin/transactions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const data = await response.json();
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      userAddress: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Transaction History</h1>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Transaction Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="PRIMARY">Primary Sale</SelectItem>
                  <SelectItem value="SECONDARY">Secondary Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">User Address</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="0x..."
                  value={filters.userAddress}
                  onChange={(e) => handleFilterChange("userAddress", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={fetchTransactions} className="bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
            <Button onClick={resetFilters} variant="outline" className="border-zinc-700 text-zinc-300">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-zinc-400">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">No transactions found</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{tx.ticket.event.name}</h3>
                        <Badge
                          variant={tx.type === "PRIMARY" ? "default" : "secondary"}
                          className={
                            tx.type === "PRIMARY"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }
                        >
                          {tx.type === "PRIMARY" ? "Primary" : "Secondary"}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400">{tx.ticket.ticketType.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold text-lg">${Number(tx.price)} USDC</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-400 mt-3">
                    <span className="font-mono">
                      {tx.from.walletAddress.slice(0, 6)}...{tx.from.walletAddress.slice(-4)}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="font-mono">
                      {tx.to.walletAddress.slice(0, 6)}...{tx.to.walletAddress.slice(-4)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <a
                      href={`https://basescan.org/tx/${tx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                    >
                      {tx.transactionHash.slice(0, 10)}...{tx.transactionHash.slice(-8)}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                className="border-zinc-700 text-zinc-300"
              >
                Previous
              </Button>
              <span className="text-white px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                className="border-zinc-700 text-zinc-300"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
