// scripts/fix-bank.ts
// @ts-nocheck
// ⚠ Script cũ cho migration last4, hiện schema không còn field này.
// Nếu không dùng, có thể xoá file này khỏi repo.

import { prisma } from "../src/server/prisma";

async function main() {
  const all = await prisma.bankAccount.findMany();
  for (const b of all) {
    if ((b as any).last4 && (b as any).last4.length > 4) {
      await prisma.bankAccount.update({
        where: { id: b.id },
        data: { last4: (b as any).last4.slice(-4) },
      });
      console.log("Fixed last4 ->", b.id);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
