'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SHORTCUTS, CATEGORIES } from '@/lib/shortcuts';
import { getStreak, recordActivity } from '@/lib/stats';

const REPS = 3;
const WRONG_KEY = 'shortcutkit_wrong';
const MASTERED_KEY = 'shortcutkit_mastered';
const FAVORITES_KEY = 'shortcutkit_favorites';

// ── 오답 노트 유틸 ───────────────────────────────────────────────────────

function getWrongIds() {
  try { return new Set(JSON.parse(localStorage.getItem(WRONG_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function updateWrong(addIds, removeIds) {
  const current = getWrongIds();
  addIds.forEach((id) => current.add(id));
  removeIds.forEach((id) => current.delete(id));
  localStorage.setItem(WRONG_KEY, JSON.stringify([...current]));
}

// ── 숙달 / 즐겨찾기 유틸 ───────────────────────────────────────────────

function getMasteredIds() {
  try { return new Set(JSON.parse(localStorage.getItem(MASTERED_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function updateMastered(addIds) {
  const current = getMasteredIds();
  addIds.forEach((id) => current.add(id));
  localStorage.setItem(MASTERED_KEY, JSON.stringify([...current]));
}

function getFavoriteIds() {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function toggleFavorite(id) {
  const current = getFavoriteIds();
  if (current.has(id)) current.delete(id);
  else current.add(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...current]));
}

// ── 공통 유틸 ────────────────────────────────────────────────────────────

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

function KeyBadge({ label, size = 'md' }) {
  return <kbd className={`mac-key mac-key-${size}`}>{label}</kbd>;
}

function ShortcutKeys({ display, size = 'md' }) {
  const keys = parseDisplayKeys(display);
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span style={{ color: 'var(--sk-text-5)', fontWeight: 300 }}>+</span>}
          <KeyBadge label={key} size={size} />
        </span>
      ))}
    </div>
  );
}

// 한국어 키보드에서 ₩ → ` 정규화
function normalizeKey(key) {
  return key === '₩' ? '`' : key;
}

// 한글 자모/음절 여부 감지
function isHangul(key) {
  if (!key || key.length !== 1) return false;
  const code = key.charCodeAt(0);
  return (code >= 0xAC00 && code <= 0xD7AF) || (code >= 0x1100 && code <= 0x11FF) || (code >= 0x3130 && code <= 0x318F);
}

function matchKeys(event, expected) {
  return (
    event.metaKey === expected.meta &&
    event.shiftKey === expected.shift &&
    event.altKey === expected.alt &&
    event.ctrlKey === expected.ctrl &&
    normalizeKey(event.key).toLowerCase() === expected.key.toLowerCase()
  );
}

const KEY_LABEL = {
  ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
  Backspace: '⌫', Delete: '⌦', Enter: '↩', Escape: '⎋', Tab: '⇥',
};

function formatPressedKeys(event) {
  const parts = [];
  if (event.metaKey) parts.push('⌘');
  if (event.ctrlKey) parts.push('⌃');
  if (event.altKey) parts.push('⌥');
  if (event.shiftKey) parts.push('⇧');
  let k = normalizeKey(event.key);
  // shift 조합 시 e.key가 조합 문자(예:'>')이면 물리 키 레이블('.')로 역변환
  if (event.shiftKey && SHIFT_TO_BASE[k]) k = SHIFT_TO_BASE[k];
  const key = KEY_LABEL[k] ?? (k.length === 1 ? k.toUpperCase() : k);
  parts.push(key);
  return parts.join('');
}

// ── Mac 키보드 컴포넌트 ──────────────────────────────────────────────────

// Shift로 생성되는 문자 → 실제 물리 키 매핑
const SHIFT_TO_BASE = {
  '{': '[', '}': ']', '>': '.', '<': ',', '?': '/', ':': ';',
  '"': "'", '|': '\\', '_': '-', '+': '=', '~': '`',
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
};

function toPhysKey(key) {
  return SHIFT_TO_BASE[key] ?? key;
}

// [keyId, units, displayLabel?]
const KEY_ROWS = [
  [
    ['`',1],['1',1],['2',1],['3',1],['4',1],['5',1],['6',1],
    ['7',1],['8',1],['9',1],['0',1],['-',1],['=',1],['backspace',1.5,'del'],
  ],
  [
    ['__tab',1.5,'tab'],['q',1],['w',1],['e',1],['r',1],['t',1],['y',1],
    ['u',1],['i',1],['o',1],['p',1],['[',1],[']',1],['\\',1],
  ],
  [
    ['__caps',1.75,'caps'],['a',1],['s',1],['d',1],['f',1],['g',1],['h',1],
    ['j',1],['k',1],['l',1],[';',1],["'",1],['__ret',1.75,'ret'],
  ],
  [
    ['shift',2.25,'⇧'],['z',1],['x',1],['c',1],['v',1],['b',1],['n',1],
    ['m',1],[',',1],['.',1],['/',1],['shift',2.25,'⇧'],
  ],
];

const MOD_ROW = [
  ['__fn',1,'fn'],['ctrl',1,'⌃'],['alt',1.25,'⌥'],['cmd',1.5,'⌘'],
  ['__space',4.25,''],['cmd',1.5,'⌘'],['opt',1,'⌥'],
];
// MOD_ROW units 합: 1+1+1.25+1.5+4.25+1.5+1 = 11.5 → 화살표 3 → 합계 14.5

function hlStyle(on) {
  return on
    ? { background: '#2563eb', color: '#fff', border: '1px solid #1d4ed8', borderBottom: '2px solid #1e40af', boxShadow: '0 0 0 2px rgba(37,99,235,0.35)' }
    : { background: '#f3f3f3', color: '#444', border: '1px solid #c0c0c0', borderBottom: '2px solid #8e8e8e', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)' };
}
function hlStyleWide(on) {
  return on ? hlStyle(true) : { ...hlStyle(false), background: '#e0e0e0' };
}

function KRow({ children }) {
  return <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>{children}</div>;
}

function KKey({ keyId, units, label, physKey, meta, shift, alt, ctrl }) {
  const wide = units > 1;
  const special = keyId.startsWith('__');
  let on = false;
  if (!special) {
    if (keyId === 'shift') on = shift;
    else if (keyId === 'cmd') on = meta;
    else if (keyId === 'alt' || keyId === 'opt') on = alt;
    else if (keyId === 'ctrl') on = ctrl;
    else on = keyId === physKey;
  }
  const display = label ?? keyId;
  const style = wide ? hlStyleWide(on) : hlStyle(on);
  return (
    <div style={{
      flex: `${units} 0 0px`, minWidth: 0, height: 24, borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: display.length > 2 ? '0.5rem' : '0.65rem',
      fontWeight: on ? 700 : 400, userSelect: 'none', ...style,
    }}>
      {display}
    </div>
  );
}

function AKey({ label, on }) {
  return (
    <div style={{
      flex: '1 0 0px', borderRadius: 3,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.55rem', fontWeight: on ? 700 : 400, userSelect: 'none',
      ...(on
        ? { background: '#2563eb', color: '#fff', border: '1px solid #1d4ed8', boxShadow: '0 0 0 2px rgba(37,99,235,0.35)' }
        : { background: '#e0e0e0', color: '#444', border: '1px solid #c0c0c0', borderBottom: '1px solid #8e8e8e' }),
    }}>
      {label}
    </div>
  );
}

function MacKeyboard({ shortcut }) {
  if (!shortcut) return null;
  const { meta, shift, alt, ctrl, key } = shortcut.keys;
  const physKey = toPhysKey(key);

  const kProps = { physKey, meta, shift, alt, ctrl };

  return (
    <div style={{ padding: 6, background: '#bdbdbd', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
      {KEY_ROWS.map((row, ri) => (
        <KRow key={ri}>
          {row.map(([id, units, label], ki) => (
            <KKey key={`${ri}-${ki}`} keyId={id} units={units} label={label} {...kProps} />
          ))}
        </KRow>
      ))}

      {/* 하단: 수정자 키 + 화살표 */}
      <div style={{ display: 'flex', gap: 2 }}>
        {/* 수정자 (11.5 units) */}
        <div style={{ flex: '11.5 0 0px', display: 'flex', gap: 2 }}>
          {MOD_ROW.map(([id, units, label], i) => (
            <KKey key={i} keyId={id} units={units} label={label} {...kProps} />
          ))}
        </div>
        {/* 화살표 (3 units, 2행) */}
        <div style={{ flex: '3 0 0px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ flex: 1, display: 'flex', gap: 2 }}>
            <div style={{ flex: 1 }} />
            <AKey label="↑" on={physKey === 'arrowup'} />
            <div style={{ flex: 1 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 2 }}>
            <AKey label="←" on={physKey === 'arrowleft'} />
            <AKey label="↓" on={physKey === 'arrowdown'} />
            <AKey label="→" on={physKey === 'arrowright'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 카테고리 메타데이터 ─────────────────────────────────────────────────

const CATEGORY_META = {
  '기본 조작':   { emoji: '📋', desc: '복사·저장·찾기 등 필수 기본기' },
  '창/앱 관리':  { emoji: '🪟', desc: '탭과 창을 효율적으로 관리' },
  '브라우저':    { emoji: '🌐', desc: '웹 탐색, 북마크, 확대/축소' },
  '텍스트 편집': { emoji: '✏️', desc: '서식, 링크, 찾기' },
  '커서/선택':   { emoji: '↔️', desc: '커서 이동과 텍스트 선택' },
  'Finder':      { emoji: '📁', desc: 'macOS 파인더 파일 관리' },
  '스크린샷':    { emoji: '📸', desc: '화면 캡처 및 클립보드 저장' },
  '시스템':      { emoji: '⚙️', desc: 'Spotlight·잠금·Mission Control·Space 전환' },
};

// ── 홈 화면 ──────────────────────────────────────────────────────────────

function LearnHome({ onStart }) {
  const [wrongIds, setWrongIds] = useState(new Set());
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [streak, setStreak] = useState(null);
  const [search, setSearch] = useState('');
  const nonAll = CATEGORIES.filter((c) => c !== '전체');

  useEffect(() => {
    setWrongIds(getWrongIds());
    setMasteredIds(getMasteredIds());
    setFavoriteIds(getFavoriteIds());
    setStreak(getStreak());
  }, []);

  const wrongShortcuts = SHORTCUTS.filter((s) => wrongIds.has(s.id));
  const favoriteShortcuts = SHORTCUTS.filter((s) => favoriteIds.has(s.id));
  const q = search.trim().toLowerCase();
  const searchResults = q
    ? SHORTCUTS.filter(
        (s) =>
          s.description.toLowerCase().includes(q) ||
          s.display.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--sk-bg)' }}>
      <header className="sticky top-0 z-10 border-b px-6 py-3"
        style={{ background: 'var(--sk-header-bg)', backdropFilter: 'blur(12px)', borderColor: 'var(--sk-border)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-sm" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</Link>
          <nav className="flex items-center gap-4">
            <span className="text-sm font-semibold text-blue-600">학습하기</span>
            <Link href="/cheatsheet" className="text-sm" style={{ color: 'var(--sk-text-3)' }}>목록</Link>
            <Link href="/practice"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 2px 10px rgba(37,99,235,0.3)' }}>
              연습하기 →
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--sk-text)' }}>단축키 학습하기</h1>
            <p className="text-sm" style={{ color: 'var(--sk-text-3)' }}>
              각 단축키를 <strong style={{ color: 'var(--sk-text-2)' }}>{REPS}번</strong> 직접 입력하며 손에 익혀요
            </p>
          </div>
          {/* 스트릭 뱃지 */}
          {streak?.streak > 0 && (
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)' }}>
              <span className="text-lg">🔥</span>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: 'var(--sk-text)' }}>{streak.streak}일 연속</div>
                <div className="text-xs" style={{ color: 'var(--sk-text-3)' }}>오늘 {streak.todayCount}개</div>
              </div>
            </div>
          )}
        </div>

        {/* 검색 */}
        <div className="mb-6 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm" style={{ color: 'var(--sk-text-5)' }}>🔍</span>
          <input
            type="text"
            placeholder="단축키 검색 (예: 복사, ⌘C, Finder)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', color: 'var(--sk-text)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            onFocus={(e) => { e.target.style.borderColor = '#bfdbfe'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--sk-border)'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-sm"
              style={{ color: 'var(--sk-text-4)' }}
            >✕</button>
          )}
        </div>

        {/* 검색 결과 */}
        {searchResults ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--sk-text-4)' }}>
              검색 결과 ({searchResults.length}개)
            </p>
            {searchResults.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: 'var(--sk-text-4)' }}>검색 결과가 없어요</p>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4">
                  {searchResults.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{s.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--sk-text-2)' }}>{s.description}</p>
                          <p className="text-xs" style={{ color: 'var(--sk-text-4)' }}>{s.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {masteredIds.has(s.id) && <span className="text-xs text-green-500 font-bold">✓</span>}
                        {favoriteIds.has(s.id) && <span className="text-xs text-pink-400">♥</span>}
                        <ShortcutKeys display={s.display} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onStart(searchResults, `검색: "${search}"`)}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 3px 12px rgba(37,99,235,0.3)' }}
                >
                  검색 결과 {searchResults.length}개 학습하기
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* 전체 + 오답 노트 + 즐겨찾기 + 랜덤 */}
            <div className="mb-6 flex flex-col gap-2.5">
              <button onClick={() => onStart(SHORTCUTS, '전체')}
                className="w-full p-5 rounded-2xl text-left transition-all hover:-translate-y-0.5 flex items-center justify-between group"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.07), rgba(79,70,229,0.04))', border: '1.5px solid rgba(37,99,235,0.18)', boxShadow: '0 2px 16px rgba(37,99,235,0.08)' }}>
                <div>
                  <div className="font-bold text-lg" style={{ color: 'var(--sk-text)' }}>⚡ 전체 학습</div>
                  <div className="text-sm mt-0.5" style={{ color: 'var(--sk-text-3)' }}>
                    모든 {SHORTCUTS.length}개 단축키 · 각 {REPS}회 입력
                    {masteredIds.size > 0 && (
                      <span className="ml-2 text-green-500 font-semibold">{masteredIds.size}/{SHORTCUTS.length} 완료</span>
                    )}
                  </div>
                </div>
                <span className="text-blue-400 text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {wrongShortcuts.length > 0 && (
                <button
                  onClick={() => onStart(shuffle(wrongShortcuts), `오답 노트 (${wrongShortcuts.length}개)`)}
                  className="w-full p-5 rounded-2xl text-left transition-all hover:-translate-y-0.5 flex items-center justify-between group"
                  style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.07), rgba(220,38,38,0.04))', border: '1.5px solid rgba(239,68,68,0.2)', boxShadow: '0 2px 16px rgba(239,68,68,0.06)' }}>
                  <div>
                    <div className="font-bold text-lg" style={{ color: 'var(--sk-text)' }}>📝 오답 노트</div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--sk-text-3)' }}>이전에 틀린 {wrongShortcuts.length}개 단축키 집중 연습</div>
                  </div>
                  <span className="text-red-300 text-xl group-hover:translate-x-1 transition-transform">→</span>
                </button>
              )}

              {favoriteShortcuts.length > 0 && (
                <button
                  onClick={() => onStart(favoriteShortcuts, `즐겨찾기 (${favoriteShortcuts.length}개)`)}
                  className="w-full p-5 rounded-2xl text-left transition-all hover:-translate-y-0.5 flex items-center justify-between group"
                  style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.06), rgba(251,113,133,0.04))', border: '1.5px solid rgba(251,113,133,0.25)', boxShadow: '0 2px 16px rgba(236,72,153,0.06)' }}>
                  <div>
                    <div className="font-bold text-lg" style={{ color: 'var(--sk-text)' }}>♥ 즐겨찾기</div>
                    <div className="text-sm mt-0.5" style={{ color: 'var(--sk-text-3)' }}>북마크한 {favoriteShortcuts.length}개 단축키</div>
                  </div>
                  <span className="text-pink-300 text-xl group-hover:translate-x-1 transition-transform">→</span>
                </button>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => onStart(shuffle(SHORTCUTS).slice(0, n), `랜덤 ${n}개`)}
                    className="py-4 rounded-xl flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--sk-border)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                  >
                    <span className="text-xl">🎲</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--sk-text)' }}>{n}개</span>
                    <span className="text-xs" style={{ color: 'var(--sk-text-4)' }}>랜덤</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--sk-text-4)' }}>카테고리별 학습</p>
            <div className="flex flex-col gap-2.5">
              {nonAll.map((cat) => {
                const items = SHORTCUTS.filter((s) => s.category === cat);
                const interactive = items.filter((s) => !s.browserBlocked).length;
                const allBlocked = interactive === 0;
                const meta = CATEGORY_META[cat] ?? { emoji: '📌', desc: '' };
                const masteredInCat = items.filter((s) => masteredIds.has(s.id)).length;
                return (
                  <button key={cat} onClick={() => onStart(items, cat)}
                    className="w-full p-4 rounded-xl text-left transition-all duration-150 flex items-center justify-between group"
                    style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = allBlocked ? '#fde68a' : '#bfdbfe'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = allBlocked ? '0 4px 16px rgba(245,158,11,0.08)' : '0 4px 16px rgba(37,99,235,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--sk-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: allBlocked ? 'rgba(245,158,11,0.08)' : 'rgba(37,99,235,0.07)' }}>
                        {meta.emoji}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--sk-text)' }}>{cat}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--sk-text-4)' }}>
                          {meta.desc} · {items.length}개
                          {allBlocked && <span style={{ color: '#f59e0b' }}> · 브라우저에서 입력 불가</span>}
                          {!allBlocked && interactive < items.length && (
                            <span style={{ color: '#9ca3af' }}> ({interactive}개 연습 가능)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {masteredInCat > 0 && (
                        <div className="text-right">
                          <div className="text-xs font-bold text-green-500">{masteredInCat}/{items.length}</div>
                          <div className="w-12 h-1.5 rounded-full mt-0.5 overflow-hidden" style={{ background: 'var(--sk-border)' }}>
                            <div className="h-full rounded-full" style={{ width: `${(masteredInCat / items.length) * 100}%`, background: '#22c55e' }} />
                          </div>
                        </div>
                      )}
                      <span className={`text-lg transition-colors ${allBlocked ? 'text-amber-300 group-hover:text-amber-400' : 'group-hover:text-blue-400'}`} style={!allBlocked ? { color: 'var(--sk-text-5)' } : {}}>→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── 반복 입력 점 표시기 ─────────────────────────────────────────────────

function RepDots({ filled }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      {Array.from({ length: REPS }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{
            width: i < filled ? 14 : 12,
            height: i < filled ? 14 : 12,
            background: i < filled ? '#22c55e' : 'var(--sk-border)',
            boxShadow: i < filled ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
          }} />
      ))}
    </div>
  );
}

// ── 세션 화면 ────────────────────────────────────────────────────────────

function LearnSession({ shortcuts, category, onComplete, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [cardKey, setCardKey] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteIds());
  const [koreanWarning, setKoreanWarning] = useState(false);
  const errorsRef = useRef({});

  const current = shortcuts[currentIndex];
  const progressPct = ((currentIndex + reps / REPS) / shortcuts.length) * 100;

  const goNext = useCallback(() => {
    const next = currentIndex + 1;
    if (next >= shortcuts.length) {
      onComplete(shortcuts.map((s) => ({ shortcut: s, errors: errorsRef.current[s.id] ?? 0 })));
    } else {
      setCurrentIndex(next);
      setReps(0);
      setFeedback(null);
      setCardKey((k) => k + 1);
    }
  }, [currentIndex, shortcuts, onComplete]);

  const handleKeyDown = useCallback((e) => {
    // 메타/컨트롤 조합은 기본 동작 항상 차단 (⌘R 리로드 등 방지)
    if (e.metaKey || e.ctrlKey) e.preventDefault();
    if (feedback) return;
    if (current.browserBlocked) return;
    if (['Meta', 'Shift', 'Alt', 'Control'].includes(e.key)) return;

    // 한글 입력 모드 감지 → 안내 후 입력 무시
    if (isHangul(e.key)) { setKoreanWarning(true); return; }
    setKoreanWarning(false);

    const correct = matchKeys(e, current.keys);
    const pressedDisplay = formatPressedKeys(e);

    if (correct) {
      const newReps = reps + 1;
      setReps(newReps);
      setFeedback({ type: 'correct', pressedDisplay });
      if (newReps >= REPS) {
        setTimeout(goNext, 700);
      } else {
        setTimeout(() => setFeedback(null), 450);
      }
    } else {
      errorsRef.current[current.id] = (errorsRef.current[current.id] ?? 0) + 1;
      setFeedback({ type: 'incorrect', pressedDisplay });
      setTimeout(() => setFeedback(null), 1400);
    }
  }, [feedback, current, reps, goNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isDone = reps >= REPS;

  return (
    <div className="min-h-screen flex flex-col select-none" style={{ background: 'var(--sk-bg)' }}>
      <header className="border-b px-6 py-3 flex items-center justify-between shrink-0"
        style={{ borderColor: 'var(--sk-border)', background: 'var(--sk-bg-card)' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-sm" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</Link>
          <span className="select-none" style={{ color: 'var(--sk-border)' }}>|</span>
          <button onClick={onExit} className="text-sm transition-colors" style={{ color: 'var(--sk-text-4)' }}>← 나가기</button>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--sk-text-2)' }}>{category}</span>
        <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--sk-text-4)' }}>{currentIndex + 1} / {shortcuts.length}</span>
      </header>

      <div className="h-1 shrink-0" style={{ background: 'var(--sk-border)' }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #2563eb, #4f46e5)' }} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 overflow-y-auto">
        <div key={cardKey} className="w-full max-w-md animate-slide-in-up flex flex-col items-center gap-5">

          {/* 단축키 카드 */}
          <div className="w-full rounded-3xl p-8 text-center transition-all duration-200 relative"
            style={{
              background: isDone ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : feedback?.type === 'incorrect' ? 'linear-gradient(135deg,#fff5f5,#fee2e2)' : 'var(--sk-bg-card)',
              border: `2px solid ${isDone ? '#86efac' : feedback?.type === 'incorrect' ? '#fca5a5' : 'var(--sk-border)'}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
            {/* 즐겨찾기 버튼 */}
            <button
              onClick={() => { toggleFavorite(current.id); setFavoriteIds(getFavoriteIds()); }}
              className="absolute top-4 right-4 text-2xl transition-all hover:scale-125 active:scale-95"
              style={{ color: favoriteIds.has(current.id) ? '#ef4444' : 'var(--sk-border)', lineHeight: 1 }}
              title={favoriteIds.has(current.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {favoriteIds.has(current.id) ? '♥' : '♡'}
            </button>
            <div className="text-5xl mb-3">{current.emoji}</div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--sk-text-4)' }}>{current.category}</p>
            <h2 className="text-2xl font-extrabold tracking-tight mb-5" style={{ color: 'var(--sk-text)' }}>{current.description}</h2>
            <ShortcutKeys display={current.display} size="lg" />
          </div>

          {/* 틀렸을 때 키보드 표시 */}
          {feedback?.type === 'incorrect' && (
            <div className="w-full animate-slide-in-up">
              <p className="text-center text-xs mb-2" style={{ color: 'var(--sk-text-4)' }}>정답 위치</p>
              <MacKeyboard shortcut={current} />
            </div>
          )}

          {/* 반복 점 (browserBlocked는 점 없음) */}
          {!current.browserBlocked && <RepDots filled={reps} />}

          {/* 상태 메시지 */}
          <div className="h-7 flex items-center justify-center">
            {current.browserBlocked ? (
              <p className="text-amber-500 text-xs font-medium">⚠️ 브라우저에서 직접 입력할 수 없는 단축키예요</p>
            ) : isDone ? (
              <p className="text-green-600 font-bold text-sm">✓ 완료! 다음으로 이동 중…</p>
            ) : feedback?.type === 'correct' ? (
              <p className="text-green-500 font-semibold text-sm">✓ 정확해요! ({reps}/{REPS})</p>
            ) : feedback?.type === 'incorrect' ? (
              <p className="text-red-400 font-semibold text-sm">✗ 다시 해보세요 — 입력: {feedback.pressedDisplay}</p>
            ) : (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--sk-text-5)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#60a5fa' }} />
                위 단축키를 눌러보세요 ({reps}/{REPS})
              </div>
            )}
          </div>

          {/* 한글 입력 경고 */}
          {koreanWarning && !isDone && !current.browserBlocked && (
            <div className="w-full py-2.5 px-4 rounded-xl text-center"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.22)' }}>
              <p className="text-xs font-semibold" style={{ color: '#d97706' }}>⌨️ 한/영 키를 눌러 영문으로 전환하세요</p>
              <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>한글 입력 상태에서는 단축키가 인식되지 않아요</p>
            </div>
          )}

          {/* 건너뛰기 버튼 (모든 단축키, isDone 제외) */}
          {!isDone && (
            <button
              onClick={goNext}
              className="text-xs transition-colors py-1 px-3"
              style={{ color: 'var(--sk-text-5)' }}
            >
              건너뛰기 →
            </button>
          )}

        </div>
      </main>
    </div>
  );
}

// ── 결과 화면 ─────────────────────────────────────────────────────────────

function LearnResult({ category, results, onRetry, onHome }) {
  const perfect = results.filter((r) => r.errors === 0);
  const mistakes = results.filter((r) => r.errors > 0).sort((a, b) => b.errors - a.errors);
  const totalErrors = results.reduce((s, r) => s + r.errors, 0);

  useEffect(() => {
    updateWrong(
      mistakes.map((r) => r.shortcut.id),
      perfect.map((r) => r.shortcut.id),
    );
    if (perfect.length > 0) updateMastered(perfect.map((r) => r.shortcut.id));
    recordActivity(results.length);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const grade =
    mistakes.length === 0 ? { emoji: '🏆', text: '완벽해요!' } :
    mistakes.length <= results.length * 0.2 ? { emoji: '👍', text: '잘했어요!' } :
    mistakes.length <= results.length * 0.5 ? { emoji: '💪', text: '조금 더 연습해요' } :
    { emoji: '📚', text: '다시 한번 해봐요' };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-bg)' }}>
      <header className="border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: 'var(--sk-border)', background: 'var(--sk-bg-card)' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-sm" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</Link>
          <span className="select-none" style={{ color: 'var(--sk-border)' }}>|</span>
          <button onClick={onHome} className="text-sm transition-colors" style={{ color: 'var(--sk-text-4)' }}>← 학습 홈</button>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--sk-text-2)' }}>{category} 완료</span>
        <div />
      </header>

      <div className="flex-1 overflow-y-auto py-10 px-6">
        <div className="max-w-md mx-auto flex flex-col items-center gap-7">
          <div className="text-center">
            <div className="text-6xl mb-3">{grade.emoji}</div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--sk-text)' }}>{grade.text}</h2>
            <p className="text-sm" style={{ color: 'var(--sk-text-4)' }}>{results.length}개 단축키 · 각 {REPS}회 입력 완료</p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {[{ label: '완료', value: results.length }, { label: '완벽', value: perfect.length }, { label: '오타', value: totalErrors }].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center"
                style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="text-xl font-bold" style={{ color: 'var(--sk-text)' }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--sk-text-4)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {mistakes.length > 0 && (
            <div className="w-full">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--sk-text-4)' }}>틀린 단축키 ({mistakes.length}개)</p>
              <div className="flex flex-col gap-2">
                {mistakes.map((r) => (
                  <div key={r.shortcut.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: '#fff5f5', border: '1.5px solid #fecaca' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{r.shortcut.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--sk-text-2)' }}>{r.shortcut.description}</p>
                        <p className="text-xs text-red-400">{r.errors}번 틀림</p>
                      </div>
                    </div>
                    <ShortcutKeys display={r.shortcut.display} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {perfect.length > 0 && (
            <details className="w-full">
              <summary className="text-sm cursor-pointer transition-colors list-none" style={{ color: 'var(--sk-text-4)' }}>
                ▸ 완벽하게 입력한 단축키 ({perfect.length}개)
              </summary>
              <div className="flex flex-col gap-2 mt-2">
                {perfect.map((r) => (
                  <div key={r.shortcut.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{r.shortcut.emoji}</span>
                      <p className="text-sm font-semibold" style={{ color: 'var(--sk-text-2)' }}>{r.shortcut.description}</p>
                    </div>
                    <ShortcutKeys display={r.shortcut.display} size="sm" />
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="flex flex-col gap-3 w-full">
            {mistakes.length > 0 && (
              <button onClick={() => onRetry(mistakes.map((r) => r.shortcut))}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 3px 12px rgba(245,158,11,0.3)' }}>
                🔄 틀린 {mistakes.length}개 다시 연습
              </button>
            )}
            <div className="flex gap-3">
              <button onClick={onHome}
                className="flex-1 py-3 rounded-xl font-semibold transition-all"
                style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', color: 'var(--sk-text-2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sk-bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sk-bg-card)'; }}>
                학습 홈으로
              </button>
              <Link href="/practice"
                className="flex-1 py-3 rounded-xl font-semibold text-white text-center transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 3px 12px rgba(37,99,235,0.3)' }}>
                연습하기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────

// defaultShortcuts/defaultCategory: 랜덤 학습에서 바로 세션 시작할 때 주입
// onExitToRoot: 세션 종료/홈 버튼 클릭 시 외부 페이지로 빠져나갈 콜백
export default function ShortcutLearn({ defaultShortcuts = null, defaultCategory = null, onExitToRoot = null }) {
  const [screen, setScreen] = useState(defaultShortcuts ? 'session' : 'home');
  const [sessionConfig, setSessionConfig] = useState(
    defaultShortcuts ? { shortcuts: defaultShortcuts, category: defaultCategory ?? '랜덤' } : null
  );
  const [sessionResults, setSessionResults] = useState([]);

  const handleStart = (shortcuts, category) => {
    setSessionConfig({ shortcuts, category });
    setScreen('session');
  };

  const handleExit = () => {
    if (onExitToRoot) onExitToRoot();
    else setScreen('home');
  };

  if (screen === 'session') {
    return (
      <LearnSession {...sessionConfig}
        onComplete={(results) => { setSessionResults(results); setScreen('result'); }}
        onExit={handleExit} />
    );
  }

  if (screen === 'result') {
    return (
      <LearnResult category={sessionConfig?.category} results={sessionResults}
        onRetry={(shortcuts) => handleStart(shortcuts, '재연습')}
        onHome={handleExit} />
    );
  }

  return <LearnHome onStart={handleStart} />;
}
