"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Toast = { id: string; text: string };
const ToastCtx = createContext<{ push: (text: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = (text: string) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, text }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2500);
  };

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-2 z-[999]">
        {items.map((t) => (
          <div key={t.id} className="px-3 py-2 rounded-md bg-black/80 text-white shadow">{t.text}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
