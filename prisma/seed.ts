import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

// Mật khẩu chung đã sửa: Mypassword123
const DEFAULT_PASSWORD = 'Mypassword123'; 

// Dữ liệu người dùng mẫu
const userData = [
  {
    email: 'pgiap316@gmail.com', // Tài khoản ADMIN của bạn
    role: UserRole.ADMIN,
    balance: 1500000.00, // 1.5 Triệu
    bankAccount: {
      bankName: 'VIETCOMBANK',
      accountName: 'NGUYEN VAN ADMIN',
      accountNumber: '0011000123001',
    }
  },
  {
    email: 'user@example.com', // Tài khoản USER kiểm thử
    role: UserRole.USER,
    balance: 500000.00, // 0.5 Triệu
    bankAccount: {
      bankName: 'TECHCOMBANK',
      accountName: 'TRAN VAN USER',
      accountNumber: '1903999999999',
    }
  },
];

async function main() {
  console.log('Bắt đầu Seeding Dữ liệu Toàn bộ Tài khoản...');
  // Mật khẩu được mã hóa sẽ là 'Mypassword123'
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10); 

  for (const userSeed of userData) {
    // 1. TẠO HOẶC TÌM USER
    let user;
    try {
      user = await prisma.user.upsert({
        where: { email: userSeed.email },
        update: {
          password: passwordHash, // CẬP NHẬT: Sử dụng passwordHash đã tạo từ Mypassword123
          role: userSeed.role,
        },
        create: {
          email: userSeed.email,
          password: passwordHash,
          role: userSeed.role,
        },
      });
      console.log(`✅ User ${user.role} (${user.email}) đã sẵn sàng. ID: ${user.id}`);
    } catch (e) {
      console.error(`❌ Lỗi khi tạo User ${userSeed.email}:`, e);
      continue;
    }

    // 2. TẠO HOẶC CẬP NHẬT WALLET
    try {
      const wallet = await prisma.wallet.upsert({
        where: { userId: user.id },
        update: { balance: userSeed.balance },
        create: {
          userId: user.id,
          balance: userSeed.balance,
          status: "ACTIVE",
        },
      });
      console.log(`   + Wallet đã sẵn sàng. Số dư: ${wallet.balance}`);
    } catch (e) {
      console.error(`   ❌ Lỗi khi tạo Wallet cho User ${user.email}:`, e);
    }

    // 3. TẠO HOẶC CẬP NHẬT BANK ACCOUNT
    try {
      const bankAccount = await prisma.bankAccount.upsert({
        where: {
          userId_accountNumber: {
            userId: user.id,
            accountNumber: userSeed.bankAccount.accountNumber,
          }
        },
        update: {},
        create: {
          userId: user.id,
          bankName: userSeed.bankAccount.bankName,
          accountName: userSeed.bankAccount.accountName,
          accountNumber: userSeed.bankAccount.accountNumber,
          isDefault: true,
        },
      });

      console.log(`   + BankAccount đã sẵn sàng. ID: ${bankAccount.id}, Số TK: ${bankAccount.accountNumber}`);
      
    } catch (e) {
      console.error(`   ❌ Lỗi khi tạo BankAccount cho User ${user.email}:`, e);
    }
    console.log('--------------------------------------------------');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Seeding TOÀN BỘ dữ liệu kiểm thử hoàn tất.');
    console.log('*** THÔNG TIN ĐĂNG NHẬP ĐÃ CẬP NHẬT ***');
    console.log(`ADMIN (Bạn): ${userData[0].email} / ${DEFAULT_PASSWORD}`);
    console.log(`USER: ${userData[1].email} / ${DEFAULT_PASSWORD}`);
  })
  .catch(async (e) => {
    console.error("Lỗi Seeding Chung:", e)
    await prisma.$disconnect()
    process.exit(1)
  })