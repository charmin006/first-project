// ROUTINE FEATURE START
// Types for Routine & Automation Features

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format
  days: number[]; // 0-6 for days of week (0 = Sunday)
}

export interface RecurringExpense {
  id: string;
  transactionId: string; // Reference to original transaction
  frequency: 'daily' | 'weekly' | 'monthly';
  nextDueDate: string; // ISO date string
  lastProcessed?: string; // ISO date string
  isActive: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'shared' | 'custom';
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReceiptScanData {
  storeName?: string;
  amount?: number;
  date?: string;
  confidence: number; // 0-1 confidence score
}

export interface MonthlyReport {
  month: string; // YYYY-MM format
  totalSpent: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  topExpenses: Array<{
    amount: number;
    category: string;
    date: string;
    note?: string;
  }>;
  insights: string[];
}

export interface UPISyncSettings {
  enabled: boolean;
  apps: string[]; // ['googlepay', 'phonepay', etc.]
  autoCategorize: boolean;
  lastSync?: string;
}

export interface UPITransaction {
  id: string;
  amount: number;
  vendor: string;
  date: string;
  source: string; // 'googlepay', 'phonepay', etc.
  rawText: string;
  suggestedCategory?: string;
  isProcessed: boolean;
  createdAt: string;
}

// ROUTINE FEATURE END 