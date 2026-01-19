// src/app/api/wallet/route.ts
import { jsonOk, jsonErr } from "@/lib/route-helpers";
import { prisma } from "@/server/prisma";
import { getUserId } from "@/server/authz";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Lấy uid: ưu tiên auth, nhưng cho phép test nhanh bằng ?uid=1
    const url = new URL(req.url);
    const uidFromQuery = url.searchParams.get("uid");
    const uidFromAuth = await getUserId(req).catch(() => null);
    const uidRaw = uidFromAuth ?? uidFromQuery;

    const userId = Number(uidRaw);
    if (!Number.isFinite(userId)) {
      return jsonErr("UNAUTHORIZED", 401);
    }

    // Đảm bảo có ví: upsert để tránh null
    const [wallet, history] = await Promise.all([
      prisma.wallet.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: 0, currency: "VND" },
      }),
      prisma.walletHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return jsonOk({ wallet, history });
  } catch (e: any) {
    // Nếu table chưa có (P2021) hoặc mới setup → trả fallback để UI vẫn chạy
    if (e?.code === "P2021") {
      return jsonOk({ wallet: { balance: 0, currency: "VND" }, history: [] });
    }
    return jsonErr(e?.message || "Internal error", 500);
  }
}
