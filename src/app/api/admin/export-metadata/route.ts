import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/export-metadata?eventId=xxx
 * Generates IPFS-compatible JSON metadata for an event
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json(
                { error: "Missing eventId parameter" },
                { status: 400 }
            );
        }

        // Fetch event with related data
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                ticketTypes: true,
                organizer: true,
            },
        });

        if (!event) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        // Generate IPFS metadata JSON
        const metadata = {
            name: event.name,
            description: event.description || "",
            image: event.coverImageUrl || "",
            external_url: `https://ticketverse.app/events/${event.id}`,
            date: event.date.toISOString(),
            venue: event.venue,
            organizer: event.organizer.walletAddress || "Unknown",
            contractAddress: event.contractAddress,
            ticketTypes: event.ticketTypes.map((tt) => ({
                name: tt.name,
                price: tt.price.toString(),
                maxSupply: tt.capacity,
                currency: "USDC",
            })),
            attributes: [
                {
                    trait_type: "Event Date",
                    value: event.date.toLocaleDateString(),
                },
                {
                    trait_type: "Venue",
                    value: event.venue,
                },
                {
                    trait_type: "Max Tickets Per Wallet",
                    value: event.maxTicketsPerWallet,
                },
                {
                    trait_type: "Transferable",
                    value: event.transferable ? "Yes" : "No",
                },
            ],
        };

        return NextResponse.json({
            success: true,
            metadata,
            eventId: event.id,
            message: "Metadata generated successfully. Upload this JSON to IPFS and update the event with the returned hash.",
        });
    } catch (error: unknown) {
        console.error("Error generating metadata:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to generate metadata: ${errorMessage}` },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/export-metadata
 * Updates event with IPFS hash and metadata URI
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventId, ipfsHash, metadataUri } = body;

        if (!eventId || !ipfsHash) {
            return NextResponse.json(
                { error: "Missing required fields: eventId, ipfsHash" },
                { status: 400 }
            );
        }

        // Update event with IPFS metadata
        const event = await prisma.event.update({
            where: { id: eventId },
            data: {
                ipfsHash,
                metadataUri: metadataUri || `ipfs://${ipfsHash}`,
            },
        });

        return NextResponse.json({
            success: true,
            event: {
                id: event.id,
                name: event.name,
                ipfsHash: event.ipfsHash,
                metadataUri: event.metadataUri,
            },
        });
    } catch (error: unknown) {
        console.error("Error updating event metadata:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to update event: ${errorMessage}` },
            { status: 500 }
        );
    }
}
