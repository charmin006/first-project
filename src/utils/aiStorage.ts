// AI Features Storage - Separated from core storage
// This handles storage for AI-specific data like classifications, budgets, and goals

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ClassifiedTransaction,
  BudgetSuggestion,
  UserBudget,
  SpendingAlert,
  SavingsGoal,
  AIInsight
} from '../types/aiFeatures';

const AI_STORAGE_KEYS = {
  CLASSIFICATIONS: 'smartspend_ai_classifications',
  BUDGET_SUGGESTIONS: 'smartspend_ai_budget_suggestions',
  USER_BUDGETS: 'smartspend_ai_user_budgets',
  SPENDING_ALERTS: 'smartspend_ai_spending_alerts',
  SAVINGS_GOALS: 'smartspend_ai_savings_goals',
  AI_INSIGHTS: 'smartspend_ai_insights'
};

// Classification Storage
export const saveClassification = async (classification: ClassifiedTransaction): Promise<void> => {
  try {
    const classifications = await getClassifications();
    const existingIndex = classifications.findIndex(c => c.transactionId === classification.transactionId);
    
    if (existingIndex >= 0) {
      classifications[existingIndex] = classification;
    } else {
      classifications.push(classification);
    }
    
    await AsyncStorage.setItem(AI_STORAGE_KEYS.CLASSIFICATIONS, JSON.stringify(classifications));
  } catch (error) {
    console.error('Error saving classification:', error);
    throw error;
  }
};

export const getClassifications = async (): Promise<ClassifiedTransaction[]> => {
  try {
    const classifications = await AsyncStorage.getItem(AI_STORAGE_KEYS.CLASSIFICATIONS);
    return classifications ? JSON.parse(classifications) : [];
  } catch (error) {
    console.error('Error getting classifications:', error);
    return [];
  }
};

export const getClassificationByTransactionId = async (transactionId: string): Promise<ClassifiedTransaction | null> => {
  try {
    const classifications = await getClassifications();
    return classifications.find(c => c.transactionId === transactionId) || null;
  } catch (error) {
    console.error('Error getting classification by transaction ID:', error);
    return null;
  }
};

// Budget Suggestions Storage
export const saveBudgetSuggestions = async (suggestions: BudgetSuggestion[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(AI_STORAGE_KEYS.BUDGET_SUGGESTIONS, JSON.stringify(suggestions));
  } catch (error) {
    console.error('Error saving budget suggestions:', error);
    throw error;
  }
};

export const getBudgetSuggestions = async (): Promise<BudgetSuggestion[]> => {
  try {
    const suggestions = await AsyncStorage.getItem(AI_STORAGE_KEYS.BUDGET_SUGGESTIONS);
    return suggestions ? JSON.parse(suggestions) : [];
  } catch (error) {
    console.error('Error getting budget suggestions:', error);
    return [];
  }
};

export const updateBudgetSuggestion = async (category: string, accepted: boolean): Promise<void> => {
  try {
    const suggestions = await getBudgetSuggestions();
    const updatedSuggestions = suggestions.map(s => 
      s.category === category ? { ...s, accepted } : s
    );
    await saveBudgetSuggestions(updatedSuggestions);
  } catch (error) {
    console.error('Error updating budget suggestion:', error);
    throw error;
  }
};

// User Budgets Storage
export const saveUserBudget = async (budget: UserBudget): Promise<void> => {
  try {
    const budgets = await getUserBudgets();
    const existingIndex = budgets.findIndex(b => b.id === budget.id);
    
    if (existingIndex >= 0) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    
    await AsyncStorage.setItem(AI_STORAGE_KEYS.USER_BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving user budget:', error);
    throw error;
  }
};

export const getUserBudgets = async (): Promise<UserBudget[]> => {
  try {
    const budgets = await AsyncStorage.getItem(AI_STORAGE_KEYS.USER_BUDGETS);
    return budgets ? JSON.parse(budgets) : [];
  } catch (error) {
    console.error('Error getting user budgets:', error);
    return [];
  }
};

export const deleteUserBudget = async (budgetId: string): Promise<void> => {
  try {
    const budgets = await getUserBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== budgetId);
    await AsyncStorage.setItem(AI_STORAGE_KEYS.USER_BUDGETS, JSON.stringify(filteredBudgets));
  } catch (error) {
    console.error('Error deleting user budget:', error);
    throw error;
  }
};

// Spending Alerts Storage
export const saveSpendingAlert = async (alert: SpendingAlert): Promise<void> => {
  try {
    const alerts = await getSpendingAlerts();
    alerts.push(alert);
    await AsyncStorage.setItem(AI_STORAGE_KEYS.SPENDING_ALERTS, JSON.stringify(alerts));
  } catch (error) {
    console.error('Error saving spending alert:', error);
    throw error;
  }
};

export const getSpendingAlerts = async (): Promise<SpendingAlert[]> => {
  try {
    const alerts = await AsyncStorage.getItem(AI_STORAGE_KEYS.SPENDING_ALERTS);
    return alerts ? JSON.parse(alerts) : [];
  } catch (error) {
    console.error('Error getting spending alerts:', error);
    return [];
  }
};

export const acknowledgeAlert = async (alertId: string): Promise<void> => {
  try {
    const alerts = await getSpendingAlerts();
    const updatedAlerts = alerts.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    );
    await AsyncStorage.setItem(AI_STORAGE_KEYS.SPENDING_ALERTS, JSON.stringify(updatedAlerts));
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    throw error;
  }
};

// Savings Goals Storage
export const saveSavingsGoal = async (goal: SavingsGoal): Promise<void> => {
  try {
    const goals = await getSavingsGoals();
    const existingIndex = goals.findIndex(g => g.id === goal.id);
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }
    
    await AsyncStorage.setItem(AI_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving savings goal:', error);
    throw error;
  }
};

export const getSavingsGoals = async (): Promise<SavingsGoal[]> => {
  try {
    const goals = await AsyncStorage.getItem(AI_STORAGE_KEYS.SAVINGS_GOALS);
    return goals ? JSON.parse(goals) : [];
  } catch (error) {
    console.error('Error getting savings goals:', error);
    return [];
  }
};

export const updateSavingsGoalProgress = async (goalId: string, currentAmount: number): Promise<void> => {
  try {
    const goals = await getSavingsGoals();
    const updatedGoals = goals.map(g => 
      g.id === goalId ? { ...g, currentAmount, lastUpdated: new Date().toISOString() } : g
    );
    await AsyncStorage.setItem(AI_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updatedGoals));
  } catch (error) {
    console.error('Error updating savings goal progress:', error);
    throw error;
  }
};

export const deleteSavingsGoal = async (goalId: string): Promise<void> => {
  try {
    const goals = await getSavingsGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    await AsyncStorage.setItem(AI_STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(filteredGoals));
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    throw error;
  }
};

// AI Insights Storage
export const saveAIInsight = async (insight: AIInsight): Promise<void> => {
  try {
    const insights = await getAIInsights();
    insights.push(insight);
    await AsyncStorage.setItem(AI_STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
  } catch (error) {
    console.error('Error saving AI insight:', error);
    throw error;
  }
};

export const getAIInsights = async (): Promise<AIInsight[]> => {
  try {
    const insights = await AsyncStorage.getItem(AI_STORAGE_KEYS.AI_INSIGHTS);
    return insights ? JSON.parse(insights) : [];
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return [];
  }
};

export const markInsightAsRead = async (insightId: string): Promise<void> => {
  try {
    const insights = await getAIInsights();
    const updatedInsights = insights.map(i => 
      i.id === insightId ? { ...i, isRead: true } : i
    );
    await AsyncStorage.setItem(AI_STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(updatedInsights));
  } catch (error) {
    console.error('Error marking insight as read:', error);
    throw error;
  }
};

// Clear all AI data (for testing/reset)
export const clearAllAIData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(AI_STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing AI data:', error);
    throw error;
  }
}; 