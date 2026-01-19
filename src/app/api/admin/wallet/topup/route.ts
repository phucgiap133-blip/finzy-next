// src/app/api/admin/wallet/topup/route.ts
import { getServerSession } from "next-auth";
import { db, jsonErr, uid } from "@/app/api/_db";

/**
 * ✅ Admin thêm tiền test (không public cho user)
 * - Dùng khi kiểm thử flow rút tiền hoặc phát thưởng.
 * - Chỉ ADMIN có quyền.
 */
export async function POST(req: Request) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role || "USER";
  if (role !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  const body = await req.json().catch(() => ({}));
  const amount = Number(body?.amount ?? 0);
  const note = String(body?.note || "Admin credit test");

  if (!Number.isFinite(amount) || amount <= 0)
    return jsonErr("Số tiền cộng không hợp lệ", 400);

  // Cộng số dư test vào ví (mock DB)
  db.wallet.balance += amount;
  db.history.unshift({
    id: uid("h_"),
    text: `Admin cộng +${amount.toLocaleString("vi-VN")}đ`,
    sub: note,
    createdAt: new Date().toISOString(),
  });

  return Response.json({
    ok: true,
    wallet: db.wallet,
    message: "Admin đã cộng tiền test thành công",
  });
}
