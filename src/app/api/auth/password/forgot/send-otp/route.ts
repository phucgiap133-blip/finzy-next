import { NextRequest } from "next/server";
import { jsonOk, jsonErr, assertMethod } from "@/lib/route-helpers";
import { ForgotSendOtpSchema } from "@/lib/validations";
import { prisma } from "@/server/prisma";
import { rateLimitGuard, SENSITIVE_RATE_LIMIT } from "@/lib/ratelimit";
import { buildOTPEmail, sendMail } from "@/lib/mailer";
import { generate6Digits, hashOtp, minutesFromNow } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    assertMethod(req, ["POST"]);
    const rl = await rateLimitGuard(req, SENSITIVE_RATE_LIMIT);
    if (rl) return rl;

    const { email } = ForgotSendOtpSchema.parse(await req.json());
    // Luôn trả ok để tránh user enumeration
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return jsonOk({ ok: true });

    const code = generate6Digits();
    const hashed = await hashOtp(code);

    await prisma.otpRequest.create({
      data: {
        userId: user.id,
        email,
        codeHash: hashed,
        expireAt: minutesFromNow(5),
        verified: false,
        type: "RESET_PASSWORD",
      },
    });

    const { subject, text, html } = buildOTPEmail(code);
    await sendMail(email, subject, text, html);

    return jsonOk({ ok: true });
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}
