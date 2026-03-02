import { Lightbulb } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import InsightCard from '../components/insights/InsightCard';
import InsightFilters from '../components/insights/InsightFilters';
import { useInsights } from '../hooks/useInsights';

export default function InsightsPage() {
  const {
    items,
    total,
    unreadCount,
    isLoading,
    error,
    typeFilter,
    severityFilter,
    setTypeFilter,
    setSeverityFilter,
    markAsRead,
    loadMore,
    refetch,
  } = useInsights();

  return (
    <div>
      <TopBar title="Insights">
        {unreadCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary)] text-white">
            {unreadCount} unread
          </span>
        )}
      </TopBar>

      <div className="p-4 md:p-8 space-y-6">
        <InsightFilters
          typeFilter={typeFilter}
          severityFilter={severityFilter}
          onTypeChange={setTypeFilter}
          onSeverityChange={setSeverityFilter}
        />

        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="w-12 h-12" />}
            title="No insights yet"
            description="CortexTrack will generate insights as it learns your browsing patterns."
          />
        ) : (
          <>
            <div className="space-y-3">
              {items.map((insight) => (
                <InsightCard key={insight._id} insight={insight} onMarkRead={markAsRead} />
              ))}
            </div>
            {items.length < total && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
