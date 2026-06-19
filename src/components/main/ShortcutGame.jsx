'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SHORTCUTS, CATEGORIES } from '@/lib/shortcuts';
import { getStreak, recordActivity } from '@/lib/stats';

const ROUND_SIZE = 10;
const WRONG_KEY = 'shortcutkit_wrong';
const FAVORITES_KEY = 'shortcutkit_favorites';

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

function getFavoriteIds() {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')); }
  catch { return new Set(); }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

// shift 조합 시 생성되는 문자 → 물리 키 레이블 역변환
const SHIFT_CHAR_TO_BASE = {
  '{': '[', '}': ']', '>': '.', '<': ',', '?': '/', ':': ';',
  '"': "'", '|': '\\', '_': '-', '+': '=', '~': '`',
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
};

function formatPressedKeys(event) {
  const parts = [];
  if (event.metaKey) parts.push('⌘');
  if (event.ctrlKey) parts.push('⌃');
  if (event.altKey) parts.push('⌥');
  if (event.shiftKey) parts.push('⇧');
  let k = normalizeKey(event.key);
  // shift 조합 시 e.key가 조합 문자(예:'>')이면 물리 키 레이블('.')로 역변환
  if (event.shiftKey && SHIFT_CHAR_TO_BASE[k]) k = SHIFT_CHAR_TO_BASE[k];
  const key = KEY_LABEL[k] ?? (k.length === 1 ? k.toUpperCase() : k);
  parts.push(key);
  return parts.join('');
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

const TIMER_SECONDS = 60;

export default function ShortcutGame() {
  const [gameStatus, setGameStatus] = useState('idle');
  const [shortcuts, setShortcuts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [quizSize, setQuizSize] = useState(ROUND_SIZE);
  const [results, setResults] = useState([]);
  const [wrongIds, setWrongIds] = useState(new Set());
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [koreanWarning, setKoreanWarning] = useState(false);
  const [timerMode, setTimerMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [activityStreak, setActivityStreak] = useState(null);
  const timerRef = useRef(null);

  const startGame = useCallback(
    (customShortcuts = null) => {
      let round;
      if (customShortcuts) {
        round = shuffle(customShortcuts);
      } else {
        const pool =
          selectedCategory === '전체'
            ? SHORTCUTS
            : SHORTCUTS.filter((s) => s.category === selectedCategory);
        const shuffled = shuffle(pool);
        round = quizSize === '전체' ? shuffled : shuffled.slice(0, Math.min(quizSize, shuffled.length));
      }
      setShortcuts(round);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setCorrectCount(0);
      setAnsweredCount(0);
      setFeedback(null);
      setResults([]);
      setTimeLeft(TIMER_SECONDS);
      setKoreanWarning(false);
      setGameStatus('playing');
    },
    [selectedCategory, quizSize]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (gameStatus !== 'playing') return;
      // 메타/컨트롤 조합은 기본 동작 항상 차단 (⌘R 리로드 등 방지)
      if (e.metaKey || e.ctrlKey) e.preventDefault();
      if (feedback) return;
      if (['Meta', 'Shift', 'Alt', 'Control'].includes(e.key)) return;

      const current = shortcuts[currentIndex];
      if (current.browserBlocked) return;

      // 한글 입력 모드 감지 → 안내 후 입력 무시
      if (isHangul(e.key)) { setKoreanWarning(true); return; }
      setKoreanWarning(false);

      const isCorrect = matchKeys(e, current.keys);
      const pressedDisplay = formatPressedKeys(e);
      const nextIndex = currentIndex + 1;
      // 타이머 모드: 무한 순환 (끝에 달하면 다시 셔플), 일반 모드: 마지막 도달 시 종료
      const isLast = !timerMode && nextIndex >= shortcuts.length;

      setAnsweredCount((prev) => prev + 1);
      setResults((prev) => [...prev, { shortcut: current, correct: isCorrect, pressedDisplay }]);

      if (isCorrect) {
        const multiplier = streak >= 4 ? 3 : streak >= 2 ? 2 : 1;
        setScore((prev) => prev + 100 * multiplier);
        setStreak((prev) => prev + 1);
        setCorrectCount((prev) => prev + 1);
        setFeedback({ type: 'correct', pressedDisplay });
        setTimeout(() => {
          setFeedback(null);
          if (isLast) setGameStatus('result');
          else setCurrentIndex(timerMode ? (nextIndex >= shortcuts.length ? 0 : nextIndex) : nextIndex);
        }, 650);
      } else {
        setStreak(0);
        setFeedback({ type: 'incorrect', pressedDisplay });
        setTimeout(() => {
          setFeedback(null);
          if (isLast) setGameStatus('result');
          else setCurrentIndex(timerMode ? (nextIndex >= shortcuts.length ? 0 : nextIndex) : nextIndex);
        }, 1900);
      }
    },
    [gameStatus, feedback, shortcuts, currentIndex, streak, timerMode]
  );

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleKeyDown]);

  // idle로 돌아올 때 오답/즐겨찾기/스트릭 갱신
  useEffect(() => {
    if (gameStatus === 'idle') {
      setWrongIds(getWrongIds());
      setFavoriteIds(getFavoriteIds());
      setActivityStreak(getStreak());
    }
  }, [gameStatus]);

  // 타이머 모드 카운트다운
  useEffect(() => {
    if (gameStatus !== 'playing' || !timerMode) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameStatus('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameStatus, timerMode]);

  // 결과 화면 진입 시 오답/정답 localStorage 저장
  useEffect(() => {
    if (gameStatus !== 'result' || results.length === 0) return;
    const wrongInRound = results.filter((r) => !r.correct).map((r) => r.shortcut.id);
    const correctInRound = results.filter((r) => r.correct).map((r) => r.shortcut.id);
    updateWrong(wrongInRound, correctInRound);
    setWrongIds(getWrongIds());
    recordActivity(results.filter((r) => r.correct).length);
  }, [gameStatus, results]);

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

  // ── 시작 화면 ────────────────────────────────────────────────────────
  if (gameStatus === 'idle') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-bg)' }}>
        <header className="border-b px-6 py-3 flex items-center justify-between"
          style={{ borderColor: 'var(--sk-border)', background: 'var(--sk-bg-card)' }}>
          <Link href="/" className="font-bold text-sm" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</Link>
          <div className="flex items-center gap-4">
            <Link href="/cheatsheet" className="text-sm" style={{ color: 'var(--sk-text-4)' }}>목록</Link>
            <Link href="/learn" className="text-sm transition-colors" style={{ color: 'var(--sk-text-4)' }}>학습하기</Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center flex flex-col items-center gap-8">
            <div>
              <div className="text-7xl mb-5">⌨️</div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--sk-text)' }}>연습하기</h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--sk-text-3)' }}>
                동작 설명이 나오면 해당 단축키를 실제로 눌러보세요
              </p>
              {/* 스트릭 */}
              {activityStreak?.streak > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                  style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', color: 'var(--sk-text-3)' }}>
                  🔥 {activityStreak.streak}일 연속 · 오늘 {activityStreak.todayCount}개
                </div>
              )}
            </div>

            <div className="w-full">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--sk-text-4)' }}>카테고리</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map((cat) => {
                  const pool = cat === '전체' ? SHORTCUTS : SHORTCUTS.filter((s) => s.category === cat);
                  const interactive = pool.filter((s) => !s.browserBlocked).length;
                  const allBlocked = cat !== '전체' && interactive === 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
                      title={allBlocked ? '이 카테고리는 브라우저에서 입력할 수 없는 단축키만 포함되어 있어요' : undefined}
                      style={
                        selectedCategory === cat
                          ? { background: allBlocked ? '#f59e0b' : '#2563eb', color: 'white', boxShadow: allBlocked ? '0 2px 8px rgba(245,158,11,0.3)' : '0 2px 8px rgba(37,99,235,0.3)' }
                          : { background: 'var(--sk-bg)', color: allBlocked ? '#d97706' : 'var(--sk-text-3)' }
                      }
                    >
                      {cat}{allBlocked ? ' ⚠️' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--sk-text-4)' }}>문항 수</p>
              <div className="flex gap-2 justify-center">
                {[10, 20, '전체'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuizSize(n)}
                    className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-150"
                    style={
                      quizSize === n
                        ? { background: '#2563eb', color: 'white', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }
                        : { background: 'var(--sk-bg)', color: 'var(--sk-text-3)' }
                    }
                  >
                    {n === '전체' ? '전체' : `${n}개`}
                  </button>
                ))}
              </div>
            </div>

            {/* 게임 모드 */}
            <div className="w-full">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--sk-text-4)' }}>게임 모드</p>
              <div className="flex gap-2 justify-center">
                {[{ id: false, label: '일반', icon: '🎯' }, { id: true, label: `타이머 ${TIMER_SECONDS}초`, icon: '⏱' }].map((m) => (
                  <button
                    key={String(m.id)}
                    onClick={() => setTimerMode(m.id)}
                    className="flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-150"
                    style={timerMode === m.id
                      ? { background: '#2563eb', color: 'white', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }
                      : { background: 'var(--sk-bg-card)', color: 'var(--sk-text-3)', border: '1.5px solid var(--sk-border)' }}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
              {timerMode && (
                <p className="text-xs mt-2" style={{ color: 'var(--sk-text-4)' }}>
                  제한 시간 안에 최대한 많이 맞춰보세요
                </p>
              )}
            </div>

            {(() => {
              const wrongShortcuts = SHORTCUTS.filter((s) => wrongIds.has(s.id));
              const favShortcuts = SHORTCUTS.filter((s) => favoriteIds.has(s.id));
              return (
                <div className="flex flex-col gap-3 w-full items-center">
                  <button
                    onClick={() => startGame()}
                    className="w-full py-4 rounded-xl text-lg font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                    }}
                  >
                    시작하기
                  </button>
                  {wrongShortcuts.length > 0 && (
                    <button
                      onClick={() => startGame(wrongShortcuts)}
                      className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 3px 12px rgba(239,68,68,0.3)' }}
                    >
                      📝 오답만 연습 ({wrongShortcuts.length}개)
                    </button>
                  )}
                  {favShortcuts.length > 0 && (
                    <button
                      onClick={() => startGame(favShortcuts)}
                      className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', boxShadow: '0 3px 12px rgba(236,72,153,0.3)' }}
                    >
                      ♥ 즐겨찾기만 연습 ({favShortcuts.length}개)
                    </button>
                  )}
                </div>
              );
            })()}

            <p className="text-xs" style={{ color: 'var(--sk-text-4)' }}>무작위 출제 · 연속 정답 시 보너스</p>
          </div>
        </div>
      </div>
    );
  }

  // ── 결과 화면 ────────────────────────────────────────────────────────
  if (gameStatus === 'result') {
    const finalAccuracy = timerMode
      ? Math.round((correctCount / Math.max(answeredCount, 1)) * 100)
      : Math.round((correctCount / shortcuts.length) * 100);
    const grade =
      finalAccuracy >= 90 ? { emoji: '🏆', text: '완벽해요!' } :
      finalAccuracy >= 70 ? { emoji: '👍', text: '잘했어요!' } :
      finalAccuracy >= 50 ? { emoji: '💪', text: '조금 더 연습해요' } :
                            { emoji: '📚', text: '기초부터 다시 해봐요' };
    const wrongItems = results.filter((r) => !r.correct);

    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-bg)' }}>
        <header className="border-b px-6 py-3 flex items-center justify-between"
          style={{ borderColor: 'var(--sk-border)', background: 'var(--sk-bg-card)' }}>
          <Link href="/" className="font-bold text-sm" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</Link>
          <Link href="/learn" className="text-sm transition-colors" style={{ color: 'var(--sk-text-4)' }}>학습하기</Link>
        </header>

        <div className="flex-1 overflow-y-auto py-10 px-6">
          <div className="max-w-lg mx-auto flex flex-col items-center gap-7">
            {/* 등급 */}
            <div className="text-center">
              <div className="text-6xl mb-3">{grade.emoji}</div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--sk-text)' }}>{grade.text}</h2>
              <p className="text-sm" style={{ color: 'var(--sk-text-4)' }}>라운드 완료</p>
            </div>

            {/* 스탯 카드 */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {[
                { label: '점수', value: score.toLocaleString() },
                { label: timerMode ? `${TIMER_SECONDS}초` : '정답', value: timerMode ? `${correctCount}개` : `${correctCount}/${shortcuts.length}` },
                { label: '정확도', value: `${finalAccuracy}%` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', boxShadow: '0 1px 4px var(--sk-shadow)' }}
                >
                  <div className="text-xl font-bold" style={{ color: 'var(--sk-text)' }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--sk-text-4)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* 오답 목록 */}
            {wrongItems.length > 0 && (
              <div className="w-full">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--sk-text-4)' }}>
                  틀린 단축키 ({wrongItems.length}개)
                </p>
                <div className="flex flex-col gap-2">
                  {wrongItems.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: '#fff5f5', border: '1.5px solid #fecaca' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{r.shortcut.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--sk-text-2)' }}>{r.shortcut.description}</p>
                          <p className="text-xs text-red-400">입력: {r.pressedDisplay}</p>
                        </div>
                      </div>
                      <ShortcutKeys display={r.shortcut.display} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 정답 목록 (접힘) */}
            {results.filter((r) => r.correct).length > 0 && (
              <details className="w-full">
                <summary className="text-sm cursor-pointer transition-colors list-none flex items-center gap-1" style={{ color: 'var(--sk-text-4)' }}>
                  <span>▸ 맞힌 단축키 ({results.filter((r) => r.correct).length}개)</span>
                </summary>
                <div className="flex flex-col gap-2 mt-2">
                  {results.filter((r) => r.correct).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}
                    >
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

            {/* 버튼 */}
            <div className="flex flex-col gap-3 w-full">
              {wrongItems.length > 0 && (
                <button
                  onClick={() => startGame(wrongItems.map((r) => r.shortcut))}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 3px 12px rgba(239,68,68,0.3)' }}
                >
                  틀린 {wrongItems.length}개 집중 연습
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => startGame()}
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 3px 12px rgba(37,99,235,0.3)' }}
                >
                  새 라운드
                </button>
                <button
                  onClick={() => setGameStatus('idle')}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all"
                  style={{ background: 'var(--sk-bg-card)', border: '1.5px solid var(--sk-border)', color: 'var(--sk-text-2)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sk-bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sk-bg-card)'; }}
                >
                  처음으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 게임 화면 ────────────────────────────────────────────────────────
  const current = shortcuts[currentIndex];
  const progress = timerMode
    ? ((TIMER_SECONDS - timeLeft) / TIMER_SECONDS) * 100
    : (currentIndex / shortcuts.length) * 100;

  return (
    <div className="min-h-screen flex flex-col select-none" style={{ background: 'var(--sk-bg)' }}>
      {/* 헤더 */}
      <header className="border-b px-6 py-3 flex items-center justify-between shrink-0"
        style={{ borderColor: 'var(--sk-border)', background: 'var(--sk-bg-card)' }}>
        <Link href="/" className="font-bold text-sm" style={{ color: 'var(--sk-text)' }}>⌨️ ShortcutKit</Link>
        <div className="flex items-center gap-5 text-sm">
          {timerMode && (
            <span className="font-bold tabular-nums text-base"
              style={{ color: timeLeft <= 10 ? '#ef4444' : '#2563eb', minWidth: '2.5rem', textAlign: 'right' }}>
              ⏱ {timeLeft}s
            </span>
          )}
          <div className="flex items-center gap-4" style={{ color: 'var(--sk-text-3)' }}>
            <span>점수 <strong style={{ color: 'var(--sk-text)' }}>{score.toLocaleString()}</strong></span>
            <span>연속 <strong style={{ color: 'var(--sk-text)' }}>{streak}{streak >= 3 ? ' 🔥' : ''}</strong></span>
            {accuracy !== null && (
              <span>정확도 <strong style={{ color: 'var(--sk-text)' }}>{accuracy}%</strong></span>
            )}
          </div>
        </div>
      </header>

      {/* 진행 바 */}
      <div className="h-1 shrink-0" style={{ background: 'var(--sk-border)' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
          }}
        />
      </div>

      {/* 문제 번호 / 타이머 진행 */}
      <div className="text-center py-2 shrink-0">
        <span className="text-xs font-medium" style={{ color: 'var(--sk-text-4)' }}>
          {timerMode ? `${correctCount}개 정답` : `${currentIndex + 1} / ${shortcuts.length}`}
        </span>
      </div>

      {/* 메인 */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
          {/* 카테고리 배지 */}
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(37,99,235,0.07)', color: '#2563eb' }}
          >
            {current.category}
          </span>

          {/* 이모지 + 설명 */}
          <div className={`transition-all duration-200 ${feedback ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
            <div className="text-7xl mb-4">{current.emoji}</div>
            <h2 className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--sk-text)' }}>{current.description}</h2>
          </div>

          {/* browserBlocked: 스킵 버튼 */}
          {current.browserBlocked && !feedback && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-amber-500 font-medium">
                ⚠️ 이 단축키는 macOS가 직접 처리해 브라우저에서 입력할 수 없어요
              </p>
              <button
                onClick={() => {
                  const nextIndex = currentIndex + 1;
                  const isLast = !timerMode && nextIndex >= shortcuts.length;
                  setResults((prev) => [...prev, { shortcut: current, correct: true, pressedDisplay: '(건너뜀)' }]);
                  setAnsweredCount((prev) => prev + 1);
                  setCorrectCount((prev) => prev + 1);
                  if (isLast) setGameStatus('result');
                  else setCurrentIndex(timerMode ? (nextIndex >= shortcuts.length ? 0 : nextIndex) : nextIndex);
                }}
                className="px-6 py-2 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}
              >
                건너뛰기 →
              </button>
            </div>
          )}

          {/* 피드백 */}
          <div className="h-28 flex flex-col items-center justify-center w-full gap-3">
            {feedback ? (
              <>
                <div
                  className={`w-full py-4 px-6 rounded-2xl text-white text-center ${
                    feedback.type === 'correct' ? 'animate-pop-correct' : 'animate-shake'
                  } animate-slide-in-up`}
                  style={
                    feedback.type === 'correct'
                      ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }
                      : { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }
                  }
                >
                  {feedback.type === 'correct' ? (
                    <>
                      <div className="text-lg font-bold">✓ 정답!</div>
                      <div className="text-sm mt-0.5 opacity-80">{feedback.pressedDisplay}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold">✗ 오답</div>
                      <div className="text-sm mt-0.5 opacity-80">
                        입력: {feedback.pressedDisplay} · 정답: <strong>{current.display}</strong>
                      </div>
                    </>
                  )}
                </div>

                {/* 오답 시 정답 키 시각적 표시 */}
                {feedback.type === 'incorrect' && (
                  <div className="animate-slide-in-up flex flex-col items-center gap-1.5">
                    <p className="text-xs" style={{ color: 'var(--sk-text-4)' }}>정답</p>
                    <ShortcutKeys display={current.display} size="lg" />
                  </div>
                )}
              </>
            ) : koreanWarning ? (
              <div className="w-full py-3 px-5 rounded-2xl text-center"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.25)' }}>
                <p className="text-sm font-semibold" style={{ color: '#d97706' }}>⌨️ 한/영 키를 눌러 영문으로 전환하세요</p>
                <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>한글 입력 상태에서는 단축키가 인식되지 않아요</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--sk-text-4)' }}>단축키를 입력하세요</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
