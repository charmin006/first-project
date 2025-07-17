// VISUALIZATION FEATURE START
// Storage utilities for visualization and finance planning features

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Income, Subscription, CashFlowData, WeeklyChartData, MonthlyChartData, CalendarDayData } from '../types/visualizationFeatures';

const STORAGE_KEYS = {
  INCOME: 'smartspend_income',
  SUBSCRIPTIONS: 'smartspend_subscriptions',
  CASH_FLOW: 'smartspend_cash_flow',
  WEEKLY_CHARTS: 'smartspend_weekly_charts',
  MONTHLY_CHARTS: 'smartspend_monthly_charts',
  CALENDAR_DATA: 'smartspend_calendar_data',
};

// Income Storage
export const saveIncome = async (income: Income): Promise<void> => {
  try {
    const existingIncome = await getIncome();
    const updatedIncome = [...existingIncome, income];
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(updatedIncome));
  } catch (error) {
    console.error('Error saving income:', error);
    throw error;
  }
};

export const getIncome = async (): Promise<Income[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOME);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting income:', error);
    return [];
  }
};

export const updateIncome = async (updatedIncome: Income): Promise<void> => {
  try {
    const existingIncome = await getIncome();
    const updatedList = existingIncome.map(income => 
      income.id === updatedIncome.id ? updatedIncome : income
    );
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(updatedList));
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};

export const deleteIncome = async (incomeId: string): Promise<void> => {
  try {
    const existingIncome = await getIncome();
    const filteredIncome = existingIncome.filter(income => income.id !== incomeId);
    await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(filteredIncome));
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

// Subscription Storage
export const saveSubscription = async (subscription: Subscription): Promise<void> => {
  try {
    const existingSubscriptions = await getSubscriptions();
    const updatedSubscriptions = [...existingSubscriptions, subscription];
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedSubscriptions));
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
};

export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

export const updateSubscription = async (updatedSubscription: Subscription): Promise<void> => {
  try {
    const existingSubscriptions = await getSubscriptions();
    const updatedList = existingSubscriptions.map(sub => 
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    );
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedList));
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const existingSubscriptions = await getSubscriptions();
    const filteredSubscriptions = existingSubscriptions.filter(sub => sub.id !== subscriptionId);
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(filteredSubscriptions));
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// Cash Flow Storage
export const saveCashFlowData = async (cashFlowData: CashFlowData): Promise<void> => {
  try {
    const existingData = await getCashFlowData();
    const updatedData = [...existingData, cashFlowData];
    await AsyncStorage.setItem(STORAGE_KEYS.CASH_FLOW, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving cash flow data:', error);
    throw error;
  }
};

export const getCashFlowData = async (): Promise<CashFlowData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CASH_FLOW);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting cash flow data:', error);
    return [];
  }
};

// Chart Data Storage
export const saveWeeklyChartData = async (weekData: WeeklyChartData): Promise<void> => {
  try {
    const existingData = await getWeeklyChartData();
    const updatedData = existingData.map(data => 
      data.week === weekData.week ? weekData : data
    );
    if (!existingData.find(data => data.week === weekData.week)) {
      updatedData.push(weekData);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_CHARTS, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving weekly chart data:', error);
    throw error;
  }
};

export const getWeeklyChartData = async (): Promise<WeeklyChartData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_CHARTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting weekly chart data:', error);
    return [];
  }
};

export const saveMonthlyChartData = async (monthData: MonthlyChartData): Promise<void> => {
  try {
    const existingData = await getMonthlyChartData();
    const updatedData = existingData.map(data => 
      data.month === monthData.month ? monthData : data
    );
    if (!existingData.find(data => data.month === monthData.month)) {
      updatedData.push(monthData);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.MONTHLY_CHARTS, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving monthly chart data:', error);
    throw error;
  }
};

export const getMonthlyChartData = async (): Promise<MonthlyChartData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_CHARTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting monthly chart data:', error);
    return [];
  }
};

// Calendar Data Storage
export const saveCalendarDayData = async (dayData: CalendarDayData): Promise<void> => {
  try {
    const existingData = await getCalendarData();
    const updatedData = existingData.map(data => 
      data.date === dayData.date ? dayData : data
    );
    if (!existingData.find(data => data.date === dayData.date)) {
      updatedData.push(dayData);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_DATA, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving calendar day data:', error);
    throw error;
  }
};

export const getCalendarData = async (): Promise<CalendarDayData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_DATA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting calendar data:', error);
    return [];
  }
};

export const getCalendarDataForMonth = async (year: number, month: number): Promise<CalendarDayData[]> => {
  try {
    const allData = await getCalendarData();
    const monthStr = month.toString().padStart(2, '0');
    return allData.filter(data => data.date.startsWith(`${year}-${monthStr}`));
  } catch (error) {
    console.error('Error getting calendar data for month:', error);
    return [];
  }
};

// Utility Functions
export const clearAllVisualizationData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.INCOME),
      AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS),
      AsyncStorage.removeItem(STORAGE_KEYS.CASH_FLOW),
      AsyncStorage.removeItem(STORAGE_KEYS.WEEKLY_CHARTS),
      AsyncStorage.removeItem(STORAGE_KEYS.MONTHLY_CHARTS),
      AsyncStorage.removeItem(STORAGE_KEYS.CALENDAR_DATA),
    ]);
  } catch (error) {
    console.error('Error clearing visualization data:', error);
    throw error;
  }
};

// VISUALIZATION FEATURE END 