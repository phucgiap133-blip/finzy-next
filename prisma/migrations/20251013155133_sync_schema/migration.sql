/*
  Warnings:

  - A unique constraint covering the columns `[userId,bankName,last4]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_userId_bankName_last4_key" ON "BankAccount"("userId", "bankName", "last4");
