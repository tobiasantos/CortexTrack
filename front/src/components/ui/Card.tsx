interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Card({ title, className = '', children }: CardProps) {
  return (
    <div className={`bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
