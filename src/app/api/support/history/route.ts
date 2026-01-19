import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/authz";
import { jsonOk, jsonErr, assertMethod } from "@/lib/route-helpers";

/**
 * Hai chế độ:
 * 1) Danh sách ticket:
 *    GET /api/support/history?mode=tickets&status=OPEN|CLOSED|ALL&cursor=123&take=20
 *    → Trả kèm preview tin nhắn cuối của ROOM (query riêng).
 *
 * 2) Danh sách message theo ticket:
 *    GET /api/support/history?mode=messages&ticketId=123&cursor=456&take=50
 *    → Tìm ticket → lấy room → list ChatMessage theo (userId, room).
 */

const QuerySchema = z.object({
  mode: z.union([z.literal("tickets"), z.literal("messages")]).optional(),
  status: z.union([z.literal("OPEN"), z.literal("CLOSED"), z.literal("ALL")]).optional(),
  ticketId: z.coerce.number().int().positive().optional(),
  cursor: z.coerce.number().int().positive().optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(req: NextRequest) {
  try {
    assertMethod(req, ["GET"]);
    const uid = await getUserId(req);
    if (!uid) return jsonErr("UNAUTHORIZED", 401);

    const url = new URL(req.url);
    const qp = Object.fromEntries(url.searchParams.entries());
    const parsed = QuerySchema.safeParse(qp);
    if (!parsed.success) return jsonErr("Query không hợp lệ", 422);

    const { mode, status, ticketId, cursor, take = 20 } = parsed.data;

    // ---- MODE: messages (theo ticket) ----
    if (mode === "messages" || ticketId) {
      if (!ticketId) return jsonErr("Thiếu ticketId", 400);

      const ticket = await prisma.supportTicket.findFirst({
        where: { id: ticketId, userId: uid },
        select: { id: true, room: true },
      });
      if (!ticket) return jsonErr("Not found", 404);

      const rows = await prisma.chatMessage.findMany({
        where: { userId: uid, room: ticket.room },
        orderBy: { id: "asc" },
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: { id: true, from: true, text: true, createdAt: true },
      });

      let nextCursor: number | null = null;
      if (rows.length > take) {
        const last = rows.pop()!;
        nextCursor = last.id;
      }

      return jsonOk({
        ticketId: ticket.id,
        room: ticket.room,
        items: rows,
        nextCursor,
      });
    }

    // ---- MODE: tickets list ----
    const where =
      status === "ALL" || !status
        ? { userId: uid }
        : { userId: uid, status };

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { id: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: { id: true, room: true, status: true, createdAt: true, title: true },
    });

    let nextCursor2: number | null = null;
    if (tickets.length > take) {
      const last = tickets.pop()!;
      nextCursor2 = last.id;
    }

    // Lấy preview tin nhắn cuối cho từng room (query riêng, song song)
    const previews = await Promise.all(
      tickets.map((t) =>
        prisma.chatMessage.findFirst({
          where: { userId: uid, room: t.room },
          orderBy: { id: "desc" },
          select: { id: true, from: true, text: true, createdAt: true },
        })
      )
    );

    const items = tickets.map((t, i) => ({
      id: t.id,
      room: t.room,
      status: t.status,
      title: t.title,
      createdAt: t.createdAt,
      lastMessage: previews[i] ?? null,
    }));

    return jsonOk({ items, nextCursor: nextCursor2 });
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 500);
  }
}
