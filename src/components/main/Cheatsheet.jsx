'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SHORTCUTS, CATEGORIES } from '@/lib/shortcuts';

const MASTERED_KEY = 'shortcutkit_mastered';
const FAVORITES_KEY = 'shortcutkit_favorites';

function getMasteredIds() {
  try { return new Set(JSON.parse(localStorage.getItem(MASTERED_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function getFavoriteIds() {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')); }
  catch { return new Set(); }
}

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
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {parseDisplayKeys(display).map((k, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: 'var(--sk-text-4)', fontSize: '0.6rem' }}>+</span>}
          <KeyBadge label={k} />
        </span>
      ))}
    </div>
  );
}

const CATEGORY_META = {
  '기본 조작':   '📋',
  '창/앱 관리':  '🪟',
  '브라우저':    '🌐',
  '텍스트 편집': '✏️',
  '커서/선택':   '↔️',
  'Finder':      '📁',
  '스크린샷':    '📸',
  '시스템':      '⚙️',
};

export default function Cheatsheet() {
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('전체');

  useEffect(() => {
    setMasteredIds(getMasteredIds());
    setFavoriteIds(getFavoriteIds());
  }, []);

  const q = search.trim().toLowerCase();
  const categories = CATEGORIES.filter((c) => c !== '전체');

  const filtered = SHORTCUTS.filter((s) => {
    const matchCat = selectedCat === '전체' || s.category === selectedCat;
    const matchSearch = !q ||
      s.description.toLowerCase().includes(q) ||
      s.display.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // 카테고리별 그룹
  const grouped = categories
    .map((cat) => ({ cat, items: filtered.filter((s) => s.category === cat) }))
    .filter(({ items }) => items.length > 0);

  const masteredCount = SHORTCUTS.filter((s) => masteredIds.has(s.id)).length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--sk-bg)', color: 'var(--sk-text)' }}>
      {/* 헤더 */}
      <header className="sticky top-0 z-20 border-b px-6 py-3"
        style={{ background: 'var(--sk-header-bg)', backdropFilter: 'blur(14px)', borderColor: 'var(--sk-border)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="font-bold text-sm shrink-0" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</Link>
          {/* 검색 */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--sk-text-4)' }}>🔍</span>
            <input
              type="text"
              placeholder="검색…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--sk-bg-input)', border: '1.5px solid var(--sk-border)', color: 'var(--sk-text)' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'var(--sk-text-4)' }}>✕</button>
            )}
          </div>
          <nav className="flex items-center gap-2 shrink-0">
            <Link href="/learn" className="text-sm" style={{ color: 'var(--sk-text-3)' }}>학습하기</Link>
            <Link href="/practice"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#1a1a1a' }}>도전하기</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 타이틀 + 통계 */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--sk-text)' }}>단축키 목록</h1>
            <p className="text-sm" style={{ color: 'var(--sk-text-3)' }}>
              총 {SHORTCUTS.length}개 단축키
              {masteredCount > 0 && (
                <span className="ml-2 font-semibold" style={{ color: '#22c55e' }}>· {masteredCount}개 완료</span>
              )}
            </p>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['전체', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={selectedCat === cat
                ? { background: '#1a1a1a', color: '#fff' }
                : { background: 'var(--sk-bg-card)', color: 'var(--sk-text-3)', border: '1.5px solid var(--sk-border)' }}
            >
              {CATEGORY_META[cat] ?? ''} {cat}
            </button>
          ))}
        </div>

        {/* 단축키 목록 */}
        {grouped.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: 'var(--sk-text-4)' }}>검색 결과가 없어요</p>
        ) : (
          <div className="flex flex-col gap-8">
            {grouped.map(({ cat, items }) => (
              <section key={cat}>
                <h2 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: 'var(--sk-text-4)' }}>
                  <span>{CATEGORY_META[cat] ?? '📌'}</span>
                  <span>{cat}</span>
                  <span className="font-normal">({items.length})</span>
                </h2>
                <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--sk-border)' }}>
                  {items.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-4 py-3 transition-colors"
                      style={{
                        background: 'var(--sk-bg-card)',
                        borderTop: i > 0 ? '1px solid var(--sk-border)' : 'none',
                      }}
                    >
                      {/* 왼쪽: 이모지 + 설명 */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg shrink-0">{s.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--sk-text)' }}>{s.description}</p>
                          {s.browserBlocked && (
                            <p className="text-xs" style={{ color: '#f59e0b' }}>⚠️ 브라우저 입력 불가</p>
                          )}
                        </div>
                      </div>
                      {/* 오른쪽: 뱃지 + 키 */}
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="flex items-center gap-1">
                          {masteredIds.has(s.id) && (
                            <span className="text-xs font-bold" style={{ color: '#22c55e' }}>✓</span>
                          )}
                          {favoriteIds.has(s.id) && (
                            <span className="text-xs" style={{ color: '#ef4444' }}>♥</span>
                          )}
                        </div>
                        <ShortcutKeys display={s.display} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
