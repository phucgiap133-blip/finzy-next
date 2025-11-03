// src/workers/withdraw.worker.ts
import { Worker, Job } from "bullmq";
import { prisma } from "@/server/prisma";
import { WithdrawalStatus, Prisma } from "@prisma/client";
import { logAudit } from "@/server/audit";
import { WITHDRAW_QUEUE_NAME, WithdrawJobData } from "../queues/withdraw.queue";
import IORedis from "ioredis"; // ✅ dùng default import ioredis

// ---------------------------------------------------------------------------------
// MÔ PHỎNG GATEWAY: Fake cổng thanh toán (có tỉ lệ fail 15%)
// ---------------------------------------------------------------------------------
const PAYMENT_GATEWAY = {
  processWithdrawal: (details: any) =>
    new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.15; // 85% thành công
        if (isSuccess) {
          resolve(`TX-${Date.now()}-${details.userId}`);
        } else {
          reject(
            new Error(
              "FGW-001: Ngân hàng đối tác không phản hồi hoặc lỗi hệ thống."
            )
          );
        }
      }, Math.floor(Math.random() * 2000) + 1000); // 1–3s
    }),
};

// ---------------------------------------------------------------------------------
// 1) Kết nối Redis cho BullMQ
//    BullMQ yêu cầu: maxRetriesPerRequest phải là null
// ---------------------------------------------------------------------------------
const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: null, // ✅ quan trọng cho BullMQ
});

// ---------------------------------------------------------------------------------
// 2) Processor
// ---------------------------------------------------------------------------------
const processor = async (job: Job<WithdrawJobData>) => {
  const { userId, amount, bankAccount, bankName, idempotencyKey } = job.data;
  const amountDecimal = new Prisma.Decimal(amount);
  const numericUserId = Number(userId);

  console.log(`[Worker - ${job.id}] Bắt đầu xử lý rút tiền cho user: ${userId}`);

  // Tìm bản ghi withdraw theo idempotencyKey
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { idempotencyKey },
    select: { id: true, status: true, userId: true },
  });

  if (!withdrawal) {
    await logAudit(
      numericUserId,
      "WORKER_FATAL_ERROR",
      `Không tìm thấy bản ghi rút tiền với key: ${idempotencyKey}`
    );
    throw new Error(`Withdrawal record not found for key: ${idempotencyKey}`);
  }

  const withdrawalRecordId = withdrawal.id;

  // Chuyển sang PROCESSING nếu đang QUEUED
  if (withdrawal.status === WithdrawalStatus.QUEUED) {
    await prisma.withdrawal.update({
      where: { id: withdrawalRecordId },
      data: { status: WithdrawalStatus.PROCESSING },
    });
    await logAudit(
      numericUserId,
      "WORKER_PROCESSING",
      `Bắt đầu xử lý Job ${withdrawalRecordId}.`
    );
  } else if (
    withdrawal.status === WithdrawalStatus.FAILED ||
    withdrawal.status === WithdrawalStatus.SUCCESS
  ) {
    console.warn(
      `[Worker - ${job.id}] Giao dịch ${withdrawalRecordId} đã ở trạng thái ${withdrawal.status}. Bỏ qua.`
    );
    return { status: "skipped", message: `Đã ${withdrawal.status}` };
  }

  try {
    // Gọi FakeGateway
    const gatewayRef = await PAYMENT_GATEWAY.processWithdrawal({
      userId,
      amount,
      bankAccount,
      bankName,
      withdrawalId: withdrawalRecordId,
    });

    // Thành công → cập nhật SUCCESS + transactionId
    await prisma.withdrawal.update({
      where: { id: withdrawalRecordId },
      data: {
        status: WithdrawalStatus.SUCCESS,
        transactionId: gatewayRef,
      },
    });

    console.log(`[Worker - ${job.id}] Giao dịch ${withdrawalRecordId} THÀNH CÔNG.`);
    await logAudit(numericUserId, "WORKER_SUCCESS", `TXID: ${gatewayRef}`);

    return { status: "success", gatewayRef };
  } catch (error: any) {
    const finalMessage =
      error?.message || "Lỗi không xác định từ cổng thanh toán.";

    console.error(
      `[Worker - ${job.id}] Giao dịch ${withdrawalRecordId} THẤT BẠI. Lý do:`,
      finalMessage
    );

    // Hoàn tiền + cập nhật FAILED trong 1 transaction
    await prisma.$transaction(async (tx) => {
      // A) Hoàn tiền
      await tx.wallet.update({
        where: { userId: numericUserId },
        data: { balance: { increment: amountDecimal } },
      });

      // B) Cập nhật trạng thái
      await tx.withdrawal.update({
        where: { id: withdrawalRecordId },
        data: {
          status: WithdrawalStatus.FAILED,
          note: finalMessage,
        },
      });

      // C) Ghi lịch sử ví
      await tx.walletHistory.create({
        data: {
          userId: numericUserId,
          text: `Hoàn tiền rút thất bại: ${amountDecimal.toString()} VND (ID: ${withdrawalRecordId})`,
          sub: finalMessage,
          amount: amountDecimal,
        },
      });
    });

    await logAudit(
      numericUserId,
      "WORKER_REFUNDED",
      `Hoàn tiền do lỗi: ${finalMessage}`
    );

    // Ném lỗi để BullMQ retry theo config (attempts/backoff)
    throw new Error(finalMessage);
  }
};

// ---------------------------------------------------------------------------------
// 3) Khởi tạo Worker
// ---------------------------------------------------------------------------------
export const withdrawWorker = new Worker<WithdrawJobData>(
  WITHDRAW_QUEUE_NAME,
  processor,
  { connection }
);

console.log(`Worker ${WITHDRAW_QUEUE_NAME} đang lắng nghe Jobs...`);
