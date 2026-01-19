// src/app/api/users/[id]/route.ts
import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { prisma } from "@/server/prisma";
import { requireAdmin } from "@/server/auth";
import { UserUpdateSchema } from "@/lib/validations/user";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(); // RBAC
    const user = await prisma.user.findUnique({
      where: { id: Number(params.id) },
    });
    if (!user) return jsonErr("Not found", 404);
    return jsonOk(user);
  } catch (e: any) {
    const msg = e?.message === "UNAUTHORIZED" ? "UNAUTHORIZED" : e?.message;
    return jsonErr(msg || "Internal error", msg === "UNAUTHORIZED" ? 401 : 500);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const parsed = UserUpdateSchema.parse(await req.json());
    // BỎ selectedBankId vì model User không có field này
    const { selectedBankId: _ignore, ...data } = parsed as any;

    const user = await prisma.user.update({
      where: { id: Number(params.id) },
      data,
    });

    return jsonOk(user);
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const id = Number(params.id);

    await prisma.$transaction(async (tx) => {
      await tx.walletHistory.deleteMany({ where: { userId: id } });
      await tx.withdrawal.deleteMany({ where: { userId: id } });
      await tx.bankAccount.deleteMany({ where: { userId: id } });
      await tx.chatMessage.deleteMany({ where: { userId: id } });
      await tx.supportTicket.deleteMany({ where: { userId: id } });
      await tx.wallet.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return jsonOk({ ok: true });
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 500);
  }
}
