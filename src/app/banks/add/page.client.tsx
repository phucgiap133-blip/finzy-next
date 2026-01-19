// src/app/banks/add/_client.tsx
"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { api } from "@/lib/api";
import BankSelectOverlay, { BankOption } from "@/components/BankSelectOverlay";

export default function BankAddClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [bankName, setBankName] = useState("Vietcombank");
const [bankCode, setBankCode] = useState("VCB");
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorField, setErrorField] = useState<
  null | "bank" | "number" | "holder"
>(null);
const [errorMsg, setErrorMsg] = useState("");


  const [selectOpen, setSelectOpen] = useState(false);
  const [anchorTop, setAnchorTop] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const numberRef = useRef<HTMLInputElement>(null);
const holderRef = useRef<HTMLInputElement>(null);



  // để đo vị trí khối form -> cho overlay bám xuống đúng ô ngân hàng
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pre = sp.get("bank");
    if (pre) setBankName(pre);
  }, [sp]);

const submit = async (e: React.FormEvent) => {
  e.preventDefault();

  setErrorField(null);
  setErrorMsg("");

  if (!number) {
    setErrorField("number");
    setErrorMsg("Vui lòng nhập số tài khoản");
    numberRef.current?.focus();
    return;
  }

  if (!holder) {
    setErrorField("holder");
    setErrorMsg("Vui lòng nhập tên chủ tài khoản");
    holderRef.current?.focus();
    return;
  }
  

  setBusy(true);
  try {
await api.banks.link({
  bankName,
  number,
  holder,
});

    router.replace("/banks");
  } finally {
    setBusy(false);
  }
};



  const openSelectBank = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      // khoảng cách từ top card tới đầu ô ngân hàng (ước lượng theo spec)
      const offsetInsideCard = 72;
      setAnchorTop(rect.top + scrollY + offsetInsideCard);
    } else {
      setAnchorTop(null);
    }
    setSelectOpen(true);
  };

  const closeSelectBank = () => setSelectOpen(false);

 const handlePickBank = (b: BankOption) => {
  setBankName(b.name);   // chỉ hiển thị tên
  setBankCode(b.code);   // lưu mã riêng
  setSelectOpen(false);
};

  const handleBack = () => {
    router.push("/banks");
  };
  const normalizeHolderName = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase(); // in hoa
};

const FieldError = ({ show }: { show: boolean }) => {
  if (!show) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 rounded-[12px] bg-[#FFF3E8] px-3 py-2 text-[13px] text-[#9A3412]">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F2994A] text-[11px] font-bold text-white">
          !
        </span>
        <span>{errorMsg}</span>
      </div>
    </div>
  );
};


  return (
    <>
      <PageContainer id="app-container" className="flex justify-center">
        {/* Khung giống Trang chủ: max 420, cách màn 12px */}
        <div className="w-full max-w-[420px] pb-10 px-[12px]">
          {/* HEADER giống Home (không cố định) */}
          <header className="pt-safe-top h-[56px] flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Quay lại"
              className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#111827]"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <h1 className="text-[18px] leading-[24px] font-semibold text-[#111827]">
              Thêm ngân hàng
            </h1>

            {/* placeholder cho cân giữa title */}
            <div className="w-11 h-11" />
          </header>

          {/* CARD trắng – thu gọn lại, max 375, nằm giữa */}
          <div
            ref={cardRef}
            className="
              mt-6
              w-full max-w-[375px] mx-auto
              rounded-[20px] bg-white
              px-5 py-6
              shadow-[0_10px_26px_rgba(0,0,0,0.08)]
            "
          >
           <form onSubmit={submit} noValidate className="space-y-4">
         {notice && (
  <div className="mb-4">
    <div
      className="
        flex items-start gap-3
        rounded-[12px]
        bg-[#FFF4E5]
        px-4 py-3
        text-[14px] leading-[20px]
        text-[#7C2D12]
        shadow-[0_4px_12px_rgba(0,0,0,0.08)]
      "
    >
      {/* icon */}
      <span className="
        mt-[2px]
        inline-flex h-5 w-5
        shrink-0
        items-center justify-center
        rounded-full
        bg-[#F2994A]
        text-[12px]
        font-bold
        text-white
      ">
        !
      </span>

      {/* message */}
      <span className="font-medium">
        {notice}
      </span>
    </div>
  </div>
)}

            
{/* Ngân hàng */}
<div className="space-y-2">
  <div className="text-[14px] font-medium text-[#111827]">
    Ngân hàng
  </div>

  <FieldError show={errorField === "bank"} />

  <div className="flex items-center gap-2">
    {/* Ô hiển thị ngân hàng */}
    <div className="flex-1 flex items-center h-12 px-4 rounded-[12px] bg-[#F7F7F7]">
      <span
        className={
          bankName
            ? "text-[15px] text-[#111827]"
            : "text-[15px] text-[#BDBDBD]"
        }
      >
        {bankName || "Chọn ngân hàng"}
      </span>
    </div>

    {/* Icon mở select – NẰM NGOÀI Ô */}
    <button
      type="button"
      onClick={openSelectBank}
      aria-label="Chọn ngân hàng"
      className="
        h-12 w-12
        rounded-[999px]
        grid place-items-center
        bg-[#F7F7F7]
        hover:bg-black/5
        active:scale-95
      "
    >
      <svg width="20" height="20" viewBox="0 0 16 16">
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
</div>

{/* Số tài khoản */}
<div className="space-y-2">
  <div className="text-[14px] font-medium text-[#111827]">
    Số tài khoản
  </div>

  <FieldError show={errorField === "number"} />

  <input
    ref={numberRef}
    value={number}
    onChange={(e) => setNumber(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        holderRef.current?.focus();
      }
    }}
    placeholder="VD: 0123456789"
    inputMode="numeric"
    className="h-12 w-full rounded-[12px] bg-[#F7F7F7] px-4"
  />
</div>


              {/* Chủ tài khoản */}
              <div className="space-y-2">
                <div className="text-[14px] leading-[20px] font-medium text-[#111827]">
                  Chủ tài khoản
                </div>
                <FieldError show={errorField === "holder"} />
<input
  ref={holderRef}
  className="
    h-12 w-full
    rounded-[12px]
    border border-transparent
    bg-[#F7F7F7]
    px-4
    text-[15px] leading-[22px] text-[#111827]
    placeholder:text-[#C4C4C4]
    outline-none
    tracking-wide
  "
  value={holder}
  onChange={(e) => setHolder(normalizeHolderName(e.target.value))}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(e as any);
    }
  }}
  placeholder="VD: NGUYEN VAN A"
/>


              </div>

              {/* Nút Gửi – H48px, bo 12px */}
              <div className="pt-2">
  <Button
    disabled={busy}
    type="submit"
    size="lg"
    className="
      w-full
      h-[48px]
      rounded-[12px]
      text-[15px] leading-[22px]
      font-semibold
    "
  >
    Gửi
  </Button>
</div>


              {msg && (
                <div className="mt-1 text-caption" style={{ color: "#C62828" }}>
                  {msg}
                </div>
              )}
            </form>
          </div>
        </div>
      </PageContainer>

      {/* overlay chọn ngân hàng – bám đúng vị trí ô ngân hàng */}
      <BankSelectOverlay
        open={selectOpen}
        onClose={closeSelectBank}
        onPick={handlePickBank}
        anchorTop={anchorTop}
      />
    </>
  );
}