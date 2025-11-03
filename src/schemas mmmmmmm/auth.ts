import { z } from "zod";

// Đăng ký
export const RegisterSchema = z.object({
  email: z.string().trim().min(1, "Email không được bỏ trống").email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải từ 8 ký tự trở lên"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

// 🔐 Đăng nhập (THÊM MỚI)
export const LoginSchema = z.object({
  email: z.string().trim().min(1, "Email không được bỏ trống").email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải từ 8 ký tự trở lên"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Quên mật khẩu - gửi OTP
export const ForgotSendOtpSchema = z.object({
  email: z.string().trim().min(1, "Email không được bỏ trống").email("Email không hợp lệ"),
});
export type ForgotSendOtpInput = z.infer<typeof ForgotSendOtpSchema>;

// Quên mật khẩu - verify OTP
export const ForgotVerifySchema = z.object({
  email: z.string().trim().min(1, "Email không được bỏ trống").email("Email không hợp lệ"),
  otp: z.string().trim().length(6, "Mã OTP phải có 6 chữ số"),
});
export type ForgotVerifyInput = z.infer<typeof ForgotVerifySchema>;

// Reset mật khẩu
export const PasswordResetSchema = z.object({
  email: z.string().trim().min(1, "Email không được bỏ trống").email("Email không hợp lệ"),
  otp: z.string().trim().length(6, "Mã OTP phải có 6 chữ số"),
  newPassword: z.string().min(8, "Mật khẩu mới phải từ 8 ký tự trở lên"),
});
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>;

// Đổi mật khẩu
export const PasswordChangeSchema = z.object({
  current: z.string().min(8, "Mật khẩu hiện tại phải từ 8 ký tự trở lên"),
  next: z.string().min(8, "Mật khẩu mới phải từ 8 ký tự trở lên"),
});
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;
