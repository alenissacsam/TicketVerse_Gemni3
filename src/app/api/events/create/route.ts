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
      coverImageUrl, 
      organizerAddress, 
      contractAddress, 
      tiers 
    } = body;

    if (!name || !date || !organizerAddress || !contractAddress || !tiers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Ensure organizer exists
    let organizer = await prisma.user.findUnique({
      where: { walletAddress: organizerAddress.toLowerCase() },
    });

    if (!organizer) {
      organizer = await prisma.user.create({
        data: {
          walletAddress: organizerAddress.toLowerCase(),
          email: `${organizerAddress.toLowerCase()}@ticketverse.com`, // Placeholder
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
        coverImageUrl,
        organizerId: organizer.id,
        contractAddress: contractAddress.toLowerCase(),
        ticketTypes: {
          create: tiers.map((tier: any) => ({
            name: tier.name,
            price: Number(tier.price),
            capacity: Number(tier.supply),
            ticketsSold: 0,
            metadataUri: tier.metadataUri
          }))
        }
      },
      include: {
        ticketTypes: true
      }
    });

    return NextResponse.json({ success: true, event });

  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
