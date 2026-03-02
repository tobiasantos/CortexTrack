import TopBar from '../components/layout/TopBar';
import DatePicker from '../components/ui/DatePicker';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Card from '../components/ui/Card';
import { useEventLog } from '../hooks/useEventLog';
import { todayDateString } from '../lib/constants';
import { formatDuration } from '../lib/formatters';
import {
  Globe,
  ArrowRightLeft,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import type { EventType } from '../types';

const EVENT_CONFIG: Record<EventType, { label: string; icon: typeof Globe; color: string }> = {
  visit: { label: 'Visit', icon: Globe, color: 'text-blue-400' },
  tab_switch: { label: 'Tab Switch', icon: ArrowRightLeft, color: 'text-purple-400' },
  tab_close: { label: 'Tab Close', icon: X, color: 'text-gray-400' },
  idle_start: { label: 'Idle', icon: Moon, color: 'text-yellow-400' },
  idle_end: { label: 'Active', icon: Sun, color: 'text-green-400' },
};

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function ActivitySkeleton() {
  return (
    <Card>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </Card>
  );
}

export default function ActivityPage() {
  const {
    events,
    total,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    refetch,
  } = useEventLog();

  return (
    <div>
      <TopBar title="Activity Log">
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
          <ActivitySkeleton />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events for this day"
            description="Browse with the CortexTrack extension active to see captured events here."
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-muted)]">
                {total} event{total !== 1 ? 's' : ''} captured
              </p>
            </div>

            <Card>
              <div className="divide-y divide-[var(--color-border)]">
                {events.map((event) => {
                  const config = EVENT_CONFIG[event.eventType] || EVENT_CONFIG.visit;
                  const Icon = config.icon;

                  return (
                    <div key={event._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      {/* Timeline dot + icon */}
                      <div className="flex flex-col items-center pt-0.5">
                        <div className={`w-8 h-8 rounded-full bg-[var(--color-bg)] flex items-center justify-center ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.color} bg-[var(--color-bg)]`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {formatTime(event.timestamp)}
                          </span>
                          {event.duration > 0 && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                              ({formatDuration(event.duration)})
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-[var(--color-text)] truncate" title={event.title || event.url}>
                          {event.title || event.domain}
                        </p>

                        <p className="text-xs text-[var(--color-text-muted)] truncate" title={event.url}>
                          {event.domain}
                          {event.url !== event.domain && (
                            <span className="ml-1 opacity-60">
                              - {event.url.replace(/^https?:\/\/[^/]+/, '').slice(0, 60)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
