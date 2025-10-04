"use client";

import Header from "../../components/Header";
import Button from "../../components/Button";
import PageContainer from "../../components/PageContainer";

export default function CommunityPage() {
  return (
    <>
      <Header title="Cộng đồng" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <div className="rounded-control border border-border shadow-sm bg-bg-card p-md">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-[color:#229ED9]" />
            <div className="flex-1">
              <div className="text-body font-medium">Nhóm Telegram Chính thức</div>
              <div className="text-caption text-text-muted">Nhận thông báo & hỗ trợ 24/7</div>
            </div>
            <Button>Tham gia</Button>
          </div>

          <div className="mt-md flex items-center gap-sm">
            <div className="text-body">Link: t.me/hh</div>
            <button className="px-sm py-xs rounded-control border border-border text-body">Sao chép</button>
          </div>

          <div className="mt-md">
            <div className="text-caption text-text-muted mb-xs">QR tham gia</div>
            <div className="w-28 h-28 bg-[color:#EDEDED] rounded-control" />
          </div>

          <div className="mt-md flex justify-between text-caption text-text-muted">
            <span>Quy tắc cộng đồng</span>
            <span>Trung tâm trợ giúp</span>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
