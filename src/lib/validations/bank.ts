import { z } from 'zod';

/**
 * Schema cho việc Thêm/Cập nhật Tài khoản Ngân hàng
 */
export const BankAccountSchema = z.object({
    // bankName: Tên ngân hàng (string)
    bankName: z.string().min(2, "Tên ngân hàng quá ngắn").max(100, "Tên ngân hàng quá dài"),
    
    // last4: 4 số cuối của tài khoản (string, thường là 4-6 số cuối)
    // Giả định: Người dùng nhập đầy đủ số tài khoản, backend sẽ lưu 4 số cuối (last4)
    accountNumber: z.string().regex(/^\d{6,20}$/, "Số tài khoản không hợp lệ (chỉ chấp nhận số)"), 
    
    // holder: Tên chủ tài khoản
    holder: z.string().min(2, "Tên chủ tài khoản quá ngắn").max(50, "Tên chủ tài khoản quá dài"),
    
    // tag: Tùy chọn (đặt tên gợi nhớ cho tài khoản)
    tag: z.string().max(30, "Tên gợi nhớ quá dài").optional(),
});

/**
 * Schema cho việc Chọn hoặc Xóa Tài khoản Ngân hàng
 */
export const BankIdSchema = z.object({
    id: z.number().int("ID ngân hàng phải là số nguyên").min(1, "ID không hợp lệ"),
});

// Kiểu dữ liệu sau khi validate thành công
export type BankAccountRequest = z.infer<typeof BankAccountSchema>;
export type BankIdRequest = z.infer<typeof BankIdSchema>;