export const GOAL_METRICS = [
  { value: 'productive_time', label: 'Daily Productive Time', unit: 'ms' },
  { value: 'distraction_time', label: 'Max Distraction Time', unit: 'ms' },
  { value: 'focus_score', label: 'Focus Score Target', unit: 'score' },
  { value: 'session_count', label: 'Session Count Target', unit: 'count' },
] as const;

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function currentMonthString(): string {
  return new Date().toISOString().slice(0, 7);
}
