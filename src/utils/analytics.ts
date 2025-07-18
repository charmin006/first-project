import { Transaction, DashboardData, CategoryBreakdown, SpendingInsight } from '../types';
import { formatCurrency } from './currency';

export const calculateDashboardData = (transactions: Transaction[]): DashboardData => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');

  const dailyTotal = transactions
    .filter(t => t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTotal = transactions
    .filter(t => t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = calculateCategoryBreakdown(transactions, currentMonth);
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    dailyTotal,
    monthlyTotal,
    categoryBreakdown,
    recentTransactions
  };
};

export const calculateCategoryBreakdown = (transactions: Transaction[], period: string): CategoryBreakdown[] => {
  const periodTransactions = transactions.filter(t => t.date.startsWith(period));
  const total = periodTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, number>();
  periodTransactions.forEach(t => {
    const current = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, current + t.amount);
  });

  const breakdown: CategoryBreakdown[] = [];
  categoryMap.forEach((amount, category) => {
    breakdown.push({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: getCategoryColor(category)
    });
  });

  return breakdown.sort((a, b) => b.amount - a.amount);
};

export const generateSpendingInsights = (transactions: Transaction[]): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  
  if (transactions.length === 0) {
    return insights;
  }

  // Find high spending days
  const dailySpending = new Map<string, number>();
  transactions.forEach(t => {
    const current = dailySpending.get(t.date) || 0;
    dailySpending.set(t.date, current + t.amount);
  });

  const avgDailySpending = Array.from(dailySpending.values()).reduce((sum, amount) => sum + amount, 0) / dailySpending.size;
  const highSpendingDays = Array.from(dailySpending.entries())
    .filter(([_, amount]) => amount > avgDailySpending * 1.5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  highSpendingDays.forEach(([date, amount]) => {
    insights.push({
      type: 'high_spending_day',
      title: 'High Spending Day',
      description: `You spent ${formatCurrency(amount)} on ${formatDate(date)}`,
      value: amount,
      date
    });
  });

  // Category trends
  const categoryTotals = new Map<string, number>();
  transactions.forEach(t => {
    const current = categoryTotals.get(t.category) || 0;
    categoryTotals.set(t.category, current + t.amount);
  });

  const topCategory = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])[0];

  if (topCategory) {
    insights.push({
      type: 'category_trend',
      title: 'Top Spending Category',
      description: `${topCategory[0]} is your highest spending category at ${formatCurrency(topCategory[1])}`,
      value: topCategory[1]
    });
  }

  // Savings suggestions
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgMonthlySpending = totalSpent / Math.max(1, getMonthsBetween(transactions));
  
  if (avgMonthlySpending > 1000) {
    insights.push({
      type: 'savings_suggestion',
      title: 'Savings Opportunity',
      description: `Consider reducing your monthly spending by 10% to save ${formatCurrency(avgMonthlySpending * 0.1)} per month`,
      value: avgMonthlySpending * 0.1
    });
  }

  return insights;
};

const getCategoryColor = (category: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const getMonthsBetween = (transactions: Transaction[]): number => {
  if (transactions.length === 0) return 1;
  
  const dates = transactions.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const months = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                (maxDate.getMonth() - minDate.getMonth()) + 1;
  
  return Math.max(1, months);
}; 