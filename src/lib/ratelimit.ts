import { NextRequest, NextResponse } from 'next/server';

const buckets = new Map<string, { cnt: number; resetAt: number }>();

/**
 * Hàm lõi thực hiện logic giới hạn tốc độ.
 */
export function rateLimit( // ✅ SỬA: Thêm 'export' ở đây
  key: string,
  limit = 5,
  windowMs = 60_000,
): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const b = buckets.get(key);
  
  // 1. Nếu bucket không tồn tại hoặc đã hết thời gian reset (Fixed Window/Leaky Bucket Basic)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { cnt: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  
  // 2. Nếu đã đạt giới hạn
  if (b.cnt >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  
  // 3. Tăng count và cho phép truy cập
  b.cnt++;
  return { ok: true };
}

// Cấu hình Rate-Limit mặc định
export const DEFAULT_RATE_LIMIT = {
    limit: 10,
    windowMs: 60 * 1000, // 1 phút
};

// Cấu hình Rate-Limit nhạy cảm (ví dụ: đăng nhập, gửi OTP)
export const SENSITIVE_RATE_LIMIT = {
    limit: 3,
    windowMs: 60 * 1000, // 1 phút
};

/**
 * Middleware Guard tích hợp với Next.js API Route Handlers.
 * @returns NextResponse (lỗi 429) nếu bị giới hạn, hoặc null nếu hợp lệ.
 */
export async function rateLimitGuard(
    req: NextRequest, 
    { limit, windowMs }: { limit: number, windowMs: number }
) 
/**
 * Middleware Guard tích hợp với Next.js API Route Handlers.
 * @returns NextResponse (lỗi 429) nếu bị giới hạn, hoặc null nếu hợp lệ.
 */
export async function rateLimitGuard(
    req: NextRequest, 
    { limit, windowMs }: { limit: number, windowMs: number }
) {
    // Lấy IP làm khóa (KEY)
    // LƯU Ý: req.ip chỉ có sẵn khi chạy trên Vercel hoặc môi trường có cấu hình Next.js đặc biệt
    const ip = req.headers.get('x-forwarded-for') || req.ip;

    if (!ip) {
        // ✅ SỬA: Thêm ok: false và status 400
        return NextResponse.json({ ok: false, error: "Không thể xác định IP người dùng" }, { status: 400 });
    }

    const result = rateLimit(ip, limit, windowMs);

    if (!result.ok) {
        const retryAfterSeconds = result.retryAfter || 60;
        
        console.warn(`[RATE_LIMIT] IP: ${ip} exceeded limit. Retry after ${retryAfterSeconds}s.`);
        
        return NextResponse.json(
            // ✅ SỬA: Thêm ok: false vào phản hồi lỗi 429
            { 
                ok: false, 
                error: `Tốc độ yêu cầu quá nhanh. Vui lòng thử lại sau ${retryAfterSeconds} giây.` 
            },
            { 
                status: 429, 
                headers: { 
                    'Retry-After': retryAfterSeconds.toString() 
                } 
            }
        );
    }
    
    return null; // Yêu cầu hợp lệ
}