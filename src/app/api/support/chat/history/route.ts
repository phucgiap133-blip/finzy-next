// src/app/api/support/chat/history/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ===== in-memory store dùng chung với /chat/send =====
type MemMsg = { id: string; userId: number; room: string; from: string; text: string; createdAt: string };
const g = globalThis as any;
g.__chatMem ??= {} as Record<string, MemMsg[]>; // { [room]: MemMsg[] }

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

// lấy uid: cho phép ?uid= khi DEV; prod thì tuỳ bạn đang dùng getUserId(req)
async function getUserIdSoft(req: Request): Promise<number | null> {
  const url = new URL(req.url);
  const uidQ = url.searchParams.get("uid");
  try {
    const mod = await import("@/server/authz");
    const fromAuth = await (mod as any).getUserId(req);
    if (fromAuth) return Number(fromAuth);
  } catch {}
  if (process.env.NODE_ENV !== "production" && uidQ) {
    const n = Number(uidQ);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function mapRow(r: any) {
  const created =
    r?.createdAt instanceof Date ? r.createdAt : new Date(r?.createdAt || Date.now());
  return {
    id: String(r?.id ?? ""),
    userId: Number(r?.userId ?? 0),
    room: String(r?.room ?? "default"),
    from: String(r?.from ?? "user"),
    text: String(r?.text ?? ""),
    createdAt: created.toISOString(),
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const room = (url.searchParams.get("room") || "default").slice(0, 64);
    const uid = await getUserIdSoft(req);
    if (!Number.isFinite(Number(uid))) {
      return NextResponse.json({ room, messages: [] });
    }

    const prisma = await getPrisma();

    // 1) Thử DB trước
    if (prisma?.chatMessage) {
      try {
        const rows = await prisma.chatMessage.findMany({
          where: { userId: Number(uid), room },
          orderBy: { createdAt: "asc" },
          take: 200,
        });
        // Nếu DB có dữ liệu → trả luôn
        if (rows && rows.length) {
          return NextResponse.json({ room, messages: rows.map(mapRow) });
        }
      } catch (e: any) {
        // Nếu table chưa tồn tại → rơi xuống fallback
        if (e?.code !== "P2021") {
          // lỗi khác thì log rồi vẫn fallback
          console.warn("history DB error:", e?.code || e?.message);
        }
      }
    }

    // 2) Fallback in-memory (dev)
    const mem = (g.__chatMem[room] as MemMsg[] | undefined) ?? [];
    const filtered = mem.filter((m) => m.userId === Number(uid));
    return NextResponse.json({ room, messages: filtered });
  } catch (e: any) {
    console.error("GET /api/support/chat/history", e);
    return NextResponse.json({ room: "default", messages: [] });
  }
}
