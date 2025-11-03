import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import { readJsonAndValidate, ApiError } from "@/lib/utils";
import { rateLimit } from "@/lib/ratelimit";
import { PasswordChangeSchema } from "@/lib/validations/auth";

const RESET_LIMIT = 5;
const RESET_WINDOW_MS = 10 * 60_000;

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await readJsonAndValidate(req, PasswordResetSchema);

    const safeEmail = email;
    const safeOtp = otp;
    const safePass = newPassword;

    const rl = rateLimit(`reset:${safeEmail}`, RESET_LIMIT, RESET_WINDOW_MS);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Quá nhiều yêu cầu, thử lại sau ${rl.retryAfter}s` },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email: safeEmail } });
    if (!user) throw new ApiError("Thông tin không hợp lệ", 400);

    const rec = await prisma.otpRequest.findFirst({
      where: {
        userId: user.id,
        email: safeEmail,
        used: false,
        purpose: "reset_password", // ✅ snake_case
      },
      orderBy: { createdAt: "desc" },
    });
    if (!rec) throw new ApiError("OTP không hợp lệ", 400);
    if (rec.expireAt.getTime() < Date.now()) throw new ApiError("OTP đã hết hạn", 400);

    await prisma.$transaction(async (tx) => {
      const ok = await bcrypt.compare(safeOtp, rec.code);
      if (!ok) throw new ApiError("OTP không đúng", 400);

      const hashed = await bcrypt.hash(safePass, 10);
      await tx.user.update({ where: { id: user.id }, data: { password: hashed } });

      await tx.otpRequest.updateMany({
        where: {
          userId: user.id,
          email: safeEmail,
          used: false,
          purpose: "reset_password", // ✅ snake_case
        },
        data: { used: true },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof ApiError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[password/reset] UNHANDLED error:", e);
    return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
  }
}
