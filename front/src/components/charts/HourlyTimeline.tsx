import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Card from '../ui/Card';
import { formatHour, formatDuration, CATEGORY_COLORS } from '../../lib/formatters';
import type { HourlyData } from '../../types';

interface HourlyTimelineProps {
  data: HourlyData[];
}

export default function HourlyTimeline({ data }: HourlyTimelineProps) {
  if (data.length === 0) return null;

  return (
    <Card title="Hourly Timeline">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="hour"
            tickFormatter={formatHour}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tickFormatter={(v) => formatDuration(v)}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            labelFormatter={(hour) => formatHour(hour as number)}
            formatter={(value, name) => [formatDuration(value as number), name as string]}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="productive" stackId="a" fill={CATEGORY_COLORS.productive} name="Productive" radius={[0, 0, 0, 0]} />
          <Bar dataKey="neutral" stackId="a" fill={CATEGORY_COLORS.neutral} name="Neutral" />
          <Bar dataKey="distraction" stackId="a" fill={CATEGORY_COLORS.distraction} name="Distraction" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
