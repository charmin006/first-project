// ROUTINE FEATURE START
// Service for managing recurring expenses

import { RecurringExpense } from '../types/routineFeatures';
import { Transaction } from '../types';
import { saveRecurringExpense, getRecurringExpenses, deleteRecurringExpense } from '../utils/routineStorage';
import { saveTransaction } from '../utils/storage';

export class RecurringExpensesService {
  private static instance: RecurringExpensesService;

  private constructor() {}

  static getInstance(): RecurringExpensesService {
    if (!RecurringExpensesService.instance) {
      RecurringExpensesService.instance = new RecurringExpensesService();
    }
    return RecurringExpensesService.instance;
  }

  // Create a recurring expense from an existing transaction
  async createRecurringExpense(
    transaction: Transaction,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<RecurringExpense> {
    const nextDueDate = this.calculateNextDueDate(new Date(), frequency);
    
    const recurringExpense: RecurringExpense = {
      id: `recurring_${Date.now()}`,
      transactionId: transaction.id,
      frequency,
      nextDueDate: nextDueDate.toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await saveRecurringExpense(recurringExpense);
    return recurringExpense;
  }

  // Process recurring expenses that are due
  async processRecurringExpenses(originalTransaction: Transaction): Promise<Transaction[]> {
    try {
      const recurringExpenses = await getRecurringExpenses();
      const today = new Date();
      const processedTransactions: Transaction[] = [];

      for (const recurring of recurringExpenses) {
        if (!recurring.isActive) continue;

        const nextDue = new Date(recurring.nextDueDate);
        if (nextDue <= today) {
          // Create new transaction
          const newTransaction: Transaction = {
            ...originalTransaction,
            id: `recurring_${Date.now()}_${Math.random()}`,
            date: nextDue.toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
          };

          // Save the new transaction
          await saveTransaction(newTransaction);
          processedTransactions.push(newTransaction);

          // Update recurring expense with next due date
          const updatedRecurring: RecurringExpense = {
            ...recurring,
            lastProcessed: nextDue.toISOString(),
            nextDueDate: this.calculateNextDueDate(nextDue, recurring.frequency).toISOString(),
          };

          await saveRecurringExpense(updatedRecurring);
        }
      }

      return processedTransactions;
    } catch (error) {
      console.error('Error processing recurring expenses:', error);
      return [];
    }
  }

  // Get all recurring expenses
  async getRecurringExpenses(): Promise<RecurringExpense[]> {
    return await getRecurringExpenses();
  }

  // Update recurring expense
  async updateRecurringExpense(recurringExpense: RecurringExpense): Promise<void> {
    await saveRecurringExpense(recurringExpense);
  }

  // Delete recurring expense
  async deleteRecurringExpense(id: string): Promise<void> {
    await deleteRecurringExpense(id);
  }

  // Toggle recurring expense active status
  async toggleRecurringExpense(id: string): Promise<void> {
    const recurringExpenses = await getRecurringExpenses();
    const recurring = recurringExpenses.find(r => r.id === id);
    
    if (recurring) {
      const updated = { ...recurring, isActive: !recurring.isActive };
      await saveRecurringExpense(updated);
    }
  }

  // Calculate next due date based on frequency
  private calculateNextDueDate(currentDate: Date, frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    
    return nextDate;
  }

  // Get frequency display text
  getFrequencyText(frequency: 'daily' | 'weekly' | 'monthly'): string {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Unknown';
    }
  }

  // Get next due date display text
  getNextDueText(nextDueDate: string): string {
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays < 0) {
      return 'Overdue';
    } else {
      return `Due in ${diffDays} days`;
    }
  }

  // Check if a transaction is part of a recurring expense
  async isRecurringTransaction(transactionId: string): Promise<boolean> {
    const recurringExpenses = await getRecurringExpenses();
    return recurringExpenses.some(r => r.transactionId === transactionId);
  }

  // Get recurring expense for a transaction
  async getRecurringExpenseForTransaction(transactionId: string): Promise<RecurringExpense | null> {
    const recurringExpenses = await getRecurringExpenses();
    return recurringExpenses.find(r => r.transactionId === transactionId) || null;
  }
}

// Export singleton instance
export const recurringExpensesService = RecurringExpensesService.getInstance();

// ROUTINE FEATURE END 