import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'smartspend_transactions',
  CATEGORIES: 'smartspend_categories',
  USER_PREFERENCES: 'smartspend_preferences'
};

// Transaction Storage
export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const existingTransactions = await getTransactions();
    const updatedTransactions = [...existingTransactions, transaction];
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const updateTransaction = async (updatedTransaction: Transaction): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const updatedTransactions = transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTransactions));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Category Storage
export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const categories = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const addCategory = async (category: Category): Promise<void> => {
  try {
    const categories = await getCategories();
    const updatedCategories = [...categories, category];
    await saveCategories(updatedCategories);
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Clear all data (for testing/reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.CATEGORIES,
      STORAGE_KEYS.USER_PREFERENCES
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}; 