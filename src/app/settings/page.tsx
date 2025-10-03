import Header from "../../components/Header";
import Card from "../../components/Card";
import Toggle from "../../components/Toggle";
import Button from "../../components/Button";
import PageContainer from "../../components/PageContainer";

export default function SettingsPage() {
  return (
    <>
      <Header title="Cài đặt" showBack noLine backFallback="/" />
      <PageContainer className="space-y-md">
        <Card title="Nhiệm vụ">
          <div className="flex items-center justify-between py-sm">
            <div>
              <div className="text-body">Xem video + click QC</div>
              <div className="text-caption text-text-muted">Đã ẩn</div>
            </div>
            <Toggle />
          </div>

          <div className="flex items-center justify-between py-sm">
            <div>
              <div className="text-body">Luôn hiển video hướng dẫn</div>
              <div className="text-caption text-text-muted">Áp dụng theo nhiệm vụ tương tự</div>
            </div>
            <Toggle />
          </div>

          <div className="mt-md">
            <Button>Đặt lại tất cả</Button>
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
