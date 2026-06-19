import Link from 'next/link';
import { SHORTCUTS, CATEGORIES } from '@/lib/shortcuts';

const HERO_KEYS = [
  { label: '⌘C',   top: '14%', left:  '7%',  rotate: '-10deg' },
  { label: '⌘V',   top: '30%', left:  '4%',  rotate:   '6deg' },
  { label: '⌘Z',   top: '52%', left:  '6%',  rotate:  '-5deg' },
  { label: '⌘S',   top: '68%', left: '11%',  rotate:   '7deg' },
  { label: '⌘⇧Z', top: '14%', right: '7%',  rotate:   '9deg' },
  { label: '⌘A',   top: '30%', right: '4%',  rotate:  '-5deg' },
  { label: '⌘F',   top: '52%', right: '6%',  rotate:   '6deg' },
  { label: '⌘W',   top: '68%', right:'10%',  rotate:  '-7deg' },
];

export default function HomePage() {
  const categoryCount = CATEGORIES.length - 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-bg-page)' }}>

      {/* ── 네비 ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: 'rgba(246,244,240,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold tracking-tight" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</span>
          <nav className="flex items-center gap-2">
            <Link href="/cheatsheet" className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: 'var(--sk-text-3)' }}>
              목록
            </Link>
            <Link href="/learn" className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ color: 'var(--sk-text-3)' }}>
              학습하기
            </Link>
            <Link href="/practice" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: '#1a1a1a', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              연습하기
            </Link>
          </nav>
        </div>
      </header>

      {/* ── 히어로 ────────────────────────────────────────── */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-32 overflow-hidden">
        {/* 떠다니는 키 장식 */}
        {HERO_KEYS.map((k, i) => (
          <span
            key={i}
            className="absolute pointer-events-none select-none"
            style={{
              top: k.top, left: k.left, right: k.right,
              transform: `rotate(${k.rotate})`,
              padding: '5px 11px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
              color: 'rgba(0,0,0,0.2)',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            {k.label}
          </span>
        ))}

        <div className="relative max-w-2xl w-full text-center flex flex-col items-center gap-8">
          {/* 배지 */}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 16px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#555',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {SHORTCUTS.length}개 단축키 · {categoryCount}개 카테고리
          </span>

          {/* 헤드라인 */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.8rem, 6.5vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: '#111',
            }}
          >
            맥 단축키를<br />손으로 익히세요
          </h1>

          <p style={{
            color: '#888',
            fontSize: '1rem',
            lineHeight: 1.8,
            maxWidth: 280,
            letterSpacing: '0.01em',
          }}>
            보고 외우고, 직접 눌러보며<br />자연스럽게 기억에 새겨요
          </p>

          {/* CTA 버튼 */}
          <div className="flex gap-3">
            <Link
              href="/learn"
              className="px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{
                background: 'white',
                border: '1.5px solid rgba(0,0,0,0.1)',
                color: '#222',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              📖 학습하기
            </Link>
            <Link
              href="/practice"
              className="px-7 py-3.5 rounded-xl font-semibold text-base text-white transition-all hover:-translate-y-0.5"
              style={{
                background: '#1a1a1a',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              ⌨️ 연습하기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 기능 카드 ──────────────────────────────────────── */}
      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              href: '/learn',
              icon: '📖',
              title: '학습하기',
              desc: '단축키를 직접 입력하며 손에 익히고, 즐겨찾기로 중요한 것만 모아요',
            },
            {
              href: '/random',
              icon: '🎲',
              title: '랜덤 학습',
              desc: '카테고리 없이 랜덤으로 단축키를 골라 바로 학습해요',
            },
            {
              href: '/practice',
              icon: '⌨️',
              title: '연습하기',
              desc: '동작 설명이 나오면 실제로 키를 눌러봐요. 타이머 챌린지도 있어요',
            },
            {
              href: '/cheatsheet',
              icon: '📋',
              title: '단축키 목록',
              desc: '전체 단축키를 카테고리별로 한눈에 확인하세요',
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group p-6 rounded-2xl transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--sk-bg-card)',
                border: '1px solid var(--sk-border)',
                boxShadow: '0 2px 12px var(--sk-shadow-md)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: 'var(--sk-bg)' }}
              >
                {card.icon}
              </div>
              <h3
                className="font-bold text-base mb-1.5 transition-colors"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--sk-text)' }}
              >
                {card.title}
              </h3>
              <p style={{ color: 'var(--sk-text-4)', fontSize: '0.8rem', lineHeight: 1.65 }}>
                {card.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 푸터 ──────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }} className="py-8">
        <div className="text-center flex flex-col items-center gap-1">
          <p style={{ color: '#bbb', fontSize: '0.72rem', fontStyle: 'italic' }}>
            온 세상에, 늘 푸른 나무처럼
          </p>
          <p style={{ color: '#bbb', fontSize: '0.72rem' }}>
            made by <span style={{ fontWeight: 600, color: '#999' }}>온늘</span>
          </p>
        </div>
      </div>
    </div>
  );
}
