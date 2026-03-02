interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  max?: string;
}

export default function DatePicker({ value, onChange, max }: DatePickerProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      max={max}
      className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
    />
  );
}
