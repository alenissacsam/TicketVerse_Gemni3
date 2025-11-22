"use client";

import { useState, useEffect } from "react";
import { useUser, useAuthModal } from "@account-kit/react";
import { Trash2, Star } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { GridPattern } from "@/components/ui/grid-pattern";

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  coverImageUrl: string | null;
  isTrending: boolean;
  ticketTypes: { price: string }[];
}

export default function AdminEventsPage() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrending = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrending: !currentStatus }),
      });
      fetchEvents();
    } catch (error) {
      console.error("Error toggling trending:", error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-6 bg-[#fcfcfc] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please sign in to access the admin panel.</p>
          <button
            onClick={openAuthModal}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-[#fcfcfc] relative">
      <GridPattern className="absolute inset-0 opacity-[0.03]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Event Management</h1>
          <p className="text-slate-600">Manage trending events and delete unwanted entries.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-600">No events found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Trending
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                            {event.coverImageUrl ? (
                              <Image
                                src={event.coverImageUrl}
                                alt={event.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Star className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{event.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(new Date(event.date), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {event.venue}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                        ${event.ticketTypes[0]?.price || "0"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleTrending(event.id, event.isTrending)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              event.isTrending ? "bg-purple-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                event.isTrending ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
