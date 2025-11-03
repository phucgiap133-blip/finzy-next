// src/app/api/auth/password/change/route.ts
import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/server/prisma";
import { ApiError, readJsonAndValidate } from "@/lib/utils";
import { PasswordChangeSchema } from "@/lib/validations/auth";
import { assertAuth } from "@/lib/auth-middleware";

export async function POST(req: Request) {
  try {
    // 1) Lấy userId từ JWT
    const auth = assertAuth(req); // throw 401 nếu token không hợp lệ
    const userIdNum = Number(auth.userId);

    // Chắn lỗi userId không phải số
    if (!Number.isInteger(userIdNum)) {
      throw new ApiError("Token không hợp lệ (userId)", 401);
    }

    // 2) Validate body
    const { current, next } = await readJsonAndValidate(req, PasswordChangeSchema);

    if (current === next) {
      throw new ApiError("Mật khẩu mới không được trùng mật khẩu hiện tại.", 400);
    }

    // 3) Lấy user và kiểm tra mật khẩu hiện tại
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
      select: { password: true },
    });

    if (!user?.password) {
      throw new ApiError("Không tìm thấy người dùng.", 404);
    }

    const ok = await bcrypt.compare(current, user.password);
    if (!ok) {
      throw new ApiError("Mật khẩu hiện tại không đúng.", 401);
    }

    // 4) Hash & cập nhật mật khẩu mới
    const hashed = await bcrypt.hash(next, 10);
    await prisma.user.update({
      where: { id: userIdNum },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true, message: "Đổi mật khẩu thành công." });
  } catch (e: any) {
    if (e instanceof ApiError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[PASSWORD CHANGE] UNHANDLED:", e);
    return NextResponse.json({ error: "Lỗi hệ thống không xác định" }, { status: 500 });
  }
}
