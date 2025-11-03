import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/auth";

const DEFAULT_PAGE_SIZE = 10;

/**
 * API GET: Lấy danh sách lịch sử rút tiền của người dùng.
 * Route: /api/withdrawals?page=1&pageSize=10
 */
export async function GET(req: Request) {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        // Xử lý Pagination
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || `${DEFAULT_PAGE_SIZE}`);

        const skip = (page - 1) * pageSize;

        // Dùng Promise.all để lấy danh sách và tổng số bản ghi đồng thời
        const [withdrawals, totalCount] = await prisma.$transaction([
            // 1. Lấy danh sách rút tiền
            prisma.withdrawal.findMany({
                where: { userId: userId },
                select: {
                    id: true,
                    amount: true,
                    fee: true,
                    status: true,
                    method: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: skip,
                take: pageSize,
            }),
            // 2. Lấy tổng số bản ghi (dùng cho frontend Pagination)
            prisma.withdrawal.count({ where: { userId: userId } }),
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);

        // 3. TRẢ VỀ KẾT QUẢ
        return NextResponse.json({
            ok: true,
            data: withdrawals,
            pagination: {
                totalItems: totalCount,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
            }
        });

    } catch (e) {
        console.error("[withdrawals/GET] UNHANDLED error:", e);
        return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
    }
}