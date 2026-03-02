import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import Card from '../ui/Card';
import { scoreColor, scoreBgColor } from '../../lib/formatters';

interface ScoreCardProps {
  score: number | null;
  previousScore?: number | null;
}

export default function ScoreCard({ score, previousScore }: ScoreCardProps) {
  const delta = score !== null && previousScore !== null && previousScore !== undefined
    ? Math.round(score - previousScore)
    : null;

  return (
    <Card>
      <p className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
        Focus Score
      </p>
      <div className={`flex items-end gap-3 ${scoreBgColor(score)} rounded-lg p-4`}>
        <span className={`text-5xl font-bold ${scoreColor(score)}`}>
          {score !== null ? Math.round(score) : '--'}
        </span>
        <span className="text-lg text-[var(--color-text-muted)] mb-1">/100</span>
      </div>
      {delta !== null && (
        <div className="flex items-center gap-1 mt-3 text-sm">
          {delta > 0 ? (
            <ArrowUp className="w-4 h-4 text-green-500" />
          ) : delta < 0 ? (
            <ArrowDown className="w-4 h-4 text-red-500" />
          ) : (
            <Minus className="w-4 h-4 text-gray-400" />
          )}
          <span className={delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : 'text-gray-400'}>
            {delta > 0 ? '+' : ''}{delta} from yesterday
          </span>
        </div>
      )}
    </Card>
  );
}
