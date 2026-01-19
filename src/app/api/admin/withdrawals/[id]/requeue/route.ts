// src/app/api/admin/withdrawals/[id]/requeue/route.ts
import { getServerSession } from "next-auth";
import { db, jsonErr } from "@/app/api/_db";

export async function POST(_: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const idx = db.withdrawalItems.findIndex((w) => w.id === ctx.params.id);
  if (idx < 0) return jsonErr("Không tìm thấy giao dịch", 404);

  db.withdrawalItems[idx].status = "Đang xử lý";
  return Response.json({ ok: true, item: db.withdrawalItems[idx] });
}
