// src/app/api/admin/route.ts
import { getServerSession } from "next-auth";
import { jsonErr } from "@/app/api/_db";

export async function GET() {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);
  return Response.json({ ok: true, admin: true, at: new Date().toISOString() });
}
