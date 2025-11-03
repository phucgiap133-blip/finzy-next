// src/server/jwt.ts
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// Định nghĩa payload đã sửa
export interface JwtPayload {
  userId: number;
  role: UserRole;
  tokenVersion?: number; // ⬅️ optional
}
// Cấu hình thời gian sống
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 phút
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 ngày

// Đảm bảo biến môi trường đã được thêm vào file .env
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// ----------------------------------------------------
// A. TẠO TOKEN
// ----------------------------------------------------

export function createAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function createRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// ----------------------------------------------------
// B. XÁC THỰC TOKEN
// ----------------------------------------------------

export function verifyAccessToken(token: string): JwtPayload | null {
    try {
        const payload = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
        return payload;
    } catch (error) {
        return null;
    }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
    try {
        const payload = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
        return payload;
    } catch (error) {
        return null;
    }
}