"use client";

import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import PageContainer from "@/components/PageContainer";
import MenuButton from "@/components/MenuButton";
import { useMenu } from "@/components/MenuProvider";

export default function Page() {
  const { openAccount } = useMenu();

  return (
    <>
      <PageContainer id="app-container" className="space-y-md lg:space-y-lg">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <MenuButton className="inline-flex items-center justify-center w-9 h-9 rounded-control border border-border hover:shadow-sm" />

          <div className="font-bold text-h5 md:text-h4">Trang chủ</div>

          <button
            type="button"
            onClick={openAccount}
            aria-label="Tài khoản"
            className="rounded-full w-8 h-8 border border-border grid place-items-center hover:shadow-sm"
          >
            <span className="text-brand-primary font-bold">∞</span>
          </button>
        </div>

        {/* Card tổng thu nhập */}
        <Card id="hero-card">
          <div className="text-center space-y-xs">
            <div className="text-body-sm text-text-muted uppercase tracking-wide">
              TỔNG THU NHẬP
            </div>
            <div className="text-stat lg:text-h2 font-extrabold">37.000đ</div>
            <div className="text-body text-text-muted">
              Rút tối thiểu 20.000đ
            </div>
            <div className="mt-md">
              {/* ✅ thêm from=home để trang rút tiền biết quay lại home */}
              <Link href="/withdraw?from=home">
                <Button className="w-full sm:w-auto text-btn lg:text-body font-semibold px-6 py-2">
                  Rút tiền ngay
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Section: Nhiệm vụ hôm nay */}
        <section className="mt-md lg:mt-lg">
          <div className="flex items-center justify-between mb-sm">
            <div className="text-h6 md:text-h5 font-semibold uppercase">
              NHIỆM VỤ HÔM NAY
            </div>
            <Link
              href="/tasks"
              className="text-body font-medium text-text-muted no-underline hover:underline"
            >
              Xem tất cả ›
            </Link>
          </div>

          <div className="space-y-sm">
            {["Click ads", "Click ads", "Click ads"].map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-control border border-border p-md bg-bg-card shadow-sm"
              >
                <div className="flex items-center gap-sm">
                  <input type="checkbox" className="w-5 h-5" />
                  <div>
                    <div className="text-body">
                      {t}{" "}
                      <span className="text-caption text-text-muted">5%</span>
                    </div>
                    <div
                      className="text-body font-medium"
                      style={{ color: "#2E7D32" }}
                    >
                      +5.000đ
                    </div>
                  </div>
                </div>

                <Link href="/tasks">
                  <Button className="px-5 text-btn lg:text-body font-semibold">
                    Làm
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}
