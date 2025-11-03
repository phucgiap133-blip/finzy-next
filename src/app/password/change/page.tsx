"use client";

import Header from "../../../components/Header";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Link from "next/link";
import { useState } from "react";
import PageContainer from "../../../components/PageContainer";
import { api } from "@/lib/api";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [nextPwd, setNextPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setMsg(null);
    setErr(null);
    if (!current || !nextPwd) return setErr("Vui lòng nhập đầy đủ thông tin.");
    if (nextPwd.length < 6) return setErr("Mật khẩu mới phải từ 6 ký tự.");

    try {
      setBusy(true);
      await api.auth.password.change({ current, next: nextPwd });
      setMsg("Đổi mật khẩu thành công.");
      setCurrent("");
      setNextPwd("");
    } catch (e: any) {
      setErr(e?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header title="Đổi mật khẩu" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <div className="bg-bg-card rounded-[16px] p-lg border border-border shadow-sm">
          <div className="text-center mb-md">
            <div className="text-h5 font-bold">Đổi mật khẩu</div>
            <div className="text-caption text-text-muted">
              Bảo vệ tài khoản của bạn bằng mật khẩu mạnh.
            </div>
          </div>

          <div className="space-y-md">
            <Input
              label="Mật khẩu hiện tại"
              type="password"
              value={current}
              onChange={(e) => setCurrent((e.target as HTMLInputElement).value)}
            />
            <Input
              label="Mật khẩu mới"
              type="password"
              value={nextPwd}
              onChange={(e) => setNextPwd((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="mt-md">
            <Button disabled={busy} onClick={submit}>
              {busy ? "Đang cập nhật…" : "Cập nhật"}
            </Button>
          </div>

          {err && <div className="mt-sm text-caption text-red-600">{err}</div>}
          {msg && <div className="mt-sm text-caption text-green-600">{msg}</div>}

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
