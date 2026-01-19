// src/lib/redis.ts
import IORedis, { Redis } from "ioredis";

let _conn: Redis | null | undefined = undefined;

export function getRedisConnection(): Redis | null {
  // Cho phép tắt Redis khi build/CI
  if (process.env.SKIP_REDIS === "1") return null;

  if (_conn !== undefined) return _conn ?? null;

  try {
    if (process.env.REDIS_URL) {
      _conn = new IORedis(process.env.REDIS_URL, { lazyConnect: true });
    } else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
      _conn = new IORedis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        lazyConnect: true,
      });
    } else {
      // Không có cấu hình => không kết nối
      _conn = null;
    }

    // Chỉ connect thật khi KHÔNG skip
    if (_conn) {
      _conn.on("error", (e) => {
        // Đừng spam lỗi khi build
        if (process.env.NODE_ENV !== "production") {
          console.warn("[redis] error", e?.message);
        }
      });
      // Không auto connect ở import-time
      // _conn.connect(); // ❌ bỏ dòng này
    }

    return _conn ?? null;
  } catch {
    _conn = null;
    return null;
  }
}
