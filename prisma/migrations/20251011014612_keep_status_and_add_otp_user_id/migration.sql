/*
  Warnings:

  - You are about to drop the column `attempts` on the `OtpRequest` table. All the data in the column will be lost.
  - You are about to drop the column `codeHash` on the `OtpRequest` table. All the data in the column will be lost.
  - You are about to drop the column `consumedAt` on the `OtpRequest` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `OtpRequest` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OtpRequest` table. All the data in the column will be lost.
  - Added the required column `code` to the `OtpRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expireAt` to the `OtpRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `OtpRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN "meta" JSONB;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OtpRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "OtpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OtpRequest" ("createdAt", "email", "id", "purpose") SELECT "createdAt", "email", "id", "purpose" FROM "OtpRequest";
DROP TABLE "OtpRequest";
ALTER TABLE "new_OtpRequest" RENAME TO "OtpRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
