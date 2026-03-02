import type { InsightType, InsightSeverity } from '../../types';

interface InsightFiltersProps {
  typeFilter: InsightType | null;
  severityFilter: InsightSeverity | null;
  onTypeChange: (type: InsightType | null) => void;
  onSeverityChange: (severity: InsightSeverity | null) => void;
}

const types: { label: string; value: InsightType | null }[] = [
  { label: 'All', value: null },
  { label: 'Anomaly', value: 'anomaly' },
  { label: 'Trend', value: 'trend' },
  { label: 'Pattern', value: 'pattern' },
  { label: 'Prediction', value: 'prediction' },
];

const severities: { label: string; value: InsightSeverity | null }[] = [
  { label: 'All', value: null },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' },
];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-[var(--color-primary)] text-white'
          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-border)]'
      }`}
    >
      {children}
    </button>
  );
}

export default function InsightFilters({
  typeFilter,
  severityFilter,
  onTypeChange,
  onSeverityChange,
}: InsightFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)] self-center mr-1">Type:</span>
        {types.map((t) => (
          <Pill key={t.label} active={typeFilter === t.value} onClick={() => onTypeChange(t.value)}>
            {t.label}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-[var(--color-text-muted)] self-center mr-1">Severity:</span>
        {severities.map((s) => (
          <Pill key={s.label} active={severityFilter === s.value} onClick={() => onSeverityChange(s.value)}>
            {s.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
