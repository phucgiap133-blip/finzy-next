"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function BankPicker({
  banks = [],
  value = "",
  onChange = () => {},
  placeholder = "Chọn ngân hàng",
  searchPlaceholder = "Tìm tên hoặc mã ngân hàng…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return banks;
    return banks.filter((b) => b.toLowerCase().includes(s));
  }, [banks, q]);

  useEffect(() => {
    function onClickOutside(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [q, open]);

  const commit = (item) => {
    onChange(item);
    setOpen(false);
    setQ("");
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
      listRef.current?.children?.[Math.min(active + 1, filtered.length - 1)]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      listRef.current?.children?.[Math.max(active - 1, 0)]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Ô hiển thị giá trị + mở popover */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-control border border-border px-md py-sm text-left bg-white"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value || placeholder}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-[12px] border border-border bg-white shadow-md">
          {/* search */}
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

          {/* list */}
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
                  className={`w-full text-left px-md py-sm hover:bg-[color:#FAFAFA] ${
                    i === active ? "bg-[color:#FAFAFA]" : ""
                  }`}
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
