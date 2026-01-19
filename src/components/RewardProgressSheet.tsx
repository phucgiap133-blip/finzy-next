"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const REWARD_ROUNDS = Array.from({ length: 9 }, (_, idx) => {
  const round = idx + 1;
  const m85 = 10_000 + idx * 5_000;
  const m95 = 20_000 + idx * 10_000;

  return {
    round,
    status: round === 1 ? "đang thực hiện" : "sắp tới",
    m85,
    m95,
  };
});

export default function RewardProgressSheet({
  show,
  sheetOpen,
  onClose,
  progress,
}: {
  show: boolean;
  sheetOpen: boolean;
  onClose: () => void;
  progress: number;
}) {
  const HALF_H = "56vh";
  const FULL_H = "92vh";

  const [expanded, setExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);

  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  // mở sheet -> reset về half
  useEffect(() => {
    if (show) {
      setExpanded(false);
      setDragY(0);
    }
  }, [show]);

  if (!show) return null;

  const onDragStart = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startYRef.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dy = e.clientY - startYRef.current;
    const clamped = Math.max(-140, Math.min(220, dy));
    setDragY(clamped);
  };

  const onDragEnd = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

    // swipe up -> expand
    if (dragY < -60) setExpanded(true);
    // swipe down -> thu về half (nếu đang full), hoặc close (nếu đang half)
    else if (dragY > 110) {
      if (expanded) setExpanded(false);
      else onClose();
    }

    setDragY(0);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose} />

      {/* Sheet */}
      <div
        className={[
          "fixed left-0 right-0 bottom-0 z-[60]",
           "w-full bg-white rounded-t-2xl px-3 pt-2 pb-[max(14px,env(safe-area-inset-bottom))]",
          "flex flex-col",
          "transition-[transform,height] duration-200 ease-out",
        ].join(" ")}
        style={{
          height: expanded ? FULL_H : HALF_H,
          transform: sheetOpen ? `translateY(${dragY}px)` : "translateY(100%)",
        }}
        role="dialog"
        aria-modal="true"
      >
       {/* ✅ vùng kéo: handle + header */}
<div
  onPointerDown={onDragStart}
  onPointerMove={onDragMove}
  onPointerUp={onDragEnd}
  onPointerCancel={onDragEnd}
  className="select-none"
>
  {/* Handle (gợi ý kéo, không cần text) */}
  <div className="mx-auto h-1.5 w-12 rounded-full bg-[#E5E7EB]" />

  {/* Header */}
  <div className="relative mt-3 pr-10">
    <div className="text-body font-semibold">Tiến độ các vòng thưởng</div>

    {/* ✅ tiêu đề -> chữ bé cách 8px */}
    <div className="mt-2 text-caption text-text-muted">
      Hoàn thành 100% để mở vòng thưởng tiếp theo.
    </div>

    {/* ✅ X kiểu 3 gạch, đặt đúng vị trí + không bị drag ăn click */}
    <button
      className="absolute right-0 top-[18px]"
      aria-label="Đóng"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="relative block h-6 w-6">
        <span
          className={`
            block h-[2px] w-5 rounded-full bg-[#111827]
            transition-transform duration-200
            translate-y-[4px] -rotate-45
          `}
        />
        <span
          className={`
            block h-[2px] w-5 rounded-full bg-[#111827]
            transition-opacity duration-150
            opacity-0
          `}
        />
        <span
          className={`
            block h-[2px] w-5 rounded-full bg-[#111827]
            transition-transform duration-200
            -translate-y-[4px] rotate-45
          `}
        />
      </span>
    </button>
  </div>
</div>


        {/* Content (scroll) */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3">
          {REWARD_ROUNDS.map((r) => {
            const total = r.m85 + r.m95;
            const isCurrent = r.round === 1;

            const hit85 = isCurrent && progress >= 85;
            const hit95 = isCurrent && progress >= 95;

            return (
              <div
                key={r.round}
                className={clsx(
                  "rounded-[20px] border px-3 py-2.5",
                  isCurrent
                    ? "border-[#EFE1D4] bg-[#FFF7EF]"
                    : "border-[#EFEFEF] bg-[#FAFAFA]"
                )}
              >
                {/* Round header (gọn) */}
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#EEEEEE]">
                  <span
                    className={clsx(
                      "inline-block h-2 w-2 rounded-full",
                      isCurrent ? "bg-[#F0B978]" : "bg-[#BDBDBD]"
                    )}
                  />
                  <div className="text-body font-semibold text-[#222]">
                    Vòng {r.round}{" "}
                    <span className="text-caption text-text-muted font-normal">
                      ({r.status})
                    </span>
                  </div>
                </div>

                {/* Rows (padding trái/phải 12px) */}
               <div className="mt-2">
                  <RewardRow label="85%" value={r.m85} done={hit85} dim={!isCurrent} />
                  <div className="h-px bg-[#EEEEEE]" />
                  <RewardRow label="95%" value={r.m95} done={hit95} dim={!isCurrent} />
                </div>

                {/* Total (gọn hơn) */}
                <div className="mt-1.5 pt-1.5 border-t border-[#EEEEEE] flex items-center justify-between">
                  <div className="text-caption text-text-muted">Tổng vòng:</div>
                  <div className="text-caption font-semibold text-text">
                    +{total.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function RewardRow({
  label,
  value,
  done,
  dim,
}: {
  label: string;
  value: number;
  done: boolean;
  dim: boolean; // vòng sắp tới
}) {
  // ✅ phản biện: vòng sắp tới không tick (chỉ chấm rỗng)
  // Vòng hiện tại: chưa đạt -> vòng tròn xám; đạt -> cam + tick
  const circleBg = dim ? "bg-[#F3F4F6]" : done ? "bg-[#F0B978]" : "bg-[#E5E7EB]";
  const circleBorder = dim ? "border border-[#D1D5DB]" : "border border-transparent";

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-caption text-text-muted">
        <span
          className={clsx(
            "inline-flex h-5 w-5 items-center justify-center rounded-full",
            circleBg,
            circleBorder
          )}
        >
          {!dim && done ? (
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path
                d="M1 4.5L4.2 7.7L11 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>

       <span className="shrink-0 whitespace-nowrap">{label}</span>
       <span className="shrink-0 text-[#D6D6D6]">—</span>

        <span className={clsx("shrink-0 whitespace-nowrap font-semibold", dim ? "text-[#9CA3AF]" : "text-text")}>
          +{value.toLocaleString("vi-VN")}đ
        </span>
      </div>
    </div>
  );
}
