import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Card from '../ui/Card';
import { formatDuration, CATEGORY_COLORS } from '../../lib/formatters';
import type { DailySummary } from '../../types';

interface CategoryTrendsChartProps {
  data: DailySummary[];
}

export default function CategoryTrendsChart({ data }: CategoryTrendsChartProps) {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((d) => ({
    date: d.date,
    productive: d.productiveTime,
    neutral: d.neutralTime,
    distraction: d.distractionTime,
  }));

  return (
    <Card title="Category Trends">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => {
              const parts = d.split('-');
              return `${parts[1]}/${parts[2]}`;
            }}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => formatDuration(v)}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            labelFormatter={(d) => d as string}
            formatter={(value, name) => [formatDuration(value as number), name as string]}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="productive"
            stackId="1"
            stroke={CATEGORY_COLORS.productive}
            fill={CATEGORY_COLORS.productive}
            fillOpacity={0.6}
            name="Productive"
          />
          <Area
            type="monotone"
            dataKey="neutral"
            stackId="1"
            stroke={CATEGORY_COLORS.neutral}
            fill={CATEGORY_COLORS.neutral}
            fillOpacity={0.6}
            name="Neutral"
          />
          <Area
            type="monotone"
            dataKey="distraction"
            stackId="1"
            stroke={CATEGORY_COLORS.distraction}
            fill={CATEGORY_COLORS.distraction}
            fillOpacity={0.6}
            name="Distraction"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
