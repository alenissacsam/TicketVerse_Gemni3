import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, sellerId, price, deadline, signature } = body;

    if (!ticketId || !sellerId || !price || !deadline || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ticket ownership
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || ticket.ownerId !== sellerId) {
      return NextResponse.json(
        { error: "Invalid ticket or ownership" },
        { status: 403 }
      );
    }

    // Check if already listed
    const existingListing = await prisma.listing.findUnique({
      where: { ticketId },
    });

    if (existingListing && existingListing.status === 'ACTIVE') {
      return NextResponse.json(
        { error: "Ticket already listed" },
        { status: 409 }
      );
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        ticketId,
        sellerId,
        price,
        deadline: new Date(deadline * 1000), // Convert unix timestamp to Date
        signature,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const where: any = {
      status: 'ACTIVE',
      deadline: {
        gt: new Date() // Only show non-expired listings
      }
    };

    if (eventId) {
      where.ticket = {
        eventId
      };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        ticket: {
          include: {
            event: true,
            ticketType: true
          }
        },
        seller: {
          select: {
            walletAddress: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
