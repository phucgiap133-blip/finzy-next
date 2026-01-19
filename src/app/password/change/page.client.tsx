"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ChangePasswordClient() {
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [nextPwd, setNextPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  // --- strength rules
  const rules = useMemo(() => {
    const len = nextPwd.length >= 8;
    const upper = /[A-Z]/.test(nextPwd);
    const digit = /\d/.test(nextPwd);
    const special = /[^A-Za-z0-9]/.test(nextPwd);
    const passed = [len, upper, digit, special].filter(Boolean).length;

    let label = "Yếu";
    let color = "#EB5757";
    if (passed >= 2) {
      label = "Vừa";
      color = "#F2C94C";
    }
    if (passed >= 4) {
      label = "Mạnh";
      color = "#27AE60";
    }

    return { len, upper, digit, special, passed, label, color };
  }, [nextPwd]);

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

  const onCancel = () => {
    router.back();
  };

    return (
    <>
<PageContainer className="flex justify-center">
<div className="w-full max-w-[420px] px-[12px] pb-12">
    {/* HEADER không cố định - giống withdraw-history */}
    <header className="pt-safe-top h-[56px] flex items-center justify-between relative">
      <button
        type="button"
        onClick={() => window.history.back()}
        aria-label="Quay lại"
        className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5 transition"
      >
        <span className="text-[20px] leading-none text-[#111827]">‹</span>
      </button>

      <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#111827] pointer-events-none">
        Đổi mật khẩu
      </h1>

      <div className="w-11 h-11" />
    </header>
{/* BODY */}
<div
  className="
    mt-6
    rounded-[20px]
    bg-[#FAFAFA]
    px-3   /* 12px */
    py-5
  "
>


  {/* INPUTS */}
  <div className="space-y-4">
    {/* Mật khẩu hiện tại */}
    <div>
      <div className="text-body font-medium mb-2">
        Mật khẩu hiện tại
      </div>
      <div className="relative">
      <input
  type={showCurrent ? "text" : "password"}
  className="w-full h-12 rounded-[12px] bg-white px-4 pr-16 border border-transparent focus:border-[#F2994A]"
  value={current}
  onChange={(e) => setCurrent(e.target.value)}
  placeholder="Nhập mật khẩu hiện tại"
/>

        <button
          type="button"
          onClick={() => setShowCurrent(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
        >
          {showCurrent ? "Ẩn" : "Hiện"}
        </button>
      </div>
    </div>

    {/* Mật khẩu mới */}
    <div>
      <div className="text-body font-medium mb-2">
        Mật khẩu mới
      </div>
      <div className="relative">
       <input
  type={showNext ? "text" : "password"}
  className="w-full h-12 rounded-[12px] bg-white px-4 pr-16 border border-transparent focus:border-[#F2994A]"
  value={nextPwd}
  onChange={(e) => setNextPwd(e.target.value)}
  placeholder="Nhập mật khẩu mới"
/>

        <button
          type="button"
          onClick={() => setShowNext(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
        >
          {showNext ? "Ẩn" : "Hiện"}
        </button>
      </div>
    </div>
  </div>
{/* STRENGTH TEXT */}
<p className="mt-3 text-[14px] text-[#EB5757]">
  {rules.passed < 2
    ? "Mật khẩu chưa đủ mạnh"
    : "Mật khẩu ổn"}
  {rules.passed < 2 && (
    <span className="text-text-muted">
      {" "}· Thêm số hoặc ký tự đặc biệt
    </span>
  )}
</p>


{/* ACTIONS */}
<div className="mt-6 flex gap-3">
  <button
    type="button"
    onClick={onCancel}
    className="flex-1 h-12 rounded-[16px] border bg-white"
  >
    Hủy
  </button>

  <Button
    onClick={submit}
    disabled={rules.passed < 2 || busy}
    className="flex-1 h-12 rounded-[16px]"
    style={{
      backgroundColor: "#F2994A",
      opacity: rules.passed < 2 ? 0.6 : 1,
    }}
  >
    Cập nhật
  </Button>
</div>
{/* FEEDBACK + FORGOT */}
<div className="mt-6 space-y-3 text-center">
  {err && (
    <p className="text-red-600 text-caption">
      {err}
    </p>
  )}

  {msg && (
    <p className="text-green-600 text-caption">
      {msg}
    </p>
  )}

  <Link
    href="/password/forgot"
    className="text-[14px] text-text-muted hover:underline"
  >
    Quên mật khẩu?
  </Link>
</div>
</div>   {/* BODY card */}

</div>   {/* max-w container */}

</PageContainer>
</>
);

} 