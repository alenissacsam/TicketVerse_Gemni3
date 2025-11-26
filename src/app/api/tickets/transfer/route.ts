import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789"); // Fallback for dev if key missing

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, fromAddress, toAddress, transactionHash } = body;

    if (!ticketId || !fromAddress || !toAddress || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Verify the ticket exists and belongs to the sender
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { 
        event: true,
        owner: true // Include owner relation
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    if (ticket.owner.walletAddress.toLowerCase() !== fromAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized: Sender does not own this ticket" },
        { status: 403 }
      );
    }

    // 2. Find or create recipient user
    let recipient = await prisma.user.findUnique({
      where: { walletAddress: toAddress.toLowerCase() },
    });

    if (!recipient) {
      recipient = await prisma.user.create({
        data: {
          walletAddress: toAddress.toLowerCase(),
          email: `wallet-${toAddress.slice(0, 6)}@placeholder.com`,
        },
      });
    }

    // 3. Perform the transfer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update Ticket owner
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          ownerId: recipient.id,
        },
      });

      // Create Transfer Record
      await tx.ticketTransfer.create({
        data: {
          ticketId: ticketId,
          fromUserId: ticket.ownerId,
          toUserId: recipient.id,
          transactionHash: transactionHash,
          price: 0, // 0 for direct transfers
        },
      });

      return updatedTicket;
    });

    // 4. Send Email Notification (Fire and forget)
    try {
      if (recipient && recipient.email) {
        await resend.emails.send({
          from: "Ticketverse <noreply@ticketverse.com>",
          to: recipient.email,
          subject: `You received a ticket for ${ticket.event.name}!`,
          html: `
            <h1>Ticket Received!</h1>
            <p>You have successfully received a ticket for <strong>${ticket.event.name}</strong>.</p>
            <p><strong>From:</strong> ${fromAddress}</p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p>View your ticket in your dashboard: <a href="${process.env.NEXT_PUBLIC_APP_URL}/tickets">My Tickets</a></p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, ticket: result });
  } catch (error) {
    console.error("Error processing transfer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
