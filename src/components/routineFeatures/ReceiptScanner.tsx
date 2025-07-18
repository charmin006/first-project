// ROUTINE FEATURE START
// Component for receipt scanning with OCR (Simplified version)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReceiptScanData } from '../../types/routineFeatures';
import { ocrService } from '../../services/ocrService';
import { formatCurrency } from '../../utils/currency';

interface ReceiptScannerProps {
  onClose: () => void;
  onDataExtracted: (data: ReceiptScanData) => void;
}

export const ReceiptScannerComponent: React.FC<ReceiptScannerProps> = ({ 
  onClose, 
  onDataExtracted 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<ReceiptScanData | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualData, setManualData] = useState({
    storeName: '',
    amount: '',
    date: '',
  });

  const simulateScanning = async () => {
    setIsScanning(true);
    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock extracted data
      const mockData: ReceiptScanData = {
        storeName: 'Walmart',
        amount: 45.67,
        date: new Date().toISOString().split('T')[0],
        confidence: 0.85,
      };
      
      setScanData(mockData);
      Alert.alert(
        'Data Extracted',
        'Receipt data has been extracted successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error simulating scan:', error);
      Alert.alert('Error', 'Failed to process receipt. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualInput = () => {
    setShowManualInput(true);
  };

  const handleManualSubmit = () => {
    const data: ReceiptScanData = {
      storeName: manualData.storeName || undefined,
      amount: manualData.amount ? parseFloat(manualData.amount) : undefined,
      date: manualData.date || undefined,
      confidence: 1.0, // Manual input has full confidence
    };
    
    setScanData(data);
    setShowManualInput(false);
  };

  const handleUseData = () => {
    if (scanData) {
      onDataExtracted(scanData);
      onClose();
    }
  };

  const handleRetake = () => {
    setScanData(null);
    setShowManualInput(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (showManualInput) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manual Input</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.manualInputContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Store Name</Text>
            <TextInput
              style={styles.textInput}
              value={manualData.storeName}
              onChangeText={(text) => setManualData({ ...manualData, storeName: text })}
              placeholder="Enter store name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.textInput}
              value={manualData.amount}
              onChangeText={(text) => setManualData({ ...manualData, amount: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.textInput}
              value={manualData.date}
              onChangeText={(text) => setManualData({ ...manualData, date: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowManualInput(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleManualSubmit}
            >
              <Text style={styles.primaryButtonText}>Use Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (scanData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Extracted Data</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.resultContainer}>
          <View style={styles.confidenceIndicator}>
            <Ionicons 
              name={scanData.confidence > 0.7 ? "checkmark-circle" : "warning"} 
              size={24} 
              color={scanData.confidence > 0.7 ? "#34C759" : "#FF9500"} 
            />
            <Text style={styles.confidenceText}>
              Confidence: {(scanData.confidence * 100).toFixed(0)}%
            </Text>
          </View>

          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Store:</Text>
              <Text style={styles.dataValue}>
                {scanData.storeName || 'Not detected'}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Amount:</Text>
              <Text style={styles.dataValue}>
                {scanData.amount ? formatCurrency(scanData.amount) : 'Not detected'}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Date:</Text>
              <Text style={styles.dataValue}>
                {scanData.date ? formatDate(scanData.date) : 'Not detected'}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetake}
            >
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUseData}
            >
              <Text style={styles.primaryButtonText}>Use This Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receipt Scanner</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        <View style={styles.scannerFrame}>
          <Ionicons name="receipt" size={64} color="#007AFF" />
          <Text style={styles.scannerTitle}>Receipt Scanner</Text>
          <Text style={styles.scannerDescription}>
            Simulate scanning a receipt to extract expense data
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={simulateScanning}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.controlButtonText}>Simulate Scan</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleManualInput}
        >
          <Ionicons name="create" size={24} color="#007AFF" />
          <Text style={styles.controlButtonText}>Manual Input</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          This is a simplified version. In a full implementation, you would use 
          the device camera to scan receipts and extract data using OCR technology.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  scannerFrame: {
    width: 250,
    height: 200,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  scannerDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minWidth: 120,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '600',
  },
  manualInputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  confidenceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  dataCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dataValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
  },
});

// ROUTINE FEATURE END 