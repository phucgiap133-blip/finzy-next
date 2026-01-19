"use client";

import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import Card from "@/components/Card";
import { api } from "@/lib/api";
import { useI18n } from "@/hooks/useI18n";

export default function WithdrawSlowSupportClient() {
  const t = useI18n();
  const sp = useSearchParams();

  // back giống các màn support khác
  const backTo = useMemo(() => sp.get("from") || "/support", [sp]);

  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = useMemo(() => {
    const moneyOk = !!String(amount).replace(/[^\d]/g, "");
    const timeOk = !!time && time.length >= 5;
    return moneyOk && timeOk;
  }, [amount, time]);

  const submit = useCallback(async () => {
    if (busy) return;

    if (!valid) {
      setMsg("Vui lòng nhập đầy đủ số tiền và thời gian.");
      return;
    }

    try {
      setBusy(true);
      setMsg(null);
      await api.support.send({
        room: "withdraw-slow",
        text: `Rút tiền chậm\nSố tiền: ${amount}\nThời gian: ${time}`,
      });
      setMsg("Đã gửi yêu cầu, CSKH sẽ phản hồi sớm.");
      setAmount("");
      setTime("");
    } catch {
      setMsg("Lỗi gửi yêu cầu.");
    } finally {
      setBusy(false);
    }
  }, [busy, valid, amount, time]);

  return (
    <>
      <Header
        title="Hỗ trợ"
        showBack
        noLine
        backFallback={backTo}
        forceFallback
      />

      {/* Card cách màn 12px, giống chat/support */}
      <PageContainer className="pt-4 pb-10 flex justify-center">
        <div className="w-full max-w-[420px] px-[12px]">
        <Card className="mt-3 rounded-[24px] bg-white shadow-sm">
  <div className="px-[12px] py-[12px]">

    {/* TITLE */}
    <div className="text-[16px] font-semibold text-[#333333] leading-none">
      Giao dịch rút tiền chậm
    </div>

    {/* DESC – cách title 8px */}
    <div className="mt-[8px] text-[14px] text-[#828282] leading-[1.4]">
      Nhập số tiền và thời gian thực hiện giao dịch.
    </div>

    {/* INPUT 1 – cách desc 24px */}
    <div className="mt-[24px]">
      <input
        className="w-full h-[44px] rounded-[12px] bg-[#F6F6F6] border border-transparent px-4 text-[14px] text-[#111111] placeholder:text-[#BDBDBD] outline-none focus:bg-white focus:border-[#E0E0E0]"
        placeholder="VD: 20.000đ"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>

    {/* INPUT 2 – cách input 1 là 16px */}
    <div className="mt-[16px]">
      <input
        className="w-full h-[44px] rounded-[12px] bg-[#F6F6F6] border border-transparent px-4 text-[14px] text-[#111111] placeholder:text-[#BDBDBD] outline-none focus:bg-white focus:border-[#E0E0E0]"
        placeholder="VD: 10:12 25/04/2025"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
    </div>

    {/* BUTTON – cách input 2 là 24px */}
    <div className="mt-[24px]">
      <Button
        onClick={submit}
        className="w-full h-[48px] rounded-[12px] text-[16px] font-semibold text-white"
        style={{ backgroundColor: "#F2994A", borderColor: "#F2994A" }}
      >
        {busy ? t.t("common.loading") : "Gửi"}
      </Button>
    </div>

    {/* MESSAGE */}
    {msg && (
      <div className="mt-[12px] text-center text-[13px] text-[#757575]">
        {msg}
      </div>
    )}
  </div>
</Card>

        </div>
      </PageContainer>
    </>
  );
}
