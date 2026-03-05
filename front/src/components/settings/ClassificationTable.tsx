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

  const filtered = classifications
    .filter((c) => c.domain.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.isOverride === b.isOverride) return a.domain.localeCompare(b.domain);
      return a.isOverride ? 1 : -1;
    });

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
              <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">Status</th>
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
                  {!c.isOverride && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Needs review
                    </span>
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
