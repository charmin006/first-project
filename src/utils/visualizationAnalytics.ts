// VISUALIZATION FEATURE START
// Analytics utilities for visualization and finance planning features

import { Transaction } from '../types';
import { Income, CashFlowData, WeeklyChartData, MonthlyChartData, CalendarDayData, ChartDataPoint } from '../types/visualizationFeatures';

// Cash Flow Calculations
export const calculateCashFlow = (
  transactions: Transaction[],
  income: Income[],
  period: 'week' | 'month' | 'year' = 'month'
): CashFlowData => {
  const now = new Date();
  const startDate = getPeriodStartDate(now, period);
  
  const periodTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= now;
  });
  
  const periodIncome = income.filter(i => {
    const incomeDate = new Date(i.date);
    return incomeDate >= startDate && incomeDate <= now;
  });
  
  const totalExpenses = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = periodIncome.reduce((sum, i) => sum + i.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  
  // Calculate trend by comparing with previous period
  const previousStartDate = getPeriodStartDate(startDate, period, -1);
  const previousTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= previousStartDate && transactionDate < startDate;
  });
  const previousIncome = income.filter(i => {
    const incomeDate = new Date(i.date);
    return incomeDate >= previousStartDate && incomeDate < startDate;
  });
  
  const previousExpenses = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
  const previousIncomeTotal = previousIncome.reduce((sum, i) => sum + i.amount, 0);
  const previousNetSavings = previousIncomeTotal - previousExpenses;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (netSavings > previousNetSavings) {
    trend = 'up';
  } else if (netSavings < previousNetSavings) {
    trend = 'down';
  }
  
  return {
    totalIncome,
    totalExpenses,
    netSavings,
    trend,
    period,
  };
};

// Weekly Chart Data
export const generateWeeklyChartData = (
  transactions: Transaction[],
  income: Income[],
  weeks: number = 8
): WeeklyChartData[] => {
  const data: WeeklyChartData[] = [];
  const now = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= weekStart && transactionDate <= weekEnd;
    });
    
    const weekIncome = income.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate >= weekStart && incomeDate <= weekEnd;
    });
    
    const weekExpenses = weekTransactions.reduce((sum, t) => sum + t.amount, 0);
    const weekIncomeTotal = weekIncome.reduce((sum, i) => sum + i.amount, 0);
    const weekNetSavings = weekIncomeTotal - weekExpenses;
    
    const weekLabel = `Week ${i + 1}`;
    
    data.push({
      week: weekLabel,
      income: weekIncomeTotal,
      expenses: weekExpenses,
      netSavings: weekNetSavings,
    });
  }
  
  return data.reverse();
};

// Monthly Chart Data
export const generateMonthlyChartData = (
  transactions: Transaction[],
  income: Income[],
  months: number = 6
): MonthlyChartData[] => {
  const data: MonthlyChartData[] = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });
    
    const monthIncome = income.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate >= monthStart && incomeDate <= monthEnd;
    });
    
    const monthExpenses = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthIncomeTotal = monthIncome.reduce((sum, i) => sum + i.amount, 0);
    const monthNetSavings = monthIncomeTotal - monthExpenses;
    
    // Category breakdown for expenses
    const categoryBreakdown = calculateCategoryBreakdown(monthTransactions);
    
    const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    data.push({
      month: monthLabel,
      income: monthIncomeTotal,
      expenses: monthExpenses,
      netSavings: monthNetSavings,
      categoryBreakdown,
    });
  }
  
  return data.reverse();
};

// Calendar Data
export const generateCalendarData = (
  transactions: Transaction[],
  income: Income[],
  year: number,
  month: number
): CalendarDayData[] => {
  const data: CalendarDayData[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = date.toISOString().split('T')[0];
    
    const dayTransactions = transactions.filter(t => t.date === dateString);
    const dayIncome = income.filter(i => i.date === dateString);
    
    const totalSpent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = dayIncome.reduce((sum, i) => sum + i.amount, 0);
    const transactionCount = dayTransactions.length + dayIncome.length;
    
    data.push({
      date: dateString,
      totalSpent,
      totalIncome,
      transactionCount,
      hasExpenses: dayTransactions.length > 0,
      hasIncome: dayIncome.length > 0,
    });
  }
  
  return data;
};

// Category Breakdown
export const calculateCategoryBreakdown = (transactions: Transaction[]): ChartDataPoint[] => {
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(transaction => {
    const current = categoryMap.get(transaction.category) || 0;
    categoryMap.set(transaction.category, current + transaction.amount);
  });
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  return Array.from(categoryMap.entries()).map(([category, amount], index) => ({
    label: category,
    value: amount,
    color: colors[index % colors.length],
  }));
};

// Income Category Breakdown
export const calculateIncomeCategoryBreakdown = (income: Income[]): ChartDataPoint[] => {
  const categoryMap = new Map<string, number>();
  
  income.forEach(incomeItem => {
    const current = categoryMap.get(incomeItem.category) || 0;
    categoryMap.set(incomeItem.category, current + incomeItem.amount);
  });
  
  const colors = [
    '#2ECC71', '#3498DB', '#9B59B6', '#E67E22', '#E74C3C',
    '#1ABC9C', '#F39C12', '#34495E', '#95A5A6', '#16A085'
  ];
  
  return Array.from(categoryMap.entries()).map(([category, amount], index) => ({
    label: category,
    value: amount,
    color: colors[index % colors.length],
  }));
};

// Utility Functions
const getPeriodStartDate = (date: Date, period: 'week' | 'month' | 'year', offset: number = 0): Date => {
  const result = new Date(date);
  
  switch (period) {
    case 'week':
      result.setDate(result.getDate() - result.getDay() + (offset * 7));
      break;
    case 'month':
      result.setMonth(result.getMonth() + offset);
      result.setDate(1);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() + offset);
      result.setMonth(0);
      result.setDate(1);
      break;
  }
  
  result.setHours(0, 0, 0, 0);
  return result;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  // ✅ Fixed: Use Indian Rupee formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Get spending insights
export const getSpendingInsights = (
  transactions: Transaction[],
  income: Income[],
  period: 'week' | 'month' = 'month'
): string[] => {
  const insights: string[] = [];
  const cashFlow = calculateCashFlow(transactions, income, period);
  
  if (cashFlow.netSavings < 0) {
    insights.push(`You're spending ${formatCurrency(Math.abs(cashFlow.netSavings))} more than you earn this ${period}`);
  } else if (cashFlow.netSavings > 0) {
    insights.push(`Great job! You've saved ${formatCurrency(cashFlow.netSavings)} this ${period}`);
  }
  
  const categoryBreakdown = calculateCategoryBreakdown(transactions);
  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown.reduce((max, current) => 
      current.value > max.value ? current : max
    );
    insights.push(`${topCategory.label} is your top spending category at ${formatCurrency(topCategory.value)}`);
  }
  
  const incomeBreakdown = calculateIncomeCategoryBreakdown(income);
  if (incomeBreakdown.length > 0) {
    const topIncomeSource = incomeBreakdown.reduce((max, current) => 
      current.value > max.value ? current : max
    );
    insights.push(`${topIncomeSource.label} is your main income source at ${formatCurrency(topIncomeSource.value)}`);
  }
  
  return insights;
};

// VISUALIZATION FEATURE END 