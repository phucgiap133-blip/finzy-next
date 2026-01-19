
"use client";
export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import Card from "@/components/Card";

export default function CommunityPage() {
  const joinLink = "t.me/hh";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      alert("Đã sao chép link!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = joinLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Đã sao chép link!");
    }
  };

  return (
    <>
      <Header
        title="Cộng đồng"
        showBack
        noLine
        centerTitle
        backNoBorder
        forceFallback
      />
<PageContainer className="pt-4 pb-10">
  <div className="mx-auto max-w-[860px] px-[12px]">
    <Card>
      {/* WRAPPER DUY NHẤT QUẢN LÝ PADDING */}
      <div className="px-[12px] py-[16px]">
        {/* Hàng thông tin nhóm */}
        <div className="flex items-center gap-md">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[#229ED9]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M9.5 13.5L10 18l2-2.5 4 3.5 2.5-13L3 11l4 1.5 8-5-5.5 6z"
                fill="white"
              />
            </svg>
          </div>

          <div className="flex-1 ml-2">
            <div className="text-body font-semibold text-text">
              Nhóm Telegram Chính thức
            </div>
            <div className="mt-[4px] text-caption text-text-muted">
              Nhận thông báo & hỗ trợ 24/7
            </div>
          </div>
        </div>

        {/* Nút tham gia */}
        <Button
          asChild
          className="w-full h-12 mt-[16px] bg-[#F2994A] text-white"
        >
          <a href="https://t.me/hh" target="_blank" rel="noreferrer">
            Tham gia
          </a>
        </Button>

       {/* Link + copy - Bọc vào thanh xám cho chuyên nghiệp */}
<div className="mt-[16px] mb-[24px] rounded-full bg-[#F5F5F5] h-12 px-1 flex items-center justify-between overflow-hidden">
  <div className="text-body text-text-muted truncate pl-3">
    Link: <span className="text-text font-medium">{joinLink}</span>
  </div>
  <button
    onClick={copyLink}
    className="w-[96px] h-10 rounded-full bg-[#FFF3E5] text-[#E67E22] text-[15px] font-bold active:scale-95 transition-all"
  >
    Sao chép
  </button>
</div>

{/* QR - Thêm bo góc cho mượt */}
<div className="mb-[24px] flex items-center justify-between">
  <div className="text-body text-text font-medium">QR tham gia</div>
  <div className="h-24 w-24 bg-[#E0E0E0] rounded-[16px] border border-black/5" />
</div>

        {/* Footer links */}
        <div className="flex items-center justify-around text-caption text-text-muted">
          <button>Quy tắc cộng đồng</button>
          <button>Trung tâm trợ giúp</button>
        </div>
      </div>
    </Card>
  </div>
</PageContainer>


    </>
  );
}
