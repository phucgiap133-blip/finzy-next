// src/app/api/user/route.ts
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { db, jsonErr } from "@/app/api/_db";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return jsonErr("UNAUTHORIZED", 401);

  // Tìm trong mock DB (nếu có), không có thì trả session
  const found = db.auth.users.find((u) => u.email.toLowerCase() === session.user!.email!.toLowerCase());
  const role = (session.user as any).role || "USER";
  return Response.json({
    ok: true,
    user: {
      id: (session.user as any).id || session.user.email,
      email: session.user.email,
      role,
      existsInDb: !!found,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) return jsonErr("UNAUTHORIZED", 401);

  const body = await req.json().catch(() => ({}));
  const nextEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const nextRole = typeof body?.role === "string" ? body.role.toUpperCase() : undefined;

  // Chỉ admin mới được đổi role (mock)
  const currentRole = (session.user as any).role || "USER";
  if (nextRole && currentRole !== "ADMIN") return jsonErr("FORBIDDEN", 403);

  // Update email (mock in-memory)
  const idx = db.auth.users.findIndex((u) => u.email.toLowerCase() === session.user!.email!.toLowerCase());
  if (idx >= 0 && nextEmail) {
    db.auth.users[idx].email = nextEmail;
  }

  // Update role (chỉ mô phỏng: không thể thay đổi token hiện tại từ đây)
  // (Trong thực tế cần DB thật + refresh phiên)
  const updated = {
    id: (session.user as any).id || (nextEmail || session.user.email),
    email: nextEmail || session.user.email,
    role: nextRole || currentRole,
  };

  return Response.json({ ok: true, user: updated });
}
