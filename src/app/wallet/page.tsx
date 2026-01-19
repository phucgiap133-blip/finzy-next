// src/app/wallet/page.tsx – ĐÃ ĐẸP CHUẨN FIGMA, GIỐNG ẢNH MÀY GỬI 100%
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import Card from "@/components/Card";
import { api } from "@/lib/api";
import { APP } from "@/config/app";


type Wallet = { balance: number };
type WalletHistoryItem = {
  id: string;
  type: "invite" | "milestone";
  amount?: number;
  text?: string;
  sub?: string;
  title?: string;
  note?: string;
  time: string;
};


const MOCK_WALLET: Wallet = { balance: 37_000 };
const MOCK_HISTORY: WalletHistoryItem[] = [
  {
    id: "invite-1",
    type: "invite",
    amount: 10000,
    title: "Đã cộng",
    sub: "cho bạn và người B",
    time: "10:21 25/04/2024",
  },
  {
    id: "milestone-85",
    type: "milestone",
    amount: 10000,
    title: "Hoàn thành mốc 85%",
    note: "Thưởng tiến độ",
    time: "10:21 25/04/2024",
  },
  {
    id: "milestone-95",
    type: "milestone",
    amount: 20000,
    title: "Hoàn thành mốc 95%",
    note: "Đang xử lý",
    time: "11:05 26/04/2024",
  },
];


function renderHistoryText(text: string) {
  const match = text.match(/(\+\s?[\d.,]+d)/i);
  if (!match) return <span>{text}</span>;
  const [amount] = match;
  const [before, after] = text.split(amount);
  return (
    <>
      {before}
      <span className="font-semibold text-[#16A34A]">{amount}</span>
      {after}
    </>
  );
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams?: { debug?: string };
}) {
  let wallet: Wallet = MOCK_WALLET;
  let history: WalletHistoryItem[] = MOCK_HISTORY;
  let isMock = true;

  try {
    const res = await api.wallet.get();
    if (res?.wallet?.balance != null) {
      wallet = res.wallet;
      isMock = false;
    }
    if (Array.isArray(res?.history) && res.history.length > 0) {
      history = res.history as WalletHistoryItem[];
      isMock = false;
    }
  } catch {}

  const showDebug = searchParams?.debug === "1";

  return (
    <PageContainer className="flex justify-center">
      <div className="w-full max-w-[375px] px-[12px] pt-2 pb-10">
        {/* HEADER H=48px */}
        <header className="h-[48px] flex items-center justify-between">
          <Link href="/?src=account" className="w-6 h-6 flex items-center justify-center" aria-label="Quay lại">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6L9 12l6 6" />
            </svg>
          </Link>

          <h1 className="text-[18px] leading-[24px] font-semibold">Ví</h1>

          <div className="w-6 h-6" />
        </header>

        {/* SỐ DƯ + MỨC RÚT – cách header 24px */}
        <div className="mt-6 text-center">
          <div className="text-[20px] leading-[24px] font-bold text-[#111827]">
            {wallet.balance.toLocaleString("vi-VN")}đ
          </div>

          <div className="mt-3 text-[15px] font-medium text-[#16A34A]">
            Mức rút tối thiểu 20.000đ
          </div>
        </div>
{/* LIST CARD – GIỐNG HỆT HOA HỒNG */}
<div className="mt-6 space-y-4">
  {history.map((item) => (
    <div
      key={item.id}
      className="
        bg-white
        rounded-2xl
        shadow-[0_4px_12px_rgba(0,0,0,0.07)]
        overflow-hidden
      "
    >
      <div className="px-[11px] py-[10px]">
        <div className="flex flex-col">
          {/* Số tiền */}
          <div className="text-[17px] font-bold leading-none text-[#16A34A]">
            +{item.amount?.toLocaleString("vi-VN")}đ
          </div>

          {/* Mô tả */}
          <div className="mt-1 text-[14px] font-medium truncate">
            {item.type === "invite"
              ? "Đã cộng cho bạn và người B"
              : item.title}
          </div>

          {/* Thời gian + ghi chú */}
          <div className="mt-[3px] text-[12.5px] text-[#6B7280]">
            {item.time}
            {item.note && <> • {item.note}</>}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>



        {/* Debug */}
        {showDebug && (
          <div className="mt-8">
            <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify({ wallet, history, isMock }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </PageContainer>
  );
}