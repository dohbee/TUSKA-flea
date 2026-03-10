import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/header";

export const metadata: Metadata = {
  title: "TUSKA Flea",
  description: "도쿄 이과 대학교 한국인 유학생 대상 중고/나눔 게시판",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-black">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}