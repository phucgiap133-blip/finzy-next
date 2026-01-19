// src/app/api/admin/retry/route.ts
import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { requireAdmin } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { withdrawQueue } from "@/queues/withdraw.queue";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json()) as { id?: number; key?: string };

    const where = body.id
      ? { id: body.id }
      : body.key
      ? { idempotencyKey: body.key }
      : null;

    if (!where) return jsonErr("Thiếu id hoặc key", 400);

    const wd = await prisma.withdrawal.findFirst({
      where,
      select: {
        id: true,
        status: true,
        userId: true,
        amount: true,
        bankName: true,
        bankAccount: true,
        idempotencyKey: true,
      },
    });

    if (!wd) return jsonErr("Không tìm thấy", 404);

    // dùng string thay cho enum WithdrawalStatus
    if (wd.status !== "FAILED" && wd.status !== "QUEUED") {
      return jsonErr(`Trạng thái hiện tại: ${wd.status} (không thể requeue)`, 400);
    }

    await prisma.withdrawal.update({
      where: { id: wd.id },
      data: { status: "QUEUED" },
    });

    await withdrawQueue.add("withdraw", {
      userId: String(wd.userId),
      amount: Number(wd.amount),
      bankAccount: wd.bankAccount || "",
      bankName: wd.bankName || "",
      idempotencyKey: wd.idempotencyKey,
    });

    return jsonOk({ ok: true, id: wd.id });
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 500);
  }
}
