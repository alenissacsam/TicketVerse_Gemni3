import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
    try {
        // Delete all tickets first (foreign key constraint)
        await prisma.ticket.deleteMany({});

        // Delete all ticket types
        await prisma.ticketType.deleteMany({});

        // Delete all events
        const result = await prisma.event.deleteMany({});

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Deleted ${result.count} events`
        });
    } catch (error: any) {
        console.error("Error deleting events:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
