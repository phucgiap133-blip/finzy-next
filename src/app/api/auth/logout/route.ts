import { jsonOk } from "@/lib/route-helpers";

export async function POST() {
  const res = jsonOk({ ok: true });
  // Xóa cookies
  res.headers.append("Set-Cookie", "accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  res.headers.append("Set-Cookie", "refreshToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  return res;
}
