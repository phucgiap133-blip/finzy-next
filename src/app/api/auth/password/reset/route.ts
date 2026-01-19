import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { PasswordResetSchema } from "@/lib/validations";
import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/lib/utils";
import { logAudit } from "@/server/audit";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = PasswordResetSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonOk({ ok: true }); // tránh lộ thông tin

    const rec = await prisma.otpRequest.findFirst({
      where: { userId: user.id, email, type: "RESET_PASSWORD", verified: true },
      orderBy: { createdAt: "desc" },
    });
    if (!rec || rec.expireAt < new Date()) return jsonErr("OTP đã hết hạn", 400);

    const ok = await verifyOtp(otp, rec.codeHash);
    if (!ok) return jsonErr("OTP không đúng", 400);

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, tokenVersion: (user.tokenVersion ?? 0) + 1 },
    });

    await prisma.otpRequest.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
    await logAudit(user.id, "PASSWORD_RESET", "via OTP");

    // buộc đăng nhập lại
    const res = jsonOk({ ok: true });
    res.headers.append("Set-Cookie", "accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    res.headers.append("Set-Cookie", "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
    return res;
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}
