"use client";

import Header from "../../../components/Header";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { useEffect, useRef, useState } from "react";
import PageContainer from "../../../components/PageContainer";
import { api } from "@/lib/api";

const RESEND_SECONDS = 60; // khớp OTP_RESEND_SECONDS

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const [busySend, setBusySend] = useState(false);
  const [busyVerify, setBusyVerify] = useState(false);
  const [busyReset, setBusyReset] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [otpOk, setOtpOk] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!countdown) return;
    timerRef.current = window.setInterval(
      () => setCountdown((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [countdown]);

  function setMsgOnly(s: string) {
    setErr(null);
    setMsg(s);
  }
  function setErrOnly(s: string) {
    setMsg(null);
    setErr(s);
  }

  async function sendOtp() {
    setErr(null);
    setMsg(null);
    setOtpOk(null);

    if (!email.trim()) return setErrOnly("Vui lòng nhập email.");
    setBusySend(true);
    try {
      await api.auth.password.forgotSendOtp({ email: email.trim() });
      setMsgOnly("Đã gửi OTP. Kiểm tra email.");
      setCountdown(RESEND_SECONDS);
    } catch (e: any) {
      setErrOnly(e?.message || "Không gửi được OTP.");
    } finally {
      setBusySend(false);
    }
  }

  async function verifyOtp() {
    setErr(null);
    setMsg(null);
    if (!email.trim() || otp.length !== 6) {
      setOtpOk(false);
      return setErrOnly("Nhập email và OTP 6 chữ số.");
    }
    setBusyVerify(true);
    try {
      // gọi đúng endpoint verify
      const res = await fetch("/api/auth/password/forgot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "OTP không hợp lệ");
      setOtpOk(true);
      setMsgOnly("OTP hợp lệ ✔");
    } catch (e: any) {
      setOtpOk(false);
      setErrOnly(e?.message || "OTP không hợp lệ");
    } finally {
      setBusyVerify(false);
    }
  }

  async function reset() {
    setErr(null);
    setMsg(null);

    if (!email.trim() || otp.length !== 6 || newPwd.length < 6) {
      return setErrOnly("Vui lòng nhập email, OTP 6 số và mật khẩu ≥ 6 ký tự.");
    }

    setBusyReset(true);
    try {
      await api.auth.password.resetWithOtp({
        email: email.trim(),
        otp,
        newPassword: newPwd,
      });
      setMsgOnly("Đặt lại mật khẩu thành công.");
      setOtp("");
      setNewPwd("");
      setOtpOk(null);
    } catch (e: any) {
      setErrOnly(e?.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      setBusyReset(false);
    }
  }

  return (
    <>
      <Header title="Quên mật khẩu" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <div className="bg-bg-card rounded-[16px] p-lg border border-border shadow-sm">
          <div className="mb-md">
            <div className="text-h5 font-bold">Quên mật khẩu</div>
            <div className="text-caption text-text-muted">
              Nhập email để nhận mã OTP
            </div>
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />

          <div className="flex items-end gap-sm">
            <div className="flex-1">
              <Input
                label="Mã OTP"
                type="text"
                value={otp}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                  setOtp(v);
                  setOtpOk(null);
                }}
                onBlur={() => otp.length === 6 && verifyOtp()}
                placeholder="______"
                className={
                  otpOk === true
                    ? "border-green-500"
                    : otpOk === false
                    ? "border-red-500"
                    : undefined
                }
              />
            </div>

            <button
              className="px-md py-sm rounded-control border border-border text-body disabled:opacity-50"
              onClick={sendOtp}
              disabled={busySend || !email.trim() || countdown > 0}
            >
              {busySend
                ? "Đang gửi…"
                : countdown > 0
                ? `Gửi lại (${countdown}s)`
                : "Gửi mã"}
            </button>
          </div>

          <Input
            label="Mật khẩu mới"
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd((e.target as HTMLInputElement).value)}
          />

          <div className="mt-md flex gap-sm">
            <Button disabled={busyVerify || otp.length !== 6} onClick={verifyOtp}>
              {busyVerify ? "Đang kiểm tra…" : "Xác minh OTP"}
            </Button>
            <Button disabled={busyReset} onClick={reset}>
              {busyReset ? "Đang cập nhật…" : "Cập nhật"}
            </Button>
          </div>

          {err && <div className="mt-sm text-caption text-red-600">{err}</div>}
          {msg && <div className="mt-sm text-caption text-green-600">{msg}</div>}
          <div className="text-caption text-text-muted">OTP có hiệu lực trong 5 phút.</div>
        </div>
      </PageContainer>
    </>
  );
}
