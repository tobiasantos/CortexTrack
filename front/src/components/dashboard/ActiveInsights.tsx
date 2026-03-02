import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Repeat, Eye, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Insight, InsightType } from '../../types';

const typeIcons: Record<InsightType, React.ElementType> = {
  anomaly: Zap,
  trend: TrendingUp,
  pattern: Repeat,
  prediction: Eye,
};

const severityColors = {
  info: 'border-l-blue-400',
  warning: 'border-l-yellow-400',
  critical: 'border-l-red-400',
};

interface ActiveInsightsProps {
  insights: Insight[];
}

export default function ActiveInsights({ insights }: ActiveInsightsProps) {
  const unread = insights.filter((i) => !i.read).slice(0, 5);

  return (
    <Card title="Active Insights">
      {unread.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
          No new insights
        </p>
      ) : (
        <div className="space-y-2">
          {unread.map((insight) => {
            const Icon = typeIcons[insight.type];
            return (
              <div
                key={insight._id}
                className={`border-l-4 ${severityColors[insight.severity]} rounded-r-lg bg-[var(--color-bg)] p-3`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text)] line-clamp-2">
                      {insight.message}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {formatDistanceToNow(parseISO(insight.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Link
        to="/insights"
        className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline mt-4"
      >
        View all insights
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Card>
  );
}
