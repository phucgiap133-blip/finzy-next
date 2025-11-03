// src/app/api/withdraw/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { readJsonAndValidate, ApiError } from "@/lib/utils";
import { requireRole, isAuthErr } from "@/server/authz";
import { rateLimit } from "@/lib/ratelimit";
import { z, ZodError } from "zod";
import { Prisma, WithdrawalStatus, UserRole } from "@prisma/client";
import { logAudit } from "@/server/audit";
import { withdrawQueue, WithdrawJobData } from "@/queues/withdraw.queue";

// SCHEMA (GIỮ NGUYÊN)
const WithdrawRequestSchema = z.object({
  amount: z.number().int("Số tiền phải là số nguyên").min(1000, "Tối thiểu 1,000đ"),
  methodId: z.number().int("ID phương thức phải là số nguyên"),
  bankAccount: z.string().min(8, "Số tài khoản không hợp lệ"),
  bankName: z.string().min(3, "Tên ngân hàng không hợp lệ"),
});
type WithdrawRequest = z.infer<typeof WithdrawRequestSchema>;

// rate limit window
const WITHDRAW_LIMIT = 5;
const WITHDRAW_WINDOW_MS = 60 * 60_000;

export async function POST(req: Request) {
  const idempotencyKey = req.headers.get("Idempotency-Key") || undefined;
  let userId = 0;
  let existingWithdrawal: any = null;

  try {
    // ✅ AUTH + RBAC
    const auth = await requireRole(req, [UserRole.USER, UserRole.ADMIN]);
    if (isAuthErr(auth)) {
      const status = auth.code === "UNAUTHORIZED" ? 401 : 403;
      return NextResponse.json(
        { error: auth.code === "UNAUTHORIZED" ? "Chưa đăng nhập" : "Bạn không có quyền thực hiện giao dịch này." },
        { status }
      );
    }
    userId = Number(auth.payload.userId);

    // ✅ A. IDEMPOTENCY CHECK
    if (idempotencyKey) {
      existingWithdrawal = await prisma.withdrawal.findUnique({
        where: { idempotencyKey },
        select: { id: true, status: true, amount: true },
      });
      if (existingWithdrawal) {
        await logAudit(
          userId,
          "WITHDRAW_IDEMPOTENCY",
          `Request trùng lặp cho key: ${idempotencyKey}. Trả về giao dịch cũ (ID: ${existingWithdrawal.id}, Status: ${existingWithdrawal.status}).`
        );
        return NextResponse.json(
          {
            ok: true,
            message: "Yêu cầu này đã được xử lý trước đó.",
            id: existingWithdrawal.id,
            status: existingWithdrawal.status,
            isIdempotent: true,
          },
          { status: 200 }
        );
      }
    }

    // B. RATE LIMIT
    const rl = rateLimit(`withdraw:${userId}`, WITHDRAW_LIMIT, WITHDRAW_WINDOW_MS);
    if (!rl.ok) {
      await logAudit(userId, "WITHDRAW_RATE_LIMIT", `Thất bại: ${rl.retryAfter}s`);
      return NextResponse.json(
        { error: `Quá nhiều yêu cầu rút tiền, thử lại sau ${rl.retryAfter}s` },
        { status: 429 }
      );
    }

    // C. VALIDATE BODY
    const { amount, methodId, bankAccount, bankName } =
      (await readJsonAndValidate(req, WithdrawRequestSchema)) as WithdrawRequest;

    // D. KIỂM TRA SỐ DƯ
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      await logAudit(userId, "WITHDRAW_FAIL_BALANCE", "Thất bại, không tìm thấy ví");
      throw new ApiError("Không tìm thấy ví", 404);
    }
    const balance = wallet.balance as unknown as Prisma.Decimal;
    const want = new Prisma.Decimal(amount);
    if (balance.lt(want)) {
      await logAudit(
        userId,
        "WITHDRAW_FAIL_BALANCE",
        `Thất bại, số dư: ${balance.toString()} < ${want.toString()}`
      );
      throw new ApiError("Số dư không đủ để thực hiện giao dịch này.", 400);
    }

    // E. GIAO DỊCH (lưu idempotencyKey)
    let newWithdrawalId = 0;
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { userId }, data: { balance: { decrement: want } } });
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount: want,
          fee: new Prisma.Decimal(0),
          status: WithdrawalStatus.QUEUED,
          method: String(methodId),
          idempotencyKey,
        },
        select: { id: true },
      });
      newWithdrawalId = newWithdrawal.id;
    });

    // F. ĐẨY JOB VÀO QUEUE
    const jobData: WithdrawJobData = {
      userId: String(userId),
      amount,
      bankAccount,
      bankName,
      idempotencyKey: idempotencyKey || String(newWithdrawalId),
    };
    const job = await withdrawQueue.add("processWithdrawal", jobData, {
      jobId: idempotencyKey || String(newWithdrawalId),
    });

    await logAudit(
      userId,
      "WITHDRAWAL_QUEUED",
      `Yêu cầu: ${want.toString()} VND (ID: ${newWithdrawalId}). Đẩy vào Queue.`
    );

    return NextResponse.json(
      {
        ok: true,
        id: newWithdrawalId,
        status: WithdrawalStatus.QUEUED,
        message: "Yêu cầu rút tiền đã được ghi nhận và đang chờ xử lý.",
        jobId: job.id,
      },
      { status: 202 }
    );
  } catch (e: any) {
    // 1) Body không hợp lệ
    if (e instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: e.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    // 2) Auth errors
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    if (e?.message === "FORBIDDEN") {
      if (userId) await logAudit(userId, "WITHDRAW_FAIL_RBAC", "Từ chối quyền. Vai trò không hợp lệ.");
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện giao dịch này." },
        { status: 403 }
      );
    }

    // 3) Idempotency trùng
    if (e?.code === "P2002" && idempotencyKey) {
      if (userId) await logAudit(userId, "WITHDRAW_IDEMPOTENCY_FAIL", `Trùng key: ${idempotencyKey}`);
      return NextResponse.json(
        { error: "Yêu cầu đang được xử lý hoặc đã hoàn tất." },
        { status: 409 }
      );
    }

    // 4) Lỗi nghiệp vụ
    if (e instanceof ApiError) {
      if (userId) await logAudit(userId, "WITHDRAW_FAIL", e.message);
      return NextResponse.json({ error: e.message }, { status: e.status });
    }

    // 5) Fallback
    console.error("[withdraw] UNHANDLED error:", e);
    return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
  }
}
