import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action } = await request.json(); // "APPROVE" or "REJECT"
    const { id: requestId } = await params;

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!verificationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (verificationRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Request already resolved" }, { status: 400 });
    }

    if (action === "APPROVE") {
      // Update User based on request type
      if (verificationRequest.type === "VIP") {
        await prisma.user.update({
          where: { id: verificationRequest.userId },
          data: { isVip: true },
        });
      } else if (verificationRequest.type === "ORGANIZER") {
        await prisma.user.update({
          where: { id: verificationRequest.userId },
          data: {
            role: "ORGANIZER",
            verificationStatus: "VERIFIED" // Legacy support
          },
        });
      }
    }

    // Update Request Status
    await prisma.verificationRequest.update({
      where: { id: requestId },
      data: { status: action === "APPROVE" ? "APPROVED" : "REJECTED" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Resolve request error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
