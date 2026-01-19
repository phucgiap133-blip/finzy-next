"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

 const submit = async () => {
  setErr(null);
  setMsg(null);

  if (!email) {
    setErr("Vui lòng nhập email.");
    return;
  }

  try {
    setBusy(true);

    // DEMO – chưa có backend
    await new Promise((r) => setTimeout(r, 1000));

    setMsg("Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn.");
  } catch {
    setErr("Không thể gửi email.");
  } finally {
    setBusy(false);
  }
};


  return (
    <PageContainer className="flex justify-center">
      <div className="w-full max-w-[420px] px-[12px] pb-12">
        {/* HEADER – giống trang đổi mật khẩu */}
        <header className="pt-safe-top h-[56px] flex items-center justify-between relative">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Quay lại"
            className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5 transition"
          >
            <span className="text-[20px] leading-none text-[#111827]">‹</span>
          </button>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#111827] pointer-events-none">
            Quên mật khẩu
          </h1>

          <div className="w-11 h-11" />
        </header>

        {/* CARD NHẸ – ĐỒNG BỘ CHANGE PASSWORD */}
        <div className="mt-6 rounded-[20px] bg-[#FAFAFA] px-4 py-5 space-y-6">
          {/* Mô tả */}
          <p className="text-[14px] text-text-muted leading-[1.6]">
            Nhập email bạn đã đăng ký.
            <br />
            Chúng tôi sẽ gửi link để bạn đặt lại mật khẩu.
          </p>

          {/* INPUT EMAIL */}
          <div>
            <div className="text-body font-medium mb-2">
              Email
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              className="
                w-full h-12
                rounded-[12px]
                bg-white
                px-4
                text-body
                outline-none
                border border-transparent
                focus:border-[#F2994A]
              "
            />
          </div>

          {/* ACTION */}
       <Button
  className="w-full h-12 rounded-[16px]"
  style={{
    backgroundColor: "#F2994A",

  }}
>
  {busy ? "Đang gửi…" : "Gửi link đặt lại mật khẩu"}
</Button>

          {/* MESSAGE */}
          {err && (
            <p className="text-center text-red-600 text-caption">
              {err}
            </p>
          )}
          {msg && (
            <p className="text-center text-green-600 text-caption">
              {msg}
            </p>
          )}

          
        </div>
      </div>
    </PageContainer>
  );
}
