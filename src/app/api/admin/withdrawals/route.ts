import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { z } from "zod";
import { requireAdmin, isAuthErr } from "@/server/authz"; // đã có ở authz.ts

const QuerySchema = z.object({
  status: z.string().optional(),               // "QUEUED" | "PROCESSING" | "SUCCESS" | "FAILED"
  userId: z.coerce.number().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.coerce.number().optional(),        // id dạng số
});

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (isAuthErr(auth)) return NextResponse.json({ ok:false, error:"FORBIDDEN" }, { status: 403 });

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ ok:false, error: parsed.error.issues[0]?.message ?? "Bad query" }, { status: 400 });
  }
  const { status, userId, from, to, limit, cursor } = parsed.data;

  const where:any = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (from || to) where.createdAt = { ...(from && { gte: from }), ...(to && { lte: to }) };

  const items = await prisma.withdrawal.findMany({
    where,
    orderBy: { id: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: { id:true, userId:true, amount:true, status:true, method:true, transactionId:true, note:true, createdAt:true }
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length-1].id : null;

  return NextResponse.json({ ok:true, data, nextCursor });
}
