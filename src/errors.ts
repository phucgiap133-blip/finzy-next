// src/errors.ts
import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function jsonOk<T = any>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonErr(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) return jsonErr(err.message, err.status, err.details);
  console.error("[API] Unhandled:", err);
  return jsonErr("Lỗi hệ thống không xác định", 500);
}
