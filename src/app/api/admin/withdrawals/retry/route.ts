// src/app/api/admin/withdrawals/retry/route.ts
import { getServerSession } from "next-auth";
import { db, jsonErr, uid } from "@/app/api/_db";

type Action = "success" | "failed";

export async function POST(req: Request) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const body = await req.json().catch(() => ({}));
  const id: string | undefined = body?.id;
  const action: Action = (body?.action === "failed" ? "failed" : "success") as Action;

  let itemIndex = -1;
  if (id) {
    itemIndex = db.withdrawalItems.findIndex((w) => w.id === id);
  } else {
    itemIndex = db.withdrawalItems.findIndex((w) => w.status === "Đang xử lý");
    if (itemIndex === -1) itemIndex = db.withdrawalItems.length ? 0 : -1;
  }
  if (itemIndex === -1) return jsonErr("Không tìm thấy giao dịch", 404);

  const it = db.withdrawalItems[itemIndex];

  if (action === "success") {
    it.status = "Thành công";
    db.history.unshift({
      id: uid("h_"),
      text: `Hoàn tất rút: ${Math.abs(it.amount).toLocaleString("vi-VN")}đ`,
      sub: it.method,
      createdAt: new Date().toISOString(),
    });
  } else {
    if (it.status !== "Thất bại") db.wallet.balance += Math.abs(it.amount);
    it.status = "Thất bại";
    db.history.unshift({
      id: uid("h_"),
      text: `Rút thất bại: ${Math.abs(it.amount).toLocaleString("vi-VN")}đ`,
      sub: "Retry thất bại",
      createdAt: new Date().toISOString(),
    });
  }

  return Response.json({ ok: true, item: it });
}
