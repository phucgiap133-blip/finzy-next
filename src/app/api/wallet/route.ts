import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/auth";

const HISTORY_LIMIT = 5; // Lấy 5 bản ghi lịch sử gần nhất

/**
 * API GET: Lấy thông tin Ví (balance) và Lịch sử giao dịch gần nhất.
 * Route: /api/wallet
 */
export async function GET() {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    try {
        const [wallet, history] = await prisma.$transaction([
            // 1. Lấy thông tin Ví (Wallet)
            prisma.wallet.findUnique({
                where: { userId: userId },
                select: {
                    balance: true,
                    // SỬA LỖI: 'currency' không tồn tại trong model Wallet, đã xóa
                },
            }),
            // 2. Lấy Lịch sử Ví (WalletHistory)
            prisma.walletHistory.findMany({
                where: { userId: userId },
                select: {
                    text: true,
                    sub: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: HISTORY_LIMIT, // Giới hạn số lượng
            }),
        ]);

        if (!wallet) {
            return NextResponse.json({ error: "Ví không tồn tại" }, { status: 404 });
        }

        // 3. TRẢ VỀ KẾT QUẢ
        return NextResponse.json({
            ok: true,
            balance: wallet.balance,
            // SỬA LỖI: Xóa 'currency'
            history: history,
        });

    } catch (e) {
        console.error("[wallet/GET] UNHANDLED error:", e);
        return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
    }
}