import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      include: {
        ticketTypes: true,
      },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      date,
      venue,
      image,
      contractAddress,
      walletAddress,
      ticketTypes, // Array of { name, price, capacity, metadataUri, imageUrl }
    } = body;

    if (!walletAddress || !contractAddress || !name || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Find or Create User (Organizer)
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          email: `${walletAddress.toLowerCase()}@ticketverse.eth`,
          emailVerified: false,
        },
      });
    }

    // 2. Create Event with Ticket Types
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        venue,
        coverImageUrl: image || null,
        contractAddress,
        organizerId: user.id,
        maxTicketsPerWallet: 10, // Default
        transferable: true,
        ticketTypes: {
          create: ticketTypes.map((tier: any) => ({
            name: tier.name,
            price: tier.price,
            capacity: tier.capacity,
            metadataUri: tier.metadataUri,
            imageUrl: tier.imageUrl,
          })),
        },
      },
      include: {
        ticketTypes: true,
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
