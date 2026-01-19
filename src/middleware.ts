// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env, isProd } from "@/lib/env";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-request-id", crypto.randomUUID());

  // CSRF very-light cho POST non-API
  if (req.method === "POST" && !req.nextUrl.pathname.startsWith("/api")) {
    const origin = req.headers.get("origin");
    if (origin && !origin.startsWith(req.nextUrl.origin)) {
      return NextResponse.json({ ok: false, error: "Invalid origin" }, { status: 403 });
    }
  }

  // Security headers cơ bản
  res.headers.set("x-frame-options", "DENY");
  res.headers.set("x-content-type-options", "nosniff");
  res.headers.set("referrer-policy", "strict-origin-when-cross-origin");

  // Dev bypass banner
  if (!isProd && env.DEV_AUTH_BYPASS === "1") {
    res.headers.set("x-dev-bypass", `user=${env.DEV_AUTH_USER_ID}, role=${env.DEV_AUTH_ROLE}`);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
