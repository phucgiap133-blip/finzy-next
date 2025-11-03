import { PrismaClient } from "@prisma/client";
// XÓA CommissionStatus, WithdrawalStatus khỏi import vì chúng không được export

const prisma = new PrismaClient();

async function upsertUser(email: string, password: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password },
  });

  // Wallet (Đã loại bỏ 'currency' theo lỗi trước đó)
  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: { balance: 37000 }, 
    create: { userId: user.id, balance: 37000 }, 
  });

  // Xoá dữ liệu con cũ để tránh trùng
  await prisma.walletHistory.deleteMany({ where: { userId: user.id } });
  await prisma.bankAccount.deleteMany({ where: { userId: user.id } });
  await prisma.commission.deleteMany({ where: { userId: user.id } });
  await prisma.withdrawal.deleteMany({ where: { userId: user.id } });

  // Seed lại dữ liệu mẫu
  await prisma.walletHistory.createMany({
    data: [
      { text: "Đã cộng +10.000đ", sub: "cho bạn và người B", userId: user.id },
      { text: "Đã cộng +20.000đ", sub: "tặng thưởng", userId: user.id },
      { text: "Đã cộng +7.000đ",  sub: "bonus",        userId: user.id },
    ],
  });

  await prisma.bankAccount.createMany({
    data: [
      {
        bankName: "MB Bank",
        accountNumber: "990012345678", 
        accountName: "Nguyễn Văn A", 
        // SỬA: Thay 'selected' bằng 'isDefault'
        isDefault: true, 
        userId: user.id,
      },
      {
        bankName: "MoMo",
        accountNumber: "098765432101", 
        accountName: "Nguyễn Văn A", 
        isDefault: false, 
        userId: user.id,
      },
    ],
  });

  await prisma.commission.createMany({
    data: [
      { 
        amount: 10000, 
        // SỬA: Dùng chuỗi cứng (string literal)
        status: "SUCCESS", 
        userId: user.id 
      },
      { 
        amount: 10000, 
        // SỬA: Dùng chuỗi cứng (string literal)
        status: "PENDING", 
        userId: user.id 
      },
    ],
  });

  await prisma.withdrawal.createMany({
    data: [
      {
        amount: 100000,
        fee: 0,
        // SỬA: Dùng chuỗi cứng (string literal)
        status: "SUCCESS", 
        method: "MoMo *****5678", 
        userId: user.id,
      },
    ],
  });

  console.log(`✅ Seeded user: ${email}`);
}

async function main() {
  const argEmail = process.argv.find((a) => a.includes("@"));
  if (argEmail) {
    await upsertUser(argEmail, "123456");
  } else {
    await upsertUser("privacy@gmail.com", "123456");
    await upsertUser("pgiap316@gmail.com", "123456");
  }
}

main()
  .then(() => console.log("✅ Seeding hoàn tất!"))
  .catch((e) => {
    console.error("❌ Lỗi khi seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });