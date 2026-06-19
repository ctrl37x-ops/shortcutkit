'use client';
import { useState, useEffect } from 'react';

function isDarkNow() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export function applyTheme(dark) {
  const theme = dark ? 'dark' : 'light';
  localStorage.setItem('sk_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new Event('sk-theme'));
}

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(isDarkNow());
    const handler = () => setDark(isDarkNow());
    window.addEventListener('sk-theme', handler);
    return () => window.removeEventListener('sk-theme', handler);
  }, []);
  return dark;
}

export default function ThemeToggle() {
  const dark = useTheme();
  return (
    <button
      onClick={() => applyTheme(!dark)}
      className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110 hover:-translate-y-0.5"
      style={{
        background: 'var(--sk-bg-card)',
        border: '1.5px solid var(--sk-border)',
        boxShadow: '0 4px 16px var(--sk-shadow-lg)',
      }}
      title={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
