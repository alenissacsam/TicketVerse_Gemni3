"use server";

import { prisma } from "@/lib/prisma";

export async function getTrendingEvents() {
    try {
        const events = await prisma.event.findMany({
            where: { isTrending: true },
            orderBy: { date: "asc" },
            include: {
                ticketTypes: true,
            },
        });

        // Serialize and map to TrendingCarousel expected format
        const serializedEvents = events.map(event => {
            // Find the lowest price
            const lowestPrice = event.ticketTypes.length > 0
                ? Math.min(...event.ticketTypes.map(t => Number(t.price)))
                : 0;

            return {
                id: event.id,
                title: event.name,
                date: event.date.toISOString(),
                location: event.venue,
                imageUrl: event.coverImageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
                price: lowestPrice === 0 ? "Free" : `${lowestPrice} USDC`,
                isTrending: event.isTrending
            };
        });

        return serializedEvents;
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
    }
}
