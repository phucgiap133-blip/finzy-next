"use client";

import Header from "../../../components/Header";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { useState } from "react";
import PageContainer from "../../../components/PageContainer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  return (
    <>
      <Header title="Quên mật khẩu" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <div className="bg-bg-card rounded-[16px] p-lg border border-border shadow-sm">
          <div className="mb-md">
            <div className="text-h5 font-bold">Quên mật khẩu</div>
            <div className="text-caption text-text-muted">Nhập email để nhận mã OTP</div>
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />

          <div className="flex items-center gap-sm">
            <Input
              label="Mã OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp((e.target as HTMLInputElement).value)}
              placeholder="____"
            />
            <button className="px-md py-sm rounded-control border border-border text-body">Gửi mã</button>
          </div>

          <div className="text-caption text-text-muted">Mã có hiệu lực trong 5 phút</div>

          <div className="mt-md">
            <Button>Cập nhật</Button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
