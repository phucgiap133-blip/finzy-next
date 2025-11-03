// src/app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { assertAuth } from "@/lib/auth-middleware";
import { handleApiError, ApiError, readJsonAndValidate } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import { UserUpdateSchema } from "@/lib/validations/user";

/**
 * GET /api/users/me
 * Lấy thông tin profile của người dùng đang đăng nhập (yêu cầu xác thực)
 */
export async function GET(req: Request) {
  try {
    const auth = assertAuth(req);
    const userId = Number(auth.userId);
    if (isNaN(userId)) throw new ApiError("Token không hợp lệ (userId)", 401);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new ApiError("Người dùng không tồn tại hoặc đã bị xóa", 404);

    return NextResponse.json({ ok: true, profile: user });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/users/me
 * Cập nhật profile của chính mình (email; role chỉ cho ADMIN)
 */
export async function PUT(req: Request) {
  try {
    // 1) Bảo vệ & lấy userId/role từ JWT
    const auth = assertAuth(req);
    const userId = Number(auth.userId);
    if (isNaN(userId)) throw new ApiError("Token không hợp lệ (userId)", 401);

    // 2) Validate body
    const payload = await readJsonAndValidate(req, UserUpdateSchema);

    // 3) Chuẩn hoá + kiểm tra business rules
    const dataToUpdate: { email?: string; role?: "USER" | "ADMIN" | "SUPPORT" } = {};

    if (payload.email) {
      const nextEmail = payload.email.toLowerCase();

      // Không update nếu không đổi
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (!current) throw new ApiError("Người dùng không tồn tại", 404);

      if (current.email !== nextEmail) {
        // Email đã tồn tại?
        const existed = await prisma.user.findUnique({ where: { email: nextEmail } });
        if (existed && existed.id !== userId) {
          throw new ApiError("Email đã được sử dụng bởi tài khoản khác", 409);
        }
        dataToUpdate.email = nextEmail;
      }
    }

    if (payload.role !== undefined) {
      // Chỉ ADMIN mới được đổi role
      if (auth.role !== "ADMIN") {
        throw new ApiError("Bạn không có quyền thay đổi vai trò (role)", 403);
      }
      dataToUpdate.role = payload.role;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw new ApiError("Không có thay đổi nào để cập nhật", 400);
    }

    // 4) Cập nhật
    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, role: true, updatedAt: true },
    });

    return NextResponse.json({
      ok: true,
      message: "Cập nhật hồ sơ thành công",
      profile: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
