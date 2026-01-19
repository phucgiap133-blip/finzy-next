// src/lib/jwt.ts
import * as jwt from "jsonwebtoken";
import type { Role } from "@/server/authz";

export type Payload = {
  userId: number;
  role: Role;                // <- string union "USER" | "ADMIN"
  tokenVersion: number;
  email?: string;
};

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || "change_me_access_secret_at_least_32_chars";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "change_me_refresh_secret_at_least_32_chars";
const ACCESS_TTL  = "15m";
const REFRESH_TTL = "7d";

export function createAccessToken(p: Payload) {
  return jwt.sign(p, ACCESS_SECRET,  { expiresIn: ACCESS_TTL  });
}
export function createRefreshToken(p: Payload) {
  return jwt.sign(p, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccessToken(t: string): Payload | null {
  try { return jwt.verify(t, ACCESS_SECRET)  as Payload; } catch { return null; }
}
export function verifyRefreshToken(t: string): Payload | null {
  try { return jwt.verify(t, REFRESH_SECRET) as Payload; } catch { return null; }
}
