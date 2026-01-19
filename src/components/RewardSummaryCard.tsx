"use client";

import clsx from "clsx";
import Card from "@/components/Card";

type Milestone = { threshold: number; reward: number };

export default function RewardSummaryCard({
  todayIncome,
  progress,
  currentMilestone,
  dimmed,
  onOpen,
}: {
  todayIncome: number;
  progress: number;
  currentMilestone: Milestone | null;
  dimmed: boolean;
  onOpen: () => void;
}) {
  const isIdle = todayIncome === 0 && progress === 0;

  return (
<div
  className={clsx(
    "transition-opacity duration-200 ease-out",
    dimmed && "opacity-40 pointer-events-none"
  )}
>


      <Card className="px-3 py-3 rounded-2xl bg-[#FFF8F1] border border-black/5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-caption text-text-muted">Thu nhập hôm nay</div>

          <button
            onClick={onOpen}
            className="flex items-center gap-1 text-caption font-medium text-text-muted"
          >
            Thưởng mốc
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-70"
            >
              <path
                d="M7 17L17 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 7h7v7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Số tiền */}
        <div className="mt-2 text-[20px] leading-[24px] font-bold text-[#222222]">
          +{todayIncome.toLocaleString("vi-VN")}đ
        </div>

        {/* 8px dưới số tiền */}
        <div className="mt-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 h-[7px] rounded-full bg-[#EDE7E1] overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-[#F0B978]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-caption text-text-muted min-w-[32px] text-right">
              {progress}%
            </div>
          </div>
        </div>

        {/* 12px dưới progress */}
        {!isIdle && currentMilestone && (
          <div className="mt-3 text-caption text-text-muted">
            Mốc hiện tại:{" "}
            <span className="font-medium text-text">
              +{currentMilestone.reward.toLocaleString("vi-VN")}đ
            </span>{" "}
            tại {currentMilestone.threshold}%
          </div>
        )}
      </Card>
    </div>
  );
}
