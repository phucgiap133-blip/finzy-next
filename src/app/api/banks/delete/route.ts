import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { readJsonAndValidate, ApiError } from "@/lib/utils";
import { getUserId } from "@/server/auth";
import { logAudit } from "@/server/audit"; 
import { BankIdSchema, BankIdRequest } from "@/schemas/bank";

/**
 * API POST: Xóa một tài khoản ngân hàng.
 * Route: /api/banks/delete
 */
export async function POST(req: Request) {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    try {
        const { id: bankId } = await readJsonAndValidate(req, BankIdSchema) as BankIdRequest;

        // 1. KIỂM TRA SỞ HỮU VÀ TRẠNG THÁI
        const bankAccount = await prisma.bankAccount.findUnique({
            where: { id: bankId },
            // Chọn accountNumber để ghi log
            select: { id: true, userId: true, isDefault: true, bankName: true, accountNumber: true } 
        });

        if (!bankAccount || bankAccount.userId !== userId) {
            await logAudit(userId, "BANK_DELETE_FAIL", `ID ${bankId} không tồn tại hoặc không thuộc sở hữu`);
            throw new ApiError("Tài khoản ngân hàng không hợp lệ hoặc không thuộc về bạn.", 403);
        }

        if (bankAccount.isDefault) { // Đã đổi từ selected
            await logAudit(userId, "BANK_DELETE_FAIL", `Không thể xóa tài khoản ID ${bankId} đang là mặc định.`);
            throw new ApiError("Vui lòng chọn một tài khoản mặc định khác trước khi xóa tài khoản này.", 400);
        }
        
        // 2. XÓA TÀI KHOẢN
        await prisma.bankAccount.delete({
            where: { id: bankId, userId: userId }, 
        });

        // 3. GHI LOG VÀ TRẢ VỀ KẾT QUẢ
        const last4 = bankAccount.accountNumber.slice(-4);
        await logAudit(userId, "BANK_DELETED", `Xóa thành công tài khoản ID: ${bankId}`);

        return NextResponse.json({ 
            ok: true, 
            message: `Đã xóa tài khoản ${bankAccount.bankName} (...${last4}).`
        });

    } catch (e) {
        if (e instanceof ApiError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        console.error("[banks/delete] UNHANDLED error:", e);
        return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
    }
}