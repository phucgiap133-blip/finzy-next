// src/app/api/auth/route.ts
import { NextRequest } from "next/server";
import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { prisma } from "@/server/prisma";
import { createAccessToken, createRefreshToken, type Payload } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const db = await prisma.user.findUnique({ where: { email } });
    if (!db || db.password !== password) {
      return jsonErr("Email hoặc mật khẩu không đúng", 401);
    }

    // role từ DB là string -> ép về union Role
    const role = db.role === "ADMIN" ? "ADMIN" : "USER";

    const payload: Payload = {
      userId: db.id,
      role,
      tokenVersion: db.tokenVersion ?? 0,
      email: db.email,
    };

    const access     = createAccessToken(payload);
    const refreshTok = createRefreshToken(payload);

    return jsonOk({ access, refresh: refreshTok });
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 400);
  }
}
