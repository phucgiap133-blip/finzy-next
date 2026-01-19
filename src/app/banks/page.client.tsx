// src/app/banks/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import Link from "next/link";
import { api } from "@/lib/api";

type BankItem = {
  id: string;
  bankName: string;
  last4: string;
  holder: string;
  tag?: string;
};

const MOCK_BANKS: BankItem[] = [
  { id: "1", bankName: "MB Bank", last4: "12345", holder: "Nguyễn Văn A", tag: "default" },
  { id: "2", bankName: "MB Bank", last4: "67890", holder: "Trần Thị B" },
  { id: "3", bankName: "MOMO", last4: "54321", holder: "Lê Văn C" },
];

// sắp xếp: tài khoản mặc định lên đầu
function arrangeBanks(list: BankItem[], selectedId: string | null) {
  if (!selectedId) return list;
  const selected = list.find((b) => b.id === selectedId);
  if (!selected) return list;
  return [selected, ...list.filter((b) => b.id !== selectedId)];
}

export default function BanksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BankItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [cannotDeleteOpen, setCannotDeleteOpen] = useState(false);


  const load = async () => {
    setLoading(true);
    try {
      const res = await api.banks.get();
      if (Array.isArray(res?.accounts) && res.accounts.length > 0) {
        const raw = res.accounts as BankItem[];
        const selected = res.selectedId ?? raw[0].id;
        setItems(arrangeBanks(raw, selected));
        setSelectedId(selected);
        setIsMock(false);
      } else {
        throw new Error("No data");
      }
    } catch {
      const selected = MOCK_BANKS[0].id;
      setItems(arrangeBanks(MOCK_BANKS, selected));
      setSelectedId(selected);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSelectDefault = async (id: string) => {
    if (selectedId === id) return;

    if (isMock) {
      setSelectedId(id);
      setItems((prev) => arrangeBanks(prev, id));
      return;
    }

    try {
      await api.banks.select({ id });
      setSelectedId(id);
      setItems((prev) => arrangeBanks(prev, id));
    } catch {
      // giữ nguyên nếu lỗi
    }
  };
const explainCannotDelete = () => {
  setCannotDeleteOpen(true);
};


  const confirmDelete = async () => {
    if (!confirmId) return;

    if (isMock) {
      setItems((prev) => prev.filter((i) => i.id !== confirmId));
      if (selectedId === confirmId) {
        const next = items.filter((i) => i.id !== confirmId);
        setSelectedId(next[0]?.id || null);
      }
      setConfirmId(null);
      return;
    }

    try {
      await api.banks.delete({ id: confirmId });
      await load();
    } finally {
      setConfirmId(null);
    }
  };

  const getAbbr = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
      const maskAccount = (last4: string) => {
  if (!last4) return "";
  if (last4.length <= 2) return `**${last4}`;
  return `${last4.slice(0, 2)}**${last4.slice(-2)}`;
};


  return (
    <PageContainer id="app-container" className="flex justify-center bg-white">
      <div className="w-full max-w-[420px] pb-10 px-[12px]">
        {/* HEADER – giống pattern Trang chủ (back + title giữa + placeholder) */}
        <header className="pt-safe-top h-[56px] flex items-center justify-between">
          <button
            type="button"
     onClick={() => router.push("/withdraw")}
            aria-label="Quay lại"
            className="w-11 h-11 rounded-full grid place-items-center text-[#111827] hover:bg-black/5"
          >
            <span className="text-[20px] leading-none">‹</span>
          </button>

          <h1 className="text-[18px] leading-[24px] font-semibold tracking-[0.01em]">
            Liên kết ngân hàng
          </h1>

          <div className="w-11 h-11" />
        </header>

        {/* CARD chính chứa list + nút thêm – ôm full width, cách header 24px */}
        <div className="mt-6 rounded-[24px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] overflow-hidden">
          {loading ? (
            <div className="px-4 py-6 text-center text-[14px] text-[#6B7280]">
              Đang tải...
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-center text-[14px] text-[#6B7280]">
              Chưa có tài khoản ngân hàng nào.
            </div>
          ) : (
            <>
             {items.map((item, index) => {
  const isDefault = selectedId === item.id;
  const isOnlyOne = items.length === 1;


                return (
                  <div key={item.id}>
                    {/* Divider giữa các item */}
                 {index === 1 && <div className="mx-4 h-px bg-[#E5E7EB]" />}



                    <div className="px-[12px] py-[12px] flex items-center justify-between gap-3">
                      {/* Vùng chọn mặc định – avatar + info */}
                      <button
                        type="button"
                        onClick={() => onSelectDefault(item.id)}
                        className="flex flex-1 items-center gap-3 text-left min-w-0"
                      >
                        {/* Avatar ngân hàng */}
                        <div className="shrink-0 w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] grid place-items-center shadow-[0_6px_16px_rgba(15,23,42,0.35)]">
                          <span className="text-[11px] font-semibold text-white tracking-[0.08em]">
                            {getAbbr(item.bankName)}
                          </span>
                        </div>

                        {/* Thông tin ngân hàng */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[15px] font-semibold text-[#111827] truncate">
                          {item.bankName} • {maskAccount(item.last4)}


                          </div>
                         <div className="mt-[2px] text-[13px] text-[#374151] font-medium truncate">
  {item.holder}
</div>

                        </div>
                      </button>

{/* RIGHT – trạng thái hành động */}
{isOnlyOne ? (
  <button
    type="button"
    onClick={explainCannotDelete}
    aria-label="Không thể xóa tài khoản duy nhất"
    title="Cần thêm ít nhất 1 tài khoản ngân hàng khác để có thể xóa"
    className="
      shrink-0
      w-8 h-8
      self-center
      rounded-full
      grid place-items-center
      text-[#D1D5DB]
      active:scale-95
    "
  >
    <svg
      className="w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  </button>
) : isDefault ? (
  <Button
    variant="soft"
    size="sm"
    className="
      shrink-0
      h-[28px]
      px-3
      rounded-full
      text-[13px] font-semibold
      shadow-none
      pointer-events-none
    "
  >
    Mặc định
  </Button>
) : (
  <button
    type="button"
    onClick={() => setConfirmId(item.id)}
    aria-label="Xóa tài khoản ngân hàng"
    className="
      shrink-0
      w-8 h-8
      self-center
      rounded-full
      grid place-items-center
      hover:bg-[#FFF3EC]
      text-[#F97373]
    "
  >
    <svg
      className="w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  </button>
)}


                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Nút Thêm ngân hàng – H48, bo 12px, style primary như Trang chủ */}
          <div className="px-4 pt-3 pb-4">
            <Link href="/banks/add">
              <Button
                className="
                  w-full
                  h-[48px]
                  rounded-[12px]
                  text-[15px] font-semibold
                  bg-[#F2994A] hover:bg-[#EA8A2F]
                  text-white
                  border border-[#F2994A]
                  shadow-[0_8px_18px_rgba(242,153,74,0.45)]
                  flex items-center justify-center
                "
              >
                + Thêm ngân hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
{confirmId && (
  <>
    {/* overlay mờ phía sau */}
    <div
      onClick={() => setConfirmId(null)}
      className={`fixed inset-0 z-[90] bg-black/40 transition-opacity
        ${confirmId
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
        }`}
    />

    {/* card giữa màn hình */}
    <div
      className={`fixed left-1/2 top-1/2 z-[91]
        w-[calc(100%-24px)] max-w-[420px]
        -translate-x-1/2 -translate-y-1/2
        rounded-[24px] bg-white
        shadow-[0_12px_32px_rgba(0,0,0,0.16)]
        px-xl py-[24px]
        transition-all duration-250
        ${confirmId
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90 pointer-events-none"
        }`}
    >
      {/* Tiêu đề + mô tả */}
      <div className="text-center">
        <div className="text-[20px] font-bold">
          Xóa tài khoản
        </div>

        <p className="mt-3 text-body text-[#4F4F4F] leading-relaxed">
          Bạn có chắc chắn muốn xóa tài khoản
          <br />
          <span className="font-semibold">
            {items.find((i) => i.id === confirmId)?.bankName} •{" "}
            {items.find((i) => i.id === confirmId)?.last4}
          </span>
          ?
        </p>
      </div>

      {/* nút – layout giống Logout */}
      <div className="mt-6 flex gap-sm">
        <button
          type="button"
          onClick={() => setConfirmId(null)}
          className="flex-1 h-12 rounded-[16px] border border-[#E0E0E0] bg-white text-body"
        >
          Hủy
        </button>

        <Button
          type="button"
          onClick={confirmDelete}
          className="flex-1 h-12 rounded-[16px] text-white text-body font-semibold bg-[#EB5757] hover:bg-[#D84343]"
        >
          Xóa
        </Button>
      </div>
    </div>
  </>
)}
{cannotDeleteOpen && (
  <>
    {/* overlay mờ phía sau */}
    <div
      onClick={() => setCannotDeleteOpen(false)}
      className="fixed inset-0 z-[90] bg-black/40 transition-opacity"
    />

    {/* card giữa màn hình – CHUẨN LOGOUT */}
    <div
      className={`
        fixed left-1/2 top-1/2 z-[91]
        w-[calc(100%-24px)] max-w-[420px]
        -translate-x-1/2 -translate-y-1/2
        rounded-[24px] bg-white
        shadow-[0_12px_32px_rgba(0,0,0,0.16)]
        px-xl py-[24px]
        transition-all duration-250
        opacity-100 scale-100
      `}
    >
      {/* Tiêu đề + mô tả */}
      <div className="text-center">
        <div className="text-[20px] font-bold">
          Không thể xóa
        </div>

        <p className="mt-3 text-body text-[#4F4F4F] leading-relaxed">
          Cần thêm ít nhất <b>1 tài khoản ngân hàng khác</b>
          <br />
          để có thể xóa tài khoản này.
        </p>
      </div>

      {/* nút – đúng spacing Logout */}
      <div className="mt-6 flex gap-sm">
        <Button
          type="button"
          onClick={() => setCannotDeleteOpen(false)}
          className="flex-1 h-12 rounded-[16px]"
        >
          Đã hiểu
        </Button>
      </div>
    </div>
  </>
)}



    </PageContainer>
  );
}