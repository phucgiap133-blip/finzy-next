// src/server/admin-guard.ts
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getUserRole } from "@/server/authz"; // ✅ đổi sang authz.ts
import { ApiError } from "@/lib/utils";

/**
 * Kiểm tra quyền ADMIN và trả 403 nếu không có.
 * Dùng trong các route admin.
 */
export async function adminAuthGuard(req: Request): Promise<NextResponse | null> {
  const role = await getUserRole(req);
  if (role !== UserRole.ADMIN) {
    console.warn(`[AdminAuthGuard] Access denied. Role: ${role}`);
    return NextResponse.json(
      { error: "Không có quyền truy cập. Chỉ dành cho Admin." },
      { status: 403 }
    );
  }
  return null; // Quyền hợp lệ
}

/**
 * Dùng trong Server Action hoặc logic server-side
 * Ném lỗi nếu không có quyền ADMIN.
 */
export async function assertAdmin(req: Request) {
  const role = await getUserRole(req);
  if (role !== UserRole.ADMIN) {
    throw new ApiError("Không có quyền truy cập. Chỉ dành cho Admin.", 403);
  }
}
