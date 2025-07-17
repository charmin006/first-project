// AI Budget Service - Separated from core functionality
// This service provides intelligent budget suggestions and forecasts

import { Transaction } from '../types';
import { BudgetSuggestion, UserBudget, DailyForecast } from '../types/aiFeatures';

export class BudgetAIService {
  // Generate smart budget suggestions based on spending patterns
  static async generateBudgetSuggestions(
    transactions: Transaction[],
    existingBudgets: UserBudget[]
  ): Promise<BudgetSuggestion[]> {
    try {
      const suggestions: BudgetSuggestion[] = [];
      const categories = this.getUniqueCategories(transactions);
      
      for (const category of categories) {
        const categoryTransactions = transactions.filter(t => t.category === category);
        const suggestion = this.analyzeCategorySpending(category, categoryTransactions);
        
        // Check if user already has a budget for this category
        const existingBudget = existingBudgets.find(b => b.category === category);
        if (!existingBudget) {
          suggestions.push(suggestion);
        }
      }
      
      return suggestions.sort((a, b) => b.suggestedAmount - a.suggestedAmount);
    } catch (error) {
      console.error('Budget suggestion error:', error);
      return [];
    }
  }

  // Calculate daily spending forecast
  static calculateDailyForecast(
    transactions: Transaction[],
    monthlyBudget: number,
    targetDate: Date = new Date()
  ): DailyForecast {
    try {
      const currentMonth = targetDate.getFullYear() + '-' + String(targetDate.getMonth() + 1).padStart(2, '0');
      const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
      
      const spentSoFar = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
      const currentDay = targetDate.getDate();
      const daysLeft = daysInMonth - currentDay + 1;
      
      const remainingBudget = Math.max(0, monthlyBudget - spentSoFar);
      const safeToSpend = daysLeft > 0 ? remainingBudget / daysLeft : 0;
      
      const riskLevel = this.calculateRiskLevel(spentSoFar, monthlyBudget, currentDay, daysInMonth);
      
      return {
        date: targetDate.toISOString().split('T')[0],
        safeToSpend: Math.round(safeToSpend * 100) / 100,
        monthlyBudget,
        spentSoFar,
        daysLeft,
        riskLevel
      };
    } catch (error) {
      console.error('Daily forecast error:', error);
      return {
        date: targetDate.toISOString().split('T')[0],
        safeToSpend: 0,
        monthlyBudget: 0,
        spentSoFar: 0,
        daysLeft: 0,
        riskLevel: 'medium'
      };
    }
  }

  // Analyze spending patterns for a specific category
  private static analyzeCategorySpending(
    category: string,
    transactions: Transaction[]
  ): BudgetSuggestion {
    if (transactions.length === 0) {
      return {
        category,
        suggestedAmount: 0,
        currentAverage: 0,
        reasoning: 'No spending data available for this category',
        accepted: false,
        createdAt: new Date().toISOString()
      };
    }

    // Calculate basic statistics
    const amounts = transactions.map(t => t.amount);
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const median = this.calculateMedian(amounts);
    const recentAverage = this.calculateRecentAverage(transactions, 3); // Last 3 months
    
    // Apply smart adjustments based on spending patterns
    const volatility = this.calculateVolatility(amounts);
    const trend = this.calculateTrend(transactions);
    
    let suggestedAmount = recentAverage || average;
    
    // Adjust based on volatility
    if (volatility > 0.5) {
      suggestedAmount *= 1.2; // 20% buffer for volatile spending
    }
    
    // Adjust based on trend
    if (trend > 0.1) {
      suggestedAmount *= 1.1; // 10% increase for upward trend
    } else if (trend < -0.1) {
      suggestedAmount *= 0.9; // 10% decrease for downward trend
    }
    
    // Apply seasonal adjustments
    const seasonalFactor = this.getSeasonalFactor(category, new Date());
    suggestedAmount *= seasonalFactor;
    
    // Round to reasonable amount
    suggestedAmount = Math.round(suggestedAmount * 100) / 100;
    
    const reasoning = this.generateReasoning(
      category,
      average,
      recentAverage,
      volatility,
      trend,
      seasonalFactor
    );
    
    return {
      category,
      suggestedAmount,
      currentAverage: Math.round(average * 100) / 100,
      reasoning,
      accepted: false,
      createdAt: new Date().toISOString()
    };
  }

  // Calculate median value
  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  // Calculate recent average (last N months)
  private static calculateRecentAverage(transactions: Transaction[], months: number): number {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= cutoffDate
    );
    
    if (recentTransactions.length === 0) return 0;
    
    const total = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    return total / recentTransactions.length;
  }

  // Calculate spending volatility (coefficient of variation)
  private static calculateVolatility(amounts: number[]): number {
    if (amounts.length < 2) return 0;
    
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const standardDeviation = Math.sqrt(variance);
    
    return standardDeviation / mean;
  }

  // Calculate spending trend (positive = increasing, negative = decreasing)
  private static calculateTrend(transactions: Transaction[]): number {
    if (transactions.length < 2) return 0;
    
    const sortedTransactions = transactions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstHalf = sortedTransactions.slice(0, Math.floor(sortedTransactions.length / 2));
    const secondHalf = sortedTransactions.slice(Math.floor(sortedTransactions.length / 2));
    
    const firstHalfAverage = firstHalf.reduce((sum, t) => sum + t.amount, 0) / firstHalf.length;
    const secondHalfAverage = secondHalf.reduce((sum, t) => sum + t.amount, 0) / secondHalf.length;
    
    if (firstHalfAverage === 0) return 0;
    
    return (secondHalfAverage - firstHalfAverage) / firstHalfAverage;
  }

  // Get seasonal adjustment factor
  private static getSeasonalFactor(category: string, date: Date): number {
    const month = date.getMonth();
    
    // Holiday season adjustments
    if (month === 11 || month === 0) { // December/January
      if (category.toLowerCase().includes('shopping') || category.toLowerCase().includes('gift')) {
        return 1.3; // 30% increase for holiday shopping
      }
    }
    
    // Summer vacation adjustments
    if (month >= 5 && month <= 8) { // June to September
      if (category.toLowerCase().includes('travel') || category.toLowerCase().includes('entertainment')) {
        return 1.2; // 20% increase for summer activities
      }
    }
    
    // Back-to-school adjustments
    if (month === 7 || month === 8) { // August/September
      if (category.toLowerCase().includes('education') || category.toLowerCase().includes('shopping')) {
        return 1.15; // 15% increase for back-to-school
      }
    }
    
    return 1.0; // No seasonal adjustment
  }

  // Calculate risk level for daily forecast
  private static calculateRiskLevel(
    spentSoFar: number,
    monthlyBudget: number,
    currentDay: number,
    daysInMonth: number
  ): 'low' | 'medium' | 'high' {
    const expectedSpending = (monthlyBudget / daysInMonth) * currentDay;
    const spendingRatio = spentSoFar / expectedSpending;
    
    if (spendingRatio < 0.8) return 'low';
    if (spendingRatio < 1.2) return 'medium';
    return 'high';
  }

  // Generate reasoning for budget suggestion
  private static generateReasoning(
    category: string,
    average: number,
    recentAverage: number,
    volatility: number,
    trend: number,
    seasonalFactor: number
  ): string {
    const reasons: string[] = [];
    
    if (recentAverage > average * 1.1) {
      reasons.push('Recent spending is higher than historical average');
    } else if (recentAverage < average * 0.9) {
      reasons.push('Recent spending is lower than historical average');
    }
    
    if (volatility > 0.5) {
      reasons.push('High spending variability - added buffer for flexibility');
    }
    
    if (trend > 0.1) {
      reasons.push('Upward spending trend detected');
    } else if (trend < -0.1) {
      reasons.push('Downward spending trend detected');
    }
    
    if (seasonalFactor !== 1.0) {
      reasons.push('Seasonal adjustment applied');
    }
    
    if (reasons.length === 0) {
      reasons.push('Based on consistent spending patterns');
    }
    
    return reasons.join('. ') + '.';
  }

  // Get unique categories from transactions
  private static getUniqueCategories(transactions: Transaction[]): string[] {
    const categories = new Set(transactions.map(t => t.category));
    return Array.from(categories).sort();
  }
} 