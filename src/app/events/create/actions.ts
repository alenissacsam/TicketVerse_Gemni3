"use server";

import { prisma } from "@/lib/prisma";

export interface CreateEventInput {
  name: string;
  description: string;
  date: string;
  venue: string;
  coverImageUrl?: string;
  price: string;
  contractAddress: string;
  creatorAddress: string;
}

export async function createEvent(input: CreateEventInput) {
  try {
    // Validate required fields
    if (!input.name || !input.description || !input.date || !input.venue || !input.price || !input.contractAddress || !input.creatorAddress) {
      throw new Error("Missing required fields");
    }

    // Parse and validate date
    const eventDate = new Date(input.date);
    if (isNaN(eventDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Parse and validate price
    const priceInWei = BigInt(Math.floor(parseFloat(input.price) * 1e18));
    if (priceInWei < 0) {
      throw new Error("Price must be positive");
    }

    // Find or create organizer user
    let organizer = await prisma.user.findUnique({
      where: { walletAddress: input.creatorAddress.toLowerCase() },
    });

    if (!organizer) {
      organizer = await prisma.user.create({
        data: {
          walletAddress: input.creatorAddress.toLowerCase(),
          email: `wallet-${input.creatorAddress.slice(0, 6)}@placeholder.com`,
        },
      });
    }

    // Create event in database
    const event = await prisma.event.create({
      data: {
        name: input.name,
        description: input.description,
        date: eventDate,
        venue: input.venue,
        coverImageUrl: input.coverImageUrl || null,
        contractAddress: input.contractAddress,
        organizerId: organizer.id,
      },
    });

    // Create a default ticket type (General Admission)
    await prisma.ticketType.create({
      data: {
        eventId: event.id,
        name: "General Admission",
        price: parseFloat(input.price),
        capacity: 1000, // Default capacity
      },
    });

    return {
      success: true,
      eventId: event.id,
      event,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
