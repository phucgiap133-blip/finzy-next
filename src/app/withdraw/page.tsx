// src/app/withdraw/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import { api } from "@/lib/api";

/* Helpers */
const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const formatVND = (v: string | number) => {
  const n = typeof v === "string" ? Number(onlyDigits(v)) : v || 0;
  return n.toLocaleString("vi-VN");
};

type BankInfo = {
  id: string;
  bankName: string;
  last4: string;
  holder: string;
} | null;

export default function WithdrawPage() {
  // đọc nguồn điều hướng
  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // "home" | "account" | null

  const [balance, setBalance] = useState<number>(0);
  const [minWithdraw] = useState<number>(1_000);
  const [maxWithdraw] = useState<number>(5_000_000);
  const [bank, setBank] = useState<BankInfo>(null);

  const [amountRaw, setAmountRaw] = useState<string>("");
  const amount = Number(onlyDigits(amountRaw) || 0);
  const amountDisplay = useMemo(() => formatVND(amountRaw), [amountRaw]);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [picking, setPicking] = useState(false); // đang chọn gợi ý

  useEffect(() => {
    (async () => {
      try {
        const { wallet } = await api.wallet.get();
        setBalance(wallet.balance);

        const banks = await api.banks.get();
        const selected =
          banks.accounts.find((a: any) => a.id === banks.selectedId) ||
          banks.accounts[0] ||
          null;
        if (selected) setBank(selected);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // gợi ý: raw × 10k/100k/1M trong min-max
  const dynamicSuggestions = useMemo(() => {
    const n = Number(onlyDigits(amountRaw)) || 0;
    if (!n) return [50_000, 100_000, 200_000];
    const bases = [10_000, 100_000, 1_000_000];
    return bases
      .map((f) => n * f)
      .filter((v) => v >= minWithdraw && v <= maxWithdraw);
  }, [amountRaw, minWithdraw, maxWithdraw]);

  const isInvalid = useMemo(() => {
    if (!bank) return true;
    if (amount <= 0) return true;
    if (amount < minWithdraw) return true;
    if (amount > maxWithdraw) return true;
    if (amount % 1000 !== 0) return true;
    return false;
  }, [bank, amount, minWithdraw, maxWithdraw]);

  const submit = async () => {
    if (!bank) return setMsg("Chưa liên kết ngân hàng.");
    if (amount <= 0) return setMsg("Nhập số tiền hợp lệ.");
    if (amount < minWithdraw)
      return setMsg(`Tối thiểu ${minWithdraw.toLocaleString("vi-VN")}đ.`);
    if (amount > maxWithdraw)
      return setMsg(`Tối đa ${maxWithdraw.toLocaleString("vi-VN")}đ/ngày.`);
    if (amount % 1000 !== 0) return setMsg("Số tiền phải là bội số 1.000đ.");

    setBusy(true);
    setMsg("");

    try {
      await api.withdraw.create({ amount, methodId: bank?.id || "default" });
      setMsg("Đã tạo lệnh rút thành công.");
      setBalance((b) => Math.max(0, b - amount));
      setAmountRaw("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Lỗi rút tiền");
    } finally {
      setBusy(false);
    }
  };

  // làm tròn khi blur (nhưng bỏ qua lúc đang pick gợi ý)
  const handleBlur = () => {
    if (picking) return;
    let n = Number(onlyDigits(amountRaw));
    if (!n) {
      setAmountRaw("");
      return;
    }
    n = Math.round(n / 1000) * 1000;
    n = Math.max(minWithdraw, Math.min(maxWithdraw, n));
    setAmountRaw(String(n));
  };

  const setQuick = (v: number) => {
    if (v < minWithdraw || v > maxWithdraw) return;
    const clamped = Math.max(minWithdraw, Math.min(maxWithdraw, v));
    setAmountRaw(String(clamped));
    setMsg("");
  };

  return (
    <>
      {/* Back theo nguồn: từ home về '/', còn lại về '/account' */}
      <Header
        title="Rút tiền"
        showBack
        noLine
        backFallback={from === "home" ? "/" : "/account"}
        forceFallback={from !== "home"} // ép fallback khi không từ home (VD: từ account overlay)
      />

      <PageContainer className="space-y-md">
        <Card>
          {/* Số dư */}
          <div className="text-center mb-md">
            <div className="text-stat font-bold">
              {balance.toLocaleString("vi-VN")}đ
            </div>
            <div className="text-caption text-[color:#2E7D32]">
              Mức rút tối thiểu {minWithdraw.toLocaleString("vi-VN")}đ
            </div>
          </div>

          {/* Lịch sử */}
          <div className="flex gap-sm mb-md">
            <Link
              href="/my-withdrawals/rut"
              className="flex-1 px-md py-sm rounded-control border border-border text-center text-body font-medium"
            >
              Lịch sử rút
            </Link>
            <Link
              href="/my-withdrawals/hoahong"
              className="flex-1 px-md py-sm rounded-control border border-border text-center text-body font-medium"
            >
              Lịch sử hoa hồng
            </Link>
          </div>

          {/* Tài khoản nhận */}
          <Link
            href="/banks"
            className="block rounded-[12px] border border-border p-md bg-white mt-md hover:shadow-sm transition"
          >
            {bank ? (
              <>
                <div className="text-body font-medium">
                  {bank.bankName} *****{bank.last4}
                </div>
                <div className="text-caption text-text-muted">
                  {bank.holder}
                </div>
              </>
            ) : (
              <div className="text-body font-medium">+ Liên kết ngân hàng</div>
            )}
          </Link>

          {/* Gợi ý nhanh */}
          <div className="flex gap-sm mb-md mt-md">
            {dynamicSuggestions.map((amt) => (
              <button
                key={amt}
                onMouseDown={(e) => {
                  e.preventDefault(); // chạy trước blur
                  setPicking(true);
                  setQuick(amt);
                  setTimeout(() => setPicking(false), 0);
                }}
                onClick={(e) => e.preventDefault()}
                className="flex-1 px-md py-sm rounded-control border border-border text-body hover:bg-[color:#FAFAFA]"
              >
                {amt.toLocaleString("vi-VN")}đ
              </button>
            ))}
          </div>

          {/* Ô nhập tiền */}
          <div className="relative mb-md">
            <input
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={(e) => {
                setAmountRaw(onlyDigits(e.target.value));
                setMsg("");
              }}
              onBlur={handleBlur}
              placeholder="Nhập số tiền muốn rút"
              className="w-full px-md py-sm pr-14 rounded-control border border-border text-body
                         [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Số tiền rút"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-muted">
              VND
            </span>
          </div>

          <Button disabled={busy || isInvalid} onClick={submit}>
            {busy ? "Đang xử lý…" : "Rút tiền"}
          </Button>

          {msg && (
            <div
              className="mt-sm text-caption"
              style={{ color: msg.startsWith("Lỗi") ? "#C62828" : "#2E7D32" }}
            >
              {msg}
            </div>
          )}

          <ul className="mt-md text-caption text-text-muted list-disc list-inside space-y-xs">
            <li>Phí dịch vụ: 0đ</li>
            <li>Giới hạn: tối thiểu 1.000đ, tối đa 5.000.000đ/ngày</li>
            <li>Bội số 1.000đ</li>
          </ul>
        </Card>
      </PageContainer>
    </>
  );
}
