// ROUTINE FEATURE START
// Storage utilities for Routine & Automation Features

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ReminderSettings,
  RecurringExpense,
  Profile,
  UPISyncSettings,
  UPITransaction,
  MonthlyReport
} from '../types/routineFeatures';

// Storage keys
const STORAGE_KEYS = {
  REMINDER_SETTINGS: 'smartspend_reminder_settings',
  RECURRING_EXPENSES: 'smartspend_recurring_expenses',
  PROFILES: 'smartspend_profiles',
  ACTIVE_PROFILE: 'smartspend_active_profile',
  UPI_SETTINGS: 'smartspend_upi_settings',
  UPI_TRANSACTIONS: 'smartspend_upi_transactions',
  MONTHLY_REPORTS: 'smartspend_monthly_reports',
  EMAIL_SETTINGS: 'smartspend_email_settings'
};

// Default reminder settings
const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  time: '21:00', // 9 PM
  days: [0, 1, 2, 3, 4, 5, 6] // All days
};

// Default profiles
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'personal',
    name: 'Personal',
    type: 'personal',
    color: '#007AFF',
    icon: 'person',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Reminder Settings
export const saveReminderSettings = async (settings: ReminderSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    throw error;
  }
};

export const getReminderSettings = async (): Promise<ReminderSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_REMINDER_SETTINGS;
  } catch (error) {
    console.error('Error loading reminder settings:', error);
    return DEFAULT_REMINDER_SETTINGS;
  }
};

// Recurring Expenses
export const saveRecurringExpense = async (recurringExpense: RecurringExpense): Promise<void> => {
  try {
    const existing = await getRecurringExpenses();
    const updated = existing.filter(e => e.id !== recurringExpense.id);
    updated.push(recurringExpense);
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_EXPENSES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recurring expense:', error);
    throw error;
  }
};

export const getRecurringExpenses = async (): Promise<RecurringExpense[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECURRING_EXPENSES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading recurring expenses:', error);
    return [];
  }
};

export const deleteRecurringExpense = async (id: string): Promise<void> => {
  try {
    const existing = await getRecurringExpenses();
    const updated = existing.filter(e => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_EXPENSES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    throw error;
  }
};

// Profiles
export const saveProfiles = async (profiles: Profile[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving profiles:', error);
    throw error;
  }
};

export const getProfiles = async (): Promise<Profile[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
    return data ? JSON.parse(data) : DEFAULT_PROFILES;
  } catch (error) {
    console.error('Error loading profiles:', error);
    return DEFAULT_PROFILES;
  }
};

export const saveActiveProfile = async (profileId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, profileId);
  } catch (error) {
    console.error('Error saving active profile:', error);
    throw error;
  }
};

export const getActiveProfile = async (): Promise<string> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    return data || 'personal';
  } catch (error) {
    console.error('Error loading active profile:', error);
    return 'personal';
  }
};

// UPI Settings
export const saveUPISettings = async (settings: UPISyncSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.UPI_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving UPI settings:', error);
    throw error;
  }
};

export const getUPISettings = async (): Promise<UPISyncSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.UPI_SETTINGS);
    return data ? JSON.parse(data) : { enabled: false, apps: [], autoCategorize: true };
  } catch (error) {
    console.error('Error loading UPI settings:', error);
    return { enabled: false, apps: [], autoCategorize: true };
  }
};

// UPI Transactions
export const saveUPITransaction = async (transaction: UPITransaction): Promise<void> => {
  try {
    const existing = await getUPITransactions();
    const updated = existing.filter(t => t.id !== transaction.id);
    updated.push(transaction);
    await AsyncStorage.setItem(STORAGE_KEYS.UPI_TRANSACTIONS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving UPI transaction:', error);
    throw error;
  }
};

export const getUPITransactions = async (): Promise<UPITransaction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.UPI_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading UPI transactions:', error);
    return [];
  }
};

// Monthly Reports
export const saveMonthlyReport = async (report: MonthlyReport): Promise<void> => {
  try {
    const existing = await getMonthlyReports();
    const updated = existing.filter(r => r.month !== report.month);
    updated.push(report);
    await AsyncStorage.setItem(STORAGE_KEYS.MONTHLY_REPORTS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving monthly report:', error);
    throw error;
  }
};

export const getMonthlyReports = async (): Promise<MonthlyReport[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading monthly reports:', error);
    return [];
  }
};

// Email Settings
export const saveEmailSettings = async (email: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EMAIL_SETTINGS, email);
  } catch (error) {
    console.error('Error saving email settings:', error);
    throw error;
  }
};

export const getEmailSettings = async (): Promise<string> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EMAIL_SETTINGS);
    return data || '';
  } catch (error) {
    console.error('Error loading email settings:', error);
    return '';
  }
};

// ROUTINE FEATURE END 