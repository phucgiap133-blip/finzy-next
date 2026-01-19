// src/lib/validations/support.ts
import { z } from "zod";

export const SendSupportSchema = z.object({
  room: z.string().min(1).default("default"),
  text: z.string().min(1).max(2000),
});
