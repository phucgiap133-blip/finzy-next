// src/server/authz.ts
import { cookies, headers } from "next/headers";
import { verifyAccessToken } from "@/server/jwt";
import type { JwtPayload } from "@/server/jwt";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export type AuthResult =
  | { ok: true; payload: JwtPayload }
  | { ok: false; code: "UNAUTHORIZED" | "FORBIDDEN" };

  
// ---------------------------
// Helpers cho Route Handlers (có req)
// ---------------------------
function readBearer(req: Request) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}
function readCookie() {
  return (
    cookies().get("accessToken")?.value ||
    cookies().get("access_token")?.value ||
    null
  );
}

/** Lấy payload từ JWT (null nếu không hợp lệ/hết hạn) */
export async function getAuthPayload(req: Request): Promise<JwtPayload | null> {
  const token = readBearer(req) || readCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}

/** Trả userId hoặc null (Route Handler) */
export async function getUserId(req: Request): Promise<number | null> {
  const p = await getAuthPayload(req);
  return p?.userId ?? null;
}

/** Trả role hoặc null (Route Handler) */
export async function getUserRole(req: Request): Promise<UserRole | null> {
  const p = await getAuthPayload(req);
  return p?.role ?? null;
}

/** RBAC: yêu cầu 1 trong các vai trò (Route Handler) */
export async function requireRole(req: Request, allowed: UserRole[]): Promise<AuthResult> {
  const payload = await getAuthPayload(req);
  if (!payload) return { ok: false, code: "UNAUTHORIZED" };
  if (!allowed.includes(payload.role)) return { ok: false, code: "FORBIDDEN" };
  return { ok: true, payload };
}

/** Chỉ ADMIN (Route Handler) */
export async function requireAdmin(req: Request): Promise<AuthResult> {
  return requireRole(req, [UserRole.ADMIN]);
}

/** Type guards để TS narrow đúng kiểu */
export function isAuthErr(a: AuthResult): a is { ok: false; code: "UNAUTHORIZED" | "FORBIDDEN" } {
  return a.ok === false;
}
export function isAuthOk(a: AuthResult): a is { ok: true; payload: JwtPayload } {
  return a.ok === true;
}

// ---------------------------
// Helpers cho Server Components / Layout (không có req)
// ---------------------------
function readBearerFromHeaders() {
  const h = headers();
  const v = h.get("authorization") || h.get("Authorization") || "";
  const m = v.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

async function getPayloadFromContext(): Promise<JwtPayload | null> {
  const token = readBearerFromHeaders() || readCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}

/** Trả role hiện tại trong Server Component/Layout */
export async function getUserRoleFromContext(): Promise<UserRole | null> {
  const p = await getPayloadFromContext();
  return p?.role ?? null;
}

/** Dùng trong layout.tsx/page server-side: ném lỗi nếu không phải ADMIN */
export async function assertAdmin(): Promise<void> {
  const p = await getPayloadFromContext();
  if (!p) throw new Error("UNAUTHORIZED");
  if (p.role !== UserRole.ADMIN) throw new Error("FORBIDDEN");
}
