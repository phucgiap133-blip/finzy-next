/*
  Warnings:

  - You are about to drop the column `code` on the `OtpRequest` table. All the data in the column will be lost.
  - Added the required column `codeHash` to the `OtpRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OtpRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "OtpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OtpRequest" ("createdAt", "email", "expireAt", "id", "purpose", "used", "userId") SELECT "createdAt", "email", "expireAt", "id", "purpose", "used", "userId" FROM "OtpRequest";
DROP TABLE "OtpRequest";
ALTER TABLE "new_OtpRequest" RENAME TO "OtpRequest";
CREATE INDEX "idx_otp_user_created" ON "OtpRequest"("userId", "createdAt");
CREATE INDEX "idx_otp_lookup" ON "OtpRequest"("email", "used", "expireAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
