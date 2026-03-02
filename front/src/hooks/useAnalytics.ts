import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { FocusScoreEntry, WeeklyComparison, DailySummary } from '../types';

interface AnalyticsData {
  focusHistory: FocusScoreEntry[];
  comparison: WeeklyComparison | null;
  summaries: DailySummary[];
  isLoading: boolean;
  error: string | null;
  days: number;
  setDays: (days: number) => void;
  refetch: () => void;
}

export function useAnalytics(): AnalyticsData {
  const [days, setDays] = useState(30);
  const [focusHistory, setFocusHistory] = useState<FocusScoreEntry[]>([]);
  const [comparison, setComparison] = useState<WeeklyComparison | null>(null);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [historyRes, compRes, summariesRes] = await Promise.allSettled([
        api.get('/focus-score/history', { params: { days } }),
        api.get('/comparison/weekly'),
        days <= 7
          ? api.get('/summary/weekly')
          : api.get('/summary/monthly'),
      ]);

      if (historyRes.status === 'fulfilled') setFocusHistory(historyRes.value.data || []);
      if (compRes.status === 'fulfilled') setComparison(compRes.value.data);
      if (summariesRes.status === 'fulfilled') setSummaries(summariesRes.value.data || []);
    } catch {
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { focusHistory, comparison, summaries, isLoading, error, days, setDays, refetch: fetchData };
}
