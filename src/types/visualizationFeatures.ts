// VISUALIZATION FEATURE START
// Type definitions for visualization and finance planning features

export interface Income {
  id: string;
  amount: number;
  category: IncomeCategory;
  date: string;
  note?: string;
  createdAt: string;
}

export type IncomeCategory = 'Salary' | 'Freelance' | 'Investment' | 'Gift' | 'Other';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  renewalCycle: RenewalCycle;
  nextDueDate: string;
  category: string;
  isActive: boolean;
  autoMarkRecurring: boolean;
  createdAt: string;
}

export type RenewalCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CashFlowData {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  trend: 'up' | 'down' | 'stable';
  period: 'week' | 'month' | 'year';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface WeeklyChartData {
  week: string;
  income: number;
  expenses: number;
  netSavings: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
  netSavings: number;
  categoryBreakdown: ChartDataPoint[];
}

export interface CalendarDayData {
  date: string;
  totalSpent: number;
  totalIncome: number;
  transactionCount: number;
  hasExpenses: boolean;
  hasIncome: boolean;
}

export interface ChartViewConfig {
  type: 'bar' | 'line' | 'pie';
  period: 'week' | 'month';
  showIncome: boolean;
  showExpenses: boolean;
  showNetSavings: boolean;
}

// VISUALIZATION FEATURE END 