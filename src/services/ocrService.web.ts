// ROUTINE FEATURE START
// Web-safe OCR service for receipt scanning (no native camera dependencies)

import { ReceiptScanData } from '../types/routineFeatures';

export class OCRService {
  private static instance: OCRService;

  private constructor() {}

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  // Web-safe camera permissions (always return true for web)
  async requestCameraPermissions(): Promise<boolean> {
    return true; // Web doesn't need camera permissions for file upload
  }

  // Web-safe media library permissions (always return true for web)
  async requestMediaLibraryPermissions(): Promise<boolean> {
    return true; // Web doesn't need media library permissions
  }

  // Simulate OCR processing for web
  async processReceiptImage(imageUri: string): Promise<ReceiptScanData> {
    try {
      // For web, we'll simulate the OCR process
      const mockData: ReceiptScanData = {
        storeName: this.extractStoreName(imageUri),
        amount: this.extractAmount(imageUri),
        date: this.extractDate(imageUri),
        confidence: 0.85, // Simulated confidence score
      };

      return mockData;
    } catch (error) {
      console.error('Error processing receipt image:', error);
      return {
        confidence: 0,
      };
    }
  }

  // Extract store name from image (simulated)
  private extractStoreName(imageUri: string): string | undefined {
    const mockStores = [
      'Walmart',
      'Target',
      'Amazon',
      'Starbucks',
      'McDonald\'s',
      'Subway',
      'CVS',
      'Walgreens',
    ];
    
    const hash = this.simpleHash(imageUri);
    return mockStores[hash % mockStores.length];
  }

  // Extract amount from image (simulated)
  private extractAmount(imageUri: string): number | undefined {
    const hash = this.simpleHash(imageUri);
    const amounts = [12.99, 24.50, 8.75, 45.20, 15.30, 32.80, 19.95, 67.40];
    return amounts[hash % amounts.length];
  }

  // Extract date from image (simulated)
  private extractDate(imageUri: string): string | undefined {
    return new Date().toISOString().split('T')[0];
  }

  // Simple hash function for simulation
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Validate extracted data
  validateExtractedData(data: ReceiptScanData): boolean {
    if (data.confidence < 0.5) {
      return false;
    }

    if (data.amount && (data.amount <= 0 || data.amount > 10000)) {
      return false;
    }

    if (data.date) {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        return false;
      }
    }

    return true;
  }

  // Web-safe camera settings
  getCameraSettings() {
    return {
      type: 'back' as const,
      ratio: '4:3',
      quality: 0.8,
      autoFocus: 'on' as const,
      flashMode: 'auto' as const,
    };
  }

  // Process text for better extraction (helper method)
  processTextForExtraction(text: string): {
    storeName?: string;
    amount?: number;
    date?: string;
  } {
    const lines = text.split('\n');
    let storeName: string | undefined;
    let amount: number | undefined;
    let date: string | undefined;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!storeName && trimmedLine.length > 3 && trimmedLine.length < 50) {
        storeName = trimmedLine;
      }

      const amountMatch = trimmedLine.match(/\$?\d+\.\d{2}/);
      if (amountMatch && !amount) {
        amount = parseFloat(amountMatch[0].replace('$', ''));
      }

      const dateMatch = trimmedLine.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
      if (dateMatch && !date) {
        date = dateMatch[0];
      }
    }

    return { storeName, amount, date };
  }

  // Get confidence score based on extraction quality
  calculateConfidence(extractedData: Partial<ReceiptScanData>): number {
    let confidence = 0;
    
    if (extractedData.storeName) confidence += 0.3;
    if (extractedData.amount) confidence += 0.4;
    if (extractedData.date) confidence += 0.3;
    
    return Math.min(confidence, 1);
  }
}

// Export singleton instance
export const ocrService = OCRService.getInstance();

// ROUTINE FEATURE END 