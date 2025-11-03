import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/server/prisma"; 
import bcrypt from "bcryptjs";
// ✅ SỬA: Thêm handleApiError vào import
import { readJsonAndValidate, ApiError, handleApiError } from "@/lib/utils"; 
import { rateLimitGuard, SENSITIVE_RATE_LIMIT } from "@/lib/ratelimit"; 
import { RegisterSchema } from "@/schemas/auth"; 

/**
 * API POST: Đăng ký tài khoản người dùng mới.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. RATE LIMIT
        const rateLimitError = await rateLimitGuard(req, SENSITIVE_RATE_LIMIT);
        if (rateLimitError) {
            return rateLimitError; 
        }
        
        // 2. VALIDATE DỮ LIỆU ĐẦU VÀO
        const { email, password } = await readJsonAndValidate(req, RegisterSchema);
        const safeEmail = email.toLowerCase(); 
        
        // 3. KIỂM TRA TỒN TẠI EMAIL
        const existingUser = await prisma.user.findUnique({ where: { email: safeEmail } });
        if (existingUser) {
            throw new ApiError("Email đã được sử dụng.", 409); 
        }
        
        // 4. MÃ HÓA MẬT KHẨU
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 5. TẠO TÀI KHOẢN VÀ VÍ (TRANSACTION)
        await prisma.$transaction(async (tx) => {
            
            // a) Tạo người dùng
            const newUser = await tx.user.create({
                data: {
                    email: safeEmail,
                    password: hashedPassword,
                    // role: 'USER', 
                }
            });
            
            // b) Tạo ví (Wallet) cho người dùng mới
            await tx.wallet.create({
                data: {
                    userId: newUser.id,
                    balance: 0, 
                }
            });
            
            // TODO: Gửi email Chào mừng/Xác minh
            
        });
        
        // 6. PHẢN HỒI THÀNH CÔNG
        return NextResponse.json({ 
            ok: true, 
            message: "Đăng ký thành công." 
        }, { status: 201 }); 
        
    } catch (e) {
        // ✅ SỬ DỤNG HÀM TIỆN ÍCH
        return handleApiError(e);
    }
}