"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
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
    { key: "seo", label: "Seo" },
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

  const setPageAndResetTab = useCallback((newPageIdx: number) => {
    setPageIdx(newPageIdx);
    setTabKey(TAB_PAGES[newPageIdx][0].key);
  }, []);

  const gotoNextPage = useCallback(() => {
    setPageAndResetTab((pageIdx + 1) % TAB_PAGES.length);
  }, [pageIdx, setPageAndResetTab]);

  const gotoPrevPage = useCallback(() => {
    setPageAndResetTab((pageIdx - 1 + TAB_PAGES.length) % TAB_PAGES.length);
  }, [pageIdx, setPageAndResetTab]);

  const tabsWrapRef = useRef<HTMLDivElement | null>(null);
  const [dragX, setDragX] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);
  const THRESHOLD = 60;

  useEffect(() => {
    const el = tabsWrapRef.current;
    if (!el) return;

    let startX = 0;
    let isDown = false;

    const start = (x: number) => {
      isDown = true;
      setDragging(true);
      startX = x;
    };
    const move = (x: number) => {
      if (!isDown) return;
      setDragX(x - startX);
    };
    const end = (x: number) => {
      if (!isDown) return;
      isDown = false;
      const dx = x - startX;

      if (dx <= -THRESHOLD) {
        setDragX(-80);
        gotoNextPage();
      } else if (dx >= THRESHOLD) {
        setDragX(80);
        gotoPrevPage();
      }
      requestAnimationFrame(() => {
        setDragging(false);
        setDragX(0);
      });
    };

    const onTouchStart = (e: TouchEvent) => start(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX);
    const onTouchEnd = (e: TouchEvent) => end(e.changedTouches[0].clientX);

    const onMouseDown = (e: MouseEvent) => start(e.clientX);
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onMouseUp = (e: MouseEvent) => end(e.clientX);

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);

      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [gotoNextPage, gotoPrevPage]);

  return (
    <>
      <Header title="Tất cả nhiệm vụ" showBack noLine backFallback="/" />

      <PageContainer className="space-y-md">
        <Card>
          <div className="text-caption text-text-muted">Mốc 85%</div>
          <div className="text-stat font-bold">+10.000đ</div>
          <div className="text-caption text-text-muted">95% • +20.000đ</div>
        </Card>

        <div className="relative">
          <div
            ref={tabsWrapRef}
            className={clsx("rounded-full p-1 pr-8 bg-[color:#F5EFE8] grid grid-cols-3 gap-1 select-none", dragging ? "cursor-grabbing" : "cursor-grab")}
            style={{ transform: `translateX(${dragX}px)`, transition: dragging ? "none" : "transform 200ms ease" }}
          >
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
                    selected ? "bg-[var(--color-primary,#F2994A)] text-white font-semibold" : "text-text-muted"
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
              aria-label="Sang trang tab kế tiếp"
            >
              ›
            </button>
          ) : (
            <button
              type="button"
              onClick={gotoPrevPage}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border border-border bg-white grid place-items-center text-caption text-text-muted"
              aria-label="Về trang tab trước"
            >
              ‹
            </button>
          )}
        </div>

        <div className="space-y-sm">
          {list.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-control border border-border p-md bg-bg-card">
              <div className="flex items-center gap-sm">
                <input type="checkbox" className="w-5 h-5" aria-label={`Đánh dấu ${item.title}`} />
                <div>
                  <div className="text-body font-medium">
                    {item.title} <span className="text-caption text-text-muted">{item.progress}</span>
                  </div>
                  <div className="text-body font-medium text-[color:#2E7D32]">+{item.bonus.toLocaleString()}đ</div>
                </div>
              </div>
              <Link href={`/tasks/guide?type=${tabKey}&id=${item.id}`} className="flex-shrink-0">
                <Button>Làm</Button>
              </Link>
            </div>
          ))}
          {list.length === 0 && <div className="text-center text-caption text-text-muted py-md">Chưa có nhiệm vụ cho mục này.</div>}
        </div>
      </PageContainer>
    </>
  );
}
