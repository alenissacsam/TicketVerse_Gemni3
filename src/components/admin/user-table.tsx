"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Ban, CheckCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_USERS = [
  { id: 1, address: "0x71C...9A3", role: "User", status: "Active", joined: "2 days ago" },
  { id: 2, address: "0x92B...1B2", role: "Organizer", status: "Active", joined: "5 days ago" },
  { id: 3, address: "0x3A1...C99", role: "User", status: "Banned", joined: "1 week ago" },
  { id: 4, address: "0x882...F11", role: "User", status: "Active", joined: "2 weeks ago" },
  { id: 5, address: "0x112...334", role: "Organizer", status: "Pending", joined: "Just now" },
];

export function UserTable() {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-bold">User Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 uppercase bg-white/5">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono font-medium">{user.address}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={user.role === 'Organizer' ? 'border-purple-500 text-purple-400' : 'border-zinc-500 text-zinc-400'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-500/10 text-green-400' :
                    user.status === 'Banned' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      user.status === 'Active' ? 'bg-green-500' :
                      user.status === 'Banned' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400">{user.joined}</td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                        <Ban className="mr-2 h-4 w-4" /> Ban User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
