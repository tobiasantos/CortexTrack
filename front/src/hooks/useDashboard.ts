import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { todayDateString } from '../lib/constants';
import type { DailySummary, HourlyData, TopSite, CategoryBreakdown, Insight } from '../types';

interface DashboardData {
  summary: DailySummary | null;
  timeline: HourlyData[];
  topSites: TopSite[];
  categories: CategoryBreakdown | null;
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  refetch: () => void;
}

export function useDashboard(): DashboardData {
  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [timeline, setTimeline] = useState<HourlyData[]>([]);
  const [topSites, setTopSites] = useState<TopSite[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const tz = new Date().getTimezoneOffset();

    try {
      const [summaryRes, timelineRes, topSitesRes, categoriesRes, insightsRes] =
        await Promise.allSettled([
          api.get(`/summary/daily`, { params: { date: selectedDate, tz } }),
          api.get(`/timeline`, { params: { date: selectedDate, tz } }),
          api.get(`/top-sites`, { params: { period: 'day', date: selectedDate, tz } }),
          api.get(`/categories`, { params: { period: 'day', date: selectedDate, tz } }),
          api.get(`/insights`, { params: { limit: 5 } }),
        ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
      if (timelineRes.status === 'fulfilled') setTimeline(timelineRes.value.data || []);
      if (topSitesRes.status === 'fulfilled') setTopSites(topSitesRes.value.data || []);
      if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data);
      if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data?.items || []);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    timeline,
    topSites,
    categories,
    insights,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    refetch: fetchData,
  };
}
