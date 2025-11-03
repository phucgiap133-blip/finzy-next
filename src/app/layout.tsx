// ❌ KHÔNG được đặt "use client" ở đây — layout.tsx phải là Server Component
import type { Metadata } from "next";
import "./globals.css";
import RootClient from "@/components/RootClient";
import MenuProvider from "@/components/MenuProvider";

export const metadata: Metadata = {
  title: "Finance Task App",
  description: "Skeleton app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-bg-page text-text">
        {/* ✅ Bọc client components trong 1 layer client */}
        <MenuProvider>
          <RootClient>{children}</RootClient>
        </MenuProvider>
      </body>
    </html>
  );
}
