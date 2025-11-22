import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/clear-events
 * Deletes all events and associated tickets from the database
 */
export async function DELETE() {
  try {
    // Delete in correct order due to foreign key constraints
    await prisma.ticketTransfer.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.ticketType.deleteMany({});
    await prisma.event.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All events and related data have been deleted",
    });
  } catch (error: unknown) {
    console.error("Error clearing events:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to clear events: ${errorMessage}` },
      { status: 500 }
    );
  }
}
