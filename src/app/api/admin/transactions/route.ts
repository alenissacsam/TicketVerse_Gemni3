import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/transactions
 * Returns paginated transaction history with filters
 * Query params: type, eventId, userAddress, startDate, endDate, page, limit
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Filter parameters
        const type = searchParams.get("type"); // "PRIMARY" | "SECONDARY" | "REFUND"
        const eventId = searchParams.get("eventId");
        const userAddress = searchParams.get("userAddress");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Pagination
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (eventId) {
            where.ticket = {
                eventId,
            };
        }

        if (userAddress) {
            const user = await prisma.user.findUnique({
                where: { walletAddress: userAddress },
            });

            if (user) {
                where.OR = [
                    { fromUserId: user.id },
                    { toUserId: user.id },
                ];
            }
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        // Filter by transaction type
        if (type === "PRIMARY") {
            // Primary sales: fromUserId is the organizer
            const events = await prisma.event.findMany({
                select: { id: true, organizerId: true },
            });

            const primaryConditions = events.map(event => ({
                ticket: { eventId: event.id },
                fromUserId: event.organizerId,
            }));

            if (where.AND) {
                where.AND.push({ OR: primaryConditions });
            } else {
                where.AND = [{ OR: primaryConditions }];
            }
        } else if (type === "SECONDARY") {
            // Secondary sales: fromUserId is NOT the organizer
            const events = await prisma.event.findMany({
                select: { id: true, organizerId: true },
            });

            const secondaryConditions = events.map(event => ({
                ticket: { eventId: event.id },
                fromUserId: { not: event.organizerId },
            }));

            if (where.AND) {
                where.AND.push({ OR: secondaryConditions });
            } else {
                where.AND = [{ OR: secondaryConditions }];
            }
        }

        // Get total count for pagination
        const total = await prisma.ticketTransfer.count({ where });

        // Fetch transactions
        const transactions = await prisma.ticketTransfer.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                ticket: {
                    include: {
                        event: {
                            include: {
                                organizer: true,
                            },
                        },
                        ticketType: true,
                    },
                },
                fromUser: true,
                toUser: true,
            },
        });

        // Determine transaction type for each
        const enrichedTransactions = transactions.map(tx => {
            const isPrimary = tx.fromUserId === tx.ticket.event.organizerId;
            return {
                ...tx,
                type: isPrimary ? "PRIMARY" : "SECONDARY",
            };
        });

        return NextResponse.json({
            transactions: enrichedTransactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
