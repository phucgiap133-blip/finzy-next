"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { api } from "@/lib/api";

const LS_KEYS = {
  HIDE_GUIDE_VIDEO: "hideGuideVideo",
  HIDE_TASK_ADS: "hideTaskAds",
} as const;

export default function SettingsClient() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [hideGuideVideo, setHideGuideVideo] = useState(false);
  const [hideTaskAds, setHideTaskAds] = useState(true);

  const [diagMsg, setDiagMsg] = useState<string | null>(null);
  const [diagBusy, setDiagBusy] = useState(false);

  const [fullDiagBusy, setFullDiagBusy] = useState(false);
  const [fullDiagMsg, setFullDiagMsg] = useState<string | null>(null);

  // ----- load từ localStorage -----
  useEffect(() => {
    if (typeof window === "undefined") return;
    setHideGuideVideo(localStorage.getItem(LS_KEYS.HIDE_GUIDE_VIDEO) === "1");
    setHideTaskAds(localStorage.getItem(LS_KEYS.HIDE_TASK_ADS) === "1");
    setMounted(true);
  }, []);

  // toggle 1: Xem video + click QC
  const onToggleAds = (checked: boolean) => {
    setHideTaskAds(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.HIDE_TASK_ADS, checked ? "1" : "0");
    }
  };

  // toggle 2: Luôn hiện video hướng dẫn (checked = hiện, nên hide = !checked)
  const onToggleGuideVisible = (checked: boolean) => {
    const hide = !checked;
    setHideGuideVideo(hide);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.HIDE_GUIDE_VIDEO, hide ? "1" : "0");
    }
  };

  const resetAll = () => {
    setHideGuideVideo(false);
    setHideTaskAds(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.HIDE_GUIDE_VIDEO, "0");
      localStorage.setItem(LS_KEYS.HIDE_TASK_ADS, "0");
    }
  };

  // ---------- CHẨN ĐOÁN ----------
  const pingApi = async () => {
    setDiagMsg(null);
    setDiagBusy(true);
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const bal = json?.wallet?.balance;
      setDiagMsg(
        `✅ API OK • /api/wallet trả về balance=${Number(bal).toLocaleString(
          "vi-VN",
        )}đ`,
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

  const runFullDiagnostics = async () => {
    setFullDiagBusy(true);
    setFullDiagMsg(null);
    try {
      const logs: string[] = [];
      const w = await api.wallet.get();
      logs.push(
        `✓ /wallet OK (balance=${w.wallet.balance.toLocaleString("vi-VN")}đ)`,
      );
      const wd = await api.history.withdrawals.get();
      logs.push(`✓ /withdrawals OK (items=${wd.items.length})`);
      const cm = await api.history.commissions.get();
      logs.push(`✓ /commissions OK (items=${cm.items.length})`);
      const b = await api.banks.get();
      logs.push(
        `✓ /banks OK (accounts=${b.accounts.length}, selected=${
          b.selectedId ?? "null"
        })`,
      );
      await api.support.chat.history("default");
      await api.support.chat.send({ room: "default", text: "ping" });
      logs.push("✓ /support/chat/* OK");
      await api.support.send({ room: "withdraw-slow", text: "diag check" });
      logs.push("✓ /support/send OK");

      try {
        const head = await fetch("/api/auth/password/change", {
          method: "HEAD",
        });
        logs.push(
          head.ok
            ? "✓ /auth/password/change health OK"
            : `• /auth/password/change health trả ${head.status}`,
        );
        const res = await fetch("/api/auth/password/change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current: "123456", next: "123456" }),
        });
        if (res.ok) logs.push("✓ /auth/password/change OK (thật)");
        else {
          const txt = await res.text().catch(() => "");
          logs.push(
            `• /auth/password/change phản hồi ${res.status}${
              txt ? " - " + txt : ""
            }`,
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

  const HeaderBar = (
    <header className="pt-safe-top h-[56px] flex items-center justify-between relative">
      {/* back icon giống các trang khác, cách màn 12px nhờ container ngoài */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Quay lại"
        className="w-11 h-11 rounded-full grid place-items-center hover:bg-black/5 transition"
      >
        <span className="text-[20px] leading-none text-[#111827]">‹</span>
      </button>

      <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-[#111827] pointer-events-none">
        Cài đặt
      </h1>

      <div className="w-11 h-11" />
    </header>
  );

  // skeleton
  if (!mounted) {
    return (
      <PageContainer id="app-container" className="flex justify-center">
        <div className="w-full max-w-[420px] pb-8 px-[12px]">
          {HeaderBar}
          <div className="mt-6">
            <Card>
              <div className="h-24 animate-pulse rounded-md bg-gray-100" />
            </Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer id="app-container" className="flex justify-center">
      {/* khung giống Trang chủ: max 420, cách màn 12px */}
      <div className="w-full max-w-[420px] pb-8 px-[12px]">
        {HeaderBar}

        {/* nội dung – cách header 24px (mt-6), các card cách nhau space-y-md */}
        <div className="mt-6 space-y-md">
          {/* CARD NHIỆM VỤ */}
{/* CARD NHIỆM VỤ - Đã cập nhật px-12px và ép khoảng cách */}
<Card>
  <div className="px-[12px] py-[16px]"> {/* Cập nhật padding trái/phải 12px theo ý bạn */}
    {/* TITLE - Nhiệm vụ */}
    <div className="mb-[18px] text-[16px] font-bold leading-none text-[#111827]">
      Nhiệm vụ
    </div>

    {/* ITEM 1 - Xem video + click QC */}
    <div className="flex items-center justify-between py-[4px]">
      <div className="flex-1 pr-3"> {/* Giảm pr một chút để cân đối với px-12 */}
        <div className="text-[15px] font-medium leading-tight text-[#111827]">
          Xem video + click QC
        </div>
        <div className="mt-[2px] text-[13px] text-[#6B7280] leading-none">
          {hideTaskAds ? "Đã ẩn" : "Đang hiện"}
        </div>
      </div>
      <Toggle checked={hideTaskAds} onChange={onToggleAds} />
    </div>

    {/* ITEM 2 - Luôn hiện video hướng dẫn */}
    <div className="flex items-center justify-between py-[4px] mt-[12px]">
      <div className="flex-1 pr-3">
        <div className="text-[15px] font-medium leading-tight text-[#111827]">
          Luôn hiện video hướng dẫn
        </div>
        <div className="mt-[2px] text-[13px] text-[#6B7280] leading-none">
          Áp dụng theo nhiệm vụ tương tự
        </div>
      </div>
      <Toggle checked={!hideGuideVideo} onChange={onToggleGuideVisible} />
    </div>

    {/* BUTTON - Đặt lại tất cả */}
    <div className="mt-[22px]">
      <Button 
        onClick={resetAll}
        className="w-full h-[48px] rounded-[12px] bg-[#F2994A] font-bold text-white border-0 transition-all active:scale-[0.98]"
      >
        Đặt lại tất cả
      </Button>
    </div>
  </div>
</Card>



       
        </div>
      </div>
    </PageContainer>
  );
}
