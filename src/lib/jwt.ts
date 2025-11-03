import * as jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client"; // OK sau khi generate

// Định nghĩa Payload (Dữ liệu bạn muốn lưu trong token)
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Lấy SECRET KEY từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key"; // Thay bằng key mạnh

if (!JWT_SECRET || JWT_SECRET === "fallback_secret_key") {
  console.warn("⚠️ JWT_SECRET chưa được thiết lập. Hãy thiết lập biến môi trường JWT_SECRET.");
}

const TOKEN_EXPIRY = '7d'; // Token hết hạn sau 7 ngày

/**
 * Tạo Token JWT
 */
export const signJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Xác minh Token JWT và trả về Payload
 */
export const verifyJwt = (token: string): JwtPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload;
  } catch (error) {
    // Token không hợp lệ, hết hạn, hoặc sai secret
    return null;
  }
};