"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";    // ✅ giờ không còn lỗi nữa
import Header from "../../components/Header";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageContainer from "../../components/PageContainer";

export default function WithdrawPage() {
  const [info, setInfo] = useState({ balance: 0, minWithdraw: 20000 });

 useEffect(() => {
  api.wallet.get()
    .then(({ wallet }) => setInfo({ balance: wallet.balance, minWithdraw: 20000 }))
    .catch(console.error);
}, []);


  return (
    <>
      <Header title="Rút tiền" showBack noLine backFallback="/account" forceFallback />
      <PageContainer className="space-y-md">
        <Card>
          <div className="text-center mb-md">
            <div className="text-stat font-bold">
              {info.balance.toLocaleString()}đ
            </div>
            <div className="text-caption text-[color:#2E7D32]">
              Mức rút tối thiểu {info.minWithdraw.toLocaleString()}đ
            </div>
          </div>

          <Button>Rút tiền</Button>
        </Card>
      </PageContainer>
    </>
  );
}
