"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";
import { api } from "@/lib/api";

export default function WithdrawSlowSupportPage() {
  const sp = useSearchParams();

  const backTo = useMemo(() => sp.get("from") || "/support/chat", [sp]);
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!amount || !time) {
      setMsg("Vui lòng nhập đầy đủ số tiền và thời gian.");
      return;
    }
    try {
      setBusy(true);
      await api.support.send({
        room: "withdraw-slow",
        text: `Rút tiền chậm\nSố tiền: ${amount}\nThời gian: ${time}`,
      });
      setMsg("Đã gửi yêu cầu, CSKH sẽ phản hồi sớm.");
      setAmount("");
      setTime("");
    } catch (e) {
      setMsg("Lỗi gửi yêu cầu.");
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
      <PageContainer className="space-y-md">
        <Card>
          <div className="inline-block rounded-full bg-[color:#FFF3E0] px-sm py-xs text-caption">
            / Rút tiền chậm
          </div>
          <div className="mt-md text-body font-semibold">
            Giao dịch rút tiền chậm
          </div>
          <div className="text-caption text-text-muted mb-md">
            Nhập số tiền và thời gian giao dịch.
          </div>

          <Input
            label="VD: 20.000đ"
            value={amount}
            onChange={(e) => setAmount((e.target as HTMLInputElement).value)}
          />
          <Input
            label="VD: 10:12 25/04/2025"
            value={time}
            onChange={(e) => setTime((e.target as HTMLInputElement).value)}
          />
          <div className="mt-md">
            <Button disabled={busy} onClick={submit}>
              {busy ? "Đang gửi…" : "Gửi"}
            </Button>
          </div>
          {msg && <div className="mt-sm text-caption text-text-muted">{msg}</div>}
        </Card>
      </PageContainer>
    </>
  );
}
