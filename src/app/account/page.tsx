import Header from "../../components/Header";
import Button from "../../components/Button";
import Link from "next/link";
import PageContainer from "../../components/PageContainer";

export default function AccountPage() {
  return (
    <>
     <Header title="" noLine showClose hideLeft closeTo="/" />


      <PageContainer className="space-y-md">
        <div className="bg-bg-card rounded-control p-lg shadow-md border border-border">
          {/* avatar + info */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full grid place-items-center shadow-sm border border-border">
              <span className="text-brand-primary text-2xl font-bold">∞</span>
            </div>
            <div className="mt-sm text-body font-medium">Tuấn</div>
            <div className="text-caption text-text-muted">privacy@gmail.com</div>
            <div className="mt-sm text-stat font-bold">37.000đ</div>
          </div>

          {/* chips nhanh */}
          <div className="mt-md flex gap-sm justify-center flex-wrap">
            <Link
              href="/wallet"
              className="px-md py-xs rounded-control bg-[color:#FFF3E0] text-body font-medium"
            >
              Ví
            </Link>
            <Link
              href="/withdraw"
              className="px-md py-xs rounded-control bg-[color:#FFF3E0] text-body font-medium"
            >
              Rút tiền
            </Link>
            <Link
              href="/my-withdrawals"
              className="px-md py-xs rounded-control bg-[color:#FFF3E0] text-body font-medium"
            >
              Lịch sử của tôi
            </Link>
          </div>

          {/* links */}
          <div className="mt-md grid gap-sm md:grid-cols-2">
            <Link
              href="/settings"
              className="flex items-center justify-between rounded-control border border-border p-md bg-bg-card text-body font-medium"
            >
              <span className="flex items-center gap-sm">
                <span className="w-5 h-5 grid place-items-center">⚙️</span>Cài đặt
              </span>
              <span className="text-caption text-text-muted">›</span>
            </Link>
            <Link
              href="/support"
              className="flex items-center justify-between rounded-control border border-border p-md bg-bg-card text-body font-medium"
            >
              <span className="flex items-center gap-sm">
                <span className="w-5 h-5 grid place-items-center">🛟</span>Hỗ trợ
              </span>
              <span className="text-caption text-text-muted">›</span>
            </Link>
          </div>

          {/* Đăng xuất */}
          <div className="mt-md">
            <Button className="w-full sm:w-auto">Đăng xuất</Button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
