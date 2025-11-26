import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const organizerAddress = searchParams.get("organizerAddress");

        if (!organizerAddress) {
            return NextResponse.json(
                { error: "Missing organizerAddress" },
                { status: 400 }
            );
        }

        const events = await prisma.event.findMany({
            where: {
                organizer: {
                    walletAddress: organizerAddress.toLowerCase(),
                },
            },
            include: {
                ticketTypes: true,
                tickets: true, // To calculate sold count
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Calculate stats
        const eventsWithStats = events.map(event => {
            const totalSold = event.tickets.length;
            const totalRevenue = event.tickets.reduce((sum, ticket) => {
                const price = event.ticketTypes.find(t => t.id === ticket.ticketTypeId)?.price || 0;
                return sum + Number(price);
            }, 0);

            return {
                ...event,
                totalSold,
                totalRevenue
            };
        });

        return NextResponse.json({ events: eventsWithStats });

    } catch (error) {
        console.error("Error fetching organizer events:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
