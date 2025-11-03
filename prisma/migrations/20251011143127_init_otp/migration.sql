-- CreateIndex
CREATE INDEX "OtpRequest_userId_purpose_used_createdAt_idx" ON "OtpRequest"("userId", "purpose", "used", "createdAt");

-- CreateIndex
CREATE INDEX "OtpRequest_email_idx" ON "OtpRequest"("email");
