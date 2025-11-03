import { NextResponse } from "next/server";

// ✅ HÀM PHẢI LÀ ASYNC VÀ TRẢ VỀ PROMISE<NUMBER | NULL>
export async function getUserId(): Promise<number | null> {
    // Tạm giả lập user đăng nhập (UserId 1)
    return 1;
}

export function json(data: any, init?: ResponseInit) {
    return NextResponse.json(data, init);
}

export function viStatus(
    status: "pending" | "success" | "failed"
): "Đang xử lý" | "Thành công" | "Thất bại" {
    switch (status) {
        case "success":
            return "Thành công";
        case "failed":
            return "Thất bại";
        default:
            return "Đang xử lý";
    }
}