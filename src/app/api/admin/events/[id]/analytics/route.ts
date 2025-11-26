import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/events/[id]/analytics
 * Returns detailed analytics for a specific event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: true,
        ticketTypes: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Calculate total capacity
    const totalCapacity = event.ticketTypes.reduce(
      (sum, type) => sum + type.capacity,
      0
    );

    // Get all ticket transfers for this event
    const transfers = await prisma.ticketTransfer.findMany({
      where: {
        ticket: {
          eventId,
        },
      },
      include: {
        ticket: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Calculate revenue by type (Primary vs Secondary)
    const primaryRevenue = transfers
      .filter((t) => t.fromUserId === event.organizerId)
      .reduce((sum, t) => sum + Number(t.price), 0);

    const secondaryRevenue = transfers
      .filter((t) => t.fromUserId !== event.organizerId)
      .reduce((sum, t) => sum + Number(t.price), 0);

    const totalRevenue = primaryRevenue + secondaryRevenue;

    // Calculate revenue by ticket type
    const revenueByType = event.ticketTypes.map((type) => {
      const typeTransfers = transfers.filter(
        (t) => t.ticket.ticketTypeId === type.id && t.fromUserId === event.organizerId
      );
      const revenue = typeTransfers.reduce((sum, t) => sum + Number(t.price), 0);
      const soldCount = typeTransfers.length;

      return {
        id: type.id,
        name: type.name,
        capacity: type.capacity,
        price: Number(type.price),
        sold: soldCount,
        revenue,
        sellThrough: (soldCount / type.capacity) * 100,
      };
    });

    // Sales over time (group by day)
    const salesByDay: Record<string, number> = {};
    transfers
      .filter((t) => t.fromUserId === event.organizerId)
      .forEach((t) => {
        const date = new Date(t.createdAt).toISOString().split("T")[0];
        salesByDay[date] = (salesByDay[date] || 0) + 1;
      });

    const salesTimeline = Object.entries(salesByDay).map(([date, count]) => ({
      date,
      sales: count,
    }));

    // Secondary market stats
    const secondaryListings = await prisma.listing.count({
      where: {
        ticket: {
          eventId,
        },
      },
    });

    const activeListings = await prisma.listing.count({
      where: {
        ticket: {
          eventId,
        },
        status: "ACTIVE",
      },
    });

    const secondaryTransfers = transfers.filter(
      (t) => t.fromUserId !== event.organizerId
    );

    const avgResalePrice =
      secondaryTransfers.length > 0
        ? secondaryTransfers.reduce((sum, t) => sum + Number(t.price), 0) /
          secondaryTransfers.length
        : 0;

    const avgOriginalPrice =
      event.ticketTypes.reduce((sum, t) => sum + Number(t.price), 0) /
      event.ticketTypes.length;

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.venue || "",
        totalCapacity,
        ticketsSold: event._count.tickets,
        sellThrough: (event._count.tickets / totalCapacity) * 100,
      },
      revenue: {
        total: totalRevenue,
        primary: primaryRevenue,
        secondary: secondaryRevenue,
        byType: revenueByType,
      },
      sales: {
        timeline: salesTimeline,
        total: event._count.tickets,
      },
      secondaryMarket: {
        totalListings: secondaryListings,
        activeListings,
        totalSales: secondaryTransfers.length,
        avgResalePrice,
        avgOriginalPrice,
        priceRatio: avgOriginalPrice > 0 ? (avgResalePrice / avgOriginalPrice) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching event analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch event analytics" },
      { status: 500 }
    );
  }
}
