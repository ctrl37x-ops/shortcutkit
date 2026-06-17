'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SHORTCUTS, CATEGORIES } from '@/lib/shortcuts';

const ROUND_SIZE = 10;
const WRONG_KEY = 'shortcutkit_wrong';

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
  const k = normalizeKey(event.key);
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
          {i > 0 && <span className="text-gray-300 font-light">+</span>}
          <KeyBadge label={key} size={size} />
        </span>
      ))}
    </div>
  );
}

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
      const isCorrect = matchKeys(e, current.keys);
      const pressedDisplay = formatPressedKeys(e);
      const nextIndex = currentIndex + 1;
      const isLast = nextIndex >= shortcuts.length;

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
          else setCurrentIndex(nextIndex);
        }, 650);
      } else {
        setStreak(0);
        setFeedback({ type: 'incorrect', pressedDisplay });
        setTimeout(() => {
          setFeedback(null);
          if (isLast) setGameStatus('result');
          else setCurrentIndex(nextIndex);
        }, 1900);
      }
    },
    [gameStatus, feedback, shortcuts, currentIndex, streak]
  );

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleKeyDown]);

  // idle로 돌아올 때 오답 목록 갱신
  useEffect(() => {
    if (gameStatus === 'idle') {
      setWrongIds(getWrongIds());
    }
  }, [gameStatus]);

  // 결과 화면 진입 시 오답/정답 localStorage 저장
  useEffect(() => {
    if (gameStatus !== 'result' || results.length === 0) return;
    const wrongInRound = results.filter((r) => !r.correct).map((r) => r.shortcut.id);
    const correctInRound = results.filter((r) => r.correct).map((r) => r.shortcut.id);
    updateWrong(wrongInRound, correctInRound);
    setWrongIds(getWrongIds());
  }, [gameStatus, results]);

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : null;

  // ── 시작 화면 ────────────────────────────────────────────────────────
  if (gameStatus === 'idle') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#fafafa' }}>
        <header className="border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: '#ebebeb', background: 'white' }}>
          <Link href="/" className="font-bold text-gray-900 text-sm">⌨️ ShortcutKit</Link>
          <Link href="/learn" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">학습하기</Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center flex flex-col items-center gap-8">
            <div>
              <div className="text-7xl mb-5">⌨️</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">연습하기</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                동작 설명이 나오면 해당 단축키를 실제로 눌러보세요
              </p>
            </div>

            <div className="w-full">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">카테고리</p>
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
                          : { background: '#efefef', color: allBlocked ? '#d97706' : '#6b7280' }
                      }
                    >
                      {cat}{allBlocked ? ' ⚠️' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">문항 수</p>
              <div className="flex gap-2 justify-center">
                {[10, 20, '전체'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuizSize(n)}
                    className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-150"
                    style={
                      quizSize === n
                        ? { background: '#2563eb', color: 'white', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }
                        : { background: '#efefef', color: '#6b7280' }
                    }
                  >
                    {n === '전체' ? '전체' : `${n}개`}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const wrongShortcuts = SHORTCUTS.filter((s) => wrongIds.has(s.id));
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
                </div>
              );
            })()}

            <p className="text-xs text-gray-400">무작위 출제 · 연속 정답 시 보너스</p>
          </div>
        </div>
      </div>
    );
  }

  // ── 결과 화면 ────────────────────────────────────────────────────────
  if (gameStatus === 'result') {
    const finalAccuracy = Math.round((correctCount / shortcuts.length) * 100);
    const grade =
      finalAccuracy >= 90 ? { emoji: '🏆', text: '완벽해요!' } :
      finalAccuracy >= 70 ? { emoji: '👍', text: '잘했어요!' } :
      finalAccuracy >= 50 ? { emoji: '💪', text: '조금 더 연습해요' } :
                            { emoji: '📚', text: '기초부터 다시 해봐요' };
    const wrongItems = results.filter((r) => !r.correct);

    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#fafafa' }}>
        <header className="border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: '#ebebeb', background: 'white' }}>
          <Link href="/" className="font-bold text-gray-900 text-sm">⌨️ ShortcutKit</Link>
          <Link href="/learn" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">학습하기</Link>
        </header>

        <div className="flex-1 overflow-y-auto py-10 px-6">
          <div className="max-w-lg mx-auto flex flex-col items-center gap-7">
            {/* 등급 */}
            <div className="text-center">
              <div className="text-6xl mb-3">{grade.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{grade.text}</h2>
              <p className="text-gray-400 text-sm">라운드 완료</p>
            </div>

            {/* 스탯 카드 */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {[
                { label: '점수', value: score.toLocaleString() },
                { label: '정답', value: `${correctCount}/${shortcuts.length}` },
                { label: '정확도', value: `${finalAccuracy}%` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: 'white', border: '1.5px solid #ebebeb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="text-xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* 오답 목록 */}
            {wrongItems.length > 0 && (
              <div className="w-full">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                          <p className="text-sm font-semibold text-gray-800">{r.shortcut.description}</p>
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
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600 transition-colors list-none flex items-center gap-1">
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
                        <p className="text-sm font-semibold text-gray-800">{r.shortcut.description}</p>
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
                  className="flex-1 py-3 rounded-xl font-semibold text-gray-700 transition-all hover:bg-gray-100"
                  style={{ background: 'white', border: '1.5px solid #ebebeb' }}
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
  const progress = (currentIndex / shortcuts.length) * 100;

  return (
    <div className="min-h-screen flex flex-col select-none" style={{ background: '#fafafa' }}>
      {/* 헤더 */}
      <header className="border-b px-6 py-3 flex items-center justify-between shrink-0"
        style={{ borderColor: '#ebebeb', background: 'white' }}>
        <Link href="/" className="font-bold text-gray-900 text-sm">⌨️ ShortcutKit</Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/learn" className="text-gray-400 hover:text-gray-700 transition-colors">학습하기</Link>
          <div className="flex items-center gap-4 text-gray-500">
            <span>점수 <strong className="text-gray-900">{score.toLocaleString()}</strong></span>
            <span>
              연속 <strong className="text-gray-900">{streak}{streak >= 3 ? ' 🔥' : ''}</strong>
            </span>
            {accuracy !== null && (
              <span>정확도 <strong className="text-gray-900">{accuracy}%</strong></span>
            )}
          </div>
        </div>
      </header>

      {/* 진행 바 */}
      <div className="h-1 shrink-0" style={{ background: '#ebebeb' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
          }}
        />
      </div>

      {/* 문제 번호 */}
      <div className="text-center py-2 shrink-0">
        <span className="text-xs text-gray-400 font-medium">{currentIndex + 1} / {shortcuts.length}</span>
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
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{current.description}</h2>
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
                  const isLast = nextIndex >= shortcuts.length;
                  setResults((prev) => [...prev, { shortcut: current, correct: true, pressedDisplay: '(건너뜀)' }]);
                  setAnsweredCount((prev) => prev + 1);
                  setCorrectCount((prev) => prev + 1);
                  if (isLast) setGameStatus('result');
                  else setCurrentIndex(nextIndex);
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
                    <p className="text-xs text-gray-400">정답</p>
                    <ShortcutKeys display={current.display} size="lg" />
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">단축키를 입력하세요</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
