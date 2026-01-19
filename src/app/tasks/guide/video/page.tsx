"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Header from "@/components/Header";
import Button from "@/components/Button";

const GUIDE_KEY = "finzy_seen_guide_click_ad_v1";

export default function TaskGuideVideoPage() {
  const router = useRouter();

  const HALF_H = "56vh";
  const FULL_H = "92vh";

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);

  const startYRef = useRef(0);
  const draggingRef = useRef(false);

  // ===== Video + custom controls =====
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  const barRef = useRef<HTMLDivElement | null>(null);
  const draggingSeekRef = useRef(false);

  const fmt = (n: number) => (Number.isFinite(n) ? n : 0);

  const markSeen = () => {
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const openFullscreen = async () => {
    const el = containerRef.current;
    const v = videoRef.current;
    if (!el || !v) return;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
        return;
      }
      if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
        return;
      }
      // iPhone fallback: fullscreen video only
      if ((v as any).webkitEnterFullscreen) {
        (v as any).webkitEnterFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seekByClientX = (clientX: number) => {
    const v = videoRef.current;
    const el = barRef.current;
    if (!v || !el || !duration) return;

    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - r.left, 0), r.width);
    const t = (x / r.width) * duration;

    v.currentTime = t;
    setCurrent(t);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => setDuration(fmt(v.duration));
    const onTime = () => !draggingSeekRef.current && setCurrent(fmt(v.currentTime));
    const onVol = () => setMuted(!!v.muted);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("volumechange", onVol);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);

    setMuted(!!v.muted);
    setPlaying(!v.paused);

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("volumechange", onVol);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const close = () => {
    markSeen(); // ✅ chốt: lần sau không auto mở nữa
    setOpen(false);
    setTimeout(() => router.replace("/tasks/guide"), 200);
  };

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

    if (dragY < -60) setExpanded(true);
    else if (dragY > 110) {
      if (expanded) setExpanded(false);
      else close();
    }
    setDragY(0);
  };

  return (
    <>
      <Header title="Nhiệm vụ" showBack noLine backFallback="/tasks/guide" />

      {/* Backdrop mờ nhẹ */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
      />

      {/* Sheet */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 w-full bg-white rounded-t-2xl px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] flex flex-col",
          "shadow-[0_-12px_30px_rgba(0,0,0,0.12)] transition-[transform,height] duration-200 ease-out"
        )}
        style={{
          height: expanded ? FULL_H : HALF_H,
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag zone */}
        <div
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          className="select-none"
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-[#E5E7EB]" />
          <div className="relative mt-3 flex items-center justify-center">
            <div className="text-body font-semibold text-center">Hướng dẫn</div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-[#F3F4F6] grid place-items-center"
              onClick={close}
              aria-label="Đóng"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto">
          {/* Video container */}
          <div
            ref={containerRef}
            className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              playsInline
              preload="metadata"
              src="/videos/guide.mp4"
            />

            {/* Play overlay khi pause */}
            {!playing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="absolute inset-0 grid place-items-center"
                aria-label="Phát video"
              >
                <span className="h-14 w-14 rounded-full bg-white/70 grid place-items-center">
                  <span className="translate-x-[1px] text-black text-xl">▶</span>
                </span>
              </button>
            )}

            {/* Control bar (loa + progress + 4 chấm) */}
            <div
              className="absolute left-3 right-3 bottom-3"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="h-11 rounded-[16px] bg-black/90 px-3 flex items-center gap-3">
                {/* Volume */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10"
                  aria-label={muted ? "Bật âm" : "Tắt âm"}
                >
                  {!muted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M11 5L6 9H3v6h3l5 4V5Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.5 8.5a4 4 0 0 1 0 7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M11 5L6 9H3v6h3l5 4V5Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 9l5 6M21 9l-5 6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Progress */}
                <div
                  ref={barRef}
                  className="relative flex-1 h-2 rounded-full bg-white/25"
                  onPointerDown={(e) => {
                    draggingSeekRef.current = true;
                    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                    seekByClientX(e.clientX);
                  }}
                  onPointerMove={(e) => {
                    if (!draggingSeekRef.current) return;
                    seekByClientX(e.clientX);
                  }}
                  onPointerUp={(e) => {
                    draggingSeekRef.current = false;
                    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
                  }}
                  onPointerCancel={() => (draggingSeekRef.current = false)}
                  role="slider"
                  aria-label="Tiến trình video"
                >
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full bg-white"
                    style={{
                      width: duration ? `${Math.min(100, (current / duration) * 100)}%` : "0%",
                    }}
                  />
                </div>

                {/* Fullscreen icon = 4 chấm */}
                <button
                  type="button"
                  onClick={openFullscreen}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10"
                  aria-label="Phóng to"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="8" cy="8" r="2.5" fill="white" />
                    <circle cx="16" cy="8" r="2.5" fill="white" />
                    <circle cx="8" cy="16" r="2.5" fill="white" />
                    <circle cx="16" cy="16" r="2.5" fill="white" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            className="mt-4 w-full h-12 rounded-full bg-[#F2994A] text-white font-semibold"
            onClick={close}
          >
            ĐÃ HIỂU – TIẾP TỤC
          </Button>
        </div>
      </div>
    </>
  );
}
