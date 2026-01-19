// src/app/api/banks/delete/route.ts
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
      try {
        await p.bankAccount.delete({ where: { id } });
      } catch {
        // nếu khoá where không đúng kiểu (string/number) → thử ép string
        await p.bankAccount.delete({ where: { id: String(id) } } as any);
      }
      return NextResponse.json({ ok: true });
    }

    // in-memory
    _mem = _mem.filter((b) => b.id !== id);
    if (_sel === id) _sel = _mem[0]?.id ?? null;
    (globalThis as any).__bankMem = _mem;
    (globalThis as any).__bankSel = _sel;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/banks/delete", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
