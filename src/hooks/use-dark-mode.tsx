import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('system');

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    // 시스템 다크모드 설정 확인
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 실제 적용되는 테마 계산
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // DOM에 테마 클래스 적용
  useEffect(() => {
    const root = document.documentElement;
    
    // 기존 테마 클래스 제거
    root.classList.remove('light', 'dark');
    
    // 새 테마 클래스 추가
    root.classList.add(effectiveTheme);
  }, [theme, effectiveTheme]);

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setThemeToSystem = () => setTheme('system');

  return {
    theme,
    effectiveTheme,
    systemTheme,
    setTheme,
    setLightTheme,
    setDarkTheme,
    setThemeToSystem,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light'
  };
}