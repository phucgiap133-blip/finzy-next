"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Card from "../../components/Card";
import Link from "next/link";
import PageContainer from "../../components/PageContainer";
import { api } from "@/lib/api";

type BankItem = {
  id: string;
  bankName: string;
  last4: string;
  holder: string;
  tag?: string;
};

export default function BanksPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<BankItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.banks.get();
      setItems(res.accounts);
      setSelectedId(res.selectedId);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = (id: string) => setConfirmId(id);
  const closeModal = () => setConfirmId(null);

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await api.banks.delete({ id: confirmId }); // method theo đúng cách bạn gọi
      setConfirmId(null);
      await load();
      setMsg("Đã xoá tài khoản ngân hàng.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi xoá tài khoản");
    }
  };

  const onSelectDefault = async (id: string) => {
    try {
      await api.banks.select({ id });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi đặt mặc định");
      return;
    }
    setSelectedId(id);
    setMsg("Đã đặt làm mặc định.");
  };

  return (
    <>
      <Header title="Liên kết ngân hàng" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <Card>
          {loading ? (
            <div className="text-caption text-text-muted">Đang tải…</div>
          ) : items.length === 0 ? (
            <div className="text-caption text-text-muted">Chưa có tài khoản ngân hàng.</div>
          ) : (
            <div className="space-y-md">
              {items.map((item) => {
                const isDefault = selectedId === item.id;
                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-[8px] bg-[color:#4F46E5] text-white grid place-items-center text-caption font-bold">
                        🏦
                      </div>
                      <div>
                        <div className="text-body font-medium">
                          {item.bankName} *****{item.last4}
                        </div>
                        <div className="text-caption text-text-muted">{item.holder}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-sm">
                      {isDefault ? (
                        <span className="text-caption px-sm py-[2px] rounded-full bg-[color:#FFF4E5] text-[color:#8A6D3B]">
                          Mặc định
                        </span>
                      ) : (
                        <button
                          className="px-sm py-[6px] rounded-control border border-border text-caption"
                          onClick={() => onSelectDefault(item.id)}
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        className="w-8 h-8 grid place-items-center rounded-control border border-border"
                        onClick={() => onDelete(item.id)}
                        aria-label="Xoá tài khoản ngân hàng"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-md">
            <Link
              href="/banks/add"
              className="block w-full text-center px-md py-sm rounded-control bg-brand-primary text-white"
            >
              + Thêm ngân hàng
            </Link>
          </div>

          {msg && (
            <div
              className="mt-sm text-caption"
              style={{ color: msg.startsWith("Lỗi") ? "#C62828" : "#2E7D32" }}
            >
              {msg}
            </div>
          )}
        </Card>
      </PageContainer>

      {confirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-md">
          <div className="w-[92vw] sm:w-[480px] rounded-[14px] bg-white p-lg shadow-lg">
            <div className="text-center space-y-sm">
              <div className="text-h5">⚠️</div>
              <div className="text-body font-semibold">Xoá tài khoản</div>
              <div className="text-caption text-text-muted">
                Bạn có chắc muốn xoá{" "}
                <b>
                  {items.find((i) => i.id === confirmId)
                    ? `${items.find((i) => i.id === confirmId)!.bankName} *****${
                        items.find((i) => i.id === confirmId)!.last4
                      }`
                    : "tài khoản này"}
                </b>
                ?
              </div>
              <div className="mt-md flex justify-center gap-sm">
                <button className="px-md py-sm rounded-control border border-border" onClick={closeModal}>
                  Hủy
                </button>
                <button
                  className="px-md py-sm rounded-control bg-[color:#EF4444] text-white"
                  onClick={confirmDelete}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
