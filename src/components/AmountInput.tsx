"use client";
import { useEffect, useMemo, useState } from "react";

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const formatVND = (v: string | number) => {
  const n = typeof v === "string" ? Number(onlyDigits(v)) : v || 0;
  return n.toLocaleString("vi-VN");
};

type AmountInputProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  fallbackSuggestions?: number[];
  onBlur?: () => void;
};

export default function AmountInput({
  value,
  onChange,
  min = 1_000,
  max = 5_000_000,
  fallbackSuggestions = [50_000, 100_000, 200_000],
  onBlur,
}: AmountInputProps) {
  const [raw, setRaw] = useState<string>(value ? String(value) : "");
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    if (!hasEdited && !value) setRaw("");
  }, [value, hasEdited]);

  const display = useMemo(() => formatVND(raw), [raw]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = onlyDigits(e.target.value);
    setHasEdited(true);
    setRaw(v);
    onChange(v ? Number(v) : 0);
  };

  const numericRaw = useMemo(() => Number(onlyDigits(raw)) || 0, [raw]);

  const suggestions = useMemo(() => {
    if (!numericRaw)
      return fallbackSuggestions.filter((v) => v >= min && v <= max).slice(0, 3);
    const bases = [10_000, 100_000, 1_000_000];
    return bases.map((f) => numericRaw * f).filter((v) => v >= min && v <= max);
  }, [numericRaw, min, max, fallbackSuggestions]);

  const pickSuggestion = (val: number) => {
    let n = Math.round(val / 1000) * 1000;
    n = Math.max(min, Math.min(max, n));
    setHasEdited(true);
    setRaw(String(n));
    onChange(n);
  };

  const handleBlur = () => {
    let n = Number(onlyDigits(raw));
    if (!n) {
      setRaw("");
      onChange(0);
      onBlur?.();
      return;
    }
    n = Math.round(n / 1000) * 1000;
    n = Math.max(min, Math.min(max, n));
    setRaw(String(n));
    onChange(n);
    onBlur?.();
  };

  return (
    <div className="space-y-sm">
      <div className="grid grid-cols-3 gap-sm">
        {suggestions.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => pickSuggestion(v)}
            className="rounded-control border border-border px-md py-sm text-center hover:bg-[color:#FAFAFA]"
          >
            {formatVND(v)}đ
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleInput}
          onBlur={handleBlur}
          placeholder="Nhập số tiền muốn rút"
          className="w-full border border-border rounded-control px-md py-sm pr-14 text-body
                     [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-muted">VND</span>
      </div>
    </div>
  );
}
