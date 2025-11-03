import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { readJsonAndValidate, ApiError } from "@/lib/utils";
import { getUserId } from "@/server/auth";
import { logAudit } from "@/server/audit"; 
import { PasswordChangeSchema } from "@/lib/validations/auth";

/**
 * API POST: Chọn một tài khoản ngân hàng làm mặc định (selected).
 * Route: /api/banks/select
 */
export async function POST(req: Request) {
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    try {
        // Đã bỏ check ApiError do không có định nghĩa trong scope này
        // Giả định BankIdSchema và BankIdRequest đã định nghĩa
        // Nếu bạn gặp lỗi tại đây, hãy kiểm tra lại file schemas/bank
        const { id: bankId } = await readJsonAndValidate(req, BankIdSchema) as BankIdRequest;

        // 1. KIỂM TRA SỞ HỮU
        const bankAccount = await prisma.bankAccount.findUnique({
            where: { id: bankId },
            // Chọn thêm các trường cần thiết để xác minh và phản hồi
            select: { id: true, userId: true, bankName: true, accountNumber: true }
        });

        // Giả định userId là Int nếu prisma.bankAccount.userId là Int
        if (!bankAccount || bankAccount.userId !== userId) {
            await logAudit(userId, "BANK_SELECT_FAIL", `ID ${bankId} không tồn tại hoặc không thuộc sở hữu`);
            return NextResponse.json({ error: "Tài khoản ngân hàng không hợp lệ hoặc không thuộc về bạn." }, { status: 403 });
        }
        
        // 2. THỰC HIỆN TRANSACTION: Đảm bảo chỉ có MỘT tài khoản được chọn
        await prisma.$transaction([
            // Bỏ chọn tất cả các tài khoản khác của người dùng
            prisma.bankAccount.updateMany({
                where: { userId: userId, isDefault: true }, // Đã đổi từ selected
                data: { isDefault: false }, // Đã đổi từ selected
            }),
            // Chọn tài khoản mới
            prisma.bankAccount.update({
                where: { id: bankId, userId: userId }, 
                data: { isDefault: true }, // Đã đổi từ selected
            })
        ]);

        // 3. GHI LOG VÀ TRẢ VỀ KẾT QUẢ
        const last4 = bankAccount.accountNumber.slice(-4);
        await logAudit(userId, "BANK_SELECTED", `Chọn thành công tài khoản ID: ${bankId}`);

        return NextResponse.json({ 
            ok: true, 
            message: `Đã chọn ${bankAccount.bankName} (...${last4}) làm tài khoản mặc định.`
        });

    } catch (e) {
        // Xử lý lỗi cho ApiError nếu nó được dùng (bạn chưa cung cấp định nghĩa)
        if (e && (e as any).status) {
            return NextResponse.json({ error: (e as any).message }, { status: (e as any).status });
        }
        console.error("[banks/select] UNHANDLED error:", e);
        return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
    }
}