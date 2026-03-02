import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../ui/Card';
import { formatDuration, CATEGORY_COLORS, CATEGORY_LABELS } from '../../lib/formatters';
import type { CategoryBreakdown } from '../../types';

interface CategoryDonutProps {
  data: CategoryBreakdown | null;
}

export default function CategoryDonut({ data }: CategoryDonutProps) {
  if (!data) return null;

  const chartData = [
    { name: CATEGORY_LABELS.productive, value: data.productive, color: CATEGORY_COLORS.productive },
    { name: CATEGORY_LABELS.neutral, value: data.neutral, color: CATEGORY_COLORS.neutral },
    { name: CATEGORY_LABELS.distraction, value: data.distraction, color: CATEGORY_COLORS.distraction },
  ].filter((d) => d.value > 0);

  const total = data.productive + data.neutral + data.distraction;

  if (total === 0) return null;

  return (
    <Card title="Categories">
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatDuration(value as number)}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex gap-4 mt-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
