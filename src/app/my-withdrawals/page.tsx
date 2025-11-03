"use client";

import Header from "@/components/Header";
import Card from "@/components/Card";
import Tag from "@/components/Tag";
import PageContainer from "@/components/PageContainer";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

/* ===================== Types & helpers ===================== */

type Status = "Thành công" | "Đang xử lý" | "Thất bại";

type WithdrawalItem = {
  id: string;
  amount: number; // âm
  status: Status;
  fee: number;
  method: string;
  createdAt: string; // ISO
};

type CommissionItem = {
  id: string;
  amount: number;
  status: Status;
  createdAt: string; // ISO
};

type TabKey = "withdraw" | "commission";

const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";
const tone = (s: Status) =>
  s === "Thành công" ? "success" : s === "Đang xử lý" ? "warning" : "danger";

/* ===================== Page ===================== */

export default function MyHistoryPage() {
  const [active, setActive] = useState<TabKey>("withdraw");

  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);

  useEffect(() => {
    // tải cả hai list
    (async () => {
      try {
        const w = await api.history.withdrawals.get();
        setWithdrawals(w?.items ?? []);
      } catch {
        setWithdrawals([]);
      }
      try {
        const c = await api.history.commissions.get();
        setCommissions(c?.items ?? []);
      } catch {
        setCommissions([]);
      }
    })();
  }, []);

  // tổng hôm nay / tháng này cho tab hoa hồng
  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return commissions
      .filter((r) => new Date(r.createdAt).toDateString() === today)
      .reduce((s, r) => s + r.amount, 0);
  }, [commissions]);

  const monthTotal = useMemo(() => {
    const d = new Date();
    const m = d.getMonth();
    const y = d.getFullYear();
    return commissions
      .filter((r) => {
        const t = new Date(r.createdAt);
        return t.getMonth() === m && t.getFullYear() === y;
      })
      .reduce((s, r) => s + r.amount, 0);
  }, [commissions]);

  return (
    <>
      <Header title="Lịch sử của tôi" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        {/* ===== Tabs (giống ảnh: pill) ===== */}
        <div className="grid grid-cols-2 gap-0 rounded-full bg-[color:#F7F2EB] p-1 border border-border">
          <button
            type="button"
            onClick={() => setActive("withdraw")}
            className={[
              "h-9 rounded-full text-center text-sm font-semibold transition",
              active === "withdraw"
                ? "bg-[color:#F39C46] text-white shadow-sm"
                : "text-text hover:bg-white",
            ].join(" ")}
          >
            Rút tiền
          </button>
          <button
            type="button"
            onClick={() => setActive("commission")}
            className={[
              "h-9 rounded-full text-center text-sm font-semibold transition",
              active === "commission"
                ? "bg-[color:#F39C46] text-white shadow-sm"
                : "text-text hover:bg-white",
            ].join(" ")}
          >
            Lịch sử hoa hồng
          </button>
        </div>

        {/* ===== Content by tab ===== */}
        {active === "withdraw" ? (
          <div className="space-y-md">
            <div className="rounded-[16px] bg-bg-card border border-border shadow-sm">
              {withdrawals.map((it) => (
                <div
                  key={it.id}
                  className="px-lg py-md border-b last:border-0 border-border"
                >
                  <div className="flex items-start gap-md">
                    {/* Avatar momo như bản cũ */}
                    <div className="w-9 h-9 rounded-full bg-[color:#F0E] text-white grid place-items-center text-caption font-bold shrink-0">
                      momo
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-body font-medium">Rút tiền</div>
                        <div className="text-body font-semibold">
                          {formatVND(it.amount)}
                        </div>
                      </div>

                      <div className="mt-xs flex items-center justify-between">
                        <div className="text-caption text-text-muted">
                          phí: {it.fee.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="flex items-center gap-md">
                          <div className="text-caption text-text-muted">
                            0 đ
                          </div>
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

              {withdrawals.length === 0 && (
                <div className="px-lg py-md text-caption text-text-muted">
                  Chưa có giao dịch.
                </div>
              )}
            </div>

            <div className="text-center text-caption text-text-muted">
              Phí rút: 0đ • Hỗ trợ 24/7
            </div>
          </div>
        ) : (
          <div className="space-y-md">
            <div className="flex justify-between text-body">
              <div>
                Hôm nay{" "}
                <span style={{ color: "#2E7D32" }}>
                  +{formatVND(todayTotal)}
                </span>
              </div>
              <div>
                Tháng này{" "}
                <span style={{ color: "#2E7D32" }}>
                  +{formatVND(monthTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-sm">
              {commissions.map((it) => (
                <Card key={it.id}>
                  <div className="flex items-center justify-between">
                    <div className="text-body font-medium">
                      +{formatVND(it.amount)}
                    </div>
                    <Tag tone={tone(it.status)}>{it.status}</Tag>
                  </div>
                  <div className="text-caption text-text-muted">
                    {new Date(it.createdAt).toLocaleString("vi-VN")}
                  </div>
                </Card>
              ))}

              {commissions.length === 0 && (
                <div className="text-caption text-text-muted">
                  Chưa có hoa hồng.
                </div>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}
