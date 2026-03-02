interface TimeRangeSelectorProps {
  value: number;
  onChange: (days: number) => void;
}

const options = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--color-border)] overflow-hidden">
      {options.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            value === days
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
