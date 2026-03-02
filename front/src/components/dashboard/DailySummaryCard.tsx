import { Clock, Zap, Coffee, ArrowLeftRight, Monitor } from 'lucide-react';
import Card from '../ui/Card';
import { formatDuration } from '../../lib/formatters';
import type { DailySummary } from '../../types';

interface DailySummaryCardProps {
  summary: DailySummary | null;
}

export default function DailySummaryCard({ summary }: DailySummaryCardProps) {
  if (!summary) return null;

  const totalTime = summary.productiveTime + summary.distractionTime + summary.neutralTime;

  const rows = [
    { icon: Zap, label: 'Productive', value: summary.productiveTime, color: 'text-green-500', dot: 'bg-green-500' },
    { icon: Coffee, label: 'Distraction', value: summary.distractionTime, color: 'text-red-500', dot: 'bg-red-500' },
    { icon: Clock, label: 'Neutral', value: summary.neutralTime, color: 'text-yellow-500', dot: 'bg-yellow-500' },
  ];

  return (
    <Card title="Today's Summary">
      <div className="space-y-3">
        {rows.map(({ icon: Icon, label, value, color, dot }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-sm text-[var(--color-text)]">{label}</span>
            </div>
            <span className="text-sm font-medium text-[var(--color-text)]">
              {formatDuration(value)}
            </span>
          </div>
        ))}

        <div className="border-t border-[var(--color-border)] pt-3 mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Clock className="w-4 h-4" />
              Total
            </div>
            <span className="font-medium text-[var(--color-text)]">{formatDuration(totalTime)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <ArrowLeftRight className="w-4 h-4" />
              Tab switches
            </div>
            <span className="font-medium text-[var(--color-text)]">{summary.tabSwitches}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <Monitor className="w-4 h-4" />
              Sessions
            </div>
            <span className="font-medium text-[var(--color-text)]">{summary.totalSessions}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
