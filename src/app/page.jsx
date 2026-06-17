import Link from 'next/link';
import { SHORTCUTS, CATEGORIES } from '@/lib/shortcuts';

// 히어로 장식용 단축키 배지
function HeroKey({ label, style }) {
  return (
    <span
      className="mac-key mac-key-md absolute opacity-25 pointer-events-none select-none"
      style={style}
    >
      {label}
    </span>
  );
}

export default function HomePage() {
  const categoryCount = CATEGORIES.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 네비 */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900 tracking-tight">⌨️ ShortcutKit</span>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/learn"
              className="text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
              학습하기
            </Link>
            <Link
              href="/practice"
              className="px-4 py-1.5 rounded-lg font-semibold text-white transition-all hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 2px 12px rgba(37,99,235,0.35)',
              }}
            >
              연습하기
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-24 overflow-hidden">
        {/* 배경 그라데이션 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% -5%, rgba(37,99,235,0.09) 0%, transparent 100%)',
          }}
        />
        {/* 떠다니는 키 장식 */}
        <HeroKey label="⌘C" style={{ top: '18%', left: '10%', transform: 'rotate(-8deg)' }} />
        <HeroKey label="⌘V" style={{ top: '30%', left: '6%',  transform: 'rotate(5deg)' }} />
        <HeroKey label="⌘Z" style={{ top: '55%', left: '8%',  transform: 'rotate(-5deg)' }} />
        <HeroKey label="⌘S" style={{ top: '70%', left: '14%', transform: 'rotate(6deg)' }} />
        <HeroKey label="⌘⇧Z" style={{ top: '18%', right: '9%',  transform: 'rotate(7deg)' }} />
        <HeroKey label="⌘A"  style={{ top: '32%', right: '6%',  transform: 'rotate(-4deg)' }} />
        <HeroKey label="⌘F"  style={{ top: '55%', right: '9%',  transform: 'rotate(5deg)' }} />
        <HeroKey label="⌘W"  style={{ top: '70%', right: '13%', transform: 'rotate(-6deg)' }} />

        {/* 콘텐츠 */}
        <div className="relative max-w-2xl w-full text-center flex flex-col items-center gap-8">
          {/* 배지 */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(37,99,235,0.08)',
              color: '#2563eb',
              border: '1px solid rgba(37,99,235,0.18)',
            }}
          >
            <span>✦</span> {SHORTCUTS.length}개 단축키 · {categoryCount}개 카테고리
          </span>

          {/* 헤드라인 */}
          <h1
            className="text-6xl font-extrabold leading-tight tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #0f172a 20%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            맥 단축키를<br />손으로 익히세요
          </h1>

          <p className="text-gray-500 text-lg max-w-xs leading-relaxed">
            보고 외우고, 직접 눌러보며<br />자연스럽게 기억에 새겨요
          </p>

          {/* CTA */}
          <div className="flex gap-3">
            <Link
              href="/learn"
              className="px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{
                border: '2px solid #2563eb',
                color: '#2563eb',
                background: 'white',
              }}
            >
              📖 학습하기
            </Link>
            <Link
              href="/practice"
              className="px-7 py-3.5 rounded-xl font-semibold text-base text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 20px rgba(37,99,235,0.38)',
              }}
            >
              ⌨️ 연습하기
            </Link>
          </div>
        </div>
      </section>

      {/* 기능 카드 */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-5">
          <Link
            href="/learn"
            className="group p-7 rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
              style={{ background: 'rgba(37,99,235,0.08)' }}
            >
              📖
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
              학습하기
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              카드를 탭해 단축키를 확인하고, 외운 것을 체크하며 진행도를 관리해요
            </p>
          </Link>

          <Link
            href="/practice"
            className="group p-7 rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
              style={{ background: 'rgba(37,99,235,0.08)' }}
            >
              ⌨️
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
              연습하기
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              동작 설명이 나오면 실제로 키를 눌러봐요. 틀린 것만 골라 집중 연습도 할 수 있어요
            </p>
          </Link>
        </div>
      </section>

      {/* 하단 스탯 */}
      <div className="border-t border-gray-100 py-8">
        <div className="max-w-xs mx-auto flex items-center justify-around text-center">
          {[
            { value: SHORTCUTS.length, label: '단축키' },
            { value: categoryCount, label: '카테고리' },
            { value: '무료', label: '이용료' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
