import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getRedisConnection } from "@/lib/redis";

export async function GET() {
  const started = Date.now();

  // DB
  let db: "ok" | "fail" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "fail";
  }

  // Redis
  let redis: "ok" | "skip" | "fail" = "skip";
  try {
    const r = getRedisConnection();
    if (r) {
      await r.ping();
      redis = "ok";
    }
  } catch {
    redis = "fail";
  }

  const ms = Date.now() - started;
  const ok = db === "ok" && redis !== "fail";

  return NextResponse.json({
    ok,
    ms,
    env: process.env.NODE_ENV,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || null,
    db,
    redis,
    time: new Date().toISOString(),
  }, { status: ok ? 200 : 500 });
}
