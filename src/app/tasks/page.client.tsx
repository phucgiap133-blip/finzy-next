"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import RewardSummaryCard from "@/components/RewardSummaryCard";
import RewardProgressSheet from "@/components/RewardProgressSheet";



type TabKey = "click" | "video" | "seo" | "nc" | "qc";

type TaskItem = {
  id: number;
  tab: TabKey;
  title: string;
  bonus: number;
  progressStep: number; // % cộng thêm khi hoàn thành
  progressLabel: string;
};

type Milestone = { threshold: number; reward: number };

// 2 mốc thưởng như UI
const MILESTONES: Milestone[] = [
  { threshold: 85, reward: 10_000 },
  { threshold: 95, reward: 20_000 },
];

// TAB theo 2 “page”
const TAB_PAGES: { key: TabKey; label: string }[][] = [
  [
    { key: "click", label: "Click ads" },
    { key: "video", label: "Xem video" },
    { key: "seo", label: "SEO" },
  ],
  [
    { key: "nc", label: "NC" },
    { key: "qc", label: "QC" },
    { key: "seo", label: "SEO" },
  ],
];

// Nhiệm vụ demo (mỗi cái +5%)
const ALL_TASKS: TaskItem[] = [
  { id: 1, tab: "click", title: "Click ads", bonus: 5_000, progressStep: 5, progressLabel: "5%" },
  { id: 2, tab: "click", title: "Click ads", bonus: 5_000, progressStep: 5, progressLabel: "5%" },
  { id: 3, tab: "click", title: "Click ads", bonus: 5_000, progressStep: 5, progressLabel: "5%" },
  { id: 4, tab: "video", title: "Xem video", bonus: 5_000, progressStep: 5, progressLabel: "5%" },
  { id: 5, tab: "seo", title: "SEO nhiệm vụ", bonus: 5_000, progressStep: 5, progressLabel: "5%" },
  { id: 6, tab: "nc", title: "NC nhiệm vụ", bonus: 5_000, progressStep: 5, progressLabel: "5%" },
  { id: 7, tab: "qc", title: "QC nhiệm vụ", bonus: 5_000, progressStep: 5, progressLabel: "5%" },
];

export default function TasksPage() {
  const DEMO_MATCH_DESIGN = true;

  const router = useRouter();
const [pageIdx, setPageIdx] = useState(0);
const [tabKey, setTabKey] = useState<TabKey>(TAB_PAGES[0][0].key);

const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
  click: null,
  video: null,
  seo: null,
  nc: null,
  qc: null,
});

  // ✅ demo giống ảnh (95%)
  const [progress, setProgress] = useState(DEMO_MATCH_DESIGN ? 95 : 0);

  // ✅ GIỮ NGUYÊN (đừng set demo ở đây nữa, để list không bị ảnh hưởng)
  const [completedIds, setCompletedIds] = useState<Set<number>>(() => new Set());

  // ✅ demo giống ảnh (+37.000đ) nhưng KHÔNG làm đổi list
  const todayIncome = useMemo(() => {
    if (DEMO_MATCH_DESIGN) return 37_000;

    let sum = 0;
    completedIds.forEach((id) => {
      const t = ALL_TASKS.find((x) => x.id === id);
      if (t) sum += t.bonus;
    });
    return sum;
  }, [completedIds, DEMO_MATCH_DESIGN]);

  const currentMilestone = useMemo(() => {
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (progress >= MILESTONES[i].threshold) return MILESTONES[i];
    }
    return null;
  }, [progress]);

  // mở / đóng bottom sheet thưởng mốc
  const [showRewardSheet, setShowRewardSheet] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (showRewardSheet) {
      requestAnimationFrame(() => setSheetOpen(true));
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      setSheetOpen(false);
    }
  }, [showRewardSheet]);

  const closeRewardSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setShowRewardSheet(false), 180);
  };



  const ALL_TABS = useMemo(
    () => [...TAB_PAGES[0], ...TAB_PAGES[1]],
    []
  );

  const currentTabs = TAB_PAGES[pageIdx];

  const tasksForTab = useMemo(
    () => ALL_TASKS.filter((t) => t.tab === tabKey),
    [tabKey]
  );

  const activeIndex = useMemo(() => {
    const local = TAB_PAGES[pageIdx].findIndex((t) => t.key === tabKey);
    return pageIdx * 3 + (local >= 0 ? local : 0);
  }, [pageIdx, tabKey]);

  const indexToKey = useCallback(
    (i: number) =>
      (ALL_TABS[i]?.key ?? ALL_TABS[0].key) as TabKey,
    [ALL_TABS]
  );

  const gotoNextPage = useCallback(() => {
    const newPage = (pageIdx + 1) % TAB_PAGES.length;
    setPageIdx(newPage);
    setTabKey(TAB_PAGES[newPage][0].key);
  }, [pageIdx]);

  const gotoPrevPage = useCallback(() => {
    setPageIdx(0);
    setTabKey("click");
  }, []);

  const setIndex = useCallback(
    (nextIndex: number) => {
      const clamped = Math.min(
        Math.max(0, nextIndex),
        ALL_TABS.length - 1
      );
      if (clamped === activeIndex) return;
      const nextKey = indexToKey(clamped);
      setTabKey(nextKey);
      const newPage = Math.floor(clamped / 3);
      if (newPage !== pageIdx) setPageIdx(newPage);
    },
    [activeIndex, indexToKey, pageIdx, ALL_TABS.length]
  );

  // swipe để đổi tab
  const swipeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let down = false;
    let axis: "x" | "y" | null = null;
    const AXIS_LOCK = 8;
    const SNAP_RATIO = 0.25;
    const MIN_PX = 18;

    const start = (x: number, y: number) => {
      down = true;
      axis = null;
      startX = x;
      startY = y;
    };
    const move = (x: number, y: number) => {
      if (!down) return;
      const dx = x - startX;
      const dy = y - startY;
      if (!axis) {
        if (Math.abs(dx) > AXIS_LOCK) axis = "x";
        else if (Math.abs(dy) > AXIS_LOCK) axis = "y";
      }
      if (axis === "y") return;
    };
    const end = (x: number) => {
      if (!down) return;
      down = false;
      const dx = x - startX;
      if (Math.abs(dx) < MIN_PX) return;
      const viewport = el.parentElement as HTMLElement | null;
      const width = viewport?.clientWidth || el.clientWidth || 1;
      const progress = dx / width;
      if (progress <= -SNAP_RATIO) setIndex(activeIndex + 1);
      else if (progress >= SNAP_RATIO) setIndex(activeIndex - 1);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      start(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) =>
      move(e.clientX, e.clientY);
    const onPointerUp = (e: PointerEvent) => {
      (e.currentTarget as Element).releasePointerCapture?.(
        e.pointerId
      );
      end(e.clientX);
    };

    el.addEventListener("pointerdown", onPointerDown, {
      passive: true,
    } as any);
    el.addEventListener("pointermove", onPointerMove, {
      passive: true,
    } as any);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, [activeIndex, setIndex]);

   // khi hoàn thành nhiệm vụ
const handleCompleteTask = (task: TaskItem) => {
  setCompletedIds((prev) => {
    if (prev.has(task.id)) return prev;
    const next = new Set(prev);
    next.add(task.id);

    setProgress((p) => Math.min(100, p + task.progressStep));
    return next;
  });
};
const selectTab = (s: TabKey) => {
  setTabKey(s);

  const inPage0 = TAB_PAGES[0].some((t) => t.key === s);
  const inPage1 = TAB_PAGES[1].some((t) => t.key === s);

  let newPage = pageIdx;
  if (inPage0 && !inPage1) newPage = 0;
  else if (inPage1 && !inPage0) newPage = 1;
  // nếu có ở cả 2 page (seo) => giữ nguyên pageIdx

  if (newPage !== pageIdx) setPageIdx(newPage);

  tabRefs.current[s]?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
};

useEffect(() => {
  tabRefs.current[tabKey]?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
}, [tabKey]);


   

  // 👉 Hàm đi tới màn “làm nhiệm vụ”
  const handleStartTask = (item: TaskItem) => {
    // tuỳ bạn sửa path, hiện tại dùng query để sau đọc được id + tab
    router.push(`/tasks?tab=${item.tab}&id=${item.id}`);
  };
const isIdle = todayIncome === 0 && progress === 0;


 return (
    <>
      <Header
        title="Cộng đồng"
        showBack
        noLine
        centerTitle
        backNoBorder
        forceFallback
      />

      <PageContainer className="space-y-md">
     

       <RewardSummaryCard
  todayIncome={todayIncome}
  progress={progress}
  currentMilestone={currentMilestone}
  dimmed={showRewardSheet}
  onOpen={() => setShowRewardSheet(true)}
/>

<RewardProgressSheet
  show={showRewardSheet}
  sheetOpen={sheetOpen}
  onClose={closeRewardSheet}
  progress={progress}
/>



{/* TABS */}
<div className="overflow-x-auto snap-x snap-mandatory [-webkit-overflow-scrolling:touch] pl-1 pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
  <div className="inline-flex gap-2 min-w-max">
    {(["click", "video", "seo", "nc", "qc"] as TabKey[]).map((s) => {
      const count = ALL_TASKS.filter((t) => t.tab === s).length;
      const selected = tabKey === s;

      const label = {
        click: "Click ads",
        video: "Xem video",
        seo: "SEO",
        nc: "NC",
        qc: "QC",
      }[s];

      return (
        <button
          key={s}
          ref={(el) => {
            tabRefs.current[s] = el;
          }}
          type="button"
          onClick={() => selectTab(s)}
          className={[
            "snap-start shrink-0 h-9 px-4 rounded-full whitespace-nowrap border transition-colors",
            "text-[14px] inline-flex items-center gap-1",
            selected
              ? "bg-[#FFF6EA] border-[#F6C48A] text-[#111827] font-semibold"
              : "bg-white border-[#F3F4F6] text-[#6B7280]",
          ].join(" ")}
        >
          <span>{label}</span>
          <span className="text-[12px] text-[#9CA3AF]">({count})</span>
        </button>
      );
    })}
  </div>
</div>



        {/* DANH SÁCH NHIỆM VỤ – style giống Trang chủ (không khung card) */}
        <div
          ref={swipeRef}
          className="space-y-sm select-none touch-pan-y"
        >
          {tasksForTab.map((item) => {
            const done = completedIds.has(item.id);
            return (
          <div
  key={item.id}
  className="flex items-center justify-between px-md py-3"
>

                <div className="flex items-center gap-sm">
                  {/* ô vuông #D9D9D9 — 32px bo 10px (đổi màu khi done) */}
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(item)}
                    disabled={done}
                    aria-label={
                      done
                        ? `Đã hoàn thành ${item.title}`
                        : `Đánh dấu hoàn thành ${item.title}`
                    }
                    className="relative inline-flex items-center"
                  >
                    <span
                      className={clsx(
                        "block w-8 h-8 rounded-[10px] grid place-items-center transition",
                        done ? "bg-[#2E7D32]" : "bg-[#D9D9D9] opacity-80"
                      )}
                    >
                      {done && (
                        <svg
                          width="16"
                          height="12"
                          viewBox="0 0 16 12"
                          fill="none"
                        >
                          <path
                            d="M1.5 6.5 5.5 10.5 14.5 1.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </button>

                  <div>
                    <div className="text-body">
                      {item.title}{" "}
                      <span className="text-caption text-text-muted">
                        {item.progressLabel}
                      </span>
                    </div>
                    <div className="text-body font-semibold text-[color:#2E7D32]">
                      +{item.bonus.toLocaleString()}đ
                    </div>
                  </div>
                </div>

{/* nút "Làm" – y hệt trang chủ */}
<Link
  href={!done ? "/tasks/guide" : "#"}
  aria-label={done ? "Làm lại nhiệm vụ" : "Làm nhiệm vụ"}
  onClick={(e) => {
    if (done) {
      e.preventDefault();
      handleStartTask(item);
    }
  }}
>
<Button
  variant="soft"
  className="
    w-[74px] h-10
    rounded-full
    text-[14px] leading-[18px] font-semibold
    bg-[#FFF3E6]
    text-[#F2994A]
    border border-[#FFE2C7]
    shadow-none
  "
>
  {done ? "Làm lại" : "Làm"}
</Button>

</Link>


              </div>
            );
          })}

          {tasksForTab.length === 0 && (
            <div className="text-center text-caption text-text-muted py-md">
              Chưa có nhiệm vụ cho mục này.
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}

/* ---------- COMPONENT VÒNG TRÒN % ---------- */

function ProgressCircle({
  value,
  size = 120,
  stroke = 10,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const [displayValue, setDisplayValue] = useState(value);
  const latestTarget = useRef(value);

  useEffect(() => {
    const start = latestTarget.current;
    const end = value;
    const diff = end - start;
    const duration = 800;
    const startTime = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const current = start + diff * t;
      setDisplayValue(current);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    latestTarget.current = value;

    return () => cancelAnimationFrame(frame);
  }, [value]);

  const clamped = Math.max(0, Math.min(100, displayValue));
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg width={size} height={size} className="block">
      <circle
        stroke="#FFE9D6"
        fill="transparent"
        strokeWidth={stroke}
        cx={size / 2}
        cy={size / 2}
        r={radius}
      />
      <circle
        stroke="#F2994A"
        fill="transparent"
        strokeWidth={stroke}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-[#F2994A] font-semibold"
        style={{ fontSize: size * 0.22 }}
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}

/* ---------- TOAST MỐC THƯỞNG 85% / 95% ---------- */

function MilestoneToast({
  active,
  onHidden,
}: {
  active: Milestone | null;
  onHidden: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    setVisible(true);

    const hideTimer = setTimeout(() => setVisible(false), 2000);
    const cleanupTimer = setTimeout(() => onHidden(), 2300);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(cleanupTimer);
    };
  }, [active, onHidden]);

  if (!active) return null;

  return (
    <div
      className={clsx(
        "pointer-events-none absolute right-0 -top-5 transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2"
      )}
    >
      <div className="flex items-center gap-sm rounded-[16px] bg-white px-md py-sm shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="w-6 h-6 rounded-[6px] bg-[#E0E0E0]" />
        <div className="text-left">
          <div className="text-body font-semibold">
            +{active.reward.toLocaleString()}đ
          </div>
          <div className="text-caption text-[#828282]">
            Đã đạt mốc {active.threshold}%
          </div>
        </div>
      </div>
    </div>
  );
}
