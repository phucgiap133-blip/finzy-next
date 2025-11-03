// src/app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { api } from "@/lib/api"; // ✅ thêm để gọi chẩn đoán hàng loạt

const LS_KEYS = {
  HIDE_GUIDE_VIDEO: "hideGuideVideo", // "1" | "0"
  HIDE_TASK_ADS: "hideTaskAds",
} as const;

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false); // tránh mismatch SSR
  const [hideGuideVideo, setHideGuideVideo] = useState(false);
  const [hideTaskAds, setHideTaskAds] = useState(true);

  const [diagMsg, setDiagMsg] = useState<string | null>(null);
  const [diagBusy, setDiagBusy] = useState(false);

  // ✅ thêm trạng thái cho kiểm tra tất cả API
  const [fullDiagBusy, setFullDiagBusy] = useState(false);
  const [fullDiagMsg, setFullDiagMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHideGuideVideo(localStorage.getItem(LS_KEYS.HIDE_GUIDE_VIDEO) === "1");
    setHideTaskAds(localStorage.getItem(LS_KEYS.HIDE_TASK_ADS) === "1");
    setMounted(true);
  }, []);

  // Toggle “Xem video + click QC”
  const onToggleAds = (checked: boolean) => {
    setHideTaskAds(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.HIDE_TASK_ADS, checked ? "1" : "0");
    }
  };

  // Toggle “Luôn hiển video hướng dẫn” = không ẩn
  const onToggleGuideVisible = (checked: boolean) => {
    const hide = !checked; // checked = hiển => hide=false
    setHideGuideVideo(hide);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.HIDE_GUIDE_VIDEO, hide ? "1" : "0");
    }
  };

  const resetAll = () => {
    // về trạng thái hiển hết
    setHideGuideVideo(false);
    setHideTaskAds(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.HIDE_GUIDE_VIDEO, "0");
      localStorage.setItem(LS_KEYS.HIDE_TASK_ADS, "0");
    }
  };

  // ========== Chẩn đoán API (đơn lẻ) ==========
  const pingApi = async () => {
    setDiagMsg(null);
    setDiagBusy(true);
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const bal = json?.wallet?.balance;
      setDiagMsg(
        `✅ API OK • /api/wallet trả về balance=${Number(bal).toLocaleString("vi-VN")}đ`,
      );
    } catch (e: any) {
      setDiagMsg(`❌ API lỗi: ${e?.message || "Không rõ nguyên nhân"}`);
    } finally {
      setDiagBusy(false);
    }
  };

  const clearLocalAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    location.reload();
  };
// ========== Chẩn đoán API (toàn bộ route đang dùng) ==========
const runFullDiagnostics = async () => {
  setFullDiagBusy(true);
  setFullDiagMsg(null);

  try {
    const logs: string[] = [];

    // 1) /wallet
    {
      const r = await api.wallet.get();
      logs.push(`✓ /wallet OK (balance=${r.wallet.balance.toLocaleString("vi-VN")}đ)`);
    }

    // 2) /withdrawals
    {
      const r = await api.history.withdrawals.get();
      logs.push(`✓ /withdrawals OK (items=${r.items.length})`);
    }

    // 3) /commissions
    {
      const r = await api.history.commissions.get();
      logs.push(`✓ /commissions OK (items=${r.items.length})`);
    }

    // 4) /banks
    {
      const r = await api.banks.get();
      logs.push(
        `✓ /banks OK (accounts=${r.accounts.length}, selected=${r.selectedId ?? "null"})`,
      );
    }

    // 5) /support/chat/*
    {
      await api.support.chat.history("default");
      await api.support.chat.send({ room: "default", text: "ping" });
      logs.push("✓ /support/chat/* OK");
    }

    // 6) /support/send
    {
      await api.support.send({ room: "withdraw-slow", text: "diag check" });
      logs.push("✓ /support/send OK");
    }

    // 7) /auth/password/change (health trước, POST sau)
    try {
      // 7a) HEAD: không đụng DB
      const head = await fetch("/api/auth/password/change", { method: "HEAD" });
      if (head.ok) {
        logs.push("✓ /auth/password/change health OK");
      } else {
        logs.push(`• /auth/password/change health trả ${head.status}`);
      }

      // 7b) POST: endpoint hoạt động là đủ (sau lần đầu current có thể sai do đã hash)
      const res = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: "123456", next: "123456" }),
      });

      if (res.ok) {
        logs.push("✓ /auth/password/change OK (thật)");
      } else {
        const txt = await res.text().catch(() => "");
        logs.push(
          `• /auth/password/change phản hồi ${res.status} (endpoint hoạt động)${txt ? " - " + txt : ""}`,
        );
      }
    } catch {
      logs.push("✗ /auth/password/change lỗi kết nối");
    }

    setFullDiagMsg(logs.join("\n"));
  } catch (e: any) {
    setFullDiagMsg(`✗ LỖI: ${e?.message || e}`);
  } finally {
    setFullDiagBusy(false);
  }
};


  // Tránh nháy trạng thái trước khi mount
  if (!mounted) {
    return (
      <>
        <Header title="Cài đặt" showBack noLine backFallback="/" />
        <PageContainer className="space-y-md">
          <Card title="Nhiệm vụ">
            <div className="h-24 animate-pulse rounded-md bg-gray-100" />
          </Card>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Header title="Cài đặt" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <Card title="Nhiệm vụ">
          <div className="flex items-center justify-between py-sm">
            <div>
              <div className="text-body">Xem video + click QC</div>
              <div className="text-caption text-text-muted">
                {hideTaskAds ? "Đã ẩn" : "Đang hiện"}
              </div>
            </div>
            {/* Controlled */}
            <Toggle checked={hideTaskAds} onChange={onToggleAds} />
          </div>

          <div className="flex items-center justify-between py-sm">
            <div>
              <div className="text-body">Luôn hiển video hướng dẫn</div>
              <div className="text-caption text-text-muted">
                Áp dụng theo nhiệm vụ tương tự
              </div>
            </div>
            {/* Controlled: checked = hiển (không ẩn) */}
            <Toggle checked={!hideGuideVideo} onChange={onToggleGuideVisible} />
          </div>

          <div className="mt-md">
            <Button onClick={resetAll}>Đặt lại tất cả</Button>
          </div>
        </Card>

        {/* ===== Chẩn đoán hệ thống ===== */}
        <Card title="Chẩn đoán">
          <div className="flex flex-col gap-sm">
            <div className="text-caption text-text-muted">
              Kiểm tra nhanh API nội bộ & làm mới bộ nhớ cục bộ.
            </div>
            <div className="flex flex-wrap gap-sm">
              <Button disabled={diagBusy} onClick={pingApi}>
                {diagBusy ? "Đang kiểm tra…" : "Kiểm tra API (/api/wallet)"}
              </Button>

              {/* ✅ nút kiểm tra tất cả API đang dùng */}
              <Button disabled={fullDiagBusy} onClick={runFullDiagnostics}>
                {fullDiagBusy ? "Đang test tất cả…" : "Kiểm tra tất cả API"}
              </Button>

              <button
                className="px-md py-sm rounded-control border border-border text-body"
                onClick={clearLocalAndReload}
              >
                Xoá cache & tải lại
              </button>
            </div>

            {diagMsg && (
              <div
                className="text-caption"
                style={{
                  color: diagMsg.startsWith("✅") ? "#2E7D32" : "#C62828",
                }}
              >
                {diagMsg}
              </div>
            )}

            {fullDiagMsg && (
              <pre className="whitespace-pre-wrap text-caption bg-[color:#FAFAFA] border border-border rounded-[12px] p-sm">
                {fullDiagMsg}
              </pre>
            )}
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
