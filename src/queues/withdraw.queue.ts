// src/queues/withdraw.queue.ts
import { Queue } from "bullmq";
import { getRedisConnection } from "@/lib/redis";

export const WITHDRAW_QUEUE_NAME = "withdraw-queue";

export type WithdrawJobData = {
  userId: string;
  amount: number;
  bankAccount: string;
  bankName: string;
  idempotencyKey: string;
};

const connection = getRedisConnection();

// Chỉ tạo queue khi có Redis
export const withdrawQueue = connection
  ? new Queue<WithdrawJobData>(WITHDRAW_QUEUE_NAME, { connection })
  : null;
