import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod"; // ⬅️ bỏ ZodSchema, không cần nữa


export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 400, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    (this as any).details = details;
  }
}

export function generate6Digits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
export async function hashOtp(code: string) { return bcrypt.hash(code, 10); }
export async function verifyOtp(code: string, hash: string) { return bcrypt.compare(code, hash); }
export function minutesFromNow(mins: number) { return new Date(Date.now() + mins * 60_000); }

export async function readJson<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}

/** ✅ Tự suy luận kiểu từ schema, không cần truyền generic khi gọi */
export async function readJsonAndValidate<S extends z.ZodTypeAny>(
  req: Request,
  schema: S
): Promise<z.infer<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError("Lỗi cú pháp JSON trong yêu cầu", 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues?.[0]?.message || "Dữ liệu yêu cầu không hợp lệ";
    throw new ApiError(msg, 400, result.error.issues);
  }
  return result.data;
}

export function assertEmail(v?: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error("Thiếu email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new Error("Email không hợp lệ");
  return s;
}
export function assertOtp(v?: string) {
  const s = String(v ?? "").trim();
  if (!/^\d{6}$/.test(s)) throw new Error("OTP phải là 6 chữ số");
  return s;
}
export function assertMinLen(v?: string, n = 6, label = "mật khẩu") {
  const s = String(v ?? "").trim();
  if (s.length < n) throw new Error(`${label} phải từ ${n} ký tự`);
  return s;
}

/** ✅ Không cần async */
export function assertPostOwnership(
  ownerId: number,
  authUserId: number,
  userRole: string,
) {
  if (userRole === "ADMIN") return;
  if (ownerId === authUserId) return;
  throw new ApiError("Bạn không có quyền thực hiện hành động này trên tài nguyên này", 403);
}

/** Chuẩn hoá lỗi API */
export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    // ✅ SỬA: Thêm ok: false vào phản hồi
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    const msg = err.issues?.[0]?.message ?? "Dữ liệu không hợp lệ";
    // ✅ SỬA: Thêm ok: false vào phản hồi
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
  console.error("[API] UNHANDLED ERROR:", err);
  // ✅ SỬA: Thêm ok: false vào phản hồi
  return NextResponse.json({ ok: false, error: "Lỗi hệ thống không xác định" }, { status: 500 });
}