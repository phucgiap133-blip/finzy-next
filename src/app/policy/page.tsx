import Header from "../../components/Header";
import Card from "../../components/Card";
import Toggle from "../../components/Toggle";
import Button from "../../components/Button";
import PageContainer from "../../components/PageContainer";

export default function PolicyPage() {
  return (
    <>
      <Header title="Chính sách & Điều khoản" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        {/* search + updated */}
        <div className="flex items-center gap-sm">
          <div className="flex-1 rounded-control border border-border bg-bg-card p-sm text-caption text-text-muted">
            Tìm kiếm
          </div>
          <div className="text-caption text-text-muted">Cập nhật: 24/04/2024</div>
        </div>

        <Card>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <div className="text-body font-medium mb-sm">Nội dung</div>
              <ul className="space-y-sm text-caption text-text-muted">
                <li>• Giới thiệu</li>
                <li>• Dữ liệu thu thập</li>
                <li>• Mục đích sử dụng</li>
                <li>• Quyền của bạn</li>
              </ul>
            </div>

            <div>
              <div className="text-body font-medium mb-sm">Giới thiệu</div>
              <div className="space-y-sm text-body">
                <div className="flex items-center justify-between">
                  <span>Chỉ dữ liệu cần thiết</span>
                  <Toggle />
                </div>
                <div className="flex items-center justify-between">
                  <span>Dữ liệu phân tích</span>
                  <Toggle />
                </div>
                <div className="flex items-center justify-between">
                  <span>Dữ liệu tiếp thị</span>
                  <Toggle />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-md flex gap-sm">
            <button className="px-md py-sm rounded-control border border-border flex-1 text-body">
              Hủy
            </button>
            <div className="flex-1">
              <Button>Đăng xuất</Button>
            </div>
          </div>

          <div className="mt-md flex justify-between text-caption text-text-muted">
            <span>Tải về PDF</span>
            <span>Quản lý đồng ý</span>
            <span>DPO: privacy@hh</span>
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
