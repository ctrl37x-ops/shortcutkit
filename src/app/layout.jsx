import "@/styles/globals.css";
import ThemeInit from "@/components/main/ThemeInit";
import ThemeToggle from "@/components/main/ThemeToggle";

export const metadata = {
  title: "ShortcutKit — 맥 단축키를 손으로 익히세요",
  description: "맥 단축키를 카드로 학습하고 직접 눌러보며 익히는 앱. 106개 단축키, 8개 카테고리.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <ThemeInit />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
