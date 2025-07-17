// AI Classification Service - Separated from core functionality
// This service provides intelligent expense classification

import { Transaction } from '../types';
import { ClassifiedTransaction, ExpenseClassification } from '../types/aiFeatures';

// Classification rules based on common financial wisdom
const NEED_CATEGORIES = ['Health', 'Transportation', 'Housing', 'Utilities', 'Insurance'];
const NEED_KEYWORDS = [
  'medicine', 'doctor', 'hospital', 'pharmacy', 'medical',
  'rent', 'mortgage', 'electricity', 'water', 'gas', 'internet',
  'insurance', 'transport', 'bus', 'train', 'fuel', 'gasoline',
  'groceries', 'food', 'essential', 'basic', 'necessity'
];

const WANT_KEYWORDS = [
  'entertainment', 'movie', 'restaurant', 'dining', 'coffee',
  'shopping', 'clothes', 'fashion', 'luxury', 'premium',
  'gaming', 'hobby', 'sports', 'fitness', 'gym',
  'vacation', 'travel', 'hotel', 'ticket', 'concert',
  'gift', 'present', 'treat', 'splurge', 'indulge'
];

export class AIClassificationService {
  // Classify transaction using rule-based AI with confidence scoring
  static async classifyTransaction(
    transaction: Transaction,
    userClassifications?: ClassifiedTransaction[]
  ): Promise<ClassifiedTransaction> {
    try {
      const classification = this.ruleBasedClassification(transaction);
      const confidence = this.calculateConfidence(transaction, classification);
      
      // Learn from user's previous classifications if available
      const learnedClassification = this.learnFromUserHistory(
        transaction,
        userClassifications,
        classification,
        confidence
      );

      return {
        transactionId: transaction.id,
        classification: learnedClassification.classification,
        confidence: learnedClassification.confidence,
        aiGenerated: true,
        classifiedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Classification error:', error);
      // Fallback to unclassified
      return {
        transactionId: transaction.id,
        classification: 'unclassified',
        confidence: 0,
        aiGenerated: false,
        classifiedAt: new Date().toISOString()
      };
    }
  }

  private static ruleBasedClassification(transaction: Transaction): ExpenseClassification {
    const { category, note, amount } = transaction;
    const text = `${category} ${note || ''}`.toLowerCase();
    
    // Check category-based rules
    if (NEED_CATEGORIES.some(needCat => 
      category.toLowerCase().includes(needCat.toLowerCase())
    )) {
      return 'need';
    }

    // Check keyword-based rules
    const needScore = NEED_KEYWORDS.filter(keyword => 
      text.includes(keyword)
    ).length;
    
    const wantScore = WANT_KEYWORDS.filter(keyword => 
      text.includes(keyword)
    ).length;

    // Amount-based heuristics
    const amountFactor = this.getAmountFactor(amount);

    // Decision logic
    if (needScore > wantScore) {
      return 'need';
    } else if (wantScore > needScore) {
      return 'want';
    } else if (amountFactor === 'high' && amount > 100) {
      return 'want'; // High amounts without clear need indicators
    } else if (amountFactor === 'low' && amount < 20) {
      return 'need'; // Low amounts are often needs
    }

    return 'unclassified';
  }

  private static calculateConfidence(
    transaction: Transaction, 
    classification: ExpenseClassification
  ): number {
    const { category, note, amount } = transaction;
    const text = `${category} ${note || ''}`.toLowerCase();
    
    let confidence = 0.5; // Base confidence

    // Category confidence
    if (NEED_CATEGORIES.some(needCat => 
      category.toLowerCase().includes(needCat.toLowerCase())
    )) {
      confidence += 0.3;
    }

    // Keyword confidence
    const needKeywords = NEED_KEYWORDS.filter(keyword => text.includes(keyword));
    const wantKeywords = WANT_KEYWORDS.filter(keyword => text.includes(keyword));
    
    if (needKeywords.length > 0) confidence += 0.2;
    if (wantKeywords.length > 0) confidence += 0.2;

    // Amount confidence
    if (amount > 200) confidence += 0.1; // High amounts are more likely wants
    if (amount < 50) confidence += 0.1; // Low amounts are more likely needs

    // Note presence confidence
    if (note && note.length > 10) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private static learnFromUserHistory(
    transaction: Transaction,
    userClassifications: ClassifiedTransaction[] | undefined,
    defaultClassification: ExpenseClassification,
    defaultConfidence: number
  ): { classification: ExpenseClassification; confidence: number } {
    if (!userClassifications || userClassifications.length === 0) {
      return { classification: defaultClassification, confidence: defaultConfidence };
    }

    // Find similar transactions based on category and amount range
    const similarTransactions = userClassifications.filter(uc => {
      const userTransaction = this.findTransactionById(uc.transactionId);
      if (!userTransaction) return false;
      
      const categoryMatch = userTransaction.category === transaction.category;
      const amountRange = Math.abs(userTransaction.amount - transaction.amount) < 50;
      
      return categoryMatch && amountRange;
    });

    if (similarTransactions.length === 0) {
      return { classification: defaultClassification, confidence: defaultConfidence };
    }

    // Calculate weighted classification based on user history
    const classifications = similarTransactions.map(uc => ({
      classification: uc.classification,
      weight: uc.confidence
    }));

    const needWeight = classifications
      .filter(c => c.classification === 'need')
      .reduce((sum, c) => sum + c.weight, 0);
    
    const wantWeight = classifications
      .filter(c => c.classification === 'want')
      .reduce((sum, c) => sum + c.weight, 0);

    if (needWeight > wantWeight) {
      return { 
        classification: 'need', 
        confidence: Math.min(defaultConfidence + 0.2, 1.0) 
      };
    } else if (wantWeight > needWeight) {
      return { 
        classification: 'want', 
        confidence: Math.min(defaultConfidence + 0.2, 1.0) 
      };
    }

    return { classification: defaultClassification, confidence: defaultConfidence };
  }

  private static getAmountFactor(amount: number): 'low' | 'medium' | 'high' {
    if (amount < 50) return 'low';
    if (amount < 200) return 'medium';
    return 'high';
  }

  // Mock function - in real app, this would access transaction storage
  private static findTransactionById(id: string): Transaction | null {
    // This would be implemented to access the actual transaction storage
    // For now, return null to avoid circular dependencies
    return null;
  }

  // Batch classification for multiple transactions
  static async classifyTransactions(
    transactions: Transaction[]
  ): Promise<ClassifiedTransaction[]> {
    const classifications: ClassifiedTransaction[] = [];
    
    for (const transaction of transactions) {
      const classification = await this.classifyTransaction(transaction);
      classifications.push(classification);
    }
    
    return classifications;
  }
} 