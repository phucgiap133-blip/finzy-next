// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/tokens.css";

import RootClient from "@/components/RootClient";
import MenuProvider from "@/components/MenuProvider";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionProvider from "@/components/SessionProvider";
import ThemeRegistry from "@/components/ThemeRegistry";
import InitialLoader from "@/components/InitialLoader";

export const metadata: Metadata = {
  title: "Finance Task App",
  description: "Skeleton app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  // ✅ bỏ viewport ở metadata (Next 14+ yêu cầu dùng export const viewport)
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // ✅ iOS safe-area/viewport ổn hơn
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="fixed inset-0 overflow-hidden bg-bg-page text-text antialiased">
        <InitialLoader />

        {/* ✅ DIV SCROLL DUY NHẤT */}
        <div
          id="app-scroll-root"
          className="h-full overflow-y-auto overscroll-none pb-20"
        >
          <SessionProvider>
            <ErrorBoundary>
              <ThemeRegistry>
                <MenuProvider>
                  <RootClient>
                    <ToastProvider>{children}</ToastProvider>
                  </RootClient>
                </MenuProvider>
              </ThemeRegistry>
            </ErrorBoundary>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
