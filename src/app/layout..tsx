import "./globals.css";
import RootClient from "../components/RootClient";

export const metadata = {
  title: "Finance Task App",
  description: "Skeleton app"
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-bg-page text-text">
        <RootClient>{children}</RootClient>
      </body>
    </html>
  );
}
