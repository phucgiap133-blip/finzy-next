import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import { readJson, assertEmail, assertOtp } from "@/lib/utils";
import { rateLimit } from "@/lib/ratelimit";

const VERIFY_LIMIT = 6;
const VERIFY_WINDOW_MS = 5 * 60_000;

export async function POST(req: Request) {
  let body: { email?: string; otp?: string };

  try {
    try {
      body = await readJson<{ email?: string; otp?: string }>(req);
    } catch (e) {
      console.error("[forgot/verify] JSON parse error:", e);
      return NextResponse.json({ error: "Lỗi cú pháp JSON trong yêu cầu" }, { status: 400 });
    }

    const { email, otp } = body;
    const safeEmail = assertEmail(email);
    const safeOtp = assertOtp(otp);

    const rl = rateLimit(`verify:${safeEmail}`, VERIFY_LIMIT, VERIFY_WINDOW_MS);
    if (!rl.ok) {
      return NextResponse.json({ error: `Thử lại sau ${rl.retryAfter}s` }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email: safeEmail } });
    if (!user) return NextResponse.json({ error: "Thông tin không hợp lệ" }, { status: 400 });

    const rec = await prisma.otpRequest.findFirst({
      where: {
        userId: user.id,
        email: safeEmail,
        used: false,
        purpose: "reset_password", // ✅ snake_case
      },
      orderBy: { createdAt: "desc" },
    });
    if (!rec) return NextResponse.json({ error: "OTP không hợp lệ" }, { status: 400 });
    if (rec.expireAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP đã hết hạn" }, { status: 400 });
    }

    const ok = await bcrypt.compare(safeOtp, rec.code);
    if (!ok) return NextResponse.json({ error: "OTP không đúng" }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.includes("Email không hợp lệ") || msg.includes("OTP")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error("[forgot/verify] error:", e);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
