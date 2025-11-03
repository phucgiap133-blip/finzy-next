"use client";

import Header from "../../../components/Header";
import Card from "../../../components/Card";
import Tag from "../../../components/Tag";
import PageContainer from "../../../components/PageContainer";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type CommissionItem = {
  id: string;
  amount: number;
  status: "Thành công" | "Đang xử lý" | "Thất bại";
  createdAt: string;
};

export default function HoaHongPage({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [rows, setRows] = useState<CommissionItem[]>([]);

  useEffect(() => {
    api.history.commissions
      .get()
      .then((res: { items: CommissionItem[] }) => setRows(res.items));
  }, []);

  const todayTotal = useMemo(() => {
    const today = new Date().toDateString();
    return rows
      .filter((r) => new Date(r.createdAt).toDateString() === today)
      .reduce((s, r) => s + r.amount, 0);
  }, [rows]);

  const monthTotal = useMemo(() => {
    const d = new Date();
    const m = d.getMonth(),
      y = d.getFullYear();
    return rows
      .filter((r) => {
        const t = new Date(r.createdAt);
        return t.getMonth() === m && t.getFullYear() === y;
      })
      .reduce((s, r) => s + r.amount, 0);
  }, [rows]);

  const tone = (status: CommissionItem["status"]) =>
    status === "Thành công"
      ? "success"
      : status === "Đang xử lý"
        ? "warning"
        : "danger";

  return (
    <>
      <Header title="Lịch sử hoa hồng" showBack noLine backFallback="/" />
      <PageContainer className={embedded ? "" : "space-y-md"}>
        <div className="flex justify-between text-body mb-md">
          <div>
            Hôm nay{" "}
            <span style={{ color: "#2E7D32" }}>
              +{todayTotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div>
            Tháng này{" "}
            <span style={{ color: "#2E7D32" }}>
              +{monthTotal.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="space-y-sm">
          {rows.map((it) => (
            <Card key={it.id}>
              <div className="flex items-center justify-between">
                <div className="text-body font-medium">
                  +{it.amount.toLocaleString("vi-VN")}đ
                </div>
                <Tag tone={tone(it.status)}>{it.status}</Tag>
              </div>
              <div className="text-caption text-text-muted">
                {new Date(it.createdAt).toLocaleString("vi-VN")}
              </div>
            </Card>
          ))}
          {rows.length === 0 && (
            <div className="text-caption text-text-muted">
              Chưa có hoa hồng.
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
