"use server";

import { prisma } from "@/lib/prisma";

export interface CreateEventInput {
  name: string;
  description: string;
  date: string;
  venue: string;
  imageUrl?: string;
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

    // Create event in database
    const event = await prisma.event.create({
      data: {
        name: input.name,
        description: input.description,
        date: eventDate,
        venue: input.venue,
        imageUrl: input.imageUrl || null,
        contractAddress: input.contractAddress,
        creatorAddress: input.creatorAddress,
        status: "ACTIVE",
      },
    });

    // Create a default ticket type (General Admission)
    await prisma.ticketType.create({
      data: {
        eventId: event.id,
        name: "General Admission",
        price: priceInWei.toString(),
        supply: 1000, // Default supply
        minted: 0,
        tokenId: 1, // First token ID
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
