import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
// Đã thay thế readJsonAndValidate và ApiError bằng kiểm tra cơ bản
import { getUserId } from "@/server/auth"; // Sử dụng getUserId từ auth để có await
import { logAudit } from "@/server/audit"; 
import { Prisma } from "@prisma/client"; 

const MAX_BANK_ACCOUNTS = 5; 

export async function POST(req: Request) {
    // Phải có await nếu dùng getUserId từ "@/server/auth"
    const userId = await getUserId();
    if (!userId) {
        return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    try {
        const body = (await req.json()) as {
            accountNumber?: string;
            bankName?: string;
            accountName?: string; // Đảm bảo trường này được đọc từ body
        };

        const { accountNumber, bankName, accountName } = body;

        // Bổ sung kiểm tra đầu vào cơ bản
        if (!accountNumber || !bankName || !accountName || accountNumber.length < 4) {
            await logAudit(userId, "BANK_ADD_FAIL", "Thiếu thông tin hoặc số tài khoản không hợp lệ.");
            return NextResponse.json({ error: "Thiếu thông tin hoặc số tài khoản không hợp lệ (≥ 4 chữ số)." }, { status: 400 });
        }

        // 1. KIỂM TRA GIỚI HẠN
        const bankCount = await prisma.bankAccount.count({ where: { userId: userId } });
        if (bankCount >= MAX_BANK_ACCOUNTS) {
            await logAudit(userId, "BANK_ADD_FAIL", `Đã đạt giới hạn ${MAX_BANK_ACCOUNTS} tài khoản`);
            return NextResponse.json({ error: `Bạn chỉ được thêm tối đa ${MAX_BANK_ACCOUNTS} tài khoản ngân hàng.` }, { status: 400 });
        }

        // 2. KIỂM TRA TRÙNG LẶP (Dựa trên userId và accountNumber)
        const existing = await prisma.bankAccount.findFirst({
            where: {
                userId: userId,
                accountNumber: accountNumber,
            },
        });

        if (existing) {
            await logAudit(userId, "BANK_ADD_FAIL", "Tài khoản ngân hàng này đã tồn tại.");
            return NextResponse.json({ error: "Tài khoản ngân hàng này đã được liên kết trước đó." }, { status: 409 });
        }

        // 3. TẠO TÀI KHOẢN MỚI
        const isFirstAccount = bankCount === 0;

        const newBank = await prisma.bankAccount.create({
            data: {
                userId: userId,
                bankName: bankName,
                accountName: accountName,
                accountNumber: accountNumber,
                isDefault: isFirstAccount,
            },
        });

        // 4. GHI LOG VÀ TRẢ VỀ KẾT QUẢ
        await logAudit(userId, "BANK_ADDED", `Thêm thành công ${bankName} (ID: ${newBank.id})`);

        return NextResponse.json({ 
            ok: true, 
            id: newBank.id,
            message: "Tài khoản ngân hàng đã được thêm thành công.",
        });

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            // Xử lý lỗi unique constraint
            return NextResponse.json({ error: "Tài khoản ngân hàng này đã được liên kết trước đó (Prisma P2002)." }, { status: 409 });
        }
        console.error("[banks/add] UNHANDLED error:", e);
        return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
    }
}
