// src/lib/validations/bank.ts
import { z } from "zod";

export const BankIdSchema = z.object({ id: z.number().int().positive() });

export const BankAccountSchema = z.object({
  bankName: z.string().min(2),
  accountNumber: z.string().min(4),
  holder: z.string().min(2),
  tag: z.string().optional(),
});
