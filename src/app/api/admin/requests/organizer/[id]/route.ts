import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { action, adminId } = await request.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const organizerRequest = await prisma.organizerRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!organizerRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Update request status
    const updated = await prisma.organizerRequest.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // If approved, update user organizer status
    if (action === "approve") {
      await prisma.user.update({
        where: { id: organizerRequest.userId },
        data: { isOrganizer: true },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Organizer approval error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
