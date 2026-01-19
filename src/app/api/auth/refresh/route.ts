// src/app/api/auth/refresh/route.ts
import { NextRequest } from "next/server";
import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { prisma } from "@/server/prisma";
import { verifyRefreshToken, createAccessToken, createRefreshToken, type Payload } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { refresh } = await req.json();
    const token = verifyRefreshToken(refresh);
    if (!token) return jsonErr("INVALID_REFRESH", 401);

    const db = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!db) return jsonErr("USER_NOT_FOUND", 404);
    if ((db.tokenVersion ?? 0) !== (token.tokenVersion ?? 0)) {
      return jsonErr("TOKEN_VERSION_MISMATCH", 401);
    }

    const role = db.role === "ADMIN" ? "ADMIN" : "USER";
    const nextPayload: Payload = {
      userId: db.id,
      role,
      tokenVersion: db.tokenVersion ?? 0,
      email: db.email,
    };

    const access  = createAccessToken(nextPayload);
    const refresh2 = createRefreshToken(nextPayload);

    return jsonOk({ access, refresh: refresh2 });
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 400);
  }
}
