import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
}

export const useThemeStore = create<ThemeState>((set) => {
  const saved = (localStorage.getItem('theme') as Theme) || 'system';
  applyTheme(saved);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = (localStorage.getItem('theme') as Theme) || 'system';
    if (current === 'system') applyTheme('system');
  });

  return {
    theme: saved,
    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      set({ theme });
    },
  };
});
