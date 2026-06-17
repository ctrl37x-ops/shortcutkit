'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SHORTCUTS, CATEGORIES } from '@/lib/shortcuts';

function parseDisplayKeys(display) {
  const MODS = new Set(['⌘', '⇧', '⌥', '⌃']);
  const keys = [];
  let i = 0;
  while (i < display.length) {
    if (MODS.has(display[i])) { keys.push(display[i]); i++; }
    else { keys.push(display.slice(i)); break; }
  }
  return keys;
}

function KeyBadge({ label }) {
  return <kbd className="mac-key mac-key-sm">{label}</kbd>;
}

function ShortcutKeys({ display }) {
  const keys = parseDisplayKeys(display);
  return (
    <div className="flex items-center gap-1 justify-center flex-wrap">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300 text-xs font-light">+</span>}
          <KeyBadge label={key} />
        </span>
      ))}
    </div>
  );
}

function ShortcutCard({ shortcut, isRevealed, isLearned, onReveal, onToggleLearned }) {
  return (
    <div
      onClick={onReveal}
      className="relative cursor-pointer transition-all duration-200 rounded-2xl p-5 flex flex-col"
      style={{
        background: isLearned
          ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
          : 'white',
        border: `1.5px solid ${isLearned ? '#86efac' : '#ebebeb'}`,
        boxShadow: isLearned
          ? '0 2px 12px rgba(34,197,94,0.1)'
          : '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        if (!isLearned) {
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.1)';
          e.currentTarget.style.borderColor = '#bfdbfe';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLearned) {
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = '#ebebeb';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* 숙지 체크 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleLearned(); }}
        title={isLearned ? '숙지 취소' : '숙지 완료로 표시'}
        className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all text-[10px] font-bold"
        style={
          isLearned
            ? { background: '#22c55e', borderColor: '#22c55e', color: 'white' }
            : { background: 'white', borderColor: '#d1d5db', color: 'transparent' }
        }
      >
        ✓
      </button>

      <div className="text-3xl mb-2.5">{shortcut.emoji}</div>
      <p className="font-semibold text-gray-900 text-sm leading-snug mb-1 pr-5">
        {shortcut.description}
      </p>
      <p className="text-xs text-gray-400 mb-3">{shortcut.category}</p>

      <div className="mt-auto">
        {isRevealed ? (
          <div className="pt-2.5 border-t border-gray-100 animate-slide-in-up">
            <ShortcutKeys display={shortcut.display} />
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">탭하여 확인 →</p>
        )}
      </div>
    </div>
  );
}

export default function ShortcutLearn() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [learnedIds, setLearnedIds] = useState(new Set());

  const filtered =
    selectedCategory === '전체'
      ? SHORTCUTS
      : SHORTCUTS.filter((s) => s.category === selectedCategory);

  const allFilteredRevealed = filtered.length > 0 && filtered.every((s) => revealedIds.has(s.id));

  const toggleReveal = (id) =>
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleLearned = (id) =>
    setLearnedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleToggleAllReveal = () => {
    if (allFilteredRevealed) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const learnedCount = learnedIds.size;
  const learnedPercent = Math.round((learnedCount / SHORTCUTS.length) * 100);

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      {/* 헤더 */}
      <header
        className="sticky top-0 z-10 px-6 py-3 border-b"
        style={{ background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)', borderColor: '#ebebeb' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-sm tracking-tight">
            ⌨️ ShortcutKit
          </Link>
          <nav className="flex items-center gap-4">
            <span className="text-sm font-semibold text-blue-600">학습하기</span>
            <Link
              href="/practice"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 2px 10px rgba(37,99,235,0.3)',
              }}
            >
              연습하기 →
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* 타이틀 + 진행도 */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">단축키 학습하기</h1>
            <span className="text-sm text-gray-400">
              {learnedCount} / {SHORTCUTS.length}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            카드를 탭해서 단축키를 확인하고, ✓로 숙지 여부를 표시하세요
          </p>

          {/* 진행도 바 */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ebebeb' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${learnedPercent}%`,
                background: 'linear-gradient(90deg, #22c55e, #16a34a)',
              }}
            />
          </div>
        </div>

        {/* 카테고리 탭 + 전체 보기 */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const count = cat === '전체' ? SHORTCUTS.length : SHORTCUTS.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
                  style={
                    selectedCategory === cat
                      ? { background: '#2563eb', color: 'white', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }
                      : { background: '#f0f0f0', color: '#6b7280' }
                  }
                >
                  {cat}
                  <span
                    className="ml-1.5 text-xs"
                    style={{ opacity: selectedCategory === cat ? 0.75 : 0.6 }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={handleToggleAllReveal}
            className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
          >
            {allFilteredRevealed ? '전체 숨기기' : '전체 단축키 보기'}
          </button>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((shortcut) => (
            <ShortcutCard
              key={shortcut.id}
              shortcut={shortcut}
              isRevealed={revealedIds.has(shortcut.id)}
              isLearned={learnedIds.has(shortcut.id)}
              onReveal={() => toggleReveal(shortcut.id)}
              onToggleLearned={() => toggleLearned(shortcut.id)}
            />
          ))}
        </div>

        {/* 숙지 5개 이상 → 연습 유도 */}
        {learnedCount >= 5 && (
          <div
            className="mt-12 p-8 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(37,99,235,0.02))',
              border: '1.5px solid rgba(37,99,235,0.12)',
            }}
          >
            <p className="font-bold text-gray-900 mb-1">{learnedCount}개를 외웠어요! 🎉</p>
            <p className="text-gray-500 text-sm mb-5">이제 실제로 키를 눌러 연습해볼까요?</p>
            <Link
              href="/practice"
              className="inline-block px-8 py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
              }}
            >
              연습하기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
