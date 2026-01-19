// src/app/account/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function AccountPage() {
  // Bất cứ khi nào /account được mở → chuyển về Home + mở account overlay
  redirect("/?src=account");
}
