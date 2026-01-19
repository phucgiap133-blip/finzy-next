// src/server/audit.ts
import { prisma } from "./prisma";

export async function logAudit(userId: number, action: string, meta?: string) {
  try {
    await prisma.walletHistory.create({
      data: { userId, text: `[AUDIT] ${action}`, sub: meta ?? undefined, amount: null },
    });
  } catch {
    // best-effort
  }
}
