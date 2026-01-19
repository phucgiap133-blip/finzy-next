import { NextResponse } from "next/server";
import { getUserId } from "@/server/authz";

export const dynamic = "force-dynamic";

// ===== in-memory fallback =====
type MemMsg = {
  id: string;
  userId: number;
  room: string;
  from: string;
  text: string;
  createdAt: string;
};

const g = globalThis as any;
g.__chatMem ??= {} as Record<string, MemMsg[]>; // { [room]: MemMsg[] }

function pushMem(room: string, m: Omit<MemMsg, "id" | "createdAt">): MemMsg {
  const arr: MemMsg[] = g.__chatMem[room] ?? (g.__chatMem[room] = []);
  const row: MemMsg = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...m,
  };
  arr.push(row);
  return row;
}

// KHỞI ĐỘNG LẠI HÀM getPrisma ĐỂ KHẮC PHỤC LỖI CACHE
async function getPrisma() {
  try {
    // Buộc import module, Node.js sẽ trả về instance Singleton đã được cache
    const mod = await import("@/server/prisma");
    console.log("[getPrisma] Import OK."); // Thêm log thành công
    return (mod as any).prisma;
  } catch (e: any) { // Cần bắt lỗi kiểu any
    // Chỉ cảnh báo nếu import lỗi (ví dụ: lỗi cấu hình TS)
    console.error("[getPrisma] CRITICAL error:", e?.message, e?.code); // Đổi thành console.error
  }
  // Trả về đối tượng rỗng để đảm bảo prisma?.chatMessage = false và chuyển sang fallback
  return { chatMessage: undefined }; 
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const uidQ = url.searchParams.get("uid");
    const uidAuth = await getUserId(req);
    const userId = Number(uidAuth ?? uidQ);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      room?: string;
      text?: string;
      from?: string; // "user" | "agent" | "system"
    };

    const room = (body.room || url.searchParams.get("room") || "default").slice(0, 64);
    const text = (body.text || "").toString().trim();
    const from = (body.from || "user").toString();

    if (!text) {
      return NextResponse.json({ error: "Thiếu text" }, { status: 400 });
    }

    const prisma = await getPrisma();
    
    // Hàm xử lý trả về thành công từ DB
    const returnSuccess = (row: any) => {
        const msg = {
            ...row,
            id: String(row.id),
            createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
        };
        return NextResponse.json({ ok: true, message: msg });
    }

    // Thử ghi DB trước
    if (prisma?.chatMessage) {
      try {
        const row = await prisma.chatMessage.create({
          data: { userId, room, from, text },
          select: { id: true, userId: true, room: true, from: true, text: true, createdAt: true },
        });
        
        return returnSuccess(row);
        
      } catch (e: any) {
        // === ĐÃ THÊM LOG LỖI QUAN TRỌNG TẠI ĐÂY ===
        console.error("[Chat API] DB error (initial):", e?.code, e?.message); 
        // === LOGIC AUTO-HEALING VÀ FALLBACK MỚI (CHỐNG P2003) ===
        // 1. Nếu lỗi là Khóa ngoại (P2003) VÀ đang ở Dev
        if (process.env.NODE_ENV !== "production" && e?.code === "P2003") {
            try {
                // TẠO INSTANCE PRISMA MỚI ĐỂ ĐẢM BẢO KẾT NỐI SẠCH
                const freshPrisma = await getPrisma();
                if (!freshPrisma?.user) throw new Error("Fresh Prisma Client not available for Auto-Healing");

                // Tự động tạo user bị thiếu (VÁ MỀM)
                await freshPrisma.user.upsert({
                    where: { id: userId },
                    update: {},
                    create: { id: userId, email: `dev${userId}@local`, password: "dev", role: "USER" },
                });
                console.log(`[Chat API] Auto-created missing user ID: ${userId}`);

                // Thử ghi lại tin nhắn vào DB thật sau khi đã vá
                const row = await freshPrisma.chatMessage.create({
                    data: { userId, room, from, text },
                    select: { id: true, userId: true, room: true, from: true, text: true, createdAt: true },
                });
                return returnSuccess(row);

            } catch (e2: any) {
                // Nếu lần ghi lại vẫn lỗi, chuyển sang Fallback In-Memory
                console.error(`[Chat API] FK Auto-Heal failed for ID ${userId}:`, e2.message);
            }
        }
        
        // 2. Nếu lỗi là thiếu bảng (P2021) HOẶC lỗi khác không xử lý được
        if (e?.code !== "P2021" && e?.code !== "P2003") {
          return NextResponse.json({ error: e.message || "DB error", code: e.code }, { status: 500 });
        }
      }
    }

    // ===== Fallback in-memory (DÙNG KHI DB KHÔNG THỂ KẾT NỐI HOẶC CÓ LỖI P2021) =====
    const mem = pushMem(room, { userId, room, from, text });
    console.log(`[Chat API] Fallback to In-Memory for room: ${room}`);
    return NextResponse.json({ ok: true, message: mem });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}