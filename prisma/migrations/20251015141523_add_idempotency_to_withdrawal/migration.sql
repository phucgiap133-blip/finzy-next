/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Withdrawal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "Withdrawal" ADD COLUMN "processedAt" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_idempotencyKey_key" ON "Withdrawal"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");
