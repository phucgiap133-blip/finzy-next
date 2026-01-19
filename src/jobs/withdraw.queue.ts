// src/jobs/withdraw.queue.ts
import { Queue } from "bullmq";
import { getRedisConnection } from "@/lib/redis";

export type WithdrawJob = { withdrawalId: number };

let q: Queue<WithdrawJob> | null = null;

export function getWithdrawQueue() {
  if (q) return q;
  const conn = getRedisConnection();
  if (!conn) return null;
  q = new Queue<WithdrawJob>("withdraw-queue", { connection: conn });
  return q;
}
