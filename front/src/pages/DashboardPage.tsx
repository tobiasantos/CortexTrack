import TopBar from '../components/layout/TopBar';
import DatePicker from '../components/ui/DatePicker';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import ScoreCard from '../components/dashboard/ScoreCard';
import DailySummaryCard from '../components/dashboard/DailySummaryCard';
import TopSitesList from '../components/dashboard/TopSitesList';
import ActiveInsights from '../components/dashboard/ActiveInsights';
import CategoryDonut from '../components/charts/CategoryDonut';
import HourlyTimeline from '../components/charts/HourlyTimeline';
import { useDashboard } from '../hooks/useDashboard';
import { todayDateString } from '../lib/constants';
import Card from '../components/ui/Card';

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-5 w-24 mb-4" />
          <Skeleton className="h-16 w-32 mb-3" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ))}
      <div className="md:col-span-2 lg:col-span-3">
        <Card>
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-[250px] w-full" />
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <Skeleton className="h-5 w-24 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full mt-3" />
          ))}
        </Card>
      </div>
      <Card>
        <Skeleton className="h-5 w-32 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full mt-2" />
        ))}
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const {
    summary,
    timeline,
    topSites,
    categories,
    insights,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    refetch,
  } = useDashboard();

  const hasData = summary || timeline.length > 0 || topSites.length > 0;

  return (
    <div>
      <TopBar title="Dashboard">
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          max={todayDateString()}
        />
      </TopBar>

      <div className="p-4 md:p-8">
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : !hasData ? (
          <EmptyState
            title="No data for this day"
            description="Browse with the CortexTrack extension to start tracking your productivity."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <ScoreCard score={summary?.focusScore ?? null} />
            <DailySummaryCard summary={summary} />
            <CategoryDonut data={categories} />

            <div className="md:col-span-2 lg:col-span-3">
              <HourlyTimeline data={timeline} />
            </div>

            <div className="lg:col-span-2">
              <TopSitesList sites={topSites} />
            </div>
            <ActiveInsights insights={insights} />
          </div>
        )}
      </div>
    </div>
  );
}
