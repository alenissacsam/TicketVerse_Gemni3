import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      include: {
        ticketsOwned: {
          include: {
            event: true,
            ticketType: true,
          },
        },
      },
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          email: `${walletAddress.toLowerCase()}@temp.email`,
        },
        include: {
          ticketsOwned: {
            include: {
              event: true,
              ticketType: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        verificationStatus: user.verificationStatus,
        isOrganizer: user.role === "ORGANIZER" || user.role === "ADMIN",
        role: user.role,
        createdAt: user.createdAt,
      },
      tickets: user.ticketsOwned,
    });
  } catch (error: any) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
