"use client";



import { useState } from "react";

import Header from "@/components/Header";

import Card from "@/components/Card";

import Toggle from "@/components/Toggle";

import Button from "@/components/Button";

import PageContainer from "@/components/PageContainer";

import BottomSheetPro from "@/components/BottomSheetPro";

import PolicyList from "@/components/PolicyList";





export default function PolicyClient() {

  const [onlyNeeded, setOnlyNeeded] = useState(true);

  const [analytics, setAnalytics] = useState(false);

  const [marketing, setMarketing] = useState(false);
  const [query, setQuery] = useState("");


const [sheet, setSheet] = useState<

  | null

  | "intro"

  | "data"

  | "purpose"

  | "rights"

  | "commit_security"

  | "commit_free"

  | "commit_data"

  | "commit_withdraw"

>(null);







  const resetAll = () => {

    setOnlyNeeded(true);

    setAnalytics(false);

    setMarketing(false);

  };
const filterByQuery = (text: string) =>
  text.toLowerCase().includes(query.toLowerCase());
const leftLabels = [
  { label: "Giới thiệu", key: "intro" },
  { label: "Dữ liệu thu thập", key: "data" },
  { label: "Mục đích sử dụng", key: "purpose" },
  { label: "Quyền của bạn", key: "rights" },
];

const rightLabels = [
  { label: "Cam kết bảo mật", key: "commit_security" },
  { label: "Cam kết miễn phí", key: "commit_free" },
  { label: "Cam kết dữ liệu", key: "commit_data" },
  { label: "Cam kết rút tiền", key: "commit_withdraw" },
];



const leftFiltered = leftLabels.filter(i => filterByQuery(i.label));
const rightFiltered = rightLabels.filter(i => filterByQuery(i.label));



  return (

    <>

      <Header

    title="Chính sách quyền riêng tư"



        showBack

        noLine

        centerTitle

        backNoBorder

        forceFallback

      />



      <PageContainer className="flex justify-center">

      <div className="w-full max-w-[420px] px-[12px] pb-12">



  {/* CARD – PADDING 12PX Ở TRÁI, TRÊN, PHẢI | GÓC DƯỚI = 0 */}

  <Card className="mt-6 bg-[#FAFAFA] rounded-[24px] overflow-hidden px-[12px] pt-6 pb-0">



    {/* Ô TÌM KIẾM – ĐÃ CÓ PADDING TRÊN 24PX (pt-6), TRÁI/PHẢI 12PX TỪ CARD */}

    <div className="relative flex h-12 items-center rounded-[16px] bg-[#F5F5F5] px-4">

      <svg

        aria-hidden

        className="h-5 w-5 shrink-0 text-[#9E9E9E]"

        viewBox="0 0 20 20"

        fill="none"

        stroke="currentColor"

        strokeWidth="1.5"

      >

        <circle cx="9" cy="9" r="5.5" />

        <path d="M13 13L17 17" strokeLinecap="round" />

      </svg>


<input
  type="text"
  placeholder="Tìm kiếm"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  className="ml-3 h-full flex-1 bg-transparent text-base text-text outline-none"
/>



      <span className="pointer-events-none absolute right-4 text-[13px] font-medium text-text-muted whitespace-nowrap">

        Cập nhật: 24/04/2024

      </span>

    </div>



{/* NỘI DUNG CHÍNH – ĐỀU DƯỚI Ô TÌM KIẾM */}
<div className="mt-6 space-y-md">
  <div
    className={`grid gap-md ${
      leftFiltered.length > 0 && rightFiltered.length > 0
        ? "grid-cols-[1fr_1px_1fr]"
        : "grid-cols-1"
    }`}
  >
    {/* ===== CỘT NỘI DUNG ===== */}
    {leftFiltered.length > 0 && (
      <div className="flex flex-col">
        <div className="text-body font-semibold mb-sm">Nội dung</div>

        <div className="flex flex-col gap-[8px] text-caption text-text-muted">
          {leftFiltered.map(item => (
            <div
              key={item.key}
              className="cursor-pointer hover:underline"
              onClick={() => setSheet(item.key as any)}
            >
              • {item.label}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ===== LINE DỌC ===== */}
    {leftFiltered.length > 0 && rightFiltered.length > 0 && (
      <div className="bg-border" />
    )}

    {/* ===== CỘT CAM KẾT ===== */}
 {rightFiltered.length > 0 && (
  <div className="flex flex-col">
    <div className="text-body font-semibold mb-sm">Cam kết</div>

    <div className="flex flex-col gap-[8px] text-caption text-text-muted">
      {rightFiltered.map(item => (
        <div
          key={item.key}
          className="cursor-pointer hover:underline"
          onClick={() => setSheet(item.key as any)}
        >
          • {item.label}
        </div>
      ))}
    </div>
  </div>
)}   



      </div>

      <div className="flex gap-sm">

        <button

          type="button"

          onClick={resetAll}

          className="flex-1 px-md py-sm rounded-[16px] border border-border bg-white text-body"

        >

          Hủy

        </button>

        <Button className="flex-1 h-11 rounded-[16px] text-btn font-semibold">

          Cập nhật

        </Button>

      </div>



      <div className="flex flex-wrap justify-between text-caption text-text-muted gap-3">

        <button type="button" className="hover:underline">

        

        

          

        </button>

   

      </div>

    </div>



  </Card>

</div>





      </PageContainer>

       {/* ✅ DÁN SHEET Ở ĐÂY */}

<BottomSheetPro

  open={sheet === "intro"}

  onClose={() => setSheet(null)}

  title="Giới thiệu"

>

  <div className="px-4 pb-2">

<PolicyList

  items={[

    { icon: "💰", text: "Kiếm tiền miễn phí thông qua nhiệm vụ hợp lệ trong hệ thống." },

    { icon: "🎁", text: "Nhận thưởng khi hoàn thành nhiệm vụ hoặc giới thiệu bạn bè." },

    { icon: "⚡", text: "Rút tiền nhanh chóng sau khi được xác nhận." },

    { icon: "📖", text: "Minh bạch, rõ ràng và dễ sử dụng cho mọi người." },

  ]}

/>







    {/* Highlight card */}

    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#ECFDF5] px-4 py-3">

      <span className="mt-[2px] text-[#10B981] text-[18px]">🛡️</span>

      <p className="text-[14px] font-medium leading-[1.6] text-[#065F46]">

        Hoàn toàn <b>MIỄN PHÍ</b> – không thu bất kỳ khoản phí nào khi sử dụng.

      </p>

    </div>

  </div>

</BottomSheetPro>





  <BottomSheetPro

  open={sheet === "data"}

  onClose={() => setSheet(null)}

  title="Dữ liệu thu thập"

>

  <div className="px-4 pb-2">

<PolicyList

  items={[

    { icon: "🔍", text: "Thông tin tài khoản cơ bản (ID, tên hiển thị)." },

    { icon: "📱", text: "Thiết bị và phiên đăng nhập để đảm bảo bảo mật." },

    { icon: "🧾", text: "Lịch sử nhiệm vụ, phần thưởng và giao dịch rút tiền." },

    { icon: "⚙️", text: "Dữ liệu kỹ thuật nhằm cải thiện trải nghiệm người dùng." },

  ]}

/>





    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#FEF2F2] px-4 py-3">

      <span className="mt-[2px] text-[#EF4444] text-[18px]">❗</span>

      <p className="text-[14px] leading-[1.6] text-[#7F1D1D]">

        Chúng tôi <b>không thu thập dữ liệu nhạy cảm</b> và{" "}

        <b>không chia sẻ dữ liệu cho bên thứ ba</b>.

      </p>

    </div>

  </div>

</BottomSheetPro>





<BottomSheetPro
  open={sheet === "rights"}
  onClose={() => setSheet(null)}
  title="Quyền của bạn"
>
  <div className="px-4 pb-2">
    <PolicyList
      items={[
        { icon: "👁️", text: "Quyền truy cập và xem dữ liệu cá nhân." },
        { icon: "✏️", text: "Quyền chỉnh sửa hoặc yêu cầu xoá dữ liệu." },
        { icon: "🔘", text: "Quyền bật hoặc tắt các tuỳ chọn phân tích." },
        { icon: "↩️", text: "Quyền rút lại sự đồng ý bất kỳ lúc nào." },
      ]}
    />

    <p className="mt-4 text-[13px] text-text-muted">
      Bạn có thể quản lý các quyền này trực tiếp trong phần Cài đặt của ứng dụng.
    </p>

    {/* Highlight card */}
    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#ECFDF5] px-4 py-3">
      <span className="mt-[2px] text-[#10B981] text-[18px]">✅</span>
      <p className="text-[14px] font-medium leading-[1.6] text-[#065F46]">
        Bạn luôn <b>toàn quyền kiểm soát</b> dữ liệu và quyền riêng tư của mình.
      </p>
    </div>
  </div>
</BottomSheetPro>





<BottomSheetPro
  open={sheet === "purpose"}
  onClose={() => setSheet(null)}
  title="Mục đích sử dụng"
>
  <div className="px-4 pb-2">
    <PolicyList
      items={[
        { icon: "⚙️", text: "Ghi nhận nhiệm vụ và phần thưởng của người dùng." },
        { icon: "💸", text: "Xử lý yêu cầu rút tiền và hỗ trợ kỹ thuật." },
        { icon: "🛑", text: "Phát hiện và ngăn chặn hành vi gian lận." },
        { icon: "🚀", text: "Cải thiện hiệu năng và độ ổn định của hệ thống." },
      ]}
    />

    {/* Highlight card */}
    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#ECFDF5] px-4 py-3">
      <span className="mt-[2px] text-[#10B981] text-[18px]">🎯</span>
      <p className="text-[14px] font-medium leading-[1.6] text-[#065F46]">
        Dữ liệu chỉ được sử dụng để <b>vận hành hệ thống công bằng</b> và
        <b> bảo vệ quyền lợi người dùng</b>.
      </p>
    </div>
  </div>
</BottomSheetPro>


<BottomSheetPro
  open={sheet === "commit_security"}
  onClose={() => setSheet(null)}
  title="Cam kết bảo mật"
>
  <div className="px-4 pb-2">
    <PolicyList
      items={[
        { icon: "🛡️", text: "Chỉ thu thập dữ liệu cần thiết để hệ thống hoạt động ổn định." },
        { icon: "🔐", text: "Áp dụng các biện pháp bảo mật để bảo vệ tài khoản người dùng." },
        { icon: "🚫", text: "Không thu thập thông tin nhạy cảm như mật khẩu hoặc tài khoản ngân hàng." },
        { icon: "👁️", text: "Người dùng có thể xem và kiểm tra thông tin của mình bất cứ lúc nào." },
      ]}
    />

    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#ECFDF5] px-4 py-3">
      <span className="mt-[2px] text-[#10B981] text-[18px]">🛡️</span>
      <p className="text-[14px] font-medium leading-[1.6] text-[#065F46]">
        Chúng tôi cam kết bảo vệ dữ liệu người dùng và không sử dụng sai mục đích.
      </p>
    </div>
  </div>
</BottomSheetPro>


<BottomSheetPro
  open={sheet === "commit_free"}
  onClose={() => setSheet(null)}
  title="Cam kết miễn phí"
>
  <div className="px-4 pb-2">
    <PolicyList
      items={[
        { icon: "💸", text: "Tham gia và sử dụng hệ thống hoàn toàn miễn phí." },
        { icon: "🚫", text: "Không yêu cầu nạp tiền để thực hiện nhiệm vụ." },
        { icon: "📄", text: "Không có chi phí ẩn trong quá trình sử dụng." },
        { icon: "🤝", text: "Người dùng chỉ cần hoàn thành nhiệm vụ hợp lệ để nhận thưởng." },
      ]}
    />

    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#ECFDF5] px-4 py-3">
      <span className="mt-[2px] text-[#10B981] text-[18px]">💸</span>
      <p className="text-[14px] font-medium leading-[1.6] text-[#065F46]">
        Hoàn toàn <b>MIỄN PHÍ</b> – không thu bất kỳ khoản phí nào khi sử dụng.
      </p>
    </div>
  </div>
</BottomSheetPro>


<BottomSheetPro
  open={sheet === "commit_data"}
  onClose={() => setSheet(null)}
  title="Cam kết dữ liệu"
>
  <div className="px-4 pb-2">
    <PolicyList
      items={[
        { icon: "🚫", text: "Không bán dữ liệu người dùng cho bên thứ ba." },
        { icon: "📦", text: "Không chia sẻ dữ liệu cho mục đích quảng cáo bên ngoài." },
        { icon: "⚖️", text: "Chỉ sử dụng dữ liệu trong phạm vi vận hành hệ thống." },
        { icon: "🔍", text: "Mọi hoạt động xử lý dữ liệu đều minh bạch và rõ ràng." },
      ]}
    />

    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#FEF2F2] px-4 py-3">
      <span className="mt-[2px] text-[#EF4444] text-[18px]">🚫</span>
      <p className="text-[14px] font-medium leading-[1.6] text-[#7F1D1D]">
        Chúng tôi <b>không bán</b> và <b>không chia sẻ</b> dữ liệu người dùng cho bất kỳ bên thứ ba nào.
      </p>
    </div>
  </div>
</BottomSheetPro>


<BottomSheetPro
  open={sheet === "commit_withdraw"}
  onClose={() => setSheet(null)}
  title="Cam kết rút tiền"
>
  <div className="px-4 pb-2">
    <PolicyList
      items={[
        { icon: "⚡", text: "Yêu cầu rút tiền được xử lý nhanh chóng sau khi xác nhận hợp lệ." },
        { icon: "🧾", text: "Lịch sử rút tiền và phần thưởng được hiển thị rõ ràng." },
        { icon: "🛑", text: "Các yêu cầu gian lận sẽ bị từ chối để đảm bảo công bằng." },
        { icon: "🤝", text: "Hỗ trợ người dùng khi gặp vấn đề trong quá trình rút tiền." },
      ]}
    />

    <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#ECFDF5] px-4 py-3">
      <span className="mt-[2px] text-[#10B981] text-[18px]">⚡</span>
      <p className="text-[14px] font-medium leading-[1.6] text-[#065F46]">
        Rút tiền minh bạch, rõ ràng và hỗ trợ người dùng khi cần thiết.
      </p>
    </div>
  </div>
</BottomSheetPro>








      

    </>

  );

}