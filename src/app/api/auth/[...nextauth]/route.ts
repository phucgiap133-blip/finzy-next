// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/server/prisma"; 
import bcrypt from "bcryptjs";
import { DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client"; // Bắt buộc phải import UserRole từ Prisma Client

// HÀM HELPER ĐỂ ĐỊNH TUYẾN NEXTAUTH
export const authOptions: NextAuthOptions = {
    // 1. ADAPTER: Kết nối NextAuth với database qua Prisma
    adapter: PrismaAdapter(prisma),

    // 2. PROVIDERS: Định nghĩa cơ chế xác thực
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null; // Không đủ thông tin
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    // ✅ SỬA: BẮT BUỘC CHỌN THÊM 'role'
                    select: { id: true, email: true, password: true, role: true } 
                });

                if (!user || !user.password) {
                    return null; // Không tìm thấy hoặc thiếu mật khẩu
                }

                // Kiểm tra mật khẩu bằng bcrypt
                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null; // Mật khẩu không đúng (Vẫn cần đảm bảo mật khẩu trong DB đã được hash)
                }

                // Đăng nhập thành công, trả về User object (KHÔNG BAO GỒM PASSWORD!)
                return {
                    id: user.id.toString(), // NextAuth cần ID là chuỗi
                    email: user.email,
                    role: user.role, // ✅ SỬA: TRẢ VỀ ROLE ĐỂ KHỚP VỚI TYPESCRIPT
                };
            }
        })
    ],

    // 3. CALLBACKS: Điều chỉnh cách NextAuth quản lý phiên
    callbacks: {
        async jwt({ token, user }) {
            // Khi đăng nhập, thêm user.id và role vào token (jwt)
            if (user) {
                token.id = user.id;
                token.role = (user as any).role; // ✅ SỬA: Ép kiểu để Typescript hiểu UserRole
            }
            return token;
        },
        async session({ session, token }) {
            // Đảm bảo session.user có userId và role
            if (token.id) {
                session.user.id = token.id as string;
            }
            if (token.role) {
                session.user.role = token.role as UserRole; // ✅ SỬA: LƯU ROLE VÀO SESSION
            }
            return session;
        }
    },

    // 4. CẤU HÌNH PHIÊN
    session: {
        strategy: "jwt", 
        maxAge: 30 * 24 * 60 * 60, // 30 ngày
    },
    
    // 5. CÁC THÔNG SỐ KHÁC
    secret: process.env.NEXTAUTH_SECRET, 
    pages: {
        signIn: "/login", // ✅ SỬA: Đồng bộ với trang bạn đã tạo ở /src/app/login/page.tsx
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// KHAI BÁO MODULE MỞ RỘNG ĐỂ CÓ THỂ TRUY CẬP user.id VÀ user.role TRONG SESSION/JWT
declare module "next-auth" {
    interface Session {
        user: {
            id: string;      
            role: UserRole;  
        } & DefaultSession["user"];
    }
    interface User {
        id: string; 
        role: UserRole; 
    }
}
declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;      
        role: UserRole;  
    }
}
