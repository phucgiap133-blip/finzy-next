"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import Card from "@/components/Card";
import PageContainer from "@/components/PageContainer";

const LS_KEYS = { HIDE_GUIDE_VIDEO: "hideGuideVideo" };

export default function TaskGuidePage() {
  const sp = useSearchParams();
  const router = useRouter();

  // Nếu ?video=1 thì ép hiện video; nếu không, theo setting localStorage
  const forceShow = sp.get("video") === "1";
  const [hideGuideVideo, setHideGuideVideo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hid = localStorage.getItem(LS_KEYS.HIDE_GUIDE_VIDEO) === "1";
    setHideGuideVideo(hid);
  }, []);

  const showVideo = useMemo(
    () => (forceShow ? true : !hideGuideVideo),
    [forceShow, hideGuideVideo]
  );

  const onDontShowNext = (v: boolean) => {
    setHideGuideVideo(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.HIDE_GUIDE_VIDEO, v ? "1" : "0");
    }
  };

  // URL KHÔNG có video (dùng cho Back hoặc khi bắt đầu nhiệm vụ)
  const backHref = useMemo(() => {
    const p = new URLSearchParams(sp);
    p.delete("video");
    const qs = p.toString();
    return `/tasks/guide${qs ? `?${qs}` : ""}`;
  }, [sp]);

  // Back: nếu đang ở ?video=1 thì bỏ param và replace; nếu không thì back bình thường
  const handleBack = () => {
    if (forceShow) {
      router.replace(backHref, { scroll: false });
    } else {
      router.back();
    }
  };

  // URL "Xem lại hướng dẫn" = giữ nguyên query hiện tại + thêm video=1
  const reviewHref = useMemo(() => {
    const p = new URLSearchParams(sp);
    p.set("video", "1");
    const qs = p.toString();
    return `/tasks/guide${qs ? `?${qs}` : ""}`;
  }, [sp]);

  // Bấm "Bắt đầu nhiệm vụ" ở trang có video -> chỉ bỏ video=1, giữ nguyên type/id...
  const onStart = () => {
    const p = new URLSearchParams(sp);
    if (p.has("video")) {
      p.delete("video");
      const qs = p.toString();
      router.replace(`/tasks/guide${qs ? `?${qs}` : ""}`, { scroll: false });
    }
    setHideGuideVideo(true);
  };

  return (
    <>
   <Header
  title="Nhiệm vụ"
  showBack
  noLine
  forceFallback
  backFallback={forceShow ? "/tasks/guide" : "/tasks"}  // 👈 dòng này
/>


      <PageContainer className="space-y-md">
        <div className="flex items-center justify-between">
          <div className="text-body font-medium">Hướng dẫn</div>
          {!forceShow && !showVideo ? (
            // ✅ Dùng replace để không tạo thêm history entry
            <Link
              href={reviewHref}
              replace
              scroll={false}
              className="text-body text-text-muted hover:underline"
            >
              Xem lại hướng dẫn ›
            </Link>
          ) : (
            <span className="text-caption text-text-muted" />
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

            <Button className="w-full" onClick={onStart}>
              Bắt đầu nhiệm vụ
            </Button>

            {showVideo ? (
              <label className="flex items-center gap-sm text-caption text-text-muted">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={hideGuideVideo}
                  onChange={(e) => onDontShowNext(e.target.checked)}
                />
                Đừng hiện video lần sau
              </label>
            ) : (
              <div className="text-center text-caption text-text-muted">
                Đã ẩn video hướng dẫn •{" "}
                <Link href={reviewHref} replace scroll={false} className="underline">
                  Hoàn tác
                </Link>
              </div>
            )}
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
