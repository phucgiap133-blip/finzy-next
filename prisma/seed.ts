import { prisma } from "../src/server/prisma";
import { Prisma } from "@prisma/client";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "privacy@gmail.com" },
    update: {},
    create: {
      email: "privacy@gmail.com",
      password: "123456", // đổi sau
      role: "ADMIN",
    },
  });
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, balance: new Prisma.Decimal(100000) },
  });
  console.log("✅ Seeded admin:", admin.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
