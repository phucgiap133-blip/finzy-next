// src/app/api/withdraw/route.ts
import { NextRequest } from "next/server";
import { jsonOk, jsonErr, assertMethod } from "@/lib/route-helpers";
import { idempotencyGuard, completeIdempotency } from "@/lib/idempotency";
import { rateLimitGuard, SENSITIVE_RATE_LIMIT } from "@/lib/ratelimit";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/authz";
import { WithdrawJobData, withdrawQueue } from "@/queues/withdraw.queue";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/server/audit";

export async function POST(req: NextRequest) {
  try {
    assertMethod(req, ["POST"]);

    const rl = await rateLimitGuard(req, SENSITIVE_RATE_LIMIT);
    if (rl) return rl;

    const uid = await getUserId(req);
    if (!uid) return jsonErr("UNAUTHORIZED", 401);

    const maybe = await idempotencyGuard(req, "/api/withdraw");
    if (maybe instanceof Response) return maybe;
    const idemKey = maybe;

    const { amount, methodId } = (await req.json()) as {
  amount: number;
  methodId: string | number;
};

if (!Number.isFinite(amount) || amount <= 0) {
  throw new Error("Số tiền không hợp lệ");
}

// id trong Prisma là string → convert về string
const bankId =
  typeof methodId === "string" ? methodId : String(methodId || "");

if (!bankId) throw new Error("Thiếu tài khoản nhận");

const [wallet, bank] = await Promise.all([
  prisma.wallet.findUniqueOrThrow({ where: { userId: uid } }),
  prisma.bankAccount.findUnique({ where: { id: bankId } }),
]);

    if (!bank || bank.userId !== uid) throw new Error("Tài khoản ngân hàng không hợp lệ");

    const MIN = 1_000;
    const MAX = 5_000_000;
    if (amount < MIN) throw new Error(`Tối thiểu ${MIN.toLocaleString("vi-VN")}đ`);
    if (amount > MAX) throw new Error(`Tối đa ${MAX.toLocaleString("vi-VN")}đ/ngày`);
    if (amount % 1000 !== 0) throw new Error("Số tiền phải là bội số 1.000đ");
    if (wallet.balance.lt(new Prisma.Decimal(amount))) throw new Error("Số dư không đủ");

    const created = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: uid },
        data: { balance: { decrement: new Prisma.Decimal(amount) } },
      });

      const w = await tx.withdrawal.create({
        data: {
          userId: uid,
          amount: new Prisma.Decimal(amount),
          status: "QUEUED",
          method: bank.bankName,
          idempotencyKey: idemKey,
        },
        select: { id: true, createdAt: true },
      });

      await tx.walletHistory.create({
        data: {
          userId: uid,
          text: `Tạo lệnh rút -${amount.toLocaleString("vi-VN")}đ`,
          sub: bank.bankName,
          amount: new Prisma.Decimal(-amount),
        },
      });

      return w;
    });

    await logAudit(uid, "WITHDRAWAL_REQUEST", `${amount} VND → ${bank.bankName}`);

    // Mask số tài khoản từ field 'number'
    const rawNumber = (bank as any).number as string | undefined;
    const last4 = rawNumber ? rawNumber.slice(-4) : "****";
    const masked = rawNumber ? `****${last4}` : "****";

    if (withdrawQueue) {
      await withdrawQueue.add(
        "withdraw",
        {
          userId: String(uid),
          amount,
          bankAccount: masked,
          bankName: bank.bankName,
          idempotencyKey: idemKey,
        } satisfies WithdrawJobData,
      );
    } else {
      console.warn(`[Withdraw] Queue disabled. Job for UID ${uid} was NOT enqueued.`);
    }

    const payload = {
      id: created.id,
      amount,
      status: "queued" as const,
      createdAt: created.createdAt,
    };

    await completeIdempotency(idemKey, payload, 200);
    return jsonOk(payload);
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 400);
  }
}
