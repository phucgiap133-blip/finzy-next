import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { requireAdmin, isAuthErr } from "@/server/authz";
import { withdrawQueue } from "@/queues/withdraw.queue";
import { logAudit } from "@/server/audit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (isAuthErr(auth)) return NextResponse.json({ ok:false, error:"FORBIDDEN" }, { status: 403 });
  const adminId = Number(auth.payload.userId);

  const id = Number(params.id);
  const wd = await prisma.withdrawal.findUnique({ where: { id } });
  if (!wd) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });

  // Chuẩn bị jobData giống lúc tạo
  const jobId = wd.idempotencyKey ?? String(wd.id);
  const jobData = {
    userId: String(wd.userId),
    amount: Number(wd.amount),
    bankAccount: (wd as any).bankAccount ?? "UNKNOWN",
    bankName: (wd as any).bankName ?? "UNKNOWN",
    idempotencyKey: jobId,
  };

  await withdrawQueue.add("processWithdrawal", jobData, { jobId, removeOnComplete: true, removeOnFail: false });
  await logAudit(adminId, "ADMIN_REQUEUE", `wd#${wd.id} jobId=${jobId}`);

  return NextResponse.json({ ok:true, jobId });
}
