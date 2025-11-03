import { NextResponse } from "next/server";
import { serialize } from 'cookie';
import { prisma } from "@/server/prisma";
import { getAuthPayload } from "@/server/auth"; // Dùng để lấy userId hiện tại
import { logAudit } from "@/server/audit";

export async function POST(req: Request) {
    const authPayload = await getAuthPayload();
    const userId = authPayload?.userId;

    try {
        if (userId) {
            // 1. Tăng tokenVersion trong DB để làm vô hiệu hóa các Refresh Token cũ
            await prisma.user.update({
                where: { id: userId },
                data: { tokenVersion: { increment: 1 } },
            });
            await logAudit(userId, "AUTH_LOGOUT", `Đăng xuất thành công. Token version được cập nhật.`);
        }
        
        // 2. Cấu hình Cookie để xóa Access Token (hết hạn ngay lập tức)
        const accessCookie = serialize('accessToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Hết hạn ngay lập tức
            path: '/',
        });

        // 3. Cấu hình Cookie để xóa Refresh Token
        const refreshCookie = serialize('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Hết hạn ngay lập tức
            path: '/api/auth/refresh',
        });

        const response = NextResponse.json({
            ok: true,
            message: "Đăng xuất thành công."
        });

        // 4. SET COOKIE
        response.headers.set('Set-Cookie', accessCookie);
        response.headers.append('Set-Cookie', refreshCookie);

        return response;

    } catch (e: any) {
        // Xử lý lỗi nhưng vẫn nên xóa cookie nếu có thể
        const response = NextResponse.json({ error: "Lỗi hệ thống khi đăng xuất." }, { status: 500 });
        response.headers.set('Set-Cookie', serialize('accessToken', '', { maxAge: 0, path: '/' }));
        response.headers.append('Set-Cookie', serialize('refreshToken', '', { maxAge: 0, path: '/api/auth/refresh' }));
        return response;
    }
}