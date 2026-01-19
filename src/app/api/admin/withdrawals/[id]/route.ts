// src/app/api/admin/withdrawals/[id]/route.ts
import { getServerSession } from "next-auth";
import { db, jsonErr, uid } from "@/app/api/_db";

type UiStatus = "success" | "failed" | "processing";
const VN: Record<UiStatus, "Thành công" | "Thất bại" | "Đang xử lý"> = {
  success: "Thành công",
  failed: "Thất bại",
  processing: "Đang xử lý",
};

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const it = db.withdrawalItems.find((w) => w.id === ctx.params.id);
  if (!it) return jsonErr("Không tìm thấy giao dịch", 404);
  return Response.json({ ok: true, item: it });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const body = await req.json().catch(() => ({}));
  const action = (String(body?.status || "") as UiStatus).toLowerCase() as UiStatus;
  if (!VN[action]) return jsonErr("Trạng thái không hợp lệ", 400);

  const idx = db.withdrawalItems.findIndex((w) => w.id === ctx.params.id);
  if (idx < 0) return jsonErr("Không tìm thấy giao dịch", 404);

  const it = db.withdrawalItems[idx];
  const to = VN[action];

  // Update trạng thái
  if (to === "Thành công") {
    it.status = to;
    db.history.unshift({
      id: uid("h_"),
      text: `Hoàn tất rút: ${Math.abs(it.amount).toLocaleString("vi-VN")}đ`,
      sub: it.method,
      createdAt: new Date().toISOString(),
    });
  } else if (to === "Thất bại") {
    if (it.status !== "Thất bại") db.wallet.balance += Math.abs(it.amount);
    it.status = to;
    db.history.unshift({
      id: uid("h_"),
      text: `Rút thất bại: ${Math.abs(it.amount).toLocaleString("vi-VN")}đ`,
      sub: "Admin cập nhật thất bại",
      createdAt: new Date().toISOString(),
    });
  } else {
    it.status = to; // Đang xử lý
  }

  return Response.json({ ok: true, item: it });
}
