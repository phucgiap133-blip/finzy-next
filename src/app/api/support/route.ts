// src/app/api/support/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { jsonOk, jsonErr, assertMethod } from "@/lib/route-helpers";
import { getUserId } from "@/server/authz";

/**
 * GET /api/support
 * Trả về danh sách room mà user đã có tương tác, gồm:
 * - lastMessage của mỗi room
 * - ticket mới nhất (nếu có) + status
 * - unread (để 0, chờ tính năng read-tracking)
 *
 * Query:
 *   - take?: number (mặc định 50, tối đa 200)
 */
export async function GET(req: NextRequest) {
  try {
    assertMethod(req, ["GET"]);

    const uid = await getUserId(req);
    if (!uid) return jsonErr("UNAUTHORIZED", 401);

    const url = new URL(req.url);
    const take = Math.min(Number(url.searchParams.get("take") || 50), 200);

    // Lấy các message mới nhất (desc) rồi distinct theo room ở phía app
    const msgs = await prisma.chatMessage.findMany({
      where: { userId: uid },
      orderBy: { createdAt: "desc" },
      take: Math.max(take * 3, take), // lấy dư một chút để distinct room chính xác
      select: {
        id: true,
        room: true,
        from: true,
        text: true,
        createdAt: true,
      },
    });

    // Distinct theo room (giữ message mới nhất)
    const seen = new Set<string>();
    const latestByRoom = [];
    for (const m of msgs) {
      if (seen.has(m.room)) continue;
      seen.add(m.room);
      latestByRoom.push(m);
      if (latestByRoom.length >= take) break;
    }

    // Map room -> ticket mới nhất
    const rooms = latestByRoom.map((m) => m.room);
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: uid, room: { in: rooms } },
      orderBy: { createdAt: "desc" },
      select: { id: true, room: true, status: true, createdAt: true },
    });

    const ticketByRoom = new Map<string, (typeof tickets)[number]>();
    for (const t of tickets) {
      if (!ticketByRoom.has(t.room)) ticketByRoom.set(t.room, t);
    }

    const data = latestByRoom.map((m) => ({
      room: m.room,
      lastMessage: {
        id: m.id,
        from: m.from,
        text: m.text,
        createdAt: m.createdAt,
      },
      ticket: ticketByRoom.get(m.room) ?? null,
      unread: 0, // chờ tính năng read-tracking
    }));

    const openCount = await prisma.supportTicket.count({
      where: { userId: uid, status: "OPEN" },
    });

    return jsonOk({ rooms: data, openCount });
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 500);
  }
}
