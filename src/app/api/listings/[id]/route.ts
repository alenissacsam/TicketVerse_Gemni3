import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In a real app, we'd verify the user session here to ensure they own the listing
    
    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    console.error("Error cancelling listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel listing" },
      { status: 500 }
    );
  }
}
