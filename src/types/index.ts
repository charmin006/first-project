export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DashboardData {
  dailyTotal: number;
  monthlyTotal: number;
  categoryBreakdown: CategoryBreakdown[];
  recentTransactions: Transaction[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface SpendingInsight {
  type: 'high_spending_day' | 'category_trend' | 'savings_suggestion';
  title: string;
  description: string;
  value?: number;
  date?: string;
} 