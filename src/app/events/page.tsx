import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/event-card";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      ticketTypes: {
        select: { price: true },
        take: 1,
        orderBy: { price: "asc" },
      },
    },
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Discover Events</h1>
          <p className="mt-2 text-gray-600">Find and book tickets for the best events in Web3.</p>
        </div>
        <Link
          href="/events/create"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
          <div className="mt-6">
            <Link
              href="/events/create"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              name={event.name}
              date={event.date}
              location={event.venue}
              imageUrl={event.coverImageUrl}
              price={event.ticketTypes[0]?.price ? Number(event.ticketTypes[0].price) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
