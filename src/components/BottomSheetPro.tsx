"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string; // default 80vh
};

export default function BottomSheetPro({
  open,
  onClose,
  title,
  children,
  maxHeight = "80vh",
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragging, setDragging] = useState(false);

  // 🔒 lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ⌨ ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // ===== DRAG =====
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !sheetRef.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      currentY.current = delta;
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const onTouchEnd = () => {
    if (!sheetRef.current) return;
    setDragging(false);

    // kéo > 120px → đóng
    if (currentY.current > 120) {
      onClose();
    } else {
      sheetRef.current.style.transform = "translateY(0)";
    }
    currentY.current = 0;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{ maxHeight }}
        className={clsx(
          "absolute bottom-0 left-0 right-0",
          "bg-white rounded-t-[24px]",
          "flex flex-col",
          "animate-sheet-up"
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-[4px] w-10 rounded-full bg-[#D1D5DB]" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-[16px] pb-[12px] text-center">
            <div className="text-[16px] font-semibold text-[#111827]">
              {title}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-[16px] pb-[24px] text-body">
          {children}
        </div>
      </div>
    </div>
  );
}
