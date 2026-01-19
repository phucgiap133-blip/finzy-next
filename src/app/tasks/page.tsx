import { Suspense } from "react";
import TasksClient from "./page.client";

export const metadata = {
  title: "Nhiệm vụ | Finzy",
  description: "Danh sách nhiệm vụ, vuốt chuyển tab, và hướng dẫn chi tiết.",
};

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-caption text-text-muted">Đang tải nhiệm vụ…</div>}>
      <TasksClient />
    </Suspense>
  );
}
