import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const isVerified = searchParams.get("isVerified");

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isVerified !== null) {
      where.isVerified = isVerified === "true";
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        walletAddress: true,
        role: true,
        isVerified: true,
        isVip: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
            tickets: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
