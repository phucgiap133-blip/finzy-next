"use client";

import { useEffect, useMemo, useState } from "react";

export type BankOption = { code: string; name: string };

const BANKS: BankOption[] = [
  { code: "VCB", name: "Vietcombank" },
  { code: "CTG", name: "VietinBank" },
  { code: "BIDV", name: "BIDV" },
  { code: "AGR", name: "Agribank" },
  { code: "TCB", name: "Techcombank" },
  { code: "MBB", name: "MB Bank" },
  { code: "ACB", name: "ACB" },
  { code: "STB", name: "Sacombank" },
  { code: "VPB", name: "VPBank" },
  { code: "TPB", name: "TPBank" },
  { code: "VIB", name: "VIB" },
  { code: "SHB", name: "SHB" },
  { code: "OCB", name: "OCB" },
  { code: "EIB", name: "Eximbank" },
  { code: "SCB", name: "SCB" },
  { code: "SEAB", name: "SeaBank" },
  { code: "VCBI", name: "VietCapital Bank" },
  { code: "BAB", name: "BacABank" },
  { code: "NCB", name: "NCB" },
  { code: "PVCOM", name: "PVComBank" },
  { code: "KLB", name: "KienlongBank" },
  { code: "NAB", name: "Nam Á Bank" },
  { code: "MSB", name: "Maritime Bank" },
  { code: "ABB", name: "ABBANK" },
  { code: "HDB", name: "HDBank" },
];

const norm = (s: string) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (bank: BankOption) => void;
  /** top (px) để bám theo ô ngân hàng trong card thêm ngân hàng */
  anchorTop?: number | null;
  selectedCode?: string; // 👈 THÊM DÒNG NÀY
};

export default function BankSelectOverlay({
  open,
  onClose,
  onPick,
  anchorTop,
  selectedCode, // 👈 THÊM
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return BANKS;
    return BANKS.filter(
      (b) => norm(b.name).includes(q) || norm(b.code).includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const top = anchorTop ?? 80; // fallback nếu chưa đo được

  return (
    <>
      {/* nền mờ xung quanh sheet */}
      <div
        className="fixed inset-0 z-[200] bg-black/35"
        onClick={onClose}
        aria-hidden
      />

     {/* THAY TOÀN BỘ PHẦN SHEET (từ dòng fixed z-[201] trở đi) BẰNG ĐOẠN NÀY → CÁCH 12PX ĐÚNG CHUẨN */}
<div
  className="
    fixed inset-x-0 z-[201]
    mx-3
    bg-white rounded-[24px]
    shadow-[0_18px_40px_rgba(0,0,0,0.25)]
    flex flex-col
    bottom-5
  "
  style={{ top: anchorTop ?? 80 }}
  onClick={(e) => e.stopPropagation()}
>

  {/* HEADER – giữ nguyên */}
  <div className="relative flex items-center justify-center px-4 pt-4 pb-3">
    <h2 className="text-[18px] font-semibold leading-[22px]">
      Chọn ngân hàng
    </h2>

<button
  className="absolute right-3 top-6"
  aria-label="Đóng"
  onClick={onClose} 
>

  <span className="relative block h-6 w-6">
    {/* Thanh trên – Xoay -45° khi mở */}
    <span
      className={`
        block h-[2px] w-5 rounded-full bg-[#111827]
        transition-transform duration-200
        ${open ? "translate-y-[4px] -rotate-45" : "-translate-y-[2px]"}
      `}
    />

    {/* Thanh giữa – biến mất khi mở */}
    <span
      className={`
        block h-[2px] w-5 rounded-full bg-[#111827]
        transition-opacity duration-150
        ${open ? "opacity-0" : "opacity-100"}
      `}
    />

    {/* Thanh dưới – Xoay 45° khi mở */}
    <span
      className={`
        block h-[2px] w-5 rounded-full bg-[#111827]
        transition-transform duration-200
        ${open ? " -translate-y-[4px] rotate-45" : "translate-y-[2px]"}
      `}
    />
  </span>
</button>


  </div>

<div className="mx-3 mb-2">
  <div className="flex h-11 items-center gap-2 rounded-[12px] bg-[#F5F5F5] px-3">
    <svg aria-hidden className="h-5 w-5 text-[#9E9E9E]" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>

    <input
      type="text"
      placeholder="Tìm ngân hàng"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="flex-1 bg-transparent text-base text-text placeholder:text-[#BDBDBD] outline-none border-none"
      inputMode="text"
      autoComplete="off"
      style={{ fontSize: '16px' }}
    />
  </div>
</div>

  {/* DANH SÁCH – cũng mx-3 để đồng bộ lề */}
<div className="mt-2 flex-1 overflow-y-auto mx-3 pb-4">
  {filtered.map((b) => {
    const selected = b.code === selectedCode;

    return (
      <button
        key={b.code}
        type="button"
        onClick={() => onPick(b)}
        className={`
          flex w-full items-center gap-3 px-2 py-3 rounded-[12px]
          text-left
          ${selected ? "bg-[#FFF4E5]" : "hover:bg-[#F5F5F5]"}
        `}
      >
        {/* Logo / code */}
        <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-[#F2F2F2] text-[11px] font-semibold text-[#424242]">
          {b.code}
        </div>

        {/* Tên ngân hàng */}
        <span className="flex-1 text-body">
          {b.name} ({b.code})
        </span>

        {/* Check icon nếu đang chọn */}
        {selected && (
          <span className="text-[#F2994A] text-[18px] font-bold">✓</span>
        )}
      </button>
    );
  })}

  {filtered.length === 0 && (
    <div className="py-4 text-center text-caption text-text-muted">
      Không tìm thấy ngân hàng phù hợp
    </div>
  )}
</div>

</div>
    </>
  );
}  