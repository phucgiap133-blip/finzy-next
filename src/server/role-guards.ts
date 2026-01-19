import { getUserRole } from "@/server/authz";

export async function requireAdminRole(req: Request) {
  const role = await getUserRole(req);
  if (role !== "ADMIN") throw new Error("FORBIDDEN");
}
export async function requireUserOrAdmin(req: Request) {
  const role = await getUserRole(req);
  if (!role) throw new Error("UNAUTHORIZED");
  return role;
}
