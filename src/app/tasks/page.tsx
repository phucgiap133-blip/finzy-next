"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Card from "../../components/Card";
import Button from "../../components/Button";
import clsx from "clsx";
import PageContainer from "../../components/PageContainer";

type TabKey = "click" | "video" | "seo" | "nc" | "qc";

const TAB_PAGES: { key: TabKey; label: string }[][] = [
  [
    { key: "click", label: "Click ads" },
    { key: "video", label: "Xem video" },
    { key: "seo", label: "Seo" },
  ],
  [
    { key: "nc", label: "NC" },
    { key: "qc", label: "QC" },
    { key: "seo", label: "Seo" }, // ⬅️ trùng key với trang 1, nhưng giờ không sao
  ],
];

type TaskItem = { id: number; title: string; bonus: number; progress: string };

const TASKS: Record<TabKey, TaskItem[]> = {
  click: [
    { id: 1, title: "Click ads", bonus: 5000, progress: "5%" },
    { id: 2, title: "Click ads", bonus: 5000, progress: "5%" },
  ],
  video: [{ id: 11, title: "Xem video", bonus: 5000, progress: "5%" }],
  seo: [{ id: 21, title: "Seo nhiệm vụ", bonus: 5000, progress: "5%" }],
  nc: [{ id: 31, title: "NC nhiệm vụ", bonus: 5000, progress: "5%" }],
  qc: [{ id: 41, title: "QC nhiệm vụ", bonus: 5000, progress: "5%" }],
};

export default function TasksPage() {
  const [pageIdx, setPageIdx] = useState<number>(0);
  const [tabKey, setTabKey] = useState<TabKey>(TAB_PAGES[0][0].key);

  const currentTabs = TAB_PAGES[pageIdx];
  const list = useMemo(() => TASKS[tabKey] ?? [], [tabKey]);

  // Gộp toàn bộ tab (6 cái)
  const ALL_TABS = useMemo(() => [...TAB_PAGES[0], ...TAB_PAGES[1]], []);

  // ❗ activeIndex KHÔNG dùng key nữa, mà là vị trí: page*3 + vị trí trong trang
  const activeIndex = useMemo(() => {
    const local = TAB_PAGES[pageIdx].findIndex(t => t.key === tabKey);
    return pageIdx * 3 + (local >= 0 ? local : 0);
  }, [pageIdx, tabKey]);

  const indexToKey = useCallback(
    (i: number) => (ALL_TABS[i]?.key ?? ALL_TABS[0].key) as TabKey,
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

  // Vuốt tuần tự 1→2→3→... và ngược lại
  const setIndex = useCallback(
    (nextIndex: number) => {
      const clamped = Math.min(Math.max(0, nextIndex), ALL_TABS.length - 1);
      if (clamped === activeIndex) return;

      const nextKey = indexToKey(clamped);
      setTabKey(nextKey);

      const newPage = Math.floor(clamped / 3);
      if (newPage !== pageIdx) setPageIdx(newPage);
    },
    [activeIndex, indexToKey, pageIdx, ALL_TABS.length]
  );

  // Gesture Pointer Events (phải→trái = next, trái→phải = prev)
  const swipeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;
    let startX = 0, startY = 0;
    let down = false;
    let axis: "x" | "y" | null = null;
    const AXIS_LOCK = 8;
    const SNAP_RATIO = 0.25;
    const MIN_PX = 18;

    const start = (x: number, y: number) => { down = true; axis = null; startX = x; startY = y; };
    const move  = (x: number, y: number) => {
      if (!down) return;
      const dx = x - startX, dy = y - startY;
      if (!axis) {
        if (Math.abs(dx) > AXIS_LOCK) axis = "x";
        else if (Math.abs(dy) > AXIS_LOCK) axis = "y";
      }
      if (axis === "y") return;
    };
    const end = (x: number) => {
      if (!down) return; down = false;
      const dx = x - startX;
      if (Math.abs(dx) < MIN_PX) return;

      const viewport = el.parentElement as HTMLElement | null;
      const width = viewport?.clientWidth || el.clientWidth || 1;
      const progress = dx / width;

      // Chuẩn hoá: phải→trái = next ; trái→phải = prev
      if (progress <= -SNAP_RATIO) setIndex(activeIndex + 1);
      else if (progress >= SNAP_RATIO) setIndex(activeIndex - 1);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      start(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onPointerUp   = (e: PointerEvent) => {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      end(e.clientX);
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: true });
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

  return (
    <>
      <Header title="Tất cả nhiệm vụ" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <Card>
          <div className="text-caption text-text-muted">Mốc 85%</div>
          <div className="text-stat font-bold">+10.000đ</div>
          <div className="text-caption text-text-muted">95% • +20.000đ</div>
        </Card>

        {/* Thanh tab 3-nút mỗi trang */}
        <div className="relative">
          <div className="rounded-full p-1 pr-8 bg-[color:#F5EFE8] grid grid-cols-3 gap-1">
            {currentTabs.map((t) => {
              const selected = tabKey === t.key;
              return (
                <button
                  key={`${t.key}-${pageIdx}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTabKey(t.key)}
                  className={clsx(
                    "h-9 w-full rounded-full text-btn transition",
                    selected
                      ? "bg-[var(--color-primary,#F2994A)] text-white font-semibold"
                      : "text-text-muted"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {pageIdx === 0 ? (
            <button
              type="button"
              onClick={gotoNextPage}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-border bg-white grid place-items-center text-caption text-text-muted"
            >
              ›
            </button>
          ) : (
            <button
              type="button"
              onClick={gotoPrevPage}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-border bg-white grid place-items-center text-caption text-text-muted"
            >
              ‹
            </button>
          )}
        </div>

        {/* Danh sách nhiệm vụ (vuốt ở đây để chuyển tab) */}
        <div ref={swipeRef} className="space-y-sm select-none touch-pan-y">
          {list.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-control border border-border p-md bg-bg-card"
            >
              <div className="flex items-center gap-sm">
                <input type="checkbox" className="w-5 h-5" />
                <div>
                  <div className="text-body font-medium">
                    {item.title}{" "}
                    <span className="text-caption text-text-muted">{item.progress}</span>
                  </div>
                  <div className="text-body font-medium text-[color:#2E7D32]">
                    +{item.bonus.toLocaleString()}đ
                  </div>
                </div>
              </div>
              <Link href={`/tasks/guide?type=${tabKey}&id=${item.id}`} className="flex-shrink-0">
                <Button>Bắt đầu</Button>
              </Link>
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center text-caption text-text-muted py-md">
              Chưa có nhiệm vụ cho mục này.
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
