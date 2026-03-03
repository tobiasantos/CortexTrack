export const GOAL_METRICS = [
  { value: 'productive_time', label: 'Daily Productive Time', unit: 'ms' },
  { value: 'distraction_time', label: 'Max Distraction Time', unit: 'ms' },
  { value: 'focus_score', label: 'Focus Score Target', unit: 'score' },
  { value: 'session_count', label: 'Session Count Target', unit: 'count' },
] as const;

export function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function currentMonthString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
