import { format, parseISO } from 'date-fns';

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

export function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 70) return 'text-green-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function scoreBgColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 dark:bg-gray-800';
  if (score >= 70) return 'bg-green-50 dark:bg-green-950';
  if (score >= 40) return 'bg-yellow-50 dark:bg-yellow-950';
  return 'bg-red-50 dark:bg-red-950';
}

export const CATEGORY_COLORS = {
  productive: '#22c55e',
  neutral: '#eab308',
  distraction: '#ef4444',
} as const;

export const CATEGORY_LABELS = {
  productive: 'Productive',
  neutral: 'Neutral',
  distraction: 'Distraction',
} as const;
