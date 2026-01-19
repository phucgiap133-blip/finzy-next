import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserRole } from "@/server/authz";

export async function POST(req: NextRequest) {
  const role = await getUserRole(req);
  if (role !== "ADMIN") return Response.json({ error: "FORBIDDEN" }, { status: 403 });

  const { ticketId, content } = await req.json();
  if (!ticketId || !content) return Response.json({ error: "ticketId & content required" }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: Number(ticketId) } });
  if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });

  const msg = await prisma.chatMessage.create({
    data: { userId: ticket.userId, room: ticket.room, from: "agent", text: String(content) }
  });

  const updated = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: "PENDING" }
  });

  return Response.json({ ok: true, newMessageId: msg.id, newStatus: updated.status });
}
