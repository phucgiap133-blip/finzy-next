// src/app/api/banks/route.ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// ===== In-memory fallback (dev) =====
type BankDTO = { id: string; bankName: string; number?: string; holder?: string };
let _mem: BankDTO[] = [];
let _memSelected: string | null = null;

let _prisma: any | null = null;
async function prisma() {
  if (_prisma) return _prisma;
  try {
    const mod = await import("@/server/prisma");
    _prisma = (mod as any).prisma;
  } catch {
    _prisma = null;
  }
  return _prisma;
}

function last4(number?: string | null) {
  const s = (number || "").replace(/\D/g, "");
  return s.slice(-4) || "****";
}

export async function GET() {
  try {
    const p = await prisma();

    if (p?.bankAccount) {
      try {
        // Thử select các field “an toàn”
        const rows = await p.bankAccount.findMany({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            bankName: true,
            number: true,
            holder: true,
            isDefault: true,
            createdAt: true,
          },
        });

        const accounts = rows.map((r: any) => ({
          id: String(r?.id ?? ""),
          bankName: String(r?.bankName ?? r?.name ?? "Ngân hàng"),
          last4: last4(r?.number ?? (r as any)?.accountNumber),
          holder: String(r?.holder ?? (r as any)?.accountName ?? ""),
        }));

        // Ưu tiên cờ isDefault, không có thì lấy bản ghi đầu
        let selectedId: string | null =
          (rows.find((r: any) => r?.isDefault)?.id as any) ??
          (rows[0]?.id as any) ??
          null;

        // (Tuỳ chọn) Nếu muốn khớp đúng với user.selectedBankId:
        // try {
        //   const userId = /* lấy từ session của bạn */;
        //   const me = await p.user.findUnique({
        //     where: { id: userId },
        //     select: { selectedBankId: true },
        //   });
        //   if (me?.selectedBankId) selectedId = String(me.selectedBankId);
        // } catch {}

        return NextResponse.json(
          { accounts, selectedId },
          { headers: { "Cache-Control": "no-store" } },
        );
      } catch (e: any) {
        // Nếu table chưa tồn tại → fallback in-memory
        if (e?.code !== "P2021") {
          // Không phải lỗi thiếu bảng → ném tiếp cho catch ngoài
          throw e;
        }
        // rơi xuống fallback bên dưới
      }
    }

    // ===== Fallback in-memory =====
    const accounts = _mem.map((r) => ({
      id: r.id,
      bankName: r.bankName,
      last4: last4(r.number),
      holder: r.holder || "",
    }));
    const selectedId = _memSelected ?? (_mem[0]?.id ?? null);

    return NextResponse.json(
      { accounts, selectedId },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: any) {
    console.error("GET /api/banks", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}
