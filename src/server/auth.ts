import { cookies } from 'next/headers';
import { verifyAccessToken, JwtPayload } from './jwt';
import { UserRole } from "@prisma/client";
import { NextResponse } from 'next/server';

// Export các hàm cần thiết cho API Routes
export { getAuthPayload, getUserId, requireRole, requireAdmin };

/**
 * Lấy Payload (userId và role) từ Access Token trong Cookie
 */
async function getAuthPayload(): Promise<JwtPayload | null> {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return null;
    }

    // Xác thực Token
    const payload = verifyAccessToken(accessToken);
    
    // Nếu Token hết hạn hoặc không hợp lệ, payload là null.
    return payload;
}

/**
 * Hàm tiện ích chỉ trả về userId
 */
async function getUserId(): Promise<number | null> {
    const payload = await getAuthPayload();
    return payload?.userId ?? null;
}

/**
 * Middleware kiểm tra vai trò (RBAC) cho bất kỳ vai trò nào
 * Thường dùng trong logic xử lý bên trong POST/GET
 * @throws Error("UNAUTHORIZED" | "FORBIDDEN")
 */
async function requireRole(allowedRoles: UserRole[]): Promise<JwtPayload> {
    const payload = await getAuthPayload();

    if (!payload) {
        throw new Error("UNAUTHORIZED"); 
    }

    // Kiểm tra xem role của user có nằm trong danh sách được phép không
    if (!allowedRoles.includes(payload.role)) {
        throw new Error("FORBIDDEN"); 
    }
    
    return payload;
}

/**
 * Middleware kiểm tra vai trò ADMIN (tiện ích)
 */
async function requireAdmin(): Promise<JwtPayload> {
    return requireRole([UserRole.ADMIN]);
}
