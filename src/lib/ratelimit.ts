// src/lib/ratelimit.ts
import { jsonErr } from "./route-helpers";

export const SENSITIVE_RATE_LIMIT = { windowMs: 60_000, max: 10 };

const bucket = new Map<string, { ts: number[] }>();

function keyFromReq(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return ip || "unknown";
}

export async function rateLimitGuard(req: Request, cfg = SENSITIVE_RATE_LIMIT) {
  try {
    const now = Date.now();
    const key = keyFromReq(req);
    const rec = bucket.get(key) ?? { ts: [] };
    // clear old
    rec.ts = rec.ts.filter(t => now - t < cfg.windowMs);
    if (rec.ts.length >= cfg.max) {
      return jsonErr("Too many requests", 429);
    }
    rec.ts.push(now);
    bucket.set(key, rec);
    return null;
  } catch {
    return null; // luôn cho qua nếu RL có vấn đề
  }
}
