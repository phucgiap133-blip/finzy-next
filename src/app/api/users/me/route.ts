// src/app/api/users/me/route.ts
import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/authz";
import { UserUpdateSchema } from "@/lib/validations/user";

export async function GET(req: Request) {
  try {
    const uid = await getUserId(req);
    if (!uid) return jsonErr("UNAUTHORIZED", 401);
    const me = await prisma.user.findUnique({ where: { id: uid } });
    return jsonOk(me);
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const uid = await getUserId(req);
    if (!uid) return jsonErr("UNAUTHORIZED", 401);

    const parsed = UserUpdateSchema.parse(await req.json());
    const { selectedBankId: _ignore, ...data } = parsed as any;

    const updated = await prisma.user.update({
      where: { id: uid },
      data,
    });

    return jsonOk(updated);
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}
