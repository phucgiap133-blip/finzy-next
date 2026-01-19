// src/lib/utils.ts
import bcrypt from "bcryptjs";

export function generate6Digits() {
  return String(Math.floor(100000 + Math.random()*900000));
}

export async function hashOtp(plain: string) {
  return bcrypt.hash(plain, 10);
}
export async function verifyOtp(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function minutesFromNow(min: number) {
  return new Date(Date.now() + min * 60 * 1000);
}

export function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}
