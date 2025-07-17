// ROUTINE FEATURE START
// Service for generating and sending monthly reports

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../types';
import { MonthlyReport } from '../types/routineFeatures';
import { saveMonthlyReport, getMonthlyReports, getEmailSettings } from '../utils/routineStorage';

export class MonthlyReportService {
  private static instance: MonthlyReportService;

  private constructor() {}

  static getInstance(): MonthlyReportService {
    if (!MonthlyReportService.instance) {
      MonthlyReportService.instance = new MonthlyReportService();
    }
    return MonthlyReportService.instance;
  }

  // Generate monthly report data
  generateMonthlyReport(transactions: Transaction[], month: string): MonthlyReport {
    const monthTransactions = transactions.filter(t => 
      t.date.startsWith(month)
    );

    const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryMap = new Map<string, number>();
    monthTransactions.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Top expenses
    const topExpenses = monthTransactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(t => ({
        amount: t.amount,
        category: t.category,
        date: t.date,
        note: t.note,
      }));

    // Generate insights
    const insights = this.generateInsights(monthTransactions, categoryBreakdown, totalSpent);

    return {
      month,
      totalSpent,
      categoryBreakdown,
      topExpenses,
      insights,
    };
  }

  // Generate insights for the report
  private generateInsights(
    transactions: Transaction[],
    categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>,
    totalSpent: number
  ): string[] {
    const insights: string[] = [];

    if (transactions.length === 0) {
      insights.push('No expenses recorded this month.');
      return insights;
    }

    // Top spending category
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      insights.push(`Your highest spending category was ${topCategory.category} (${topCategory.percentage.toFixed(1)}% of total).`);
    }

    // Daily average
    const uniqueDays = new Set(transactions.map(t => t.date)).size;
    const dailyAverage = totalSpent / uniqueDays;
    insights.push(`You spent an average of $${dailyAverage.toFixed(2)} per day.`);

    // Spending frequency
    if (transactions.length > 0) {
      const avgTransactionsPerDay = transactions.length / uniqueDays;
      insights.push(`You recorded ${avgTransactionsPerDay.toFixed(1)} transactions per day on average.`);
    }

    // Large expenses
    const largeExpenses = transactions.filter(t => t.amount > 100);
    if (largeExpenses.length > 0) {
      insights.push(`You had ${largeExpenses.length} expenses over $100 this month.`);
    }

    // Category diversity
    const uniqueCategories = new Set(transactions.map(t => t.category)).size;
    if (uniqueCategories > 5) {
      insights.push(`Your spending was spread across ${uniqueCategories} different categories.`);
    } else if (uniqueCategories <= 3) {
      insights.push(`Your spending was concentrated in just ${uniqueCategories} categories.`);
    }

    return insights;
  }

  // Generate HTML for PDF
  private generateReportHTML(report: MonthlyReport): string {
    const date = new Date(report.month + '-01');
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>SmartSpend Monthly Report - ${monthName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #007AFF;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #007AFF;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
            }
            .summary {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .total {
              font-size: 24px;
              font-weight: bold;
              color: #007AFF;
              text-align: center;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            .category-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .category-name {
              font-weight: 500;
            }
            .category-amount {
              color: #007AFF;
              font-weight: 500;
            }
            .expense-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .expense-details {
              flex: 1;
            }
            .expense-category {
              color: #666;
              font-size: 14px;
            }
            .expense-date {
              color: #999;
              font-size: 12px;
            }
            .expense-amount {
              color: #007AFF;
              font-weight: 500;
            }
            .insights {
              background: #e3f2fd;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #007AFF;
            }
            .insights h3 {
              margin-top: 0;
              color: #007AFF;
            }
            .insights ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .insights li {
              margin-bottom: 8px;
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SmartSpend Monthly Report</h1>
              <p>${monthName}</p>
            </div>

            <div class="summary">
              <div class="total">Total Spent: $${report.totalSpent.toFixed(2)}</div>
            </div>

            <div class="section">
              <h2>Category Breakdown</h2>
              ${report.categoryBreakdown.map(cat => `
                <div class="category-item">
                  <span class="category-name">${cat.category}</span>
                  <span class="category-amount">$${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)</span>
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2>Top Expenses</h2>
              ${report.topExpenses.map(expense => `
                <div class="expense-item">
                  <div class="expense-details">
                    <div class="expense-category">${expense.category}</div>
                    <div class="expense-date">${expense.date}${expense.note ? ` - ${expense.note}` : ''}</div>
                  </div>
                  <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>

            <div class="insights">
              <h3>Monthly Insights</h3>
              <ul>
                ${report.insights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>

            <div class="footer">
              <p>Generated by SmartSpend on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate and save PDF
  async generatePDF(report: MonthlyReport): Promise<string> {
    try {
      const html = this.generateReportHTML(report);
      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Share PDF
  async sharePDF(pdfUri: string): Promise<void> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Monthly Report',
        });
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      throw error;
    }
  }

  // Save report to storage
  async saveReport(report: MonthlyReport): Promise<void> {
    try {
      await saveMonthlyReport(report);
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  // Get saved reports
  async getSavedReports(): Promise<MonthlyReport[]> {
    try {
      return await getMonthlyReports();
    } catch (error) {
      console.error('Error loading reports:', error);
      return [];
    }
  }

  // Get email settings
  async getEmailAddress(): Promise<string> {
    try {
      return await getEmailSettings();
    } catch (error) {
      console.error('Error loading email settings:', error);
      return '';
    }
  }

  // Save email settings
  async saveEmailSettings(emailAddress: string): Promise<void> {
    try {
      // This would save email settings to storage
      // For now, we'll just log it
      console.log('Email settings saved:', emailAddress);
    } catch (error) {
      console.error('Error saving email settings:', error);
      throw error;
    }
  }

  // Send report via email (simulated - would integrate with email service)
  async sendReportEmail(report: MonthlyReport, emailAddress: string): Promise<boolean> {
    try {
      // In a real implementation, you would:
      // 1. Generate PDF
      // 2. Use EmailJS, SendGrid, or similar service
      // 3. Send email with PDF attachment
      
      console.log(`Simulating email send to ${emailAddress} for ${report.month}`);
      
      // For now, just save the report
      await this.saveReport(report);
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Get current month in YYYY-MM format
  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get previous month in YYYY-MM format
  getPreviousMonth(): string {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
  }
}

// Export singleton instance
export const monthlyReportService = MonthlyReportService.getInstance();

// ROUTINE FEATURE END 