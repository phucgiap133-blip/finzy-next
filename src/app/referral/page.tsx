"use client";

import { useMemo, useState } from "react";
import Header from "../../components/Header";
import Card from "../../components/Card";
import PageContainer from "../../components/PageContainer";

type Status = "doing" | "pending" | "done";
type InviteItem = { id: number; name: string; phone: string; status: Status };

const ALL: InviteItem[] = [
  { id: 1, name: "Người H", phone: "09***456", status: "doing" },
  { id: 2, name: "Người H", phone: "09***456", status: "doing" },
  { id: 3, name: "Người H", phone: "09***456", status: "pending" },
  { id: 4, name: "Người H", phone: "09***456", status: "pending" },
  { id: 5, name: "Người H", phone: "09***456", status: "pending" },
  { id: 6, name: "Người H", phone: "09***456", status: "done" },
  { id: 7, name: "Người H", phone: "09***456", status: "done" },
  { id: 8, name: "Người H", phone: "09***456", status: "done" },
  { id: 9, name: "Người H", phone: "09***456", status: "done" },
];

const STATUS: Record<Status, { text: string; badge: string }> = {
  doing: { text: "Đang làm", badge: "bg-[color:#FFE4DE] text-[color:#C84C32]" },
  pending: {
    text: "Chờ rút",
    badge: "bg-[color:#FFE8B0] text-[color:#8A5A00]",
  },
  done: {
    text: "Đã hoàn thành",
    badge: "bg-[color:#DFF0D8] text-[color:#3C763D]",
  },
};

export default function ReferralPage() {
  const [tab, setTab] = useState<Status>("doing");
  const inviteLink = "https://app.example/invite/abc";

  const filtered = useMemo(() => ALL.filter((i) => i.status === tab), [tab]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      alert("Đã sao chép link mời!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = inviteLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Đã sao chép link mời!");
    }
  };

  return (
    <>
      <Header title="Giới thiệu bạn bè" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <div className="text-[color:#2E7D32] text-body font-semibold">
          +10.000đ cho mỗi người
        </div>
        <div className="text-caption text-text-muted">
          Thưởng cộng ngay khi bạn của bạn rút tiền đầu tiên được xác nhận thành
          công.
        </div>

        <div className="flex gap-sm">
          <input
            className="w-full rounded-control border border-border px-md py-sm text-body"
            placeholder="Link giới thiệu"
            value={inviteLink}
            readOnly
            aria-label="Link giới thiệu"
          />
          <button
            onClick={copyLink}
            className="px-md py-sm rounded-control border border-border text-body"
            aria-label="Sao chép link giới thiệu"
          >
            Sao chép
          </button>
        </div>

        <div
          className="rounded-[12px] bg-[color:#F6F1E8] p-[6px] flex gap-sm"
          role="tablist"
          aria-label="Lọc trạng thái lời mời"
        >
          {[
            { id: "doing", label: "Đang làm" },
            { id: "pending", label: "Chờ rút" },
            { id: "done", label: "Đã hoàn thành" },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === (t.id as Status)}
              onClick={() => setTab(t.id as Status)}
              className={`flex-1 py-xs rounded-full ${
                tab === t.id
                  ? "bg-white shadow-sm text-body font-medium"
                  : "text-caption text-text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-sm">
          {filtered.length === 0 ? (
            <div className="text-center text-caption text-text-muted py-md">
              Chưa có mục nào trong danh sách này.
            </div>
          ) : (
            filtered.map((u) => (
              <Card key={u.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="w-6 h-6 rounded-[8px] bg-[color:#FF6D5A] grid place-items-center text-white text-caption">
                      ∞
                    </div>
                    <div>
                      <div className="text-body font-medium">{u.name}</div>
                      <div className="text-caption text-text-muted">
                        {u.phone}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-md py-xs rounded-full text-caption ${STATUS[u.status].badge}`}
                  >
                    {STATUS[u.status].text}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        <ul className="mt-sm text-caption text-text-muted list-disc pl-md space-y-xs">
          <li>Áp dụng cho tài khoản mới</li>
          <li>Không tính lệnh rút bị huỷ/thất bại</li>
        </ul>
      </PageContainer>
    </>
  );
}
