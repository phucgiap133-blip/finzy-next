import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { generate6Digits, minutesFromNow, hashOtp, ApiError, readJsonAndValidate } from "@/lib/utils";
import { rateLimit } from "@/lib/ratelimit";
import { PasswordChangeSchema } from "@/lib/validations/auth";
import { sendMail, buildOTPEmail } from "@/lib/mailer";

const SEND_LIMIT = 5;
const SEND_WINDOW_MS = 10 * 60_000;

export async function POST(req: Request) {
  try {
    const { email } = await readJsonAndValidate(req, ForgotSendOtpSchema);
    const safeEmail = email;

    const rl = rateLimit(`send-otp:${safeEmail}`, SEND_LIMIT, SEND_WINDOW_MS);
    if (!rl.ok) {
      return NextResponse.json(
        { error: `Quá nhiều yêu cầu, thử lại sau ${rl.retryAfter}s` },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email: safeEmail } });
    if (!user) {
      return NextResponse.json({ ok: true }); // tránh dò tài khoản
    }

    const code = generate6Digits();
    const hashedCode = await hashOtp(code);

    await prisma.otpRequest.create({
      data: {
        userId: user.id,
        email: safeEmail,
        code: hashedCode,
        expireAt: minutesFromNow(5),
        purpose: "reset_password", // ✅ snake_case đúng theo schema
      },
    });

    const mailContent = buildOTPEmail(code);
    await sendMail(safeEmail, mailContent.subject, mailContent.text, mailContent.html);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof ApiError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[send-otp] UNHANDLED error:", e);
    return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
  }
}
