import { useState } from 'react';
import { X } from 'lucide-react';
import { GOAL_METRICS } from '../../lib/constants';
import type { Goal } from '../../types';

interface GoalFormProps {
  initial?: Goal | null;
  existingMetrics: string[];
  onSave: (goal: Goal) => void;
  onClose: () => void;
}

export default function GoalForm({ initial, existingMetrics, onSave, onClose }: GoalFormProps) {
  const [metric, setMetric] = useState(initial?.metric ?? '');
  const [targetValue, setTargetValue] = useState(() => {
    if (!initial) return '';
    const def = GOAL_METRICS.find((m) => m.value === initial.metric);
    if (def?.unit === 'ms') return String(Math.round(initial.target / 3600000 * 10) / 10);
    return String(initial.target);
  });

  const available = GOAL_METRICS.filter(
    (m) => m.value === initial?.metric || !existingMetrics.includes(m.value)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const def = GOAL_METRICS.find((m) => m.value === metric);
    let target = Number(targetValue);
    if (def?.unit === 'ms') target = target * 3600000;
    onSave({ metric, target });
  };

  const selectedDef = GOAL_METRICS.find((m) => m.value === metric);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            {initial ? 'Edit Goal' : 'New Goal'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              required
              disabled={!!initial}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
            >
              <option value="">Select a metric</option>
              {available.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Target {selectedDef?.unit === 'ms' ? '(hours)' : selectedDef?.unit === 'score' ? '(0-100)' : ''}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max={selectedDef?.unit === 'score' ? 100 : undefined}
              required
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder={selectedDef?.unit === 'ms' ? 'e.g. 4' : 'e.g. 80'}
            />
          </div>

          <button
            type="submit"
            disabled={!metric || !targetValue}
            className="w-full py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {initial ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}
