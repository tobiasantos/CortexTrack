import { Zap, TrendingUp, Repeat, Eye, Check } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Insight, InsightType } from '../../types';

const typeIcons: Record<InsightType, React.ElementType> = {
  anomaly: Zap,
  trend: TrendingUp,
  pattern: Repeat,
  prediction: Eye,
};

const typeLabels: Record<InsightType, string> = {
  anomaly: 'Anomaly',
  trend: 'Trend',
  pattern: 'Pattern',
  prediction: 'Prediction',
};

const severityStyles = {
  info: 'border-l-blue-400',
  warning: 'border-l-yellow-400',
  critical: 'border-l-red-400',
};

const severityBadge = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

interface InsightCardProps {
  insight: Insight;
  onMarkRead: (id: string) => void;
}

export default function InsightCard({ insight, onMarkRead }: InsightCardProps) {
  const Icon = typeIcons[insight.type];

  return (
    <div
      className={`border-l-4 ${severityStyles[insight.severity]} rounded-r-xl p-4 transition-colors ${
        insight.read
          ? 'bg-[var(--color-surface)]'
          : 'bg-[var(--color-bg)] shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {typeLabels[insight.type]}
            </span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${severityBadge[insight.severity]}`}>
              {insight.severity}
            </span>
          </div>
          <p className={`text-sm ${insight.read ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
            {insight.message}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            {formatDistanceToNow(parseISO(insight.createdAt), { addSuffix: true })}
          </p>
        </div>
        {!insight.read && (
          <button
            onClick={() => onMarkRead(insight._id)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors cursor-pointer shrink-0"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        )}
      </div>
    </div>
  );
}
