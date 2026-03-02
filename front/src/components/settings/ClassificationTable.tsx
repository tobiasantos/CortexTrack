import { useState } from 'react';
import type { SiteClassification, Category } from '../../types';

interface ClassificationTableProps {
  classifications: SiteClassification[];
  onUpdate: (domain: string, category: Category) => Promise<void>;
}

const categories: Category[] = ['productive', 'neutral', 'distraction'];

export default function ClassificationTable({ classifications, onUpdate }: ClassificationTableProps) {
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = classifications.filter((c) =>
    c.domain.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = async (domain: string, category: Category) => {
    setUpdating(domain);
    try {
      await onUpdate(domain, category);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search domains..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">Domain</th>
              <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">Category</th>
              <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">Override</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.domain} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2.5 text-[var(--color-text)]">
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=16`}
                      alt=""
                      className="w-4 h-4"
                      loading="lazy"
                    />
                    {c.domain}
                  </div>
                </td>
                <td className="py-2.5">
                  <select
                    value={c.category}
                    onChange={(e) => handleChange(c.domain, e.target.value as Category)}
                    disabled={updating === c.domain}
                    className="px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5">
                  {c.isOverride && (
                    <span className="text-xs text-[var(--color-primary)] font-medium">Custom</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
          No domains found
        </p>
      )}
    </div>
  );
}
