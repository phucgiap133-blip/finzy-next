"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageContainer from "../../components/PageContainer";
import { api } from "@/lib/api";

export default function WithdrawPage() {
  // dữ liệu ví + ngân hàng
  const [balance, setBalance] = useState(0);
  const [minWithdraw, setMinWithdraw] = useState(20000);
  const [bank, setBank] = useState(null); // giữ dữ liệu bank object

  // form
  const [amount, setAmount] = useState(""); // chuỗi rỗng hoặc số
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // nạp dữ liệu ban đầu
  useEffect(() => {
    (async () => {
      try {
        const { wallet } = await api.wallet.get();
        setBalance(wallet.balance);
        setMinWithdraw(20000);

        const banks = await api.banks.get();
        const selected =
          banks.accounts.find(a => a.id === banks.selectedId) || banks.accounts[0] || null;
        if (selected) setBank(selected);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const submit = async () => {
    if (!amount || amount <= 0) {
      setMsg("Nhập số tiền hợp lệ.");
      return;
    }
    if (amount < minWithdraw) {
      setMsg(`Tối thiểu ${minWithdraw.toLocaleString()}đ.`);
      return;
    }
    if (!bank) {
      setMsg("Chưa liên kết ngân hàng.");
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      // với mock: methodId có thể đặt tạm id ngân hàng
      await api.withdraw.create({
        amount,
        methodId: bank?.id || "default"
      });

      setMsg("Đã tạo lệnh rút thành công.");
      setBalance((b) => Math.max(0, b - amount));
      setAmount("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Lỗi rút tiền");
    } finally {
      setBusy(false);
    }
  };


  return (
    <>
      <Header title="Rút tiền" showBack noLine backFallback="/account" forceFallback />

      <PageContainer className="space-y-md">
        <Card>
          {/* Tổng số dư */}
          <div className="text-center mb-md">
            <div className="text-stat font-bold">{balance.toLocaleString()}đ</div>
            <div className="text-caption text-[color:#2E7D32]">
              Mức rút tối thiểu {minWithdraw.toLocaleString()}đ
            </div>
          </div>

          {/* 2 nút lịch sử */}
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

          {/* Khung ngân hàng */}
          <Link
            href="/banks"
            className="block rounded-[12px] border border-border p-md bg-white mt-md hover:shadow-sm transition"
          >
            {bank ? (
              <>
                <div className="text-body font-medium">
                  {bank.bankName} *****{bank.last4}
                </div>
                <div className="text-caption text-text-muted">{bank.holder}</div>
              </>
            ) : (
              <div className="text-body font-medium">+ Liên kết ngân hàng</div>
            )}
          </Link>

          {/* Quick amounts */}
          <div className="flex gap-sm mb-md mt-md">
            {[50000, 100000, 200000].map((amt) => (
              <button
                key={amt}
                className="flex-1 px-md py-sm rounded-control border border-border text-body"
                onClick={() => quick(amt)}
              >
                {amt.toLocaleString()}đ
              </button>
            ))}
          </div>

          {/* Input số tiền */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="Nhập số tiền muốn rút"
            className="w-full px-md py-sm rounded-control border border-border mb-md text-body"
          />

          <Button disabled={busy} onClick={submit}>
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

          {/* Ghi chú */}
          <ul className="mt-md text-caption text-text-muted list-disc list-inside space-y-xs">
            <li>Phí dịch vụ: 0đ</li>
            <li>Giới hạn: tối thiểu 20.000đ, tối đa 500.000đ/ngày</li>
            <li>Bội số 1.000đ</li>
          </ul>
        </Card>
      </PageContainer>
    </>
  );
}
