// ROUTINE FEATURE START
// OCR service for receipt scanning

import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
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

  // Request camera permissions
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  // Request media library permissions
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  // Simulate OCR processing (in a real app, you'd use a proper OCR library)
  async processReceiptImage(imageUri: string): Promise<ReceiptScanData> {
    try {
      // This is a simplified simulation - in a real app, you'd use:
      // - Tesseract.js for OCR
      // - Google Cloud Vision API
      // - Azure Computer Vision
      // - Or similar OCR services
      
      // For now, we'll simulate extraction with some common patterns
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
    // In a real implementation, this would use OCR to find store names
    // Common patterns: "STORE NAME", "RETAILER", etc.
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
    
    // Simulate extraction based on image URI hash
    const hash = this.simpleHash(imageUri);
    return mockStores[hash % mockStores.length];
  }

  // Extract amount from image (simulated)
  private extractAmount(imageUri: string): number | undefined {
    // In a real implementation, this would use OCR to find currency amounts
    // Common patterns: "$XX.XX", "TOTAL: $XX.XX", etc.
    
    // Simulate extraction with random amounts
    const hash = this.simpleHash(imageUri);
    const amounts = [12.99, 24.50, 8.75, 45.20, 15.30, 32.80, 19.95, 67.40];
    return amounts[hash % amounts.length];
  }

  // Extract date from image (simulated)
  private extractDate(imageUri: string): string | undefined {
    // In a real implementation, this would use OCR to find dates
    // Common patterns: "MM/DD/YYYY", "DD/MM/YYYY", etc.
    
    // Return today's date as default
    return new Date().toISOString().split('T')[0];
  }

  // Simple hash function for simulation
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
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

  // Get camera settings for receipt scanning
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
      
      // Look for store name (usually at the top)
      if (!storeName && trimmedLine.length > 3 && trimmedLine.length < 50) {
        storeName = trimmedLine;
      }

      // Look for amount (currency pattern)
      const amountMatch = trimmedLine.match(/\$?\d+\.\d{2}/);
      if (amountMatch && !amount) {
        amount = parseFloat(amountMatch[0].replace('$', ''));
      }

      // Look for date (various formats)
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