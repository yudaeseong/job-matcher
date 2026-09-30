import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "채용공고 매칭 분석기",
  description: "채용공고와 내 이력서를 비교해 매칭 점수와 부족한 역량을 알려주는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
