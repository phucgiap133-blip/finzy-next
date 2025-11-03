import { prisma } from "@/server/prisma";

/**
 * Ghi lại một sự kiện quan trọng của người dùng vào WalletHistory (dùng như Audit Log).
 * @param userId ID người dùng.
 * @param event Tên hành động chính (ví dụ: 'PASSWORD_CHANGE', 'WITHDRAWAL_REQUEST').
 * @param sub Chi tiết bổ sung (ví dụ: số tiền, trạng thái).
 */
export async function logAudit(userId: number, event: string, sub?: string): Promise<void> {
    try {
        await prisma.walletHistory.create({
            data: {
                userId: userId,
                text: event, // Ví dụ: 'PASSWORD_CHANGE'
                sub: sub,   // Ví dụ: 'thành công' hoặc '50000 VND'
                // createdAt tự động là now()
            },
        });
    } catch (e) {
        // Rất quan trọng: Audit log không được chặn luồng chính. 
        // Chỉ log lỗi ra console nếu việc ghi log thất bại.
        console.error(`[AUDIT LOG ERROR] Failed to log event '${event}' for user ${userId}:`, e);
    }
}
