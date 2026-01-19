"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export type TabDef = { key: string; label: string };

type SwipePagerProps = {
  tabs: TabDef[];
  initialIndex?: number;
  renderPage: (index: number, key: string) => React.ReactNode;
  className?: string;
  tabClassName?: string;
};

export default function SwipePager({
  tabs,
  initialIndex = 0,
  renderPage,
  className = "",
  tabClassName = "",
}: SwipePagerProps) {
  const safeInitialIndex = Math.min(Math.max(0, initialIndex), Math.max(0, tabs.length - 1));
  const [selectedKey, setSelectedKey] = useState<string>(() => tabs[safeInitialIndex]?.key ?? tabs[0]?.key);

  useEffect(() => {
    if (!tabs.length) return;
    const exists = tabs.some(t => t.key === selectedKey);
    if (!exists) {
      // Nếu tab đã chọn không còn tồn tại, quay về tab mặc định
      const fallbackKey = tabs[Math.min(safeInitialIndex, tabs.length - 1)]?.key ?? tabs[0].key;
      setSelectedKey(fallbackKey);
    }
  }, [tabs, selectedKey, safeInitialIndex, setSelectedKey]); // ✅ Thêm dependencies

  const index = useMemo(() => {
    const i = tabs.findIndex(t => t.key === selectedKey);
    return i >= 0 ? i : 0;
  }, [tabs, selectedKey]);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const SNAP_RATIO = 0.25;
  const AXIS_LOCK = 8;
  const EASE = "cubic-bezier(.22,.61,.36,1)";

  const setIndexSafe = React.useCallback(
    (i: number) => {
      const clamped = Math.min(Math.max(0, i), tabs.length - 1);
      const key = tabs[clamped]?.key;
      if (key) setSelectedKey(key);
    },
    [tabs, setSelectedKey] // ✅ Bỏ tabs.length, chỉ giữ tabs và setSelectedKey
  );
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let startX = 0, startY = 0;
    let down = false;
    let axis: "x" | "y" | null = null;

    const start = (x: number, y: number) => {
      down = true; axis = null;
      setDragging(true);
      setAnimating(false);
      setDragX(0);
      startX = x; startY = y;
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

      setDragX(dx);
    };
    const end = (x: number) => {
      if (!down) return;
      down = false;
      setDragging(false);

      const dx = x - startX;
      const viewport = el.parentElement as HTMLElement | null;
      const width = viewport?.clientWidth || el.clientWidth || 1;
      const progress = dx / width;

      let next = index;
      if (progress <= -SNAP_RATIO) next = Math.min(index + 1, tabs.length - 1);
      else if (progress >= SNAP_RATIO) next = Math.max(index - 1, 0);

      if (next !== index) {
        setAnimating(true);
        setDragX((next > index ? -1 : 1) * width * 0.6);
        setTimeout(() => {
          setIndexSafe(next);
          setDragX(0);
          setTimeout(() => setAnimating(false), 260);
        }, 40);
      } else {
        setAnimating(true);
        setDragX(Math.sign(dx || 1) * 18);
        setTimeout(() => {
          setDragX(0);
          setTimeout(() => setAnimating(false), 200);
        }, 40);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      start(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onPointerUp = (e: PointerEvent) => {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
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
  }, [index, tabs.length, setIndexSafe, SNAP_RATIO, AXIS_LOCK]); // <--- Đảm bảo mảng dependencies này

  const indicatorWidthPct = useMemo(() => (tabs.length ? 100 / tabs.length : 100), [tabs.length]);
  const indicatorOffsetPct = useMemo(() => (tabs.length ? (index * 100) / tabs.length : 0), [index, tabs.length]);

  return (
    <div className={clsx("w-full", className)}>
      <div className="rounded-full border border-border bg-[color:#F5EFE8] px-1 py-1 select-none">
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${tabs.length || 1}, minmax(0, 1fr))` }}>
          <div
            className="absolute top-0 bottom-0 rounded-full bg-[var(--color-primary,#F2994A)] transition-[transform,width] duration-200"
            style={{ width: `${indicatorWidthPct}%`, transform: `translateX(${indicatorOffsetPct}%)`, zIndex: 0 }}
          />
          {tabs.map((t, i) => {
            const selected = i === index;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setIndexSafe(i)}
                className={clsx("relative z-10 h-9 w-full rounded-full text-btn transition",
                  selected ? "text-white font-semibold" : "text-text-muted", tabClassName)}
                aria-selected={selected}
                role="tab"
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-2xl border border-border bg-white" data-pager-viewport>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent z-10" />

        <div ref={wrapRef} className="select-none touch-pan-y">
          <div
            className="flex will-change-transform"
            style={{
              width: `${Math.max(1, tabs.length) * 100}%`,
              transform: `translateX(calc(-${index} * 100% + ${dragX}px))`,
              transition: dragging ? "none" : `transform ${animating ? 260 : 200}ms ${EASE}`,
            }}
          >
            {tabs.map((t, i) => (
              <section key={`panel-${t.key}`} style={{ minWidth: "100%" }} className="p-4" role="tabpanel">
                {renderPage(i, t.key)}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
