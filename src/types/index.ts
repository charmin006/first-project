export interface Transaction {
  id: string;
  title: string; // ✅ Fixed: Added title field for transaction name
  amount: number;
  category: string;
  date: string;
  note?: string;
  type: 'expense' | 'income'; // ✅ Fixed: Added transaction type
  isNeed: boolean; // ✅ Fixed: Added need vs want classification
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