import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { PasswordChangeSchema } from "@/lib/validations";
import { getUserId } from "@/server/authz";
import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import { logAudit } from "@/server/audit";

export async function POST(req: Request) {
  try {
    const uid = await getUserId(req);
    if (!uid) return jsonErr("UNAUTHORIZED", 401);

    const { current, next } = PasswordChangeSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user || !user.password) return jsonErr("UNAUTHORIZED", 401);

    const ok = await bcrypt.compare(current, user.password);
    if (!ok) return jsonErr("Mật khẩu hiện tại không đúng", 400);

    const newHash = await bcrypt.hash(next, 10);
    await prisma.user.update({
      where: { id: uid },
      data: { password: newHash, tokenVersion: (user.tokenVersion ?? 0) + 1 },
    });

    const res = jsonOk({ ok: true });
    res.headers.append("Set-Cookie", "accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    res.headers.append("Set-Cookie", "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    await logAudit(uid, "PASSWORD_CHANGE", "success");
    return res;
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}
