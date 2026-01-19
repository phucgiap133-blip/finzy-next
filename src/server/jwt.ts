// src/server/jwt.ts
import jwt from "jsonwebtoken";

const ACCESS_SECRET  = process.env.ACCESS_SECRET  || "dev-access";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "dev-refresh";

type Payload = { userId: number; role: "USER"|"ADMIN"; tokenVersion?: number };

export function createAccessToken(p: Payload) {
  return jwt.sign(p, ACCESS_SECRET, { expiresIn: "15m" });
}
export function createRefreshToken(p: Payload) {
  return jwt.sign(p, REFRESH_SECRET, { expiresIn: "7d" });
}
export function verifyAccessToken(token: string) {
  try { return jwt.verify(token, ACCESS_SECRET) as Payload; } catch { return null; }
}
export function verifyRefreshToken(token: string) {
  try { return jwt.verify(token, REFRESH_SECRET) as Payload; } catch { return null; }
}
