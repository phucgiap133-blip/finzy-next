'use client';

import Header from "../../../components/Header";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Link from "next/link";
import { useState } from "react";
import PageContainer from "../../../components/PageContainer";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [nextPwd, setNextPwd] = useState("");

  return (
    <>
      <Header title="Đổi mật khẩu" showBack noLine backFallback="/" />

      <PageContainer className="space-y-md">
        <div className="bg-bg-card rounded-[16px] p-lg border border-border shadow-sm">
          <div className="text-center mb-md">
            <div className="text-h5 font-bold">Đổi mật khẩu</div>
            <div className="text-caption text-text-muted">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh.</div>
          </div>

          <div className="space-y-md">
            <Input label="Mật khẩu hiện tại" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            <Input label="Nhập lại mật khẩu mới" type="password" value={nextPwd} onChange={(e) => setNextPwd(e.target.value)} />
          </div>

          <div className="mt-md">
            <Button>Cập nhật</Button>
          </div>

          <div className="mt-sm text-center">
            <Link href="/password/forgot" className="text-body text-brand-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
