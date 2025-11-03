import { NextResponse } from "next/server";
import { assertAuth } from "@/lib/auth-middleware";
import { handleApiError, ApiError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import { Prisma } from "@prisma/client";

/** ✅ Helper: Chỉ cho phép ADMIN */
function assertAdmin(req: Request) {
  const auth = assertAuth(req);
  if (auth.role !== "ADMIN") {
    throw new ApiError("Bạn không có quyền quản trị viên để thực hiện hành động này", 403);
  }
}

/** ✅ DELETE /api/users/[id] – ADMIN (xóa dữ liệu liên quan rồi xóa user) */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Xác thực quyền admin
    assertAdmin(req);

    // 2. Lấy và kiểm tra ID
    const userId = Number(params.id);
    if (!Number.isInteger(userId)) {
      throw new ApiError("ID người dùng không hợp lệ", 400);
    }

    // 3. Kiểm tra tồn tại
    const exists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!exists) {
      throw new ApiError("Không tìm thấy người dùng để xóa", 404);
    }

    // 4. Xóa dữ liệu liên quan (transaction)
    await prisma.$transaction([
      prisma.post.deleteMany({ where: { authorId: userId } }),
      prisma.walletHistory.deleteMany({ where: { userId } }),
      prisma.wallet.deleteMany({ where: { userId } }),
      prisma.withdrawal.deleteMany({ where: { userId } }),
      prisma.bankAccount.deleteMany({ where: { userId } }),
      prisma.otpRequest.deleteMany({ where: { userId } }),
      prisma.supportTicketMessage.deleteMany({ where: { ticket: { userId } } }),
      prisma.supportTicket.deleteMany({ where: { userId } }),
      // nếu bạn KHÔNG dùng NextAuth, có thể xóa 2 dòng dưới:
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.deleteMany({ where: { userId } }),
    ]);

    // 5. Xóa user
    await prisma.user.delete({ where: { id: userId } });

    // 6. Phản hồi
    return NextResponse.json({
      ok: true,
      message: `Người dùng ID ${userId} cùng dữ liệu liên quan đã được xóa.`,
    });
  } catch (err) {
    // ✅ Xử lý lỗi FK hoặc not found
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Không thể xóa vì còn dữ liệu liên quan (bài viết, ví, ...). Hãy xóa/cascade trước.",
          },
          { status: 409 }
        );
      }
      if (err.code === "P2025") {
        return NextResponse.json(
          { error: "Không tìm thấy người dùng để xóa" },
          { status: 404 }
        );
      }
    }

    // ✅ Xử lý lỗi chung
    return handleApiError(err);
  }
}
