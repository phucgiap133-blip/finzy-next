// src/server/auth.ts
import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export async function requireAdmin() {
  const token = cookies().get("accessToken")?.value;
  const payload = verifyAccessToken(token || "");
  if (!payload || payload.role !== "ADMIN") throw new Error("UNAUTHORIZED");
  return payload;
}
