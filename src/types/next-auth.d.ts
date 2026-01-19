// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import type { Role } from "@/server/authz";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role; // ✅ string union
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}
