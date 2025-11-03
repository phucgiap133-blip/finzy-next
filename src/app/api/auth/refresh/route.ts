import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { serialize } from 'cookie';
import { verifyRefreshToken, createAccessToken } from "@/server/jwt";
import { prisma } from "@/server/prisma"; // ✅ Import prisma
import { logAudit } from "@/server/audit";

export async function POST(req: Request) {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
        return NextResponse.json({ error: "Refresh Token không tồn tại." }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
        return NextResponse.json({ error: "Phiên đã hết hạn." }, { status: 401 });
    }

    // ✅ KIỂM TRA REVOCATION (tokenVersion)
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { tokenVersion: true }
    });

    if (!user || user.tokenVersion !== payload.tokenVersion) {
        // Nếu tokenVersion trong DB đã được cập nhật (do user logout/đổi pass)
        await logAudit(payload.userId, "AUTH_REVOKED", "Refresh Token bị thu hồi (tokenVersion không khớp).");
        return NextResponse.json({ error: "Phiên đã bị thu hồi. Vui lòng đăng nhập lại." }, { status: 401 });
    }
    
    // 3. Tạo Access Token Mới
    // Sử dụng payload hiện tại (đã bao gồm tokenVersion mới nhất)
    const newAccessToken = createAccessToken(payload); 

    // 4. Cấu hình Cookie Access Token Mới (15 phút)
    const accessCookie = serialize('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, 
        path: '/',
    });

    await logAudit(payload.userId, "AUTH_REFRESH", `Làm mới Access Token thành công.`);

    const response = NextResponse.json({
        ok: true,
        message: "Access Token đã được làm mới.",
        user: { id: payload.userId, role: payload.role }
    });

    response.headers.set('Set-Cookie', accessCookie);

    return response;
}