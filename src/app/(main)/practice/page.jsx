import ShortcutGame from '@/components/main/ShortcutGame';

export const metadata = {
  title: '맥 단축키 트레이너',
  description: '맥 단축키를 직접 눌러 연습하는 타이핑 레이슨 스타일 트레이너',
};

export default function PracticePage() {
  return <ShortcutGame />;
}
