import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids, action } = body as { ids: string[]; action: "APPROVE" | "REJECT" };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty request IDs" },
        { status: 400 }
      );
    }

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVE or REJECT" },
        { status: 400 }
      );
    }

    // Fetch all requests to validate and get user info
    const requests = await prisma.verificationRequest.findMany({
      where: {
        id: { in: ids },
        status: "PENDING",
      },
      include: {
        user: true,
      },
    });

    if (requests.length === 0) {
      return NextResponse.json(
        { error: "No valid pending requests found" },
        { status: 404 }
      );
    }

    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";

    // Update all requests in a transaction
    await prisma.$transaction(async (tx) => {
      // Update request statuses
      await tx.verificationRequest.updateMany({
        where: {
          id: { in: requests.map((r) => r.id) },
        },
        data: {
          status,
        },
      });

      // If approving, update user records
      if (action === "APPROVE") {
        for (const request of requests) {
          if (request.type === "ORGANIZER") {
            await tx.user.update({
              where: { id: request.userId },
              data: { role: "ORGANIZER" },
            });
          } else if (request.type === "VIP") {
            await tx.user.update({
              where: { id: request.userId },
              data: { isVip: true },
            });
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${action.toLowerCase()}ed ${requests.length} request(s)`,
      count: requests.length,
    });
  } catch (error) {
    console.error("Batch request error:", error);
    return NextResponse.json(
      { error: "Failed to process batch request" },
      { status: 500 }
    );
  }
}
