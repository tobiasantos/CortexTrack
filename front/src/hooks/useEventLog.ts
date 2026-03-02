import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { todayDateString } from '../lib/constants';
import type { RawEvent } from '../types';

interface EventLogData {
  events: RawEvent[];
  total: number;
  isLoading: boolean;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  refetch: () => void;
}

export function useEventLog(): EventLogData {
  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const [events, setEvents] = useState<RawEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get('/events/log', {
        params: { date: selectedDate, limit: 500 },
      });
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch {
      setError('Failed to load event log');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    events,
    total,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    refetch: fetchData,
  };
}
