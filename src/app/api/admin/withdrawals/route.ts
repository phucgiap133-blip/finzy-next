// src/app/api/admin/withdrawals/route.ts
import { getServerSession } from "next-auth";
import { db, jsonErr, uid } from "@/app/api/_db";

type UiStatus = "success" | "failed" | "processing";
const VN: Record<UiStatus, "Thành công" | "Thất bại" | "Đang xử lý"> = {
  success: "Thành công",
  failed: "Thất bại",
  processing: "Đang xử lý",
};

export async function GET(req: Request) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "").toLowerCase() as UiStatus | "";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "20"), 1), 100);
  const cursor = url.searchParams.get("cursor"); // ISO createdAt

  let items = [...db.withdrawalItems]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  if (status && VN[status]) items = items.filter((x) => x.status === VN[status]);

  const page = cursor
    ? items.filter((x) => +new Date(x.createdAt) < +new Date(cursor)).slice(0, limit)
    : items.slice(0, limit);

  const nextCursor = page.length ? page[page.length - 1].createdAt : null;

  return Response.json({ ok: true, items: page, nextCursor, total: items.length });
}

export async function PATCH(req: Request) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const action = (String(body?.status || "") as UiStatus).toLowerCase() as UiStatus;

  if (!id) return jsonErr("Thiếu id", 400);
  if (!VN[action]) return jsonErr("Trạng thái không hợp lệ", 400);

  const idx = db.withdrawalItems.findIndex((w) => w.id === id);
  if (idx < 0) return jsonErr("Không tìm thấy giao dịch", 404);

  const it = db.withdrawalItems[idx];

  // trạng thái cũ -> mới
  const to = VN[action];
  if (to === "Thành công") {
    it.status = to;
    db.history.unshift({
      id: uid("h_"),
      text: `Hoàn tất rút: ${Math.abs(it.amount).toLocaleString("vi-VN")}đ`,
      sub: it.method,
      createdAt: new Date().toISOString(),
    });
  } else if (to === "Thất bại") {
    if (it.status !== "Thất bại") {
      // hoàn tiền 1 lần
      db.wallet.balance += Math.abs(it.amount);
    }
    it.status = to;
    db.history.unshift({
      id: uid("h_"),
      text: `Rút thất bại: ${Math.abs(it.amount).toLocaleString("vi-VN")}đ`,
      sub: "Admin đánh dấu thất bại",
      createdAt: new Date().toISOString(),
    });
  } else {
    it.status = to; // "Đang xử lý"
  }

  return Response.json({ ok: true, item: it });
}
