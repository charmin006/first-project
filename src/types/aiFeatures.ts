// AI Features Types - Separate from core types to maintain modularity

export type ExpenseClassification = 'need' | 'want' | 'unclassified';

export interface ClassifiedTransaction {
  transactionId: string;
  classification: ExpenseClassification;
  confidence: number; // 0-1 confidence score
  aiGenerated: boolean;
  classifiedAt: string;
}

export interface BudgetSuggestion {
  category: string;
  suggestedAmount: number;
  currentAverage: number;
  reasoning: string;
  accepted: boolean;
  createdAt: string;
}

export interface UserBudget {
  id: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}

export interface SpendingAlert {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  category?: string;
  threshold: number;
  currentSpending: number;
  triggeredAt: string;
  acknowledged: boolean;
}

export interface DailyForecast {
  date: string;
  safeToSpend: number;
  monthlyBudget: number;
  spentSoFar: number;
  daysLeft: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  isActive: boolean;
  weeklyTarget: number;
  lastUpdated: string;
}

export interface AIInsight {
  id: string;
  type: 'classification' | 'budget_suggestion' | 'spending_alert' | 'savings_progress';
  title: string;
  description: string;
  data: any;
  createdAt: string;
  isRead: boolean;
} 