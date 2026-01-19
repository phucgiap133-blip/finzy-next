import { Suspense } from "react";
import TaskGuideClient from "./page.client";

export const metadata = {
  title: "Nhiệm vụ • Hướng dẫn | Finzy",
  description: "Video hướng dẫn, các bước thực hiện và tuỳ chọn ẩn/hiện video.",
};

export default function TaskGuidePage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải hướng dẫn…</div>}>
      <TaskGuideClient />
    </Suspense>
  );
}
