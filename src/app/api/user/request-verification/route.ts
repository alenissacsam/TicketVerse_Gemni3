import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { walletAddress, type } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
    }

    // Default to ORGANIZER if no type provided (backward compatibility)
    const requestType = type || "ORGANIZER";

    if (!["ORGANIZER", "VIP"].includes(requestType)) {
      return NextResponse.json({ error: "Invalid verification type" }, { status: 400 });
    }

    // Find user first
    const user = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: {},
      create: {
        walletAddress: walletAddress.toLowerCase(),
        email: `${walletAddress.toLowerCase()}@placeholder.com`,
      },
    });

    // Check for existing pending request of same type
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: user.id,
        type: requestType,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ success: true, message: "Request already pending" });
    }

    // Create new request
    await prisma.verificationRequest.create({
      data: {
        userId: user.id,
        type: requestType,
        status: "PENDING",
      },
    });

    // Also update legacy status for backward compatibility if it's an organizer request
    if (requestType === "ORGANIZER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationStatus: "PENDING" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Verification request error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
