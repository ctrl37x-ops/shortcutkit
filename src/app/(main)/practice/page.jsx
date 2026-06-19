import ShortcutGame from '@/components/main/ShortcutGame';

export const metadata = {
  title: '도전하기 — ShortcutKit',
  description: '맥 단축키를 직접 눌러보며 도전하세요. 타이머 챌린지와 점수·스트릭 시스템으로 실력을 키워요.',
};

export default function PracticePage() {
  return <ShortcutGame />;
}
