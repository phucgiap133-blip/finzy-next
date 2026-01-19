// scripts/seed.ts
import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const HASH_123456 = await bcrypt.hash("123456", 10);

  // === START: BỔ SUNG USER ID 1 CỐ ĐỊNH CHO MÔI TRƯỜNG DEV ===
  await prisma.user.upsert({
    where: { id: 1 }, 
    update: {},
    create: {
      id: 1, 
      email: "uid1@chat.local", 
      role: "USER", 
      password: HASH_123456,
      // Đảm bảo các trường bắt buộc khác (nếu có) cũng được điền
    },
  });
  // Tạo luôn ví rỗng cho User ID 1 (Tùy chọn, nếu cần cho logic khác)
  await prisma.wallet.upsert({
    where: { userId: 1 },
    update: {},
    create: { userId: 1, balance: 0, currency: "VND" },
  });
  // === END: BỔ SUNG ===


  await prisma.user.upsert({
    where: { email: "privacy@gmail.com" },
    create: { email: "privacy@gmail.com", role: "ADMIN", password: HASH_123456 },
    update: {},
  });

  const users = await prisma.user.findMany({ select: { id: true } });
  for (const u of users) {
    await prisma.wallet.upsert({
      where: { userId: u.id },
      create: { userId: u.id, balance: 0, currency: "VND" },
      update: {},
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Lỗi seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
