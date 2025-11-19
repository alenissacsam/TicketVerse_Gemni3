import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      date,
      venue,
      price,
      capacity,
      contractAddress,
      walletAddress,
      image,
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
      // Auto-create user for EOA wallets that haven't "signed up" via the auth flow
      // We use a placeholder email since we don't have one from the wallet
      console.log("User not found, auto-creating for EOA:", walletAddress);
      user = await prisma.user.create({
        data: {
          walletAddress,
          email: `${walletAddress.toLowerCase()}@ticketverse.eth`, // Placeholder
          emailVerified: false,
        },
      });
    }

    // 2. Create Event
    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        venue,
        coverImageUrl: image || null,
        contractAddress,
        organizerId: user.id,
        // Default rules
        maxTicketsPerWallet: 4,
        transferable: true,
        ticketTypes: {
          create: {
            name: "General Admission",
            price: parseFloat(price),
            capacity: parseInt(capacity),
            ticketsSold: 0,
          },
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
