import TopBar from '../components/layout/TopBar';
import TimeRangeSelector from '../components/ui/TimeRangeSelector';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import TrendChart from '../components/charts/TrendChart';
import ComparisonBars from '../components/charts/ComparisonBars';
import ProductivityHeatmap from '../components/charts/ProductivityHeatmap';
import CategoryTrendsChart from '../components/charts/CategoryTrendsChart';
import Card from '../components/ui/Card';
import { useAnalytics } from '../hooks/useAnalytics';

function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-62 w-full" />
        </Card>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { focusHistory, comparison, summaries, isLoading, error, days, setDays, refetch } =
    useAnalytics();

  const hasData = focusHistory.length > 0 || summaries.length > 0;

  return (
    <div>
      <TopBar title="Analytics">
        <TimeRangeSelector value={days} onChange={setDays} />
      </TopBar>

      <div className="p-4 md:p-8">
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : isLoading ? (
          <AnalyticsSkeleton />
        ) : !hasData ? (
          <EmptyState
            title="Not enough data yet"
            description="Keep using CortexTrack and check back later for analytics."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <ProductivityHeatmap data={summaries} />
            </div>
            <TrendChart data={focusHistory} />
            <ComparisonBars data={comparison} />
            <div className="lg:col-span-2">
              <CategoryTrendsChart data={summaries} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
