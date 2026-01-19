// src/lib/idempotency.ts
import { prisma } from "@/server/prisma";
import { jsonOk } from "./route-helpers";

const IDEM_TTL_MS = 5 * 60_000; // 5 phút

export async function idempotencyGuard(req: Request, endpoint: string) {
  const key = req.headers.get("Idempotency-Key") || req.headers.get("x-idempotency-key");
  if (!key) return crypto.randomUUID(); // tự sinh key nếu client không gửi

  const rec = await prisma.idempotencyRecord.findUnique({ where: { idempotencyKey: key } });
  const now = new Date();

  if (!rec) {
    await prisma.idempotencyRecord.create({
      data: {
        idempotencyKey: key,
        endpoint,
        expireAt: new Date(Date.now() + IDEM_TTL_MS),
      },
    });
    return key;
  }

  // nếu có body cached -> trả lại
  if (rec.responseStatus && rec.responseBody) {
    return new Response(rec.responseBody, {
      status: rec.responseStatus,
      headers: { "content-type": "application/json; charset=utf-8", "x-idempotent-replay": "1" },
    });
  }

  // nếu chưa hết hạn nhưng đang xử lý -> 202
  if (rec.expireAt > now) {
    return new Response(JSON.stringify({ processing: true }), { status: 202, headers: { "content-type": "application/json" } });
  }

  // hết hạn -> cho phép xử lý lại
  await prisma.idempotencyRecord.update({
    where: { idempotencyKey: key },
    data: { expireAt: new Date(Date.now() + IDEM_TTL_MS), responseBody: null, responseStatus: null },
  });
  return key;
}

export async function completeIdempotency(key: string, payload: any, status = 200) {
  try {
    await prisma.idempotencyRecord.update({
      where: { idempotencyKey: key },
      data: { responseBody: JSON.stringify(payload), responseStatus: status },
    });
  } catch {
    // ignore
  }
  return jsonOk(payload, status);
}
