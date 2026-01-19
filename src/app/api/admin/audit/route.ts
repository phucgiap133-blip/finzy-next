// src/app/api/admin/audit/route.ts
import { getServerSession } from "next-auth";
import { db, jsonErr } from "@/app/api/_db";

export async function GET(req: Request) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "20"), 1), 100);
  const cursor = url.searchParams.get("cursor"); // ISO string – trả về các bản ghi < cursor

  const items = [...db.history].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );

  const slice = cursor
    ? items.filter((x) => +new Date(x.createdAt) < +new Date(cursor)).slice(0, limit)
    : items.slice(0, limit);

  const nextCursor = slice.length
    ? slice[slice.length - 1].createdAt
    : null;

  return Response.json({ ok: true, items: slice, nextCursor });
}
