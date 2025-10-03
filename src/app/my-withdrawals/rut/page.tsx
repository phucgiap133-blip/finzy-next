import Header from "../../../components/Header";
import Tag from "../../../components/Tag";
import PageContainer from "../../../components/PageContainer";

const ITEMS = [
  { amount: -100000, status: "Thành công", tone: "success", fee: "0 đ", method: "MoMo *****5678", time: "10:21 17/08/2025" },
  { amount: -100000, status: "Thành công", tone: "success", fee: "0 đ", method: "MoMo *****5678", time: "10:21 17/08/2025" },
  { amount: -100000, status: "Đang xử lý", tone: "warning", fee: "0 đ", method: "MB Bank *****1234", time: "09:02 12/09/2025" },
];

export default function RutPage({ embedded = false }) {
  return (
    <>
      <Header title="Lịch sử rút" showBack noLine backFallback="/" />

      <PageContainer>
        <div className="rounded-[16px] bg-bg-card border border-border shadow-sm">
          {ITEMS.map((it, i) => (
            <div key={i} className="px-lg py-md border-b last:border-0 border-border">
              <div className="flex items-start gap-md">
                {/* icon */}
                <div className="w-9 h-9 rounded-full bg-[color:#F0E] text-white grid place-items-center text-caption font-bold shrink-0">
                  momo
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-body font-medium">Rút tiền</div>
                    <div className="text-body font-semibold">{it.amount.toLocaleString("vi-VN")}đ</div>
                  </div>

                  <div className="mt-xs flex items-center justify-between">
                    <div className="text-caption text-text-muted">phí: {it.fee}</div>
                    <div className="flex items-center gap-md">
                      <div className="text-caption text-text-muted">0 đ</div>
                      <Tag tone={it.tone}>{it.status}</Tag>
                    </div>
                  </div>

                  <div className="mt-xs">
                    <div className="text-body">{it.method}</div>
                    <div className="text-caption text-text-muted">{it.time}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!embedded && (
          <div className="text-center text-caption text-text-muted mt-md">
            Phí rút: 0đ • Hỗ trợ 24/7
          </div>
        )}
      </PageContainer>
    </>
  );
}
