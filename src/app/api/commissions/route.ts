// src/app/api/commissions/route.ts
import { prisma } from "@/server/prisma";
import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { getUserId } from "@/server/authz";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const uidFromQuery = url.searchParams.get("uid");
    const uidFromAuth = await getUserId(req).catch(() => null);
    const userId = Number(uidFromAuth ?? uidFromQuery);

    if (!Number.isFinite(userId)) return jsonErr("UNAUTHORIZED", 401);

    let items;
    try {
      items = await prisma.commission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, amount: true, status: true, createdAt: true },
      });
    } catch (e: any) {
      // Nếu bảng chưa có (P2021) hoặc schema lệch → trả rỗng để UI chạy
      if (e?.code === "P2021") {
        items = [];
      } else {
        throw e;
      }
    }

    return jsonOk({ items });
  } catch (e: any) {
    return jsonErr(e?.message || "Internal error", 500);
  }
}
