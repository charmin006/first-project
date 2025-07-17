// ROUTINE FEATURE START
// Component for UPI app synchronization

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UPISyncSettings, UPITransaction } from '../../types/routineFeatures';
import { upiSyncService } from '../../services/upiSync';

interface UPISyncProps {
  onClose: () => void;
  onTransactionDetected: (transaction: UPITransaction) => void;
}

export const UPISyncComponent: React.FC<UPISyncProps> = ({ 
  onClose, 
  onTransactionDetected 
}) => {
  const [settings, setSettings] = useState<UPISyncSettings>({
    enabled: false,
    apps: [],
    autoCategorize: true,
  });
  const [unprocessedTransactions, setUnprocessedTransactions] = useState<UPITransaction[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    unprocessed: 0,
    totalAmount: 0,
  });
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    loadSettings();
    loadTransactions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await upiSyncService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading UPI settings:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const transactions = await upiSyncService.getUnprocessedTransactions();
      setUnprocessedTransactions(transactions);
      
      const transactionStats = await upiSyncService.getTransactionStats();
      setStats(transactionStats);
    } catch (error) {
      console.error('Error loading UPI transactions:', error);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    try {
      await upiSyncService.toggleSync(enabled);
      setSettings(prev => ({ ...prev, enabled }));
      
      if (enabled) {
        Alert.alert(
          'UPI Sync Enabled',
          'SmartSpend will now detect transactions from your UPI apps.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling UPI sync:', error);
      Alert.alert('Error', 'Failed to update UPI sync settings.');
    }
  };

  const handleToggleApp = async (appName: string) => {
    try {
      await upiSyncService.toggleApp(appName);
      const updatedSettings = await upiSyncService.getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error toggling UPI app:', error);
    }
  };

  const handleToggleAutoCategorize = async (enabled: boolean) => {
    try {
      const newSettings = { ...settings, autoCategorize: enabled };
      await upiSyncService.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating auto-categorize setting:', error);
    }
  };

  const handleDetectTransactions = async () => {
    setIsDetecting(true);
    try {
      const newTransactions = await upiSyncService.detectUPITransactions();
      await loadTransactions();
      
      if (newTransactions.length > 0) {
        Alert.alert(
          'Transactions Detected',
          `${newTransactions.length} new transaction(s) detected!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No New Transactions', 'No new UPI transactions were detected.');
      }
    } catch (error) {
      console.error('Error detecting transactions:', error);
      Alert.alert('Error', 'Failed to detect transactions. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleProcessTransaction = async (transaction: UPITransaction) => {
    try {
      await upiSyncService.markAsProcessed(transaction.id);
      onTransactionDetected(transaction);
      await loadTransactions();
      
      Alert.alert('Success', 'Transaction processed successfully!');
    } catch (error) {
      console.error('Error processing transaction:', error);
      Alert.alert('Error', 'Failed to process transaction.');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Transactions',
      'Are you sure you want to clear all UPI transactions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await upiSyncService.clearAllTransactions();
              await loadTransactions();
              Alert.alert('Success', 'All transactions cleared.');
            } catch (error) {
              console.error('Error clearing transactions:', error);
              Alert.alert('Error', 'Failed to clear transactions.');
            }
          },
        },
      ]
    );
  };

  const getAvailableApps = () => {
    return upiSyncService.getAvailableApps();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>UPI Sync</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable UPI Sync</Text>
            <Text style={styles.settingDescription}>
              Automatically detect transactions from UPI apps
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleSync}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor={settings.enabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {settings.enabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Apps</Text>
            
            {getAvailableApps().map((app) => (
              <View key={app.name} style={styles.appRow}>
                <View style={styles.appInfo}>
                  <Ionicons name={app.icon as any} size={24} color="#007AFF" />
                  <Text style={styles.appName}>{app.displayName}</Text>
                </View>
                <Switch
                  value={settings.apps.includes(app.name)}
                  onValueChange={() => handleToggleApp(app.name)}
                  trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                  thumbColor={settings.apps.includes(app.name) ? '#fff' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto-Categorize</Text>
                <Text style={styles.settingDescription}>
                  Automatically suggest categories for transactions
                </Text>
              </View>
              <Switch
                value={settings.autoCategorize}
                onValueChange={handleToggleAutoCategorize}
                trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                thumbColor={settings.autoCategorize ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.processed}</Text>
                <Text style={styles.statLabel}>Processed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.unprocessed}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>${stats.totalAmount.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Amount</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.detectButton}
              onPress={handleDetectTransactions}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.detectButtonText}>Detect Transactions</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {unprocessedTransactions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pending Transactions</Text>
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={styles.clearButton}>Clear All</Text>
                </TouchableOpacity>
              </View>
              
              {unprocessedTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionVendor}>{transaction.vendor}</Text>
                      <Text style={styles.transactionAmount}>
                        ${transaction.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.date)} • {upiSyncService.getAppDisplayName(transaction.source)}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.processButton}
                      onPress={() => handleProcessTransaction(transaction)}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.processButtonText}>Process</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {transaction.suggestedCategory && (
                    <View style={styles.categorySuggestion}>
                      <Ionicons name="bulb" size={16} color="#FF9500" />
                      <Text style={styles.categoryText}>
                        Suggested: {transaction.suggestedCategory}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          UPI sync automatically detects transactions from connected payment apps. 
          Transactions are processed and categorized based on vendor information. 
          You can review and approve transactions before they're added to your expenses.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  detectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  transactionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionVendor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categorySuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  categoryText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 6,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
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
});

// ROUTINE FEATURE END 