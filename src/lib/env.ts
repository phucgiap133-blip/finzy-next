// src/lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_USE_MOCK: z.enum(["0", "1"]).default("0"),
  NEXT_PUBLIC_API_URL: z.string().default("/api"),
  NEXT_PUBLIC_APP_ORIGIN: z.string().url().optional(),

  // NextAuth (nếu dùng)
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // JWT (server/jwt dùng ACCESS/REFRESH; lib/jwt dùng JWT_SECRET cho legacy)
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_SECRET: z.string().min(16).default("fallback_secret_key"),

  // DB
  DATABASE_URL: z.string(),

  // Mail
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Redis (BullMQ + rate-limit)
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),

  // Dev bypass
  DEV_AUTH_BYPASS: z.enum(["0", "1"]).default("0"),
  DEV_AUTH_USER_ID: z.coerce.number().default(1),
  DEV_AUTH_ROLE: z.enum(["USER", "ADMIN"]).default("ADMIN"),
});

export const env = EnvSchema.parse(process.env);
export const isProd = env.NODE_ENV === "production";
