"use client";

import React from "react";
import {
  SessionProvider as NextAuthSessionProvider,
  type SessionProviderProps,
} from "next-auth/react";

/**
 * Bọc NextAuth SessionProvider với cấu hình ổn định cho App Router.
 * - Tắt refetch nền để tránh call dư thừa.
 * - Không đòi hỏi truyền session từ server (NextAuth tự khôi phục).
 */
export default function SessionProvider({
  children,
  ...rest
}: { children: React.ReactNode } & Omit<SessionProviderProps, "children">) {
  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={0}
      {...rest}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
