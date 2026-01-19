"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import Card from "@/components/Card";
import { api } from "@/lib/api";

export default function ReferralSupportClient() {
  const sp = useSearchParams();

  // back giống withdraw-slow + các màn support khác
  const backTo = useMemo(() => sp.get("from") || "/support", [sp]);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    const value = code.trim();
    if (!value) {
      setMsg("Vui lòng nhập mã giới thiệu.");
      return;
    }
    try {
      setBusy(true);
      setMsg(null);
      await api.support.send({
        room: "referral",
        text: `Hỗ trợ thưởng giới thiệu\nMã: ${value}`,
      });
      setMsg("Đã gửi yêu cầu, CSKH sẽ phản hồi sớm.");
      setCode("");
    } catch {
      setMsg("Có lỗi khi gửi yêu cầu. Thử lại sau nhé.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header
        title="Hỗ trợ"
        showBack
        noLine
        backFallback={backTo}
        forceFallback
      />

      {/* Card cách màn 12px, đồng bộ withdraw-slow */}
      <PageContainer className="pt-4 pb-10 flex justify-center">
        <div className="w-full max-w-[420px] px-[12px]">
     <Card className="mt-3 rounded-[24px] bg-white p-[12px] shadow-sm">
  {/* Title */}
  <div className="text-center">
    <div className="text-[16px] font-semibold text-[#333333]">
      Không nhận được thưởng giới thiệu?
    </div>
    <div className="mt-[8px] text-[14px] text-[#828282]">
      Nhập mã giới thiệu để được hỗ trợ.
    </div>
  </div>

  {/* Input */}
  <div className="mt-[24px]">
    <input
      className="w-full rounded-[12px] bg-[#F6F6F6] border border-transparent px-4 py-3 text-[14px] text-[#111111] placeholder:text-[#BDBDBD] outline-none focus:bg-white focus:border-[#E0E0E0]"
      placeholder="VD: ABC123"
      value={code}
      onChange={(e) => setCode(e.target.value)}
    />
  </div>

  {/* Button */}
  <div className="mt-[24px]">
    <Button
      className="w-full h-[48px] rounded-[12px] text-[16px] font-semibold text-white"
      style={{ backgroundColor: "#F2994A", borderColor: "#F2994A" }}
      disabled={busy}
      onClick={submit}
    >
      {busy ? "Đang gửi…" : "Gửi"}
    </Button>
  </div>

  {/* Message */}
  {msg && (
    <div className="mt-[16px] text-center text-[13px] text-[#757575]">
      {msg}
    </div>
  )}
</Card>

        </div>
      </PageContainer>
    </>
  );
}
