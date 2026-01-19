// src/app/api/admin/withdrawals/requeue-all/route.ts
import { getServerSession } from "next-auth";
import { db, jsonErr } from "@/app/api/_db";

export async function POST() {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const affected = [];
  for (const it of db.withdrawalItems) {
    if (it.status !== "Thành công") {
      it.status = "Đang xử lý";
      affected.push(it.id);
    }
  }
  return Response.json({ ok: true, count: affected.length, ids: affected });
}
