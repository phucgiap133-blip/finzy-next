"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  banks?: string[];
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
};

export default function BankPicker({
  banks = [],
  value = "",
  onChange = () => {},
  placeholder = "Chọn ngân hàng",
  searchPlaceholder = "Tìm tên hoặc mã ngân hàng…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return banks;
    return banks.filter((b) => b.toLowerCase().includes(s));
  }, [banks, q]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [q, open]);

  const commit = (item: string) => {
    onChange(item);
    setOpen(false);
    setQ("");
    inputRef.current?.focus();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
      const idx = Math.min(active + 1, filtered.length - 1);
      listRef.current?.children?.[idx]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      const idx = Math.max(active - 1, 0);
      listRef.current?.children?.[idx]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-control border border-border px-md py-sm text-left bg-white"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value || placeholder}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-[12px] border border-border bg-white shadow-md">
          <div className="p-sm border-b border-border">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="w-full px-md py-sm rounded-control border border-border"
              autoFocus
            />
          </div>

          <div ref={listRef} role="listbox" className="max-h-64 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-md py-sm text-sm text-text-muted">Không tìm thấy ngân hàng</div>
            ) : (
              filtered.map((item, i) => (
                <button
                  key={item}
                  role="option"
                  aria-selected={value === item}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(item)}
                  className={`w-full text-left px-md py-sm hover:bg-[color:#FAFAFA] ${i === active ? "bg-[color:#FAFAFA]" : ""}`}
                >
                  {item}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
