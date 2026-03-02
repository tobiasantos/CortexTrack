// --- Auth ---
export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// --- Dashboard ---
export interface DailySummary {
  _id: string;
  user: string;
  date: string;
  productiveTime: number;
  distractionTime: number;
  neutralTime: number;
  focusScore: number | null;
  tabSwitches: number;
  totalSessions: number;
  topSites: TopSite[];
}

export interface TopSite {
  domain: string;
  time: number;
  category: Category;
}

export interface HourlyData {
  hour: number;
  productive: number;
  distraction: number;
  neutral: number;
}

export interface CategoryBreakdown {
  productive: number;
  neutral: number;
  distraction: number;
}

export type Category = 'productive' | 'neutral' | 'distraction';

// --- Analytics ---
export interface FocusScoreEntry {
  date: string;
  score: number | null;
}

export interface WeeklyComparison {
  thisWeek: WeekAggregate;
  lastWeek: WeekAggregate;
}

export interface WeekAggregate {
  days: number;
  productiveTime: number;
  distractionTime: number;
  neutralTime: number;
  avgFocusScore: number | null;
}

// --- Insights ---
export type InsightType = 'anomaly' | 'trend' | 'pattern' | 'prediction';
export type InsightSeverity = 'info' | 'warning' | 'critical';

export interface Insight {
  _id: string;
  type: InsightType;
  severity: InsightSeverity;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface InsightsResponse {
  items: Insight[];
  total: number;
  unreadCount: number;
}

// --- Goals ---
export interface Goal {
  metric: string;
  target: number;
}

// --- Settings ---
export interface SiteClassification {
  domain: string;
  category: Category;
  isOverride?: boolean;
}
