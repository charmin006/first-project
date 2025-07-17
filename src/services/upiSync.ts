// ROUTINE FEATURE START
// UPI sync service for automatic transaction detection

import { UPISyncSettings, UPITransaction } from '../types/routineFeatures';
import { saveUPISettings, getUPISettings, saveUPITransaction, getUPITransactions } from '../utils/routineStorage';

export class UPISyncService {
  private static instance: UPISyncService;

  private constructor() {}

  static getInstance(): UPISyncService {
    if (!UPISyncService.instance) {
      UPISyncService.instance = new UPISyncService();
    }
    return UPISyncService.instance;
  }

  // Get UPI settings
  async getSettings(): Promise<UPISyncSettings> {
    return await getUPISettings();
  }

  // Update UPI settings
  async updateSettings(settings: UPISyncSettings): Promise<void> {
    await saveUPISettings(settings);
  }

  // Enable/disable UPI sync
  async toggleSync(enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    settings.enabled = enabled;
    await this.updateSettings(settings);
  }

  // Add/remove UPI app
  async toggleApp(appName: string): Promise<void> {
    const settings = await this.getSettings();
    const appIndex = settings.apps.indexOf(appName);
    
    if (appIndex > -1) {
      settings.apps.splice(appIndex, 1);
    } else {
      settings.apps.push(appName);
    }
    
    await this.updateSettings(settings);
  }

  // Get available UPI apps
  getAvailableApps(): Array<{ name: string; displayName: string; icon: string }> {
    return [
      { name: 'googlepay', displayName: 'Google Pay', icon: 'logo-google' },
      { name: 'phonepay', displayName: 'PhonePe', icon: 'phone-portrait' },
      { name: 'paytm', displayName: 'Paytm', icon: 'wallet' },
      { name: 'amazonpay', displayName: 'Amazon Pay', icon: 'logo-amazon' },
      { name: 'bhim', displayName: 'BHIM', icon: 'card' },
      { name: 'whatsapp', displayName: 'WhatsApp Pay', icon: 'logo-whatsapp' },
    ];
  }

  // Simulate SMS detection (in a real app, you'd use SMS permissions)
  async detectUPITransactions(): Promise<UPITransaction[]> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled || settings.apps.length === 0) {
        return [];
      }

      // Simulate detecting transactions from SMS
      const mockTransactions = this.generateMockUPITransactions(settings.apps);
      
      // Save new transactions
      for (const transaction of mockTransactions) {
        await saveUPITransaction(transaction);
      }

      return mockTransactions;
    } catch (error) {
      console.error('Error detecting UPI transactions:', error);
      return [];
    }
  }

  // Generate mock UPI transactions for simulation
  private generateMockUPITransactions(enabledApps: string[]): UPITransaction[] {
    const transactions: UPITransaction[] = [];
    const now = new Date();
    
    // Generate 1-3 random transactions
    const numTransactions = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numTransactions; i++) {
      const app = enabledApps[Math.floor(Math.random() * enabledApps.length)];
      const amount = Math.floor(Math.random() * 500) + 10; // $10-$510
      const vendors = ['Grocery Store', 'Restaurant', 'Gas Station', 'Online Shop', 'Pharmacy'];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      
      // Random date within last 24 hours
      const date = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
      
      const transaction: UPITransaction = {
        id: `upi_${Date.now()}_${i}`,
        amount,
        vendor,
        date: date.toISOString().split('T')[0],
        source: app,
        rawText: `Payment of Rs.${amount} to ${vendor} via ${app}`,
        suggestedCategory: this.suggestCategory(vendor, amount),
        isProcessed: false,
        createdAt: new Date().toISOString(),
      };
      
      transactions.push(transaction);
    }
    
    return transactions;
  }

  // Suggest category based on vendor and amount
  private suggestCategory(vendor: string, amount: number): string {
    const vendorLower = vendor.toLowerCase();
    
    if (vendorLower.includes('grocery') || vendorLower.includes('store')) {
      return 'Food & Dining';
    } else if (vendorLower.includes('restaurant') || vendorLower.includes('cafe')) {
      return 'Food & Dining';
    } else if (vendorLower.includes('gas') || vendorLower.includes('fuel')) {
      return 'Transportation';
    } else if (vendorLower.includes('pharmacy') || vendorLower.includes('medical')) {
      return 'Healthcare';
    } else if (vendorLower.includes('online') || vendorLower.includes('shop')) {
      return 'Shopping';
    } else if (amount > 200) {
      return 'Shopping';
    } else {
      return 'Food & Dining';
    }
  }

  // Parse SMS text to extract transaction details
  parseSMSText(smsText: string): Partial<UPITransaction> | null {
    try {
      // Common UPI SMS patterns
      const patterns = [
        // Google Pay pattern
        /Rs\.(\d+(?:\.\d{2})?) paid to (.+?)\./i,
        // PhonePe pattern
        /Rs\.(\d+(?:\.\d{2})?) sent to (.+?)\./i,
        // Paytm pattern
        /Rs\.(\d+(?:\.\d{2})?) paid to (.+?)\./i,
        // Generic pattern
        /(\d+(?:\.\d{2})?) paid to (.+?)\./i,
      ];

      for (const pattern of patterns) {
        const match = smsText.match(pattern);
        if (match) {
          const amount = parseFloat(match[1]);
          const vendor = match[2].trim();
          
          if (amount && vendor) {
            return {
              amount,
              vendor,
              suggestedCategory: this.suggestCategory(vendor, amount),
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing SMS text:', error);
      return null;
    }
  }

  // Get unprocessed UPI transactions
  async getUnprocessedTransactions(): Promise<UPITransaction[]> {
    try {
      const transactions = await getUPITransactions();
      return transactions.filter(t => !t.isProcessed);
    } catch (error) {
      console.error('Error getting unprocessed transactions:', error);
      return [];
    }
  }

  // Mark transaction as processed
  async markAsProcessed(transactionId: string): Promise<void> {
    try {
      const transactions = await getUPITransactions();
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (transaction) {
        transaction.isProcessed = true;
        await saveUPITransaction(transaction);
      }
    } catch (error) {
      console.error('Error marking transaction as processed:', error);
    }
  }

  // Get transaction statistics
  async getTransactionStats(): Promise<{
    total: number;
    processed: number;
    unprocessed: number;
    totalAmount: number;
  }> {
    try {
      const transactions = await getUPITransactions();
      const processed = transactions.filter(t => t.isProcessed);
      const unprocessed = transactions.filter(t => !t.isProcessed);
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        total: transactions.length,
        processed: processed.length,
        unprocessed: unprocessed.length,
        totalAmount,
      };
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      return {
        total: 0,
        processed: 0,
        unprocessed: 0,
        totalAmount: 0,
      };
    }
  }

  // Clear all UPI transactions
  async clearAllTransactions(): Promise<void> {
    try {
      // In a real implementation, you'd clear the storage
      // For now, we'll just mark all as processed
      const transactions = await getUPITransactions();
      for (const transaction of transactions) {
        transaction.isProcessed = true;
        await saveUPITransaction(transaction);
      }
    } catch (error) {
      console.error('Error clearing transactions:', error);
    }
  }

  // Get app display name
  getAppDisplayName(appName: string): string {
    const apps = this.getAvailableApps();
    const app = apps.find(a => a.name === appName);
    return app ? app.displayName : appName;
  }

  // Check if sync is enabled
  async isSyncEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled && settings.apps.length > 0;
  }
}

// Export singleton instance
export const upiSyncService = UPISyncService.getInstance();

// ROUTINE FEATURE END 