import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/auth";

// Kích thước trang mặc định (default page size)
const DEFAULT_PAGE_SIZE = 10;

/**
 * API GET: Lấy danh sách lịch sử hoa hồng của người dùng.
 * Route: /api/commissions?page=1&pageSize=10
 */
export async function GET(req: Request) {
    const userId = await getUserId();
    if (!userId) {
        // Trả về 401 nếu chưa đăng nhập
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        
        // Xử lý Pagination
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || `${DEFAULT_PAGE_SIZE}`);

        // Tính toán offset (skip)
        const skip = (page - 1) * pageSize;

        // Dùng $transaction để đảm bảo tính nhất quán (consistent) và tối ưu hiệu suất (chạy song song)
        const [commissions, totalCount] = await prisma.$transaction([
            // 1. Lấy danh sách hoa hồng
            prisma.commission.findMany({
                where: { userId: userId },
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    createdAt: true,
                    // Nếu bạn có các trường khác như 'reason' hoặc 'source' thì thêm vào đây
                },
                orderBy: {
                    createdAt: 'desc', // Sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
                },
                skip: skip,
                take: pageSize,
            }),
            // 2. Lấy tổng số bản ghi (dùng cho pagination)
            prisma.commission.count({ where: { userId: userId } }),
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);

        // 3. TRẢ VỀ KẾT QUẢ
        return NextResponse.json({
            ok: true,
            data: commissions,
            pagination: {
                totalItems: totalCount,
                totalPages: totalPages,
                currentPage: page,
                pageSize: pageSize,
            }
        });
    
    } catch (e) {
        console.error("[commissions/GET] UNHANDLED error:", e);
        // Trả về lỗi 500 nếu có lỗi hệ thống không xác định
        return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
    }
}
