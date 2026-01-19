"use client";
import { useMemo } from "react";
import vi from "@/i18n/vi";

type Dict = Record<string, string>;
const DICTS: Record<string, Dict> = { vi };

export function useI18n(locale = "vi") {
  const dict = useMemo(() => DICTS[locale] ?? vi, [locale]);
  const t = (key: string, fallback?: string) => dict[key] ?? fallback ?? key;
  return { t, locale };
}
