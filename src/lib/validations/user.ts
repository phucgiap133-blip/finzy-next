// src/lib/validations/user.ts
import { z } from "zod";

export const UserUpdateSchema = z.object({
  selectedBankId: z.number().int().positive().nullable().optional(),
});
