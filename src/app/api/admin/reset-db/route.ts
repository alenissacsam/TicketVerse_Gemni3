import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    // 1. Delete all Tickets (depend on TicketType and User)
    await prisma.ticket.deleteMany({});

    // 2. Delete all TicketTypes (depend on Event)
    await prisma.ticketType.deleteMany({});

    // 3. Delete all Events (depend on User/Organizer)
    await prisma.event.deleteMany({});

    // 4. Delete all Users (optional, but requested "start from scratch")
    // Be careful if you want to keep the admin user.
    // For now, let's delete everyone to be clean, or maybe keep the current user if we could identify them.
    // But the request was "delete the current users and event to start from the scracth".
    await prisma.user.deleteMany({});

    return NextResponse.json({ message: "Database reset successfully" });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json(
      { error: "Failed to reset database" },
      { status: 500 }
    );
  }
}
