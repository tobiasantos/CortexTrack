import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Lightbulb,
  Target,
  Settings,
  Brain,
  LogOut,
  ScrollText,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/activity', icon: ScrollText, label: 'Activity Log' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] fixed left-0 top-0 z-30">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)]">
        <Brain className="w-8 h-8 text-[var(--color-primary)]" />
        <span className="text-xl font-bold text-[var(--color-text)]">CortexTrack</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <div className="px-3 py-2 text-sm text-[var(--color-text-muted)] truncate">
          {user?.email}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 w-full transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
