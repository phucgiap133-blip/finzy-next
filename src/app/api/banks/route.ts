import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/auth";

/**
 * API GET: Lấy tất cả tài khoản ngân hàng đã liên kết của người dùng.
 * Route: /api/banks
 */
export async function GET() {
    const userId = await getUserId();
    if (!userId) {
        // Trả về 401 Unauthenticated
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    try {
        // 1. TRUY VẤN TẤT CẢ TÀI KHOẢN
        const banks = await prisma.bankAccount.findMany({
            where: { userId: userId },
            select: {
                id: true,
                bankName: true,
                accountNumber: true, // Lấy toàn bộ số tài khoản (Thay thế last4)
                accountName: true, // Đã đổi từ holder
                isDefault: true, // Đã đổi từ selected
                // Bỏ trường 'tag'
            },
            orderBy: {
                isDefault: 'desc', // Đưa tài khoản đang chọn lên đầu (Đã đổi từ selected)
            },
        });

        // 2. FORMAT VÀ TRẢ VỀ KẾT QUẢ
        const formattedBanks = banks.map(bank => ({
            ...bank,
            // Thêm last4 cho tiện hiển thị nếu cần (Tính toán từ accountNumber)
            last4: bank.accountNumber.slice(-4), 
        }));

        return NextResponse.json({
            ok: true,
            data: formattedBanks,
            message: `Tìm thấy ${banks.length} tài khoản ngân hàng.`
        });
        
    } catch (e) {
        console.error("[banks/GET] UNHANDLED error:", e);
        return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
    }
}