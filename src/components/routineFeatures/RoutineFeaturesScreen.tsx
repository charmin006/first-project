// ROUTINE FEATURE START
// Main screen for Routine & Automation features

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderSettingsComponent } from './ReminderSettings';
import { RecurringExpensesComponent } from './RecurringExpenses';
import { ReceiptScannerComponent } from './ReceiptScanner';
import { MonthlyReportsComponent } from './MonthlyReports';
import { UPISyncComponent } from './UPISync';
import { ProfileManagerComponent } from './ProfileManager';
import { Transaction } from '../../types';
import { ReceiptScanData, UPITransaction } from '../../types/routineFeatures';

interface RoutineFeaturesScreenProps {
  transactions: Transaction[];
  onAddTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

type FeatureTab = 'reminders' | 'recurring' | 'scanner' | 'reports' | 'upi' | 'profiles';

export const RoutineFeaturesScreen: React.FC<RoutineFeaturesScreenProps> = ({
  transactions,
  onAddTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('reminders');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const features = [
    {
      id: 'reminders' as FeatureTab,
      title: 'Daily Reminders',
      description: 'Set up notifications to log expenses',
      icon: 'notifications',
      color: '#007AFF',
    },
    {
      id: 'recurring' as FeatureTab,
      title: 'Recurring Expenses',
      description: 'Automate regular payments',
      icon: 'repeat',
      color: '#34C759',
    },
    {
      id: 'scanner' as FeatureTab,
      title: 'Receipt Scanner',
      description: 'Scan receipts with OCR',
      icon: 'camera',
      color: '#FF9500',
    },
    {
      id: 'reports' as FeatureTab,
      title: 'Monthly Reports',
      description: 'Generate and email reports',
      icon: 'document-text',
      color: '#AF52DE',
    },
    {
      id: 'upi' as FeatureTab,
      title: 'UPI Sync',
      description: 'Auto-detect UPI transactions',
      icon: 'phone-portrait',
      color: '#FF3B30',
    },
    {
      id: 'profiles' as FeatureTab,
      title: 'Profile Manager',
      description: 'Manage multiple profiles',
      icon: 'people',
      color: '#5856D6',
    },
  ];

  const openFeature = (featureId: FeatureTab) => {
    setActiveTab(featureId);
    setShowModal(true);
    
    let content: React.ReactNode = null;
    
    switch (featureId) {
      case 'reminders':
        content = (
          <ReminderSettingsComponent
            onClose={() => setShowModal(false)}
          />
        );
        break;
        
      case 'recurring':
        content = (
          <RecurringExpensesComponent
            onClose={() => setShowModal(false)}
            onAddRecurring={(transaction, frequency) => {
              // Handle recurring expense creation
              console.log('Creating recurring expense:', transaction, frequency);
              setShowModal(false);
            }}
          />
        );
        break;
        
      case 'scanner':
        content = (
          <ReceiptScannerComponent
            onClose={() => setShowModal(false)}
            onDataExtracted={(data: ReceiptScanData) => {
              // Auto-fill transaction form with scanned data
              const transactionData = {
                amount: data.amount || 0,
                category: 'Food & Dining', // Default category
                date: data.date || new Date().toISOString().split('T')[0],
                note: data.storeName ? `Scanned from ${data.storeName}` : 'Scanned receipt',
              };
              onAddTransaction(transactionData);
              setShowModal(false);
            }}
          />
        );
        break;
        
      case 'reports':
        content = (
          <MonthlyReportsComponent
            onClose={() => setShowModal(false)}
            transactions={transactions}
          />
        );
        break;
        
      case 'upi':
        content = (
          <UPISyncComponent
            onClose={() => setShowModal(false)}
            onTransactionDetected={(transaction: UPITransaction) => {
              // Convert UPI transaction to regular transaction
              const transactionData = {
                amount: transaction.amount,
                category: transaction.suggestedCategory || 'Food & Dining',
                date: transaction.date,
                note: `UPI: ${transaction.vendor} via ${transaction.source}`,
              };
              onAddTransaction(transactionData);
              setShowModal(false);
            }}
          />
        );
        break;
        
      case 'profiles':
        content = (
          <ProfileManagerComponent
            onClose={() => setShowModal(false)}
            onProfileSwitch={(profileId) => {
              console.log('Switching to profile:', profileId);
              setShowModal(false);
            }}
          />
        );
        break;
    }
    
    setModalContent(content);
  };

  const getFeatureStatus = (featureId: FeatureTab) => {
    // In a real app, you'd check actual status from services
    switch (featureId) {
      case 'reminders':
        return { enabled: false, status: 'Not configured' };
      case 'recurring':
        return { enabled: false, status: 'No recurring expenses' };
      case 'scanner':
        return { enabled: true, status: 'Ready to scan' };
      case 'reports':
        return { enabled: true, status: 'Reports available' };
      case 'upi':
        return { enabled: false, status: 'Not connected' };
      case 'profiles':
        return { enabled: true, status: 'Personal profile active' };
      default:
        return { enabled: false, status: 'Not configured' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Routine & Automation</Text>
        <Text style={styles.subtitle}>
          Automate your expense tracking workflow
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.featuresGrid}>
          {features.map((feature) => {
            const status = getFeatureStatus(feature.id);
            return (
              <TouchableOpacity
                key={feature.id}
                style={styles.featureCard}
                onPress={() => openFeature(feature.id)}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color="#fff" />
                </View>
                
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                  
                  <View style={styles.featureStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: status.enabled ? '#34C759' : '#FF9500' }
                    ]} />
                    <Text style={styles.statusText}>{status.status}</Text>
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            These automation features help you stay on top of your expenses 
            with minimal effort. Set up reminders, automate recurring payments, 
            scan receipts, and more to streamline your financial tracking.
          </Text>
        </View>
      </ScrollView>

      {/* Feature Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          {modalContent}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  featureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

// ROUTINE FEATURE END 