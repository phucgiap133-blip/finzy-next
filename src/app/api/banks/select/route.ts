// src/app/api/banks/select/route.ts
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
    const { id } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

    const p = await prisma();
    if (p?.bankAccount) {
      // reset isDefault
      try {
        await p.bankAccount.updateMany({ data: { isDefault: false } });
      } catch {}
      try {
        await p.bankAccount.update({ where: { id }, data: { isDefault: true } });
      } catch {
        // nếu schema không có isDefault thì bỏ qua, coi như client lưu nhớ id
      }
      return NextResponse.json({ ok: true });
    }

    // in-memory
    if (_mem.some((b) => b.id === id)) _sel = id;
    (globalThis as any).__bankSel = _sel;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/banks/select", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
