// src/workers/withdraw.worker.ts
import { Worker, Job } from "bullmq";
import { prisma } from "@/server/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/server/audit";
import { WITHDRAW_QUEUE_NAME, WithdrawJobData } from "@/queues/withdraw.queue";
import { getRedisConnection } from "@/lib/redis";

const connection = getRedisConnection();
export const withdrawWorker = connection
  ? new Worker<WithdrawJobData>(WITHDRAW_QUEUE_NAME, processor, { connection })
  : null;

async function processor(job: Job<WithdrawJobData>) {
  // ... GIỮ nguyên phần xử lý của bạn ...
}

if (withdrawWorker) {
  console.log(`Worker ${WITHDRAW_QUEUE_NAME} đang lắng nghe Jobs...`);
} else if (process.env.SKIP_REDIS === "1") {
  console.log("[Worker] SKIP_REDIS=1 → worker tắt.");
} else {
  console.log("[Worker] Không có kết nối Redis → worker tắt.");
}
