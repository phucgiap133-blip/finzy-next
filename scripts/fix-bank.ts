// scripts/fix-bank.ts
import { prisma } from "@/server/prisma";

async function main() {
  // 1) Xoá bản ghi rác id=0 (nếu có)
  await prisma.bankAccount.deleteMany({ where: { id: 0 } }).catch(() => {});

  // 2) Gán tất cả bank về userId=1 nếu lệch/null (tuỳ DB của bạn, userId có thể luôn not null)
  await prisma.bankAccount.updateMany({
    where: { OR: [{ userId: 1 }, { userId: { not: 1 } }] }, // nếu muốn ép tất cả về 1
    data: { userId: 1 },
  });

  // 3) Đảm bảo đúng 1 bank isDefault=true
  const all = await prisma.bankAccount.findMany({
    where: { userId: 1 },
    orderBy: { id: "asc" },
    select: { id: true, isDefault: true },
  });

  if (all.length === 0) return;

  // Tìm những bản ghi đang default
  const defaults = all.filter(b => b.isDefault);

  if (defaults.length === 0) {
    // Chưa có -> đặt bản ghi đầu tiên làm mặc định
    await prisma.bankAccount.update({
      where: { id: all[0].id },
      data: { isDefault: true },
    });
  } else if (defaults.length > 1) {
    // Có nhiều hơn 1 -> giữ lại cái đầu, tắt các cái còn lại
    const keepId = defaults[0].id;
    await prisma.bankAccount.updateMany({
      where: { userId: 1, id: { not: keepId } },
      data: { isDefault: false },
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
