// src/server/authz.ts
import { cookies, headers } from "next/headers";

export type Role = "USER" | "ADMIN";

/** Lấy userId: demo lấy từ header `x-user-id`, fallback 1 */
export async function getUserId(req?: Request): Promise<number | null> {
  try {
    const h = req ? req.headers : (await headers());
    const raw = h.get("x-user-id") ?? cookies().get("uid")?.value;
    const n = raw ? Number(raw) : 1;
    return Number.isFinite(n) ? n : null;
  } catch {
    return 1; // dev fallback
  }
}

/** Suy luận role: header Authorization: Bearer <token> hoặc cookie `role`  */
export async function getUserRole(req?: Request): Promise<Role | null> {
  const h = req ? req.headers : (await headers());
  const auth = h.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieRole = cookies().get("role")?.value?.toUpperCase();

  if (token === "admin" || cookieRole === "ADMIN") return "ADMIN";
  if (token === "user" || cookieRole === "USER") return "USER";
  // dev mặc định coi là USER (đừng để trống nếu bạn muốn siết chặt)
  return "USER";
}

/** Bắt buộc ADMIN, ném lỗi nếu không phải */
export async function assertAdmin(req?: Request): Promise<void> {
  const role = await getUserRole(req);
  if (role !== "ADMIN") throw new Error("UNAUTHORIZED");
}
