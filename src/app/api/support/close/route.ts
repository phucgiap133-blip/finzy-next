import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/authz";
import { jsonOk, jsonErr, assertMethod } from "@/lib/route-helpers";
import { rateLimitGuard, SENSITIVE_RATE_LIMIT } from "@/lib/ratelimit";
import { logAudit } from "@/server/audit";

/**
 * Đóng ticket:
 * - body: { ticketId?: number, room?: string, reason?: string }
 * - Nếu không truyền ticketId: sẽ tìm ticket OPEN mới nhất (lọc theo room nếu có).
 * - Ghi 1 system message vào room tương ứng (ChatMessage: userId + room).
 */
const CloseSchema = z.object({
  ticketId: z.coerce.number().int().positive().optional(),
  room: z.string().min(1).max(100).optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    assertMethod(req, ["POST"]);
    const rl = await rateLimitGuard(req, SENSITIVE_RATE_LIMIT);
    if (rl) return rl;

    const uid = await getUserId(req);
    if (!uid) return jsonErr("UNAUTHORIZED", 401);

    const input = CloseSchema.parse(await req.json().catch(() => ({})));

    // Xác định ticket thuộc user
    const ticket =
      input.ticketId != null
        ? await prisma.supportTicket.findFirst({
            where: { id: input.ticketId, userId: uid },
          })
        : await prisma.supportTicket.findFirst({
            where: {
              userId: uid,
              status: "OPEN",
              ...(input.room ? { room: input.room } : {}),
            },
            orderBy: { createdAt: "desc" },
          });

    if (!ticket) return jsonErr("Ticket không tồn tại", 404);
    if (ticket.status === "CLOSED") return jsonOk({ ok: true, alreadyClosed: true });

    await prisma.$transaction(async (tx) => {
      await tx.supportTicket.update({
        where: { id: ticket.id },
        data: { status: "CLOSED" },
      });

      // Ghi system message theo room (KHÔNG có ticketId trong ChatMessage)
      await tx.chatMessage.create({
        data: {
          userId: uid,
          room: ticket.room,
          from: "system",
          text:
            input.reason?.trim()?.slice(0, 500) ||
            `Ticket #${ticket.id} đã được đóng.`,
        },
      });
    });

    await logAudit(uid, "SUPPORT_TICKET_CLOSE", `ticket#${ticket.id}`);
    return jsonOk({ ok: true, ticketId: ticket.id });
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}
