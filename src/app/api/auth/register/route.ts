import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { jsonOk, jsonErr, assertMethod } from "@/lib/route-helpers";
import { RegisterSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { rateLimitGuard, SENSITIVE_RATE_LIMIT } from "@/lib/ratelimit";
import { logAudit } from "@/server/audit";

export async function POST(req: NextRequest) {
  try {
    assertMethod(req, ["POST"]);
    const rl = await rateLimitGuard(req, SENSITIVE_RATE_LIMIT);
    if (rl) return rl;

    const { email, password } = RegisterSchema.parse(await req.json());

    const existed = await prisma.user.findUnique({ where: { email } });
    if (existed) return jsonErr("Email đã tồn tại", 409);

    const pwd = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
       password: pwd,
        role: "USER",
        tokenVersion: 0,
        wallet: { create: { balance: 0, currency: "VND" } },
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    await logAudit(user.id, "REGISTER");
    return jsonOk({ user });
  } catch (e: any) {
    return jsonErr(e?.message || "Bad request", 400);
  }
}
