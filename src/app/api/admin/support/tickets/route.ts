import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserRole } from "@/server/authz";

export async function GET(req: NextRequest) {
  const role = await getUserRole(req);
  if (role !== "ADMIN") return Response.json({ error: "FORBIDDEN" }, { status: 403 });

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true } } }
  });

  const out = await Promise.all(tickets.map(async (t) => {
    const last = await prisma.chatMessage.findFirst({
      where: { userId: t.userId, room: t.room },
      orderBy: { createdAt: "desc" }
    });
    return {
      id: t.id,
      topic: t.title,
      status: t.status,
      createdAt: t.createdAt,
      userEmail: t.user?.email || "",
      lastMessage: last?.text || "",
      lastRole: last?.from ? (last.from === "agent" ? "ADMIN" : "USER") : null
    };
  }));

  return Response.json({ tickets: out });
}
