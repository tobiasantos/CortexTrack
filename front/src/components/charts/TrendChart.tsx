import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import Card from '../ui/Card';
import { formatDate } from '../../lib/formatters';
import type { FocusScoreEntry } from '../../types';

interface TrendChartProps {
  data: FocusScoreEntry[];
}

export default function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) return null;

  const filtered = data.filter((d) => d.score !== null);

  return (
    <Card title="Focus Score Trend">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={filtered}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            labelFormatter={(d) => formatDate(d as string)}
            formatter={(value) => [Math.round(value as number), 'Focus Score']}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-primary)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
