import { NextResponse } from "next/server";
import { verifyJwt, JwtPayload } from "@/lib/jwt";
import { ApiError } from "@/lib/utils";

/**
 * Lấy JWT từ Header Authorization và xác minh nó.
 */
// PHẢI CÓ từ khóa 'export'
export function assertAuth(req: Request): JwtPayload {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
        throw new ApiError("Chưa đăng nhập", 401);
    }

    const payload = verifyJwt(token);

    if (!payload) {
        throw new ApiError("Token không hợp lệ hoặc đã hết hạn", 401);
    }
    
    return payload;
}