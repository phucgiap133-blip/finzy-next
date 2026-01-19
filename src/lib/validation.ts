// src/lib/validations.ts
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const PasswordChangeSchema = z.object({
  current: z.string().min(6),
  next: z.string().min(6),
});

export const ForgotSendOtpSchema = z.object({
  email: z.string().email(),
});

export const ForgotVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const PasswordResetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
