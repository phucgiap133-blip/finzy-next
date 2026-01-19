import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserRole } from "@/server/authz";

export async function POST(req: NextRequest) {
  const role = await getUserRole(req);
  if (role !== "ADMIN") return Response.json({ error: "FORBIDDEN" }, { status: 403 });

  const { ticketId } = await req.json();
  if (!ticketId) return Response.json({ error: "ticketId required" }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: Number(ticketId) } });
  if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: "CLOSED" }
  });

  return Response.json({ ok: true, newStatus: updated.status, message: "Đã đóng ticket." });
}
