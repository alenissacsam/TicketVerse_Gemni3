import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenId, eventId, ticketTypeId, ownerAddress, transactionHash, price } = body;

    if (!tokenId || !eventId || !ticketTypeId || !ownerAddress || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user by wallet address (or create if not exists - though they should exist if they are logged in)
    // For now, we assume the user exists or we find them by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress: ownerAddress },
    });

    if (!user) {
      // Fallback: create a user if they don't exist (e.g. first time interacting)
      // In a real app, we might want to enforce auth via session
      user = await prisma.user.create({
        data: {
          walletAddress: ownerAddress,
          email: `wallet-${ownerAddress.slice(0, 6)}@placeholder.com`, // Placeholder email
        },
      });
    }

    // Get organizer ID for the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        tokenId: tokenId.toString(),
        eventId,
        ticketTypeId,
        ownerId: user.id,
        purchasePrice: price || 0,
        transfers: {
          create: {
            fromUserId: event.organizerId,
            toUserId: user.id,
            transactionHash,
          }
        }
      },
    });

    await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: {
        ticketsSold: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("Error saving ticket:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save ticket" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerAddress = searchParams.get("ownerAddress");

    if (!ownerAddress) {
      return NextResponse.json(
        { error: "Missing ownerAddress parameter" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: ownerAddress },
    });

    if (!user) {
      return NextResponse.json({ tickets: [] });
    }

    const tickets = await prisma.ticket.findMany({
      where: { ownerId: user.id },
      include: {
        event: true,
        ticketType: true,
        listing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
