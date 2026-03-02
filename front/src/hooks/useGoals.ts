import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Goal, DailySummary } from '../types';
import { todayDateString } from '../lib/constants';

interface GoalWithProgress extends Goal {
  current: number;
  progress: number;
}

interface GoalsData {
  goals: GoalWithProgress[];
  isLoading: boolean;
  error: string | null;
  saveGoals: (goals: Goal[]) => Promise<void>;
  deleteGoal: (metric: string) => Promise<void>;
  refetch: () => void;
}

function computeProgress(goal: Goal, summary: DailySummary | null): { current: number; progress: number } {
  if (!summary) return { current: 0, progress: 0 };

  let current = 0;
  switch (goal.metric) {
    case 'productive_time':
      current = summary.productiveTime;
      break;
    case 'distraction_time':
      current = summary.distractionTime;
      break;
    case 'focus_score':
      current = summary.focusScore ?? 0;
      break;
    case 'session_count':
      current = summary.totalSessions;
      break;
  }

  let progress: number;
  if (goal.metric === 'distraction_time') {
    progress = goal.target > 0 ? Math.max(0, (1 - current / goal.target) * 100) : 100;
  } else {
    progress = goal.target > 0 ? Math.min(100, (current / goal.target) * 100) : 0;
  }

  return { current, progress };
}

export function useGoals(): GoalsData {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [rawGoals, setRawGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [goalsRes, summaryRes] = await Promise.allSettled([
        api.get('/goals'),
        api.get('/summary/daily', { params: { date: todayDateString() } }),
      ]);

      let fetchedGoals: Goal[] = [];
      let fetchedSummary: DailySummary | null = null;

      if (goalsRes.status === 'fulfilled') fetchedGoals = goalsRes.value.data || [];
      if (summaryRes.status === 'fulfilled') fetchedSummary = summaryRes.value.data;

      setRawGoals(fetchedGoals);
      setSummary(fetchedSummary);
      setGoals(fetchedGoals.map((g) => ({ ...g, ...computeProgress(g, fetchedSummary) })));
    } catch {
      setError('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveGoals = async (newGoals: Goal[]) => {
    const { data } = await api.put('/goals', newGoals);
    setRawGoals(data);
    setGoals(data.map((g: Goal) => ({ ...g, ...computeProgress(g, summary) })));
  };

  const deleteGoal = async (metric: string) => {
    const updated = rawGoals.filter((g) => g.metric !== metric);
    await saveGoals(updated);
  };

  return { goals, isLoading, error, saveGoals, deleteGoal, refetch: fetchData };
}
