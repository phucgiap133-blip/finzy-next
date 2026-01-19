// src/lib/auth-middleware.ts
import { verifyAccessToken, type Payload } from "@/lib/jwt";

/**
 * Xác thực từ header Authorization: Bearer <access_token>
 * Trả về Payload nếu hợp lệ, ném lỗi nếu không.
 */
export function assertAuth(req: Request): Payload {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyAccessToken(token) : null;

  if (!payload) {
    // tuỳ trường hợp bạn có thể return Response.json(..., {status:401})
    throw new Error("UNAUTHORIZED");
  }
  return payload;
}
