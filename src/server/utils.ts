// src/server/utils.ts
import { randomUUID } from "crypto";

/** Chuẩn hóa log */
export function logInfo(...args: any[]) {
  console.log(`[INFO]`, ...args);
}
export function logWarn(...args: any[]) {
  console.warn(`[WARN]`, ...args);
}
export function logError(...args: any[]) {
  console.error(`[ERROR]`, ...args);
}

/** Sinh UUID an toàn */
export const uuid = () => randomUUID();

/** Định dạng tiền VND */
export const formatVND = (n: number | string) => {
  const v = Number(n || 0);
  return v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

/** Chờ delay mili giây */
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Tính thời gian thực thi (debug) */
export async function measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const res = await fn();
    const dur = Date.now() - start;
    logInfo(`${label} completed in ${dur}ms`);
    return res;
  } catch (e) {
    const dur = Date.now() - start;
    logError(`${label} failed after ${dur}ms`, e);
    throw e;
  }
}
