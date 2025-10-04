"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import PageContainer from "../../../components/PageContainer";
import { api } from "@/lib/api";

export default function BankAddPage() {
  const router = useRouter();
  const [bankName, setBankName] = useState<string>("MB Bank");
  const [number, setNumber] = useState<string>("");
  const [holder, setHolder] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      await api.banks.link({ bankName, number, holder });
      router.replace("/banks");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Lỗi liên kết");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header title="Thêm ngân hàng" showBack noLine backFallback="/banks" />
      <PageContainer className="space-y-md">
        <Card>
          <form className="space-y-md" onSubmit={submit}>
            <div>
              <label className="text-caption text-text-muted">Ngân hàng</label>
              <select
                className="mt-xs w-full border border-border rounded-control px-md py-sm text-body bg-white"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              >
                <option>MB Bank</option>
                <option>Vietcombank</option>
                <option>MoMo</option>
                <option>TPBank</option>
              </select>
            </div>

            <div>
              <label className="text-caption text-text-muted">Số tài khoản / SĐT</label>
              <input
                className="mt-xs w-full border border-border rounded-control px-md py-sm text-body"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="00123456789"
                required
              />
            </div>

            <div>
              <label className="text-caption text-text-muted">Chủ tài khoản</label>
              <input
                className="mt-xs w-full border border-border rounded-control px-md py-sm text-body"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div className="flex gap-sm">
              <button
                type="button"
                className="px-md py-sm rounded-control border border-border"
                onClick={() => router.back()}
                disabled={busy}
              >
                Hủy
              </button>
              <Button disabled={busy} type="submit">
                Liên kết
              </Button>
            </div>

            {msg && <div className="text-caption" style={{ color: "#C62828" }}>{msg}</div>}
          </form>
        </Card>
      </PageContainer>
    </>
  );
}
