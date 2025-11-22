import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.verificationRequest.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      requests: requests.map(req => ({
        id: req.id,
        user: req.user,
        type: req.type,
        status: req.status,
        createdAt: req.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Fetch requests error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
