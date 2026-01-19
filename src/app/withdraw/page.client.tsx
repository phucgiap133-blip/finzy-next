
// src/app/withdraw/page.tsx
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { api } from "@/lib/api";
import { APP } from "@/config/app";



// 👉 DEMO MODE: true = cho rút dù chưa liên kết ngân hàng
const DEMO_MODE = true; // đổi false khi lên production



const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const formatVND = (v: string | number) => {
  const n = typeof v === "string" ? Number(onlyDigits(v)) : v || 0;
  return n.toLocaleString("vi-VN");
};

type BankInfo = {
  id: string;
  bankName: string;
  last4: string;
  holder: string;
  isLinked?: boolean; // ✅ THÊM
} | null;


export default function WithdrawClient() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const router = useRouter();

  const [balance, setBalance] = useState<number>(0);
  const [bank, setBank] = useState<BankInfo>(null);

  const [amountRaw, setAmountRaw] = useState<string>("");
  const amount = Number(onlyDigits(amountRaw) || 0);
  const amountDisplay = useMemo(
    () => formatVND(amountRaw),
    [amountRaw]
  );

  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState("");
  const [picking, setPicking] = useState(false);
  // ===== DEMO CONFIRM FLOW =====
const [showConfirm, setShowConfirm] = useState(false);
const [confirmChecked, setConfirmChecked] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);


  useEffect(() => {
    (async () => {
      try {
        const { wallet } = await api.wallet.get();
        setBalance(wallet.balance);

        const banks = await api.banks.get();
        const selected =
          banks.accounts.find((a: any) => a.id === banks.selectedId) ||
          banks.accounts[0] ||
          null;
       if (selected) {
  setBank({
    ...selected,
    isLinked: !!banks.selectedId, // có selectedId mới là bank thật
  });
}

      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const dynamicSuggestions = useMemo(() => {
    const n = Number(onlyDigits(amountRaw)) || 0;
    if (!n) return [50_000, 100_000, 200_000];
    const bases = [10_000, 100_000, 1_000_000];
    return bases
      .map((f) => n * f)
      .filter(
        (v) =>
          v >= APP.minWithdraw && v <= APP.maxWithdrawDaily
      )
      .slice(0, 3);
  }, [amountRaw]);

  const isInvalid = useMemo(() => {
    if (!bank) return true;
    if (amount <= 0) return true;
    if (amount < APP.minWithdraw) return true;
    if (amount > APP.maxWithdrawDaily) return true;
    if (amount % APP.withdrawStep !== 0) return true;
    return false;
  }, [bank, amount]);

  const normalizeOnBlur = useCallback(() => {
    if (picking) return;
    let n = Number(onlyDigits(amountRaw));
    if (!n) {
      setAmountRaw("");
      return;
    }
    const step = APP.withdrawStep;
    n = Math.round(n / step) * step;
    n = Math.max(
      APP.minWithdraw,
      Math.min(APP.maxWithdrawDaily, n)
    );
    setAmountRaw(String(n));
  }, [amountRaw, picking]);

  const setQuick = (v: number) => {
    if (v < APP.minWithdraw || v > APP.maxWithdrawDaily) return;
    const clamped = Math.max(
      APP.minWithdraw,
      Math.min(APP.maxWithdrawDaily, v)
    );
    setAmountRaw(String(clamped));
    setMsg("");
  };

const submit = useCallback(async () => {
 setSubmitted(true);

// ❗ CHỈ CHẶN KHI KHÔNG PHẢI DEMO
if (!DEMO_MODE && (!bank || !bank.isLinked)) {
  setMsg("Vui lòng liên kết ngân hàng trước khi rút tiền.");
  return;
}

// 👉 DEMO MODE: giả lập rút thành công
if (DEMO_MODE) {
  setBusy(true);
  setTimeout(() => {
    setMsg("Rút tiền thành công 🎉 (DEMO)");
    setBalance((b) => Math.max(0, b - amount));
    setAmountRaw("");
    setBusy(false);
  }, 800);
  return;
}




    if (amount <= 0)
      return setMsg("Nhập số tiền hợp lệ.");
    if (amount < APP.minWithdraw)
      return setMsg(
        `Tối thiểu ${APP.minWithdraw.toLocaleString(
          "vi-VN"
        )}đ.`
      );
    if (amount > APP.maxWithdrawDaily)
      return setMsg(
        `Tối đa ${APP.maxWithdrawDaily.toLocaleString(
          "vi-VN"
        )}đ/ngày.`
      );
    if (amount % APP.withdrawStep !== 0)
      return setMsg(
        `Số tiền phải là bội số ${APP.withdrawStep.toLocaleString(
          "vi-VN"
        )}đ.`
      );

    setBusy(true);
    setMsg("");

    try {
      await api.withdraw.create({
        amount,
        methodId: bank?.id || "default",
      });
      setMsg("Đã tạo lệnh rút thành công.");
      setBalance((b) => Math.max(0, b - amount));
      setAmountRaw("");
    } catch (err) {
      setMsg(
        err instanceof Error ? err.message : "Lỗi rút tiền"
      );
    } finally {
      setBusy(false);
    }
  }, [bank, amount]);

  const handleBack = () => {
    if (from === "home") {
      router.push("/");
    } else {
      router.push("/account");
    }
  };
const bankError = useMemo(() => {
  if (!bank) return null; // chưa load xong
  if (!bank.isLinked) return "Chưa liên kết ngân hàng.";
  return null;
}, [bank]);


// ❌ BỎ dòng này
// if (!bank) return "Chưa liên kết ngân hàng.";

const amountError = useMemo(() => {
  if (!amountRaw) return null;
  if (amount < APP.minWithdraw)
    return `Tối thiểu ${APP.minWithdraw.toLocaleString("vi-VN")}đ`;
  if (amount > APP.maxWithdrawDaily)
    return `Tối đa ${APP.maxWithdrawDaily.toLocaleString("vi-VN")}đ/ngày`;
  if (amount % APP.withdrawStep !== 0)
    return `Số tiền phải là bội số ${APP.withdrawStep.toLocaleString("vi-VN")}đ`;
  return null;
}, [amountRaw, amount]);



 return (
  <>

    <PageContainer
      id="app-container"
      className="flex justify-center"
    >
      {/* khung max-width + padding giống Trang chủ */}
      <div className="w-full max-w-[420px] pb-10 px-[12px]">
        {/* HEADER KHÔNG CỐ ĐỊNH – giống Trang chủ */}
        <header
          className="
            pt-safe-top
            h-[56px]
            flex items-center justify-between
          "
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="Quay lại"
            className="w-11 h-11 rounded-full grid place-items-center text-[#111827] hover:bg-black/5"
          >
            <span className="text-[20px] leading-none">
              ‹
            </span>
          </button>

          <h1 className="text-[18px] leading-[24px] font-semibold tracking-[0.01em]">
            Rút tiền
          </h1>

          <div className="w-11 h-11" />
        </header>

        {/* CARD SỐ DƯ – cách header 24px (mt-6) */}
        <div
          className="
            mt-6
            bg-[#FAFAFA]
            rounded-[20px]
            border border-[#F0F0F0]
            shadow-[0_2px_6px_rgba(0,0,0,0.04)]
            p-6 md:p-8
            text-center
          "
        >
         <div
              id="income-title"
              className="
                uppercase tracking-[0.08em]
                text-[14px] font-semibold text-[#4B4B4B]
              "
            >
            Số dư khả dụng
          </div>

           <div className="mt-2 text-[20px] leading-[24px] font-bold text-[#222222]">
              37.000đ
          </div>

         <div className="mt-1 text-[14px] leading-[20px] text-[#7A7A7A]">
              Rút tối thiểu 
            {APP.minWithdraw.toLocaleString("vi-VN")}đ
          </div>
        </div>
{/* 2 PILL LỊCH SỬ – shortcut điều hướng */}
<div className="grid grid-cols-2 gap-sm mt-3">
  <Link
    href="/my-withdrawals/rut"
    className="
      text-center px-md py-sm
      bg-white
      border border-[#E5E7EB]
      rounded-full
      text-body font-medium
      text-[#6B7280]
    "
  >
    Lịch sử rút
  </Link>

<Link
  href="/my-withdrawals/hoahong"
 
  className="
    text-center px-md py-sm
    bg-white
    border border-[#E5E7EB]
    rounded-full
    text-body font-medium
    text-[#6B7280]
  "
>
  Lịch sử hoa hồng
</Link>

</div>


        {/* BANK CARD – cách 2 pill 24px (mt-6) */}
        <Link
          href="/banks"
          className="
            mt-6 block rounded-[14px] bg-white px-md py-sm
            border border-border shadow-sm hover:shadow-md transition
          "
        >
          <div className="flex items-center gap-sm">
            <div className="h-10 w-10 rounded-[10px] bg-gradient-to-br from-[#ff4b5c] to-[#4a67ff]" />

            <div className="flex-1">
              {bank ? (
                <>
                  <div className="text-[15px] font-semibold text-[#111827] leading-[20px]">
                    {bank.bankName} *****{bank.last4}
                  </div>
                  <div className="mt-[2px] text-[14px] text-[#6B7280] leading-[18px]">
                    {bank.holder}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[15px] font-semibold text-[#111827] leading-[20px]">
                    MB Bank *****12345
                  </div>
                  <div className="mt-[2px] text-[14px] text-[#6B7280] leading-[18px]">
                    Nguyễn Văn A
                  </div>
                </>
              )}
            </div>

            <span className="text-lg text-text-muted">
              ›
            </span>
          </div>
        </Link>
       {submitted && bankError && (
  <div className="mt-2 flex items-start gap-2 text-[13px]">
    <span className="mt-[2px] inline-flex w-4 h-4 shrink-0 items-center justify-center rounded-full bg-[#EB5757] text-white text-[11px] font-bold">
      !
    </span>
    <span className="text-[#6B7280]">
      {bankError}
    </span>
  </div>
)}



        {/* VÙNG SỐ TIỀN – cách bank card 24px (mt-6) */}
        <div className="mt-6">
          <div className="flex items-baseline gap-2 text-h3 font-bold">
            <span>đ</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={(e) => {
                setAmountRaw(onlyDigits(e.target.value));
                setMsg("");
              }}
              onBlur={normalizeOnBlur}
              placeholder="0"
              className="flex-1 bg-transparent outline-none border-none text-h3"
            />
          </div>
          {amountError && (
  <div className="mt-2 flex items-start gap-2 text-[13px]">
    <span className="mt-[2px] inline-flex w-4 h-4 shrink-0 items-center justify-center rounded-full bg-[#EB5757] text-white text-[11px] font-bold">
      !
    </span>
    <span className="text-[#6B7280]">
      {amountError}
    </span>
  </div>
)}


          {/* 3 nút + Tối đa: full chiều ngang, gap 12px */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            {dynamicSuggestions.map((amt) => (
              <button
                key={amt}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setPicking(true);
                  setQuick(amt);
                  setTimeout(
                    () => setPicking(false),
                    0
                  );
                }}
                onClick={(e) => e.preventDefault()}
                className="
                  h-[40px]
                  rounded-[12px]
                  bg-[#F2F2F2]
                  text-[14px]
                  font-medium
                  text-[#111827]
                  flex items-center justify-center
                "
              >
                {amt.toLocaleString("vi-VN")}đ
              </button>
            ))}

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setPicking(true);
                setQuick(APP.maxWithdrawDaily);
                setTimeout(
                  () => setPicking(false),
                  0
                );
              }}
              onClick={(e) => e.preventDefault()}
              className="
                h-[40px]
                rounded-[12px]
                bg-[#FFF3E5]
                text-[14px]
                font-medium
                text-[#E67E22]
                flex items-center justify-center
              "
            >
              Tối đa
            </button>
          </div>
        </div>

        {/* NÚT RÚT TIỀN – cách hàng nút nhanh 24px (mt-6) */}
        <div className="mt-6">
        <Button
  disabled={busy}
 onClick={() => {
  setSubmitted(true);
  if (amount <= 0) return;
  setShowConfirm(true);
}}

  className="
    w-full
    h-[48px]
    rounded-[12px]
    text-btn
    flex items-center justify-center
  "
>
  {busy ? "Đang xử lý…" : "Rút tiền"}
</Button>


          {msg && (
            <p className="mt-2 text-caption text-center text-text-muted">
              {msg}
            </p>
          )}
        </div>

        {/* Ghi chú footer */}
        <ul className="mt-4 text-caption text-text-muted list-disc list-inside space-y-xs">
          <li>Phí dịch vụ: 0 đ</li>
          <li>
            Giới hạn: tối thiểu{" "}
            {APP.minWithdraw.toLocaleString("vi-VN")}đ,
            tối đa{" "}
            {APP.maxWithdrawDaily.toLocaleString("vi-VN")}đ/ngày
          </li>
          <li>
            Bội số{" "}
            {APP.withdrawStep.toLocaleString("vi-VN")}đ
          </li>
        </ul>
      </div>
   
    </PageContainer>

   {showConfirm && (
  <>
    {/* overlay mờ */}
    <div
      onClick={() => setShowConfirm(false)}
      className="fixed inset-0 z-[90] bg-black/40"
    />

    {/* card giữa màn hình */}
    <div
      className="
        fixed left-1/2 top-1/2 z-[91]
        w-[calc(100%-24px)] max-w-[420px]
        -translate-x-1/2 -translate-y-1/2
        rounded-[24px] bg-white
        shadow-[0_12px_32px_rgba(0,0,0,0.16)]
        px-xl py-[24px]
      "
    >
      {/* Title */}
      <div className="text-center">
        <div className="text-[20px] font-bold">
          Xác nhận rút tiền
        </div>

        {/* amount – cách title 12px */}
        <div className="mt-3 text-[24px] font-semibold text-[#111]">
          {amount.toLocaleString("vi-VN")}đ
        </div>
      </div>

      {/* checkbox – cách amount 16px */}
      <button
        type="button"
        onClick={() => setConfirmChecked((v) => !v)}
        className="mt-4 flex items-center gap-sm mx-auto text-body text-[#4F4F4F]"
      >
        <span
          className={`w-6 h-6 rounded-[8px] border border-[#E0E0E0] grid place-items-center ${
            confirmChecked ? "bg-[#F2994A]" : "bg-[#F2F2F2]"
          }`}
        >
          {confirmChecked && (
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path
                d="M1 5.5 4.5 9 13 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span>Tôi xác nhận rút số tiền này</span>
      </button>

      {/* buttons – cách checkbox 24px */}
      <div className="mt-6 flex gap-sm">
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="flex-1 h-12 rounded-[16px] border border-[#E0E0E0] bg-white text-body"
        >
          Hủy
        </button>

        <Button
          type="button"
          disabled={!confirmChecked}
          onClick={() => {
            setShowConfirm(false);
            setShowSuccess(true);
            setConfirmChecked(false);
            setAmountRaw("");

            setTimeout(() => setShowSuccess(false), 3000);
          }}
          className={`flex-1 h-12 rounded-[16px] text-white text-body font-semibold ${
            !confirmChecked
              ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed"
              : "bg-[#F2994A] hover:opacity-90"
          }`}
        >
          Xác nhận rút
        </Button>
      </div>
    </div>
  </>
)}


 {/* TAG THÔNG BÁO – overlay, không đẩy layout */}
{showSuccess && (
  <div className="absolute right-[12px] top-[60px] z-20">
    <div
      className="
        flex items-center gap-2
        rounded-[12px]
        bg-[#FAFAFA]
        px-3 py-2
        shadow-[0_2px_6px_rgba(0,0,0,0.1)]
      "
    >
      <div className="h-6 w-6 rounded bg-green-500 text-white flex items-center justify-center text-[12px]">
        ✓
      </div>

      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-[#111111]">
          Rút tiền thành công
        </div>
        <div className="text-[12px] text-slate-500">
          +{amount.toLocaleString("vi-VN")}đ
        </div>
      </div>
    </div>
  </div>
)}

  </>
);
}
