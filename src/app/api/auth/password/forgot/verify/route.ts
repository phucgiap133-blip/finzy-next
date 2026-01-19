import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { ForgotVerifySchema } from "@/lib/validations";
import { prisma } from "@/server/prisma";
import { verifyOtp } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { email, otp } = ForgotVerifySchema.parse(await req.json());

    const record = await prisma.otpRequest.findFirst({
      where: { email, type: "RESET_PASSWORD" },
      orderBy: { createdAt: "desc" },
    });
    if (!record || record.expireAt < new Date()) return jsonErr("OTP không hợp lệ hoặc đã hết hạn", 400);

    const ok = await verifyOtp(otp, record.codeHash);
    if (!ok) return jsonErr("OTP không đúng", 400);

    await prisma.otpRequest.update({ where: { id: record.id }, data: { verified: true } });
    return jsonOk({ ok: true });
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}
