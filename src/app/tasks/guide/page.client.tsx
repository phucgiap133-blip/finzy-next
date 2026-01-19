"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";

const GUIDE_KEY = "finzy_seen_guide_click_ad_v1";

export default function TaskGuidePage() {
  const router = useRouter();
  const pushedRef = useRef(false);

  const currentStep = 2;
  const steps = ["Mở link quảng cáo", "Ở lại ≥ 5 giây", "Quay lại ứng dụng nhận thưởng"];

  // ✅ User mới: vào lần đầu -> tự qua video, lần 2 trở đi -> không auto nữa
  useEffect(() => {
    if (pushedRef.current) return; // tránh strict-mode chạy 2 lần
    pushedRef.current = true;

    try {
      const seen = localStorage.getItem(GUIDE_KEY);
      if (!seen) router.push("/tasks/guide/video");
    } catch {
      // ignore
    }
  }, [router]);

  return (
    <>
      <Header title="Nhiệm vụ" showBack noLine />

      <PageContainer className="min-h-[calc(100vh-56px)] pb-[calc(120px+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[720px] flex flex-col min-h-full">
          <div className="space-y-4">
            <div className="text-body font-semibold text-text">
              Bước {currentStep} / {steps.length} • Ở lại ≥ 5 giây ✔
            </div>

            <div>
              <div className="text-caption text-text-muted mb-1">Các bước:</div>

              <ul className="space-y-1">
                {steps.map((s, i) => {
                  const isNextAction = i + 1 === currentStep;
                  return (
                    <li
                      key={s}
                      className={
                        isNextAction
                          ? "text-body font-medium text-[#F2994A]"
                          : "text-body text-text-muted"
                      }
                    >
                      • {s}
                    </li>
                  );
                })}
              </ul>

              {/* LINK VIDEO (user cũ tự bấm) */}
              <button
                type="button"
                onClick={() => router.push("/tasks/guide/video")}
                className="mt-3 text-caption text-text-muted underline w-fit"
              >
                Xem video hướng dẫn (12s)
              </button>

              <div className="mt-6">
                <div className="text-body leading-none mb-3">
                  <span className="text-[#F2994A] font-semibold">+7.000đ</span>{" "}
                  <span className="text-text-muted">khi hoàn thành</span>
                </div>

                <Button className="w-full h-12 rounded-[12px] bg-[#F2994A] hover:bg-[#EA8A2F] text-white font-semibold">
                  Bắt đầu làm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
