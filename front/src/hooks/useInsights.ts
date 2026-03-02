import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Insight, InsightType, InsightSeverity } from '../types';

interface InsightsData {
  items: Insight[];
  total: number;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  typeFilter: InsightType | null;
  severityFilter: InsightSeverity | null;
  setTypeFilter: (type: InsightType | null) => void;
  setSeverityFilter: (severity: InsightSeverity | null) => void;
  markAsRead: (id: string) => Promise<void>;
  loadMore: () => void;
  refetch: () => void;
}

const LIMIT = 20;

export function useInsights(): InsightsData {
  const [items, setItems] = useState<Insight[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState<InsightType | null>(null);
  const [severityFilter, setSeverityFilter] = useState<InsightSeverity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = { limit: LIMIT, offset: append ? offset : 0 };
      if (typeFilter) params.type = typeFilter;
      if (severityFilter) params.severity = severityFilter;

      const { data } = await api.get('/insights', { params });
      if (append) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
    } catch {
      setError('Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  }, [offset, typeFilter, severityFilter]);

  useEffect(() => {
    setOffset(0);
    fetchData(false);
  }, [typeFilter, severityFilter]);

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchData(true);
  };

  const markAsRead = async (id: string) => {
    await api.patch(`/insights/${id}`);
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, read: true } : i)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return {
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
    refetch: () => fetchData(false),
  };
}
