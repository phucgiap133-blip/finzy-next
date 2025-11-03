import { z } from 'zod';

// Các loại Phòng Chat/Phòng Hỗ trợ cố định
export const SupportRoomType = z.enum([
    "default",       // Hỗ trợ chung
    "withdrawal",    // Vấn đề rút tiền
    "commission",    // Vấn đề hoa hồng
    "technical",     // Vấn đề kỹ thuật
]);
export type SupportRoom = z.infer<typeof SupportRoomType>;


/**
 * Schema cho việc Gửi Yêu cầu Hỗ trợ Mới (Support Ticket)
 */
export const SendSupportSchema = z.object({
    // Loại phòng hỗ trợ/loại vấn đề
    room: SupportRoomType.default("default"), 
    
    // Nội dung yêu cầu/tin nhắn đầu tiên
    text: z.string().min(10, "Nội dung yêu cầu quá ngắn (tối thiểu 10 ký tự)").max(500, "Nội dung yêu cầu quá dài (tối đa 500 ký tự)"),
});

export type SendSupportRequest = z.infer<typeof SendSupportSchema>;