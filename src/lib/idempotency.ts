import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { ApiError } from "@/lib/utils";

const IDEMPOTENCY_TTL_MINUTES = 24 * 60;
const PROCESSING_STATUS = 102; // dùng như “đang xử lý”

/**
 * Kiểm tra & ghi nhận Idempotency Key
 */
export async function idempotencyGuard(
  req: NextRequest,
  routePath: string
): Promise<NextResponse | string> {
  const key = req.headers.get("Idempotency-Key");
  if (!key) throw new ApiError("Header 'Idempotency-Key' là bắt buộc.", 400);

  const now = new Date();

  const existing = await prisma.idempotencyRecord.findUnique({
    where: { idempotencyKey: key },
    select: {
      idempotencyKey: true,
      expireAt: true,
      responseStatus: true,
      responseBody: true,
    },
  });

  if (existing && existing.expireAt > now) {
    // còn hạn
    if (existing.responseStatus !== PROCESSING_STATUS && existing.responseBody) {
      // Đã hoàn thành -> trả kết quả cache
      return new NextResponse(existing.responseBody, {
        status: existing.responseStatus ?? 200,
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Status": "COMPLETED",
        },
      });
    }
    // Đang xử lý
    throw new ApiError("Yêu cầu đang được xử lý. Vui lòng không gửi trùng lặp.", 409);
  }

  // Không có hoặc đã hết hạn -> upsert record mới ở trạng thái PROCESSING
  const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MINUTES * 60_000);

  await prisma.idempotencyRecord.upsert({
    where: { idempotencyKey: key },
    update: {
      endpoint: routePath,
      expireAt: expiresAt,
      responseStatus: PROCESSING_STATUS,
      responseBody: null,
    },
    create: {
      idempotencyKey: key,
      endpoint: routePath,
      expireAt: expiresAt,
      responseStatus: PROCESSING_STATUS,
      responseBody: null,
    },
  });

  return key;
}

/**
 * Đánh dấu hoàn tất & lưu kết quả cho Idempotency Key
 */
export async function completeIdempotency(
  idempotencyKey: string,
  successResponse: any,
  status = 200
) {
  await prisma.idempotencyRecord.update({
    where: { idempotencyKey },
    data: {
      responseStatus: status,
      responseBody: JSON.stringify(successResponse),
    },
  });
}
