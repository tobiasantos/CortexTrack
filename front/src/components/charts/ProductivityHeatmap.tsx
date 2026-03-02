import { useMemo } from 'react';
import { getDay, parseISO, format, startOfWeek, addDays } from 'date-fns';
import Card from '../ui/Card';
import type { DailySummary } from '../../types';

interface ProductivityHeatmapProps {
  data: DailySummary[];
}

function scoreToColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 dark:bg-gray-800';
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-green-500';
  if (score >= 40) return 'bg-green-400';
  if (score >= 20) return 'bg-green-300';
  return 'bg-green-200';
}

export default function ProductivityHeatmap({ data }: ProductivityHeatmapProps) {
  const grid = useMemo(() => {
    if (data.length === 0) return [];

    const map = new Map(data.map((d) => [d.date, d.focusScore]));
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = parseISO(sorted[0].date);
    const lastDate = parseISO(sorted[sorted.length - 1].date);
    const start = startOfWeek(firstDate, { weekStartsOn: 1 });

    const cells: { date: string; score: number | null; dayOfWeek: number }[] = [];
    let current = start;
    while (current <= lastDate) {
      const dateStr = format(current, 'yyyy-MM-dd');
      cells.push({
        date: dateStr,
        score: map.get(dateStr) ?? null,
        dayOfWeek: getDay(current),
      });
      current = addDays(current, 1);
    }

    return cells;
  }, [data]);

  if (grid.length === 0) return null;

  const weeks: typeof grid[] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <Card title="Productivity Heatmap">
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`w-4 h-4 rounded-sm ${scoreToColor(cell.score)}`}
                  title={`${cell.date}: ${cell.score !== null ? Math.round(cell.score) : 'No data'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--color-text-muted)]">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-green-200" />
        <div className="w-3 h-3 rounded-sm bg-green-400" />
        <div className="w-3 h-3 rounded-sm bg-green-600" />
        <span>More</span>
      </div>
    </Card>
  );
}
