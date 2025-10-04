"use client";

import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

export default function WithdrawSlowSupportPage() {
  return (
    <>
      <Header title="Hỗ trợ" showBack noLine backFallback="/support/chat" forceFallback />
      <PageContainer className="space-y-md">
        <Card>
          <div className="text-caption px-sm py-xs bg-[color:#FFF3E0] rounded-full inline-block">/ Rút tiền chậm</div>
          <div className="mt-md text-body">Giao dịch rút tiền chậm</div>
          <div className="text-caption text-text-muted mb-md">Nhập số tiền và thời gian thực hiện giao dịch.</div>
          <Input label="VD: 20.000đ" />
          <Input label="VD: 10:12 25/04/2025" />
          <div className="mt-md">
            <Button>Gửi</Button>
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
