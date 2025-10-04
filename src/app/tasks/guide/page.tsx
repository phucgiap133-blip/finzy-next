"use client";

import Link from "next/link";
import Header from "../../../components/Header";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import PageContainer from "../../../components/PageContainer";

type GuideProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function TaskGuidePage({ searchParams }: GuideProps) {
  const showVideo = searchParams?.video === "1";

  return (
    <>
      <Header title="Nhiệm vụ" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <div className="flex items-center justify-between">
          <div className="text-body font-medium">Hướng dẫn</div>
          {!showVideo ? (
            <Link href="/tasks/guide?video=1" className="text-body text-text-muted hover:underline">
              Xem lại hướng dẫn ›
            </Link>
          ) : (
            <span className="text-caption text-text-muted">Xem lại hướng dẫn</span>
          )}
        </div>

        {showVideo && (
          <div className="rounded-[14px] border border-border bg-white p-md">
            <div className="aspect-[16/9] rounded-[12px] bg-[color:#F3F4F6] grid place-items-center">
              <div className="w-12 h-12 rounded-full bg-white grid place-items-center shadow">▶</div>
            </div>
            <div className="mt-sm flex items-center gap-sm">
              <div className="flex-1 h-2 rounded-full bg-[color:#E5E7EB] overflow-hidden">
                <div className="h-full w-1/3 bg-[color:#9CA3AF]" />
              </div>
              <button className="px-sm py-xs rounded-control border border-border text-body">⋯</button>
            </div>
          </div>
        )}

        <Card>
          <div className="space-y-md">
            <div className="space-y-sm">
              <div className="flex items-start gap-sm">
                <span className="mt-[2px]">🔁</span>
                <div>
                  <div className="text-body font-medium">Bước 1</div>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <span className="mt-[2px]">✅</span>
                <div className="text-body">Click vào quảng cáo</div>
              </div>
              <div className="flex items-start gap-sm">
                <span className="mt-[2px]">⏳</span>
                <div className="text-body">Chờ nhận thưởng</div>
              </div>
            </div>

            <div className="text-caption text-text-muted">0/3 đã làm • +7.000đ</div>

            {showVideo ? (
              <Link href="/tasks/guide">
                <Button className="w-full">Bắt đầu nhiệm vụ</Button>
              </Link>
            ) : (
              <Button className="w-full">Bắt đầu nhiệm vụ</Button>
            )}

            {showVideo ? (
              <div className="flex items-center gap-sm text-caption text-text-muted">
                <input id="hideVideo" type="checkbox" className="w-4 h-4" />
                <label htmlFor="hideVideo">Đừng hiển video lần sau</label>
              </div>
            ) : (
              <div className="text-center text-caption text-text-muted">Đã ẩn video hướng dẫn • Hoàn tác</div>
            )}
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
