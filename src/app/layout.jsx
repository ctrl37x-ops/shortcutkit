import "@/styles/globals.css";

export const metadata = {
  title: "내 프로젝트",
  description: "바이브코딩으로 만든 웹 애플리케이션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
