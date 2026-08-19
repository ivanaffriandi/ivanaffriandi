'use client';

export type ThemeMode = 'system' | 'light' | 'dark';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('mail_theme_mode') as ThemeMode) || 'system';
}

export function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('mail_theme_mode', mode);

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function initThemeListener(onThemeChange?: (mode: ThemeMode, isDark: boolean) => void) {
  if (typeof window === 'undefined') return () => {};

  const currentMode = getStoredTheme();
  applyTheme(currentMode);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    const activeMode = getStoredTheme();
    if (activeMode === 'system') {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      if (onThemeChange) {
        onThemeChange('system', e.matches);
      }
    }
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  } else {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
}
