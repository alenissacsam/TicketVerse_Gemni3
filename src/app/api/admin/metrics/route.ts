import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/metrics
 * Returns platform-wide statistics for the admin dashboard
 */
export async function GET() {
    try {
        // Get total events count
        const totalEvents = await prisma.event.count();
        const activeEvents = await prisma.event.count({
            where: {
                date: {
                    gte: new Date(),
                },
            },
        });

        // Get total tickets sold
        const totalTicketsSold = await prisma.ticket.count();

        // Get total revenue (sum of all ticket transfers where fromUserId is organizer)
        const ticketTransfers = await prisma.ticketTransfer.findMany({
            include: {
                ticket: {
                    include: {
                        ticketType: true,
                        event: {
                            include: {
                                organizer: true,
                            },
                        },
                    },
                },
            },
        });

        // Calculate total revenue from primary sales
        const totalRevenue = ticketTransfers
            .filter((transfer) => transfer.fromUserId === transfer.ticket.event.organizerId)
            .reduce((sum, transfer) => sum + Number(transfer.price), 0);

        // Get active users count (users who have purchased tickets)
        const activeUsers = await prisma.user.count({
            where: {
                ticketsPurchased: {
                    some: {},
                },
            },
        });

        // Get recent activity (last 10 ticket purchases)
        const recentPurchases = await prisma.ticketTransfer.findMany({
            take: 10,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                ticket: {
                    include: {
                        event: true,
                        ticketType: true,
                    },
                },
                from: true,
                to: true,
            },
        });

        // Get recent listings
        const recentListings = await prisma.listing.findMany({
            take: 10,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                ticket: {
                    include: {
                        event: true,
                        ticketType: true,
                    },
                },
                seller: true,
            },
        });

        // Get top events by sales
        const topEventsBySales = await prisma.event.findMany({
            take: 5,
            orderBy: {
                ticketsSold: "desc",
            },
            include: {
                organizer: true,
                _count: {
                    select: {
                        tickets: true,
                    },
                },
            },
        });

        // Calculate revenue per event for leaderboard
        const eventsWithRevenue = await Promise.all(
            topEventsBySales.map(async (event) => {
                const transfers = await prisma.ticketTransfer.findMany({
                    where: {
                        ticket: {
                            eventId: event.id,
                        },
                        fromUserId: event.organizerId,
                    },
                });

                const revenue = transfers.reduce((sum, t) => sum + Number(t.price), 0);

                return {
                    ...event,
                    revenue,
                };
            })
        );

        return NextResponse.json({
            overview: {
                totalEvents,
                activeEvents,
                totalTicketsSold,
                totalRevenue,
                activeUsers,
            },
            recentActivity: {
                purchases: recentPurchases,
                listings: recentListings,
            },
            topEvents: eventsWithRevenue,
        });
    } catch (error) {
        console.error("Error fetching admin metrics:", error);
        return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }
}
