// src/lib/rate-limit.ts
// In-memory fixed-window limiter (key → { count, resetAt })
const store = new Map<string, { count: number; resetAt: number }>();

type LimitOk = { success: true };
type LimitBlocked = { success: false; reset: number };
type LimitResult = LimitOk | LimitBlocked;

function isBlocked(r: LimitResult): r is LimitBlocked {
  return r.success === false;
}

export async function limit(
  key: string,
  max = 60,
  windowMs = 60_000
): Promise<LimitResult> {
  const now = Date.now();
  const rec = store.get(key);

  // cửa sổ mới
  if (!rec || rec.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  // còn quota
  if (rec.count < max) {
    rec.count += 1;
    return { success: true };
  }

  // bị chặn
  return { success: false, reset: rec.resetAt };
}

export async function assertRateLimit(
  key: string,
  max = 60,
  windowMs = 60_000
): Promise<void> {
  const r = await limit(key, max, windowMs);

  // ✅ TS narrow bằng type-guard, nên dùng được r.reset
  if (isBlocked(r)) {
    const resetSec = Math.ceil((r.reset - Date.now()) / 1000);
    const err: any = new Error("Quá nhiều yêu cầu, thử lại sau.");
    err.status = 429;
    err.meta = { resetSec };
    throw err;
  }
}
