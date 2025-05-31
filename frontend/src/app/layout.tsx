import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT 세미나 신청",
  description: "사내 IT 세미나 신청 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
