import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { contractAddress } = await request.json();

    if (!contractAddress) {
      return NextResponse.json(
        { success: false, error: "Contract address is required" },
        { status: 400 }
      );
    }

    // Create or get a default organizer user
    let organizer = await prisma.user.findFirst({
      where: { email: "admin@ticketverse.app" }
    });

    if (!organizer) {
      // Create a default organizer
      organizer = await prisma.user.create({
        data: {
          email: "admin@ticketverse.app",
          walletAddress: "0x0000000000000000000000000000000000000001", // Dummy address
          emailVerified: true,
        }
      });
    }

    // Sample events data (matching Prisma schema)
    const eventsData = [
      {
        name: "Neon Nights Festival",
        description: "Experience the future of events with Neon Nights Festival. Join us at Cyber City, VR for an unforgettable experience.",
        date: new Date("2025-10-24T12:00:00Z"),
        venue: "Cyber City, VR",
        coverImageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000",
        contractAddress: `${contractAddress}-1`, // Unique contract address
        organizerId: organizer.id,
        maxTicketsPerWallet: 4,
        transferable: true,
        isTrending: true,
        ticketTypes: {
          create: [
            {
              name: "General Admission",
              price: 0.5,
              capacity: 100,
              ticketsSold: 34,
            },
          ],
        },
      },
      {
        name: "MetaVerse Music Summit",
        description: "The biggest Web3 music conference of the year. Network with artists, labels, and innovators.",
        date: new Date("2025-11-15T14:00:00Z"),
        venue: "Virtual Arena, Decentraland",
        coverImageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000",
        contractAddress: `${contractAddress}-2`,
        organizerId: organizer.id,
        maxTicketsPerWallet: 4,
        transferable: true,
        isTrending: true,
        ticketTypes: {
          create: [
            {
              name: "VIP Pass",
              price: 2.0,
              capacity: 50,
              ticketsSold: 12,
            },
            {
              name: "Standard",
              price: 0.8,
              capacity: 950,
              ticketsSold: 555,
            },
          ],
        },
      },
      {
        name: "BlockBeat Electronic",
        description: "24 hours of non-stop electronic music powered by blockchain technology.",
        date: new Date("2025-12-01T18:00:00Z"),
        venue: "The Grid, Berlin",
        coverImageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1000",
        contractAddress: `${contractAddress}-3`,
        organizerId: organizer.id,
        maxTicketsPerWallet: 4,
        transferable: true,
        isTrending: false,
        ticketTypes: {
          create: [
            {
              name: "Early Bird",
              price: 1.2,
              capacity: 500,
              ticketsSold: 500,
            },
            {
              name: "Regular",
              price: 1.5,
              capacity: 1500,
              ticketsSold: 1345,
            },
          ],
        },
      },
      {
        name: "CryptoArt Gallery Opening",
        description: "Inaugural exhibition featuring the hottest NFT artists of 2025.",
        date: new Date("2025-10-30T17:00:00Z"),
        venue: "Digital Museum, London",
        coverImageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1000",
        contractAddress: `${contractAddress}-4`,
        organizerId: organizer.id,
        maxTicketsPerWallet: 4,
        transferable: true,
        isTrending: false,
        ticketTypes: {
          create: [
            {
              name: "Collector Pass",
              price: 3.0,
              capacity: 30,
              ticketsSold: 19,
            },
            {
              name: "General Entry",
              price: 0.5,
              capacity: 120,
              ticketsSold: 70,
            },
          ],
        },
      },
      {
        name: "DAO Summit 2025",
        description: "Governance, collaboration, and the future of decentralized organizations.",
        date: new Date("2025-11-20T10:00:00Z"),
        venue: "Convention Center, Singapore",
        coverImageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000",
        contractAddress: `${contractAddress}-5`,
        organizerId: organizer.id,
        maxTicketsPerWallet: 4,
        transferable: true,
        isTrending: false,
        ticketTypes: {
          create: [
            {
              name: "Speaker Pass",
              price: 5.0,
              capacity: 50,
              ticketsSold: 32,
            },
            {
              name: "Attendee",
              price: 1.0,
              capacity: 750,
              ticketsSold: 380,
            },
          ],
        },
      },
    ];

    // Create all events
    const createdEvents = await Promise.all(
      eventsData.map((event) =>
        prisma.event.create({
          data: event,
          include: { ticketTypes: true },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: createdEvents.length,
      events: createdEvents,
    });
  } catch (error: any) {
    console.error("Error recreating events:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
