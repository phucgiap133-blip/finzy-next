/*
  Warnings:

  - The primary key for the `BankAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountNumberMasked` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `last4` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `BankAccount` table. All the data in the column will be lost.
  - Added the required column `number` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "holder" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BankAccount" ("bankName", "createdAt", "holder", "id", "userId") SELECT "bankName", "createdAt", "holder", "id", "userId" FROM "BankAccount";
DROP TABLE "BankAccount";
ALTER TABLE "new_BankAccount" RENAME TO "BankAccount";
CREATE INDEX "BankAccount_userId_isDefault_idx" ON "BankAccount"("userId", "isDefault");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "selectedBankId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_selectedBankId_fkey" FOREIGN KEY ("selectedBankId") REFERENCES "BankAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("banned", "createdAt", "email", "id", "password", "role", "selectedBankId", "tokenVersion", "updatedAt") SELECT "banned", "createdAt", "email", "id", "password", "role", "selectedBankId", "tokenVersion", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_selectedBankId_key" ON "User"("selectedBankId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
