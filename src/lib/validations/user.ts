// src/lib/validations/user.ts
import { z } from "zod";

export const UserUpdateSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").optional(),
  role: z.enum(["USER", "ADMIN"]).optional(), // ✅ bỏ SUPPORT
}).refine((data) => Object.keys(data).length > 0, {
  message: "Không có dữ liệu để cập nhật",
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
