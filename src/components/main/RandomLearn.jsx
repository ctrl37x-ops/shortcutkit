'use client';
import { useState } from 'react';
import Link from 'next/link';
import ShortcutLearn from '@/components/main/ShortcutLearn';
import { SHORTCUTS } from '@/lib/shortcuts';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const OPTIONS = [
  { count: 10,              label: '10개',  sub: '가볍게 시작' },
  { count: 20,              label: '20개',  sub: '표준 분량' },
  { count: 30,              label: '30개',  sub: '집중 훈련' },
  { count: SHORTCUTS.length, label: '전체', sub: `${SHORTCUTS.length}개 전부` },
];

export default function RandomLearn() {
  const [config, setConfig] = useState(null);

  // 세션 시작: 랜덤 섞은 뒤 count개 슬라이스
  const handlePick = (count) => {
    const pool = shuffle(SHORTCUTS).slice(0, count);
    setConfig({ shortcuts: pool, category: count === SHORTCUTS.length ? '전체 랜덤' : `랜덤 ${count}개` });
  };

  // 세션 중이면 ShortcutLearn 에 주입
  if (config) {
    return (
      <ShortcutLearn
        defaultShortcuts={config.shortcuts}
        defaultCategory={config.category}
        onExitToRoot={() => setConfig(null)}
      />
    );
  }

  // ── 픽커 화면 ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f6f4f0' }}>

      {/* 네비 */}
      <header
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: 'rgba(246,244,240,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold tracking-tight text-gray-900 hover:opacity-70 transition-opacity">
            ⌨️ ShortcutKit
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/learn"
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: '#6b6b6b' }}
            >
              학습하기
            </Link>
            <Link
              href="/practice"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: '#1a1a1a', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
            >
              도전하기
            </Link>
          </nav>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-md flex flex-col items-center gap-10">

          {/* 제목 */}
          <div className="text-center flex flex-col gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              🎲
            </div>
            <h1
              className="text-3xl font-black tracking-tight"
              style={{ color: '#111', fontFamily: 'var(--font-serif)' }}
            >
              랜덤 학습하기
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7 }}>
              몇 개를 학습할까요?<br />카드를 섞어 바로 시작해요
            </p>
          </div>

          {/* 개수 선택 그리드 */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {OPTIONS.map(({ count, label, sub }) => (
              <button
                key={count}
                onClick={() => handlePick(count)}
                className="group flex flex-col items-center gap-1 py-6 rounded-2xl transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: 'white',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="text-2xl font-black group-hover:text-blue-600 transition-colors"
                  style={{ color: '#111' }}
                >
                  {label}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{sub}</span>
              </button>
            ))}
          </div>

          {/* 홈 링크 */}
          <Link
            href="/"
            style={{ fontSize: '0.8rem', color: '#bbb' }}
            className="hover:text-gray-500 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
