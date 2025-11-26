import { NextResponse } from "next/server";
import { prisma} from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, adminId } = await request.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Update request status
    const updated = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
      },
    });

    // If approved, update user verification status
    if (action === "approve") {
      await prisma.user.update({
        where: { id: verificationRequest.userId },
        data: { verificationStatus: "VERIFIED" },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Verification approval error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
