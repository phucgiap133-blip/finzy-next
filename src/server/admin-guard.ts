import { NextResponse } from "next/server";
import { getUserRole } from "@/server/authz";

export async function adminAuthGuard(req: Request): Promise<NextResponse | null> {
  const role = await getUserRole(req);
  if (role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Không có quyền truy cập. Chỉ dành cho Admin." },
      { status: 403 }
    );
  }
  return null;
}
