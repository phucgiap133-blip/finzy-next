// src/lib/validations/index.ts
import { z } from "zod";

/** Auth */
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});
export const LoginSchema = RegisterSchema;
export const PasswordChangeSchema = z.object({
  current: z.string().min(6),
  next: z.string().min(6),
});
export const ForgotSendOtpSchema = z.object({ email: z.string().email() });
export const ForgotVerifySchema = z.object({ email: z.string().email(), otp: z.string().min(4).max(8) });
export const PasswordResetSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
  newPassword: z.string().min(6),
});

/** Users */
export const UserUpdateSchema = z.object({
  selectedBankId: z.number().int().positive().nullable().optional(),
});

/** Re-exports for consumers that import from subfiles */
export * as bank from "./bank";
export * as support from "./support";
export * as user from "./user";
