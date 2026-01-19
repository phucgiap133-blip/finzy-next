// src/app/api/withdrawals/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let _prisma: any | null = null;
async function getPrisma() {
  if (_prisma) return _prisma;
  try {
    const mod = await import("@/server/prisma");
    _prisma = (mod as any).prisma;
  } catch {
    _prisma = null;
  }
  return _prisma;
}

function toNum(v: any) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return parseFloat(v.toString()); // Prisma.Decimal | string
}

function toItem(r: any) {
  const created =
    r?.createdAt instanceof Date
      ? r.createdAt
      : new Date(r?.createdAt || Date.now());

  // Cố gắng suy ra “method” nhưng KHÔNG yêu cầu bankName (có thể chưa tồn tại cột)
  const methodText =
    r?.method?.name ||
    r?.bank?.bankName ||
    r?.bank?.name ||
    r?.methodName ||
    r?.channel ||
    "Tài khoản mặc định";

  return {
    id: String(r?.id ?? ""),
    amount: toNum(r?.amount),
    status: String(r?.status ?? "pending"),
    fee: toNum(r?.fee),
    method: String(methodText),
    createdAt: created.toISOString(),
  };
}

export async function GET() {
  try {
    const prisma = await getPrisma();

    if (prisma?.withdrawal) {
      try {
        // Lấy các scalar chắc chắn; tránh tham chiếu cột có thể thiếu
        const rows = await prisma.withdrawal.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            amount: true,
            status: true,
            fee: true,
            createdAt: true,
          },
        });

        const items = rows.map(toItem);
        return NextResponse.json(
          { items },
          { headers: { "Cache-Control": "no-store" } },
        );
      } catch (e: any) {
        // Nếu bảng chưa tồn tại → fallback mock
        if (e?.code !== "P2021") {
          // Có thể là select sai tên cột (P2022) → thử findMany tối thiểu
          try {
            const rows = await prisma.withdrawal.findMany({
              orderBy: { createdAt: "desc" },
              take: 100,
            });
            const items = rows.map(toItem);
            return NextResponse.json(
              { items },
              { headers: { "Cache-Control": "no-store" } },
            );
          } catch (inner: any) {
            if (inner?.code !== "P2021") throw inner;
          }
        }
        // rơi xuống mock
      }
    }

    // ===== Fallback mock (không có Prisma/bảng) =====
    const items = [
      toItem({
        id: "w1",
        amount: -50000,
        status: "success",
        fee: 0,
        createdAt: new Date(),
        methodName: "MoMo • 09**1234",
      }),
    ];
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: any) {
    console.error("GET /api/withdrawals failed:", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}
