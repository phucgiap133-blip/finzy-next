// BẮT BUỘC có các import này nếu bạn đang dùng các định nghĩa mở rộng bên ngoài file NextAuth chính
import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client"; // ✅ BẮT BUỘC: Import Enum UserRole từ Prisma

declare module "next-auth" {
    /**
     * Mở rộng Session object để bao gồm các trường tùy chỉnh
     */
    interface Session {
        user: {
            id: string;      // Thêm ID người dùng
            role: UserRole;  // ✅ THÊM ROLE (kiểu từ Prisma)
        } & DefaultSession["user"]; // Giữ lại các trường mặc định (name, email, image)
    }

    /**
     * Mở rộng User object (được trả về từ authorize)
     */
    interface User {
        id: string; 
        role: UserRole; // ✅ THÊM ROLE
    }
}

declare module "next-auth/jwt" {
    /**
     * Mở rộng JWT Token để bao gồm các trường tùy chỉnh
     */
    interface JWT extends DefaultJWT {
        id: string;      // Thêm ID người dùng
        role: UserRole;  // ✅ THÊM ROLE
    }
}