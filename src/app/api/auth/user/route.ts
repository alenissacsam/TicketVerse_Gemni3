import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, walletAddress } = body;

    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: "Missing email or wallet address" },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await prisma.user.upsert({
        where: { walletAddress },
        update: { email },
        create: {
          email,
          walletAddress,
          emailVerified: true,
          updatedAt: new Date(),
        },
      });
    } catch (e: any) {
      console.error("Upsert failed, checking error code:", e.code);
      if (e.code === "P2002" && e.meta?.target?.includes("email")) {
        // Email exists but wallet is different. Update wallet for this email.
        user = await prisma.user.update({
          where: { email },
          data: { walletAddress },
        });
      } else {
        throw e;
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
