import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface TopBarProps {
  title: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, children }: TopBarProps) {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <h1 className="text-xl font-bold text-[var(--color-text)]">{title}</h1>
      <div className="flex items-center gap-3">
        {children}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors cursor-pointer"
          aria-label={`Current theme: ${theme}. Click to change.`}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="w-5 h-5 text-[var(--color-text-muted)]" />
        </button>
      </div>
    </header>
  );
}
