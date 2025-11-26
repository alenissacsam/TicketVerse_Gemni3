import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, eventId } = body;

    if (!tokenId || !eventId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Find the ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        tokenId: tokenId,
        eventId: eventId,
      },
      include: {
        ticketType: true,
        owner: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found for this event" },
        { status: 404 }
      );
    }

    // 2. Check if already scanned
    if (ticket.redeemed) {
      return NextResponse.json(
        {
          code: "ALREADY_SCANNED",
          error: "Ticket already scanned",
          ticket: {
            ...ticket,
            scannedAt: ticket.updatedAt // Assuming updatedAt is the scan time for now
          }
        },
        { status: 400 }
      );
    }

    // 3. Mark as USED
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        redeemed: true,
        redeemedAt: new Date(),
      },
      include: {
        ticketType: true,
        owner: true,
      }
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });

  } catch (error) {
    console.error("Error verifying ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
