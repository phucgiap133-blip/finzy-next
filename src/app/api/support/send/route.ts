import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  room: z.string().min(1).max(100).default("default"),
  text: z.string().min(1).max(2000),
});

let _prisma: any;
async function prisma() {
  if (_prisma) return _prisma;
  const mod = await import("@/server/prisma");
  _prisma = (mod as any).prisma;
  return _prisma;
}

async function getUid(req: Request): Promise<number | null> {
  try {
    const mod = await import("@/server/authz");
    const got = await (mod as any).getUserId(req);
    if (Number.isFinite(+got)) return +got;
  } catch {}
  const url = new URL(req.url);
  const q = url.searchParams.get("uid");
  return Number.isFinite(+q!) ? +q! : null;
}

export async function POST(req: Request) {
  const tag = "[support/send]";
  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  try {
    console.log(`${tag} dev-friendly route ACTIVE`);

    const uid = await getUid(req);
    if (!uid) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    // body
    let parsed: z.infer<typeof BodySchema>;
    try {
      const raw = await req.json().catch(() => ({}));
      parsed = BodySchema.parse(raw);
    } catch (e: any) {
      if (debug) console.error(`${tag} ZodError:`, e?.issues || e?.message);
      return NextResponse.json(
        { error: "INVALID_BODY", detail: e?.issues || e?.message },
        { status: 400 },
      );
    }
    const { room, text } = parsed;

    const p = await prisma();

    // helpers
    const ensureUser = async () => {
      await p.user.upsert({
        where: { id: uid },
        update: {},
        create: { id: uid, email: `dev${uid}@local`, password: "dev", role: "USER" },
      });
      await p.wallet.upsert({
        where: { userId: uid },
        update: {},
        create: { userId: uid, balance: 0 },
      });
    };

    const needTablesHint =
      "Table missing. Run: taskkill /F /IM node.exe ; npx prisma db push --force-reset ; npx prisma generate ; npm run dev";

    // 1) ticket OPEN theo room
    let ticket: any = null;
    try {
      ticket = await p.supportTicket.findFirst({
        where: { userId: uid, room, status: "OPEN" },
        orderBy: { createdAt: "desc" },
      });
    } catch (e: any) {
      if (e?.code === "P2021") {
        if (debug) console.error(`${tag} P2021 at findFirst:`, e?.message);
        return NextResponse.json({ error: "MISSING_TABLE", code: "P2021", hint: needTablesHint }, { status: 500 });
      }
      throw e;
    }

    if (!ticket) {
      try {
        ticket = await p.supportTicket.create({
          data: { userId: uid, room, title: `Hỗ trợ: ${room}`, status: "OPEN" },
        });
      } catch (e: any) {
        if (e?.code === "P2003") {
          await ensureUser();
          ticket = await p.supportTicket.create({
            data: { userId: uid, room, title: `Hỗ trợ: ${room}`, status: "OPEN" },
          });
        } else if (e?.code === "P2021") {
          return NextResponse.json({ error: "MISSING_TABLE", code: "P2021", table: "SupportTicket", hint: needTablesHint }, { status: 500 });
        } else {
          throw e;
        }
      }
    }

    // === CHỈNH SỬA: Đảm bảo ticketId được truyền vào ChatMessage.create ===
    const chatMessageBaseData = { userId: uid, room, ticketId: ticket.id, from: "user", text };

    // 2) ghi message user
    let userMsg: any;
    try {
      userMsg = await p.chatMessage.create({
        data: chatMessageBaseData, // Dùng data mới có ticketId
        select: { id: true, createdAt: true },
      });
    } catch (e: any) {
      if (e?.code === "P2003") {
        await ensureUser();
        userMsg = await p.chatMessage.create({
          data: chatMessageBaseData, // Dùng data mới có ticketId
          select: { id: true, createdAt: true },
        });
      } else if (e?.code === "P2021") {
        return NextResponse.json({ error: "MISSING_TABLE", code: "P2021", table: "ChatMessage", hint: needTablesHint }, { status: 500 });
      } else {
        throw e;
      }
    }

    // 3) auto-reply
    const reply =
      /rút|withdraw/i.test(text)
        ? "Đã ghi nhận vấn đề rút tiền, mình đang theo dõi cho bạn."
        : /giới thiệu|referral/i.test(text)
        ? "Mình sẽ kiểm tra thưởng giới thiệu cho bạn."
        : "Cám ơn bạn! Yêu cầu đã được ghi nhận.";
    try {
      await p.chatMessage.create({
        data: { userId: uid, room, ticketId: ticket.id, from: "agent", text: reply }, // Thêm ticketId
      });
    } catch (e: any) {
      if (e?.code === "P2021") {
        return NextResponse.json({ error: "MISSING_TABLE", code: "P2021", table: "ChatMessage", hint: needTablesHint }, { status: 500 });
      }
      throw e;
    }
    // === KẾT THÚC CHỈNH SỬA ===

    // 4) cập nhật firstMessageId nếu cần
    if (!ticket.firstMessageId) {
      await p.supportTicket.update({
        where: { id: ticket.id },
        data: { firstMessageId: userMsg.id },
      }).catch((e: any) => {
        if (debug) console.error(`${tag} update firstMessageId failed:`, e?.message);
      });
    }

    // audit (best-effort)
    try {
      const mod = await import("@/server/audit");
      await (mod as any).logAudit?.(uid, "SUPPORT_SEND", `${room} #${ticket.id}`);
    } catch (e) {
      if (debug) console.warn(`${tag} audit skipped`);
    }

    return NextResponse.json({ ok: true, ticketId: ticket.id, messageId: userMsg.id, room });
  } catch (e: any) {
    if (debug) console.error("[support/send] Unhandled:", e);
    return NextResponse.json(
      { error: e?.message || "Internal error", code: e?.code || null },
      { status: 500 },
    );
  }
}