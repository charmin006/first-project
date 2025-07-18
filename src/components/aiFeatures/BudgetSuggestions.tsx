// AI Feature Component - Budget Suggestions
// This component displays AI-generated budget suggestions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';
import { BudgetSuggestion, UserBudget } from '../../types/aiFeatures';
import { 
  getBudgetSuggestions, 
  saveBudgetSuggestions, 
  saveUserBudget 
} from '../../utils/aiStorage';
import { BudgetAIService } from '../../services/budgetAI';
import { formatCurrency } from '../../utils/currency';

interface BudgetSuggestionsProps {
  transactions: Transaction[];
  onBudgetCreated?: (budget: UserBudget) => void;
}

export const BudgetSuggestions: React.FC<BudgetSuggestionsProps> = ({
  transactions,
  onBudgetCreated
}) => {
  const [suggestions, setSuggestions] = useState<BudgetSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<BudgetSuggestion | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, [transactions]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      let existingSuggestions = await getBudgetSuggestions();
      
      if (existingSuggestions.length === 0 && transactions.length > 0) {
        // Generate new suggestions if none exist
        existingSuggestions = await BudgetAIService.generateBudgetSuggestions(transactions, []);
        await saveBudgetSuggestions(existingSuggestions);
      }
      
      setSuggestions(existingSuggestions.filter(s => !s.accepted));
    } catch (error) {
      console.error('Error loading budget suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: BudgetSuggestion) => {
    try {
      const budget: UserBudget = {
        id: Date.now().toString(),
        category: suggestion.category,
        amount: suggestion.suggestedAmount,
        period: 'monthly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveUserBudget(budget);
      
      // Mark suggestion as accepted
      const updatedSuggestions = suggestions.map(s => 
        s.category === suggestion.category ? { ...s, accepted: true } : s
      );
      await saveBudgetSuggestions(updatedSuggestions);
      setSuggestions(updatedSuggestions.filter(s => !s.accepted));
      
      onBudgetCreated?.(budget);
      Alert.alert('Success', `Budget created for ${suggestion.category}`);
    } catch (error) {
      console.error('Error accepting budget suggestion:', error);
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    }
  };

  const handleCustomizeSuggestion = (suggestion: BudgetSuggestion) => {
    setSelectedSuggestion(suggestion);
    setCustomAmount(suggestion.suggestedAmount.toString());
    setShowCustomizeModal(true);
  };

  const handleSaveCustomBudget = async () => {
    if (!selectedSuggestion || !customAmount) return;
    
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const budget: UserBudget = {
        id: Date.now().toString(),
        category: selectedSuggestion.category,
        amount,
        period: 'monthly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveUserBudget(budget);
      
      // Mark suggestion as accepted
      const updatedSuggestions = suggestions.map(s => 
        s.category === selectedSuggestion.category ? { ...s, accepted: true } : s
      );
      await saveBudgetSuggestions(updatedSuggestions);
      setSuggestions(updatedSuggestions.filter(s => !s.accepted));
      
      onBudgetCreated?.(budget);
      setShowCustomizeModal(false);
      setSelectedSuggestion(null);
      setCustomAmount('');
      
      Alert.alert('Success', `Custom budget created for ${selectedSuggestion.category}`);
    } catch (error) {
      console.error('Error saving custom budget:', error);
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    }
  };

  // ✅ Fixed: Use consistent currency formatting
  // const formatCurrency = (amount: number) => {
  //   return `$${amount.toFixed(2)}`;
  // };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Analyzing your spending patterns...</Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No new budget suggestions available</Text>
        <Text style={styles.emptySubtext}>
          Add more transactions to get personalized budget recommendations
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={24} color="#007AFF" />
        <Text style={styles.title}>Smart Budget Suggestions</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Based on your spending patterns, here are our recommendations:
      </Text>

      <ScrollView style={styles.suggestionsList} showsVerticalScrollIndicator={false}>
        {suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Text style={styles.categoryName}>{suggestion.category}</Text>
              <Text style={styles.suggestedAmount}>
                {formatCurrency(suggestion.suggestedAmount)}
              </Text>
            </View>
            
            <Text style={styles.reasoning}>{suggestion.reasoning}</Text>
            
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>Current Average:</Text>
              <Text style={styles.comparisonValue}>
                {formatCurrency(suggestion.currentAverage)}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptSuggestion(suggestion)}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.customizeButton}
                onPress={() => handleCustomizeSuggestion(suggestion)}
              >
                <Ionicons name="pencil" size={16} color="#007AFF" />
                <Text style={styles.customizeButtonText}>Customize</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Customize Budget Modal */}
      <Modal
        visible={showCustomizeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Customize Budget</Text>
            <Text style={styles.modalSubtitle}>
              Set your preferred amount for {selectedSuggestion?.category}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Budget Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCustomizeModal(false);
                  setSelectedSuggestion(null);
                  setCustomAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveCustomBudget}
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingTop: 40,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  suggestionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  suggestedAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  reasoning: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#999',
  },
  comparisonValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  customizeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 8,
  },
  customizeButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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