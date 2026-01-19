// src/types/index.ts
export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: number;
  role: Role;
  email?: string;
}
