import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserRole } from "@/server/authz";

export async function GET(req: NextRequest) {
  const role = await getUserRole(req);
  if (role !== "ADMIN") return Response.json({ error: "FORBIDDEN" }, { status: 403 });

  const url = new URL(req.url);
  const ticketId = Number(url.searchParams.get("ticketId") || "0");
  if (!ticketId) return Response.json({ error: "ticketId required" }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: ticket.userId, room: ticket.room },
    orderBy: { createdAt: "asc" },
    take: 500
  });

  const normalized = messages.map((m) => ({
    id: m.id,
    role: (m.from === "agent" ? "ADMIN" : "USER") as "ADMIN" | "USER",
    content: m.text,
    createdAt: m.createdAt
  }));

  return Response.json({
    ticket: {
      id: ticket.id,
      topic: ticket.title,
      status: ticket.status,
      createdAt: ticket.createdAt,
      userId: ticket.userId,
      userEmail: "" // (có thể join thêm nếu cần)
    },
    messages: normalized
  });
}
