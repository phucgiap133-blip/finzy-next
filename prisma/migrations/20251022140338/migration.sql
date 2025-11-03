/*
  Warnings:

  - You are about to drop the `IdempotencyKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `created_at` on the `withdrawals` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `withdrawals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,accountNumber]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `withdrawals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `withdrawals` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "IdempotencyKey_route_idx";

-- DropIndex
DROP INDEX "IdempotencyKey_key_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "IdempotencyKey";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("created_at", "email", "id", "password", "role", "updated_at") SELECT "created_at", "email", "id", "password", "role", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_withdrawals" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "fee" DECIMAL NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bank_account_id" INTEGER,
    "idempotencyKey" TEXT,
    "transactionId" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "withdrawals_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_withdrawals" ("amount", "bank_account_id", "fee", "id", "method", "status") SELECT "amount", "bank_account_id", "fee", "id", "method", "status" FROM "withdrawals";
DROP TABLE "withdrawals";
ALTER TABLE "new_withdrawals" RENAME TO "withdrawals";
CREATE UNIQUE INDEX "withdrawals_idempotencyKey_key" ON "withdrawals"("idempotencyKey");
CREATE UNIQUE INDEX "withdrawals_transactionId_key" ON "withdrawals"("transactionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_user_id_accountNumber_key" ON "bank_accounts"("user_id", "accountNumber");
