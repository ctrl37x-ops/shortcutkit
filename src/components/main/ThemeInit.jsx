'use client';
import { useEffect } from 'react';

// 페이지 로드 시 저장된 테마를 html[data-theme]에 즉시 적용
export default function ThemeInit() {
  useEffect(() => {
    const theme = localStorage.getItem('sk_theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
  return null;
}
