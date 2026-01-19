// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/app/api/_db";

const authHandler = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7d
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        const user = db.auth.users.find((u) => u.email.toLowerCase() === email && u.password === password);
        if (!user) return null;
        // Trả về payload tối thiểu cho JWT
        return { id: email, email, role: "USER" as const };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Lần đăng nhập đầu tiên có "user"
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // role -> từ DB hoặc mặc định USER
        token.role = (user as any).role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      // Gắn role/email/id vào session
      if (session.user) {
        (session.user as any).id = token.id || token.sub || session.user.email!;
        (session.user as any).role = (token as any).role || "USER";
        session.user.email = (token.email as string) || session.user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // tuỳ UI của bạn
  },
});

export const { GET, POST } = authHandler;
