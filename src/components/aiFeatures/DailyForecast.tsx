// AI Feature Component - Daily Forecast
// This component shows daily spending forecast based on monthly budget

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';
import { DailyForecast, UserBudget } from '../../types/aiFeatures';
import { BudgetAIService } from '../../services/budgetAI';
import { getUserBudgets, saveUserBudget } from '../../utils/aiStorage';

interface DailyForecastProps {
  transactions: Transaction[];
  onBudgetUpdated?: (budget: UserBudget) => void;
}

export const DailyForecastComponent: React.FC<DailyForecastProps> = ({
  transactions,
  onBudgetUpdated
}) => {
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, [transactions, monthlyBudget]);

  const loadForecast = async () => {
    try {
      setIsLoading(true);
      
      // Get user's monthly budget
      const budgets = await getUserBudgets();
      const totalBudget = budgets
        .filter(b => b.period === 'monthly')
        .reduce((sum, b) => sum + b.amount, 0);
      
      setMonthlyBudget(totalBudget);
      
      if (totalBudget > 0) {
        const dailyForecast = BudgetAIService.calculateDailyForecast(
          transactions,
          totalBudget
        );
        setForecast(dailyForecast);
      }
    } catch (error) {
      console.error('Error loading forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBudget = async () => {
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const budget: UserBudget = {
        id: Date.now().toString(),
        category: 'Monthly Budget',
        amount,
        period: 'monthly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveUserBudget(budget);
      setMonthlyBudget(amount);
      setShowBudgetModal(false);
      setBudgetInput('');
      
      onBudgetUpdated?.(budget);
      Alert.alert('Success', 'Monthly budget updated!');
    } catch (error) {
      console.error('Error setting budget:', error);
      Alert.alert('Error', 'Failed to set budget. Please try again.');
    }
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low':
        return '#4ECDC4';
      case 'medium':
        return '#FFE66D';
      case 'high':
        return '#FF6B6B';
      default:
        return '#999';
    }
  };

  const getRiskIcon = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low':
        return 'trending-down';
      case 'medium':
        return 'remove';
      case 'high':
        return 'trending-up';
      default:
        return 'help-circle';
    }
  };

  const getRiskMessage = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low':
        return 'Great! You\'re under budget';
      case 'medium':
        return 'Watch your spending today';
      case 'high':
        return 'Consider reducing expenses';
      default:
        return 'Set a budget to get started';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Calculating your daily forecast...</Text>
      </View>
    );
  }

  if (monthlyBudget === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="calculator" size={24} color="#007AFF" />
          <Text style={styles.title}>Daily Spending Forecast</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Ionicons name="calculator-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No Budget Set</Text>
          <Text style={styles.emptySubtitle}>
            Set a monthly budget to see your daily spending forecast
          </Text>
          
          <TouchableOpacity
            style={styles.setBudgetButton}
            onPress={() => setShowBudgetModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.setBudgetButtonText}>Set Monthly Budget</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to calculate forecast</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calculator" size={24} color="#007AFF" />
        <Text style={styles.title}>Daily Spending Forecast</Text>
        <TouchableOpacity onPress={() => setShowBudgetModal(true)}>
          <Ionicons name="settings" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.forecastCard}>
        <View style={styles.forecastHeader}>
          <Text style={styles.forecastLabel}>Safe to Spend Today</Text>
          <Text style={styles.forecastAmount}>
            {formatCurrency(forecast.safeToSpend)}
          </Text>
        </View>

        <View style={styles.riskIndicator}>
          <Ionicons
            name={getRiskIcon(forecast.riskLevel) as any}
            size={16}
            color={getRiskColor(forecast.riskLevel)}
          />
          <Text style={[
            styles.riskText,
            { color: getRiskColor(forecast.riskLevel) }
          ]}>
            {getRiskMessage(forecast.riskLevel)}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Monthly Budget</Text>
            <Text style={styles.statValue}>
              {formatCurrency(forecast.monthlyBudget)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent So Far</Text>
            <Text style={styles.statValue}>
              {formatCurrency(forecast.spentSoFar)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Days Left</Text>
            <Text style={styles.statValue}>
              {forecast.daysLeft}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((forecast.spentSoFar / forecast.monthlyBudget) * 100, 100)}%`,
                  backgroundColor: getRiskColor(forecast.riskLevel)
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {((forecast.spentSoFar / forecast.monthlyBudget) * 100).toFixed(1)}% of budget used
          </Text>
        </View>
      </View>

      {/* Budget Setting Modal */}
      <Modal
        visible={showBudgetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Monthly Budget</Text>
            <Text style={styles.modalSubtitle}>
              Enter your total monthly spending budget
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Budget Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder={monthlyBudget > 0 ? monthlyBudget.toString() : "0.00"}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowBudgetModal(false);
                  setBudgetInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSetBudget}
              >
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    padding: 40,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  setBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setBudgetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  forecastCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  forecastLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  forecastAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#666',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
}); 