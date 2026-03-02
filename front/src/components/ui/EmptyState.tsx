import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-[var(--color-text-muted)] mb-3">
        {icon || <InboxIcon className="w-12 h-12" />}
      </div>
      <p className="text-lg font-medium text-[var(--color-text)]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
    </div>
  );
}
