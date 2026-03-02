import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import Card from '../ui/Card';
import { formatDuration } from '../../lib/formatters';
import type { WeeklyComparison } from '../../types';

interface ComparisonBarsProps {
  data: WeeklyComparison | null;
}

export default function ComparisonBars({ data }: ComparisonBarsProps) {
  if (!data) return null;

  const chartData = [
    {
      name: 'Productive',
      thisWeek: data.thisWeek.productiveTime,
      lastWeek: data.lastWeek.productiveTime,
    },
    {
      name: 'Distraction',
      thisWeek: data.thisWeek.distractionTime,
      lastWeek: data.lastWeek.distractionTime,
    },
    {
      name: 'Neutral',
      thisWeek: data.thisWeek.neutralTime,
      lastWeek: data.lastWeek.neutralTime,
    },
  ];

  return (
    <Card title="Weekly Comparison">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatDuration(v)}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value, name) => [formatDuration(value as number), name === 'thisWeek' ? 'This Week' : 'Last Week']}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            formatter={(value) => (value === 'thisWeek' ? 'This Week' : 'Last Week')}
          />
          <Bar dataKey="thisWeek" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={24} />
          <Bar dataKey="lastWeek" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>

      {data.thisWeek.avgFocusScore !== null && data.lastWeek.avgFocusScore !== null && (
        <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-[var(--color-border)]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              {Math.round(data.thisWeek.avgFocusScore)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">This Week Avg</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">
              {Math.round(data.lastWeek.avgFocusScore)}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Last Week Avg</p>
          </div>
        </div>
      )}
    </Card>
  );
}
