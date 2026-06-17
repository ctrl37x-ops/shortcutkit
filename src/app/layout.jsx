import "@/styles/globals.css";

export const metadata = {
  title: "ShortcutKit — 맥 단축키를 손으로 익히세요",
  description: "맥 단축키를 카드로 학습하고 직접 눌러보며 익히는 앱. 54개 단축키, 6개 카테고리.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
