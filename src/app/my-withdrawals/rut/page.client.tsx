"use client";

import Header from "../../../components/Header";
import Tag from "../../../components/Tag";
import PageContainer from "../../../components/PageContainer";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type WithdrawalItem = {
  id: string;
  amount: number; // âm
  status: "Thành công" | "Đang xử lý" | "Thất bại";
  fee: number;
  method: string;
  createdAt: string;
};

export default function RutPage({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<WithdrawalItem[]>([]);

  useEffect(() => {
    api.history.withdrawals
      .get()
      .then((res: { items: WithdrawalItem[] }) => setItems(res.items));
  }, []);

  const tone = (status: WithdrawalItem["status"]) =>
    status === "Thành công"
      ? "success"
      : status === "Đang xử lý"
        ? "warning"
        : "danger";

  return (
    <>
      <Header title="Lịch sử rút" showBack noLine backFallback="/" />
      <PageContainer>
        <div className="rounded-[16px] bg-bg-card border border-border shadow-sm">
          {items.map((it) => (
            <div
              key={it.id}
              className="px-lg py-md border-b last:border-0 border-border"
            >
              <div className="flex items-start gap-md">
                <div className="w-9 h-9 rounded-full bg-[color:#F0E] text-white grid place-items-center text-caption font-bold shrink-0">
                  momo
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-body font-medium">Rút tiền</div>
                    <div className="text-body font-semibold">
                      {it.amount.toLocaleString("vi-VN")}đ
                    </div>
                  </div>

                  <div className="mt-xs flex items-center justify-between">
                    <div className="text-caption text-text-muted">
                      phí: {it.fee.toLocaleString("vi-VN")} đ
                    </div>
                    <div className="flex items-center gap-md">
                      <div className="text-caption text-text-muted">0 đ</div>
                      <Tag tone={tone(it.status)}>{it.status}</Tag>
                    </div>
                  </div>

                  <div className="mt-xs">
                    <div className="text-body">{it.method}</div>
                    <div className="text-caption text-text-muted">
                      {new Date(it.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="px-lg py-md text-caption text-text-muted">
              Chưa có giao dịch.
            </div>
          )}
        </div>

        {!embedded && (
          <div className="text-center text-caption text-text-muted mt-md">
            Phí rút: 0đ • Hỗ trợ 24/7
          </div>
        )}
      </PageContainer>
    </>
  );
}
