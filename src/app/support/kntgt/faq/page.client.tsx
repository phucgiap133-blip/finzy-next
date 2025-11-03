"use client";

import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";
import { Tag } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ReferralSupportPage() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    if (!code.trim()) {
      setMsg("Vui lòng nhập mã giới thiệu.");
      return;
    }
    try {
      setBusy(true);
      await api.support.send({
        room: "referral",
        text: `Hỗ trợ thưởng giới thiệu\nMã: ${code.trim()}`,
      });
      setMsg("Đã gửi yêu cầu, CSKH sẽ phản hồi sớm.");
      setCode("");
    } catch (e) {
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
        backFallback="/support/chat"
        forceFallback
      />

      <PageContainer className="space-y-md max-w-[420px] mx-auto">
        <Card>
          {/* Thanh tiêu đề mini với icon */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:#FFF3E0] text-[color:#EF6C00] text-caption">
              <Tag className="w-4 h-4" />
              <span>/Giới thiệu</span>
            </span>
          </div>

          {/* Tiêu đề + mô tả */}
          <div className="mt-md text-body font-semibold text-center">
            Không nhận được thưởng giới thiệu?
          </div>
          <div className="text-caption text-text-muted text-center mb-md">
            Nhập mã giới thiệu để được hỗ trợ.
          </div>

          {/* Ô nhập */}
          <div className="space-y-sm">
            <Input
              label=""
              placeholder="VD: ABC123"
              value={code}
              onChange={(e) => setCode((e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Nút gửi */}
          <div className="mt-md">
            <Button
              className="w-full h-12 rounded-xl text-btn font-semibold"
              disabled={busy}
              onClick={submit}
            >
              {busy ? "Đang gửi…" : "Gửi"}
            </Button>
            {msg && (
              <div className="mt-sm text-caption text-text-muted">{msg}</div>
            )}
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
