// src/app/wallet/page.tsx
import Header from "../../components/Header";
import Card from "../../components/Card";
import PageContainer from "../../components/PageContainer";
import { api } from "@/lib/api";

type WalletHistoryItem = { id: string; text: string; sub?: string };

export default async function WalletPage({
  searchParams,
}: {
  searchParams?: { debug?: string };
}) {
  const { wallet, history } = await api.wallet.get();
  const showDebug = searchParams?.debug === "1";

  return (
    <>
      <Header
        title="Ví"
        showBack
        noLine
        backFallback="/account"
        forceFallback
      />
      <PageContainer className="space-y-md">
        <div className="text-center">
          <div className="text-stat font-bold">
            {wallet.balance.toLocaleString("vi-VN")}đ
          </div>
          <div className="text-caption" style={{ color: "#2E7D32" }}>
            Mức rút tối thiểu 20.000đ
          </div>
        </div>

        <div className="space-y-sm">
          {(history as WalletHistoryItem[]).map((it) => (
            <Card key={it.id}>
              <div className="text-body font-medium">{it.text}</div>
              {it.sub && (
                <div className="text-caption text-text-muted">{it.sub}</div>
              )}
            </Card>
          ))}
        </div>

        {/* 🔎 Debug JSON: bật qua ?debug=1 */}
        {showDebug && (
          <div className="mt-md">
            <div className="mb-xs text-caption text-text-muted">
              Debug JSON (ví & lịch sử)
            </div>
            <pre className="whitespace-pre-wrap rounded-[12px] border border-border bg-[color:#FAFAFA] p-md text-[12px] overflow-x-auto">
              {JSON.stringify({ wallet, history }, null, 2)}
            </pre>
          </div>
        )}
      </PageContainer>
    </>
  );
}
