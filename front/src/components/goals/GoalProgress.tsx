import { Trash2, Pencil } from 'lucide-react';
import { formatDuration } from '../../lib/formatters';
import { GOAL_METRICS } from '../../lib/constants';
import type { Goal } from '../../types';

interface GoalProgressProps {
  goal: Goal & { current: number; progress: number };
  onEdit: () => void;
  onDelete: () => void;
}

function formatValue(metric: string, value: number): string {
  const def = GOAL_METRICS.find((m) => m.value === metric);
  if (!def) return String(value);
  if (def.unit === 'ms') return formatDuration(value);
  if (def.unit === 'score') return String(Math.round(value));
  return String(Math.round(value));
}

export default function GoalProgress({ goal, onEdit, onDelete }: GoalProgressProps) {
  const label = GOAL_METRICS.find((m) => m.value === goal.metric)?.label ?? goal.metric;
  const clampedProgress = Math.min(100, Math.max(0, goal.progress));

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-[var(--color-text)]">{label}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors cursor-pointer"
            aria-label="Edit goal"
          >
            <Pencil className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
            aria-label="Delete goal"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            clampedProgress >= 100
              ? 'bg-green-500'
              : clampedProgress >= 50
              ? 'bg-[var(--color-primary)]'
              : 'bg-yellow-500'
          }`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>
          {formatValue(goal.metric, goal.current)} / {formatValue(goal.metric, goal.target)}
        </span>
        <span>{Math.round(clampedProgress)}%</span>
      </div>
    </div>
  );
}
