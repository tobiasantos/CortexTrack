import Card from '../ui/Card';
import CategoryBadge from '../ui/CategoryBadge';
import { formatDuration } from '../../lib/formatters';
import type { TopSite } from '../../types';

interface TopSitesListProps {
  sites: TopSite[];
}

export default function TopSitesList({ sites }: TopSitesListProps) {
  if (sites.length === 0) return null;

  return (
    <Card title="Top Sites">
      <div className="space-y-3">
        {sites.slice(0, 10).map((site, i) => (
          <div key={site.domain} className="flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--color-text-muted)] w-5 text-right">
              {i + 1}
            </span>
            <img
              src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
              alt=""
              className="w-5 h-5 rounded"
              loading="lazy"
            />
            <span className="flex-1 text-sm text-[var(--color-text)] truncate">
              {site.domain}
            </span>
            <span className="text-sm font-medium text-[var(--color-text-muted)] tabular-nums">
              {formatDuration(site.time)}
            </span>
            <CategoryBadge category={site.category} />
          </div>
        ))}
      </div>
    </Card>
  );
}
