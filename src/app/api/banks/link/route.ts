// src/app/api/banks/link/route.ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

let _mem: any[] = (globalThis as any).__bankMem ?? [];
let _sel: string | null = (globalThis as any).__bankSel ?? null;
(globalThis as any).__bankMem = _mem;
(globalThis as any).__bankSel = _sel;

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const bankName = String(body.bankName || "");
    const number = String(body.number || "");
    const holder = String(body.holder || "");
    if (!bankName || !number || !holder) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const p = await prisma();
    if (p?.bankAccount) {
      // thử các tên field phổ biến
      try {
        const row = await p.bankAccount.create({
          data: { bankName, number, holder, isDefault: false },
        });
        return NextResponse.json({ id: String(row.id) });
      } catch {
        // nếu schema khác tên field → thử map mềm
        const row = await p.bankAccount.create({
          data: { bankName, accountNumber: number, accountName: holder },
        } as any);
        return NextResponse.json({ id: String((row as any).id) });
      }
    }

    // in-memory
    const id = `mem_${Date.now()}`;
    _mem.unshift({ id, bankName, number, holder });
    if (!_sel) _sel = id;
    (globalThis as any).__bankMem = _mem;
    (globalThis as any).__bankSel = _sel;

    return NextResponse.json({ id });
  } catch (e: any) {
    console.error("POST /api/banks/link", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
