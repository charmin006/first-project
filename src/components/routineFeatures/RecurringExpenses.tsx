// ROUTINE FEATURE START
// Component for managing recurring expenses

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurringExpense } from '../../types/routineFeatures';
import { Transaction } from '../../types';
import { recurringExpensesService } from '../../services/recurringExpenses';

interface RecurringExpensesProps {
  onClose: () => void;
  onAddRecurring: (transaction: Transaction, frequency: 'daily' | 'weekly' | 'monthly') => void;
}

export const RecurringExpensesComponent: React.FC<RecurringExpensesProps> = ({ 
  onClose, 
  onAddRecurring 
}) => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecurringExpenses();
  }, []);

  const loadRecurringExpenses = async () => {
    try {
      const expenses = await recurringExpensesService.getRecurringExpenses();
      setRecurringExpenses(expenses);
    } catch (error) {
      console.error('Error loading recurring expenses:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await recurringExpensesService.toggleRecurringExpense(id);
      await loadRecurringExpenses();
    } catch (error) {
      console.error('Error toggling recurring expense:', error);
      Alert.alert('Error', 'Failed to update recurring expense.');
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    Alert.alert(
      'Delete Recurring Expense',
      'Are you sure you want to delete this recurring expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recurringExpensesService.deleteRecurringExpense(id);
              await loadRecurringExpenses();
            } catch (error) {
              console.error('Error deleting recurring expense:', error);
              Alert.alert('Error', 'Failed to delete recurring expense.');
            }
          },
        },
      ]
    );
  };

  const handleCreateRecurring = () => {
    // In a real app, you'd show a form to select a transaction and frequency
    Alert.alert(
      'Create Recurring Expense',
      'Select frequency for the last transaction:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Daily',
          onPress: () => {
            // Simulate creating from last transaction
            const mockTransaction: Transaction = {
              id: 'mock_transaction',
              title: 'Daily Coffee',
              amount: 25.00,
              category: 'Food & Dining',
              date: new Date().toISOString().split('T')[0],
              note: 'Daily coffee',
              type: 'expense',
              isNeed: false,
              createdAt: new Date().toISOString(),
            };
            onAddRecurring(mockTransaction, 'daily');
          },
        },
        {
          text: 'Weekly',
          onPress: () => {
            const mockTransaction: Transaction = {
              id: 'mock_transaction',
              title: 'Weekly Gas',
              amount: 50.00,
              category: 'Transportation',
              date: new Date().toISOString().split('T')[0],
              note: 'Weekly gas',
              type: 'expense',
              isNeed: true,
              createdAt: new Date().toISOString(),
            };
            onAddRecurring(mockTransaction, 'weekly');
          },
        },
        {
          text: 'Monthly',
          onPress: () => {
            const mockTransaction: Transaction = {
              id: 'mock_transaction',
              title: 'Monthly Subscription',
              amount: 100.00,
              category: 'Utilities',
              date: new Date().toISOString().split('T')[0],
              note: 'Monthly subscription',
              type: 'expense',
              isNeed: true,
              createdAt: new Date().toISOString(),
            };
            onAddRecurring(mockTransaction, 'monthly');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (isActive: boolean, nextDueDate: string) => {
    if (!isActive) return '#999';
    
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#FF3B30'; // Overdue
    if (diffDays === 0) return '#FF9500'; // Due today
    if (diffDays <= 3) return '#FF9500'; // Due soon
    return '#34C759'; // On track
  };

  const getStatusText = (isActive: boolean, nextDueDate: string) => {
    if (!isActive) return 'Inactive';
    
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due ${formatDate(nextDueDate)}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recurring Expenses</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateRecurring}
        >
          <Ionicons name="add-circle" size={24} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Recurring Expense</Text>
        </TouchableOpacity>
      </View>

      {recurringExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="repeat" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No Recurring Expenses</Text>
          <Text style={styles.emptyDescription}>
            Create recurring expenses to automatically track regular payments
          </Text>
        </View>
      ) : (
        <View style={styles.expensesList}>
          {recurringExpenses.map((expense) => (
            <View key={expense.id} style={styles.expenseCard}>
              <View style={styles.expenseHeader}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseAmount}>$25.00</Text>
                  <Text style={styles.expenseCategory}>Food & Dining</Text>
                  <Text style={styles.expenseNote}>Daily coffee</Text>
                </View>
                <View style={styles.expenseControls}>
                  <Switch
                    value={expense.isActive}
                    onValueChange={() => handleToggleActive(expense.id)}
                    trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                    thumbColor={expense.isActive ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <View style={styles.expenseDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="repeat" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {recurringExpensesService.getFrequencyText(expense.frequency)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    {getStatusText(expense.isActive, expense.nextDueDate)}
                  </Text>
                </View>

                <View style={styles.statusIndicator}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(expense.isActive, expense.nextDueDate) },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.expenseActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // Edit functionality would go here
                    Alert.alert('Edit', 'Edit functionality coming soon');
                  }}
                >
                  <Ionicons name="create" size={16} color="#007AFF" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteRecurring(expense.id)}
                >
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          Recurring expenses will be automatically added to your transactions 
          on their due dates. You can pause or delete them at any time.
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  expensesList: {
    padding: 10,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  expenseNote: {
    fontSize: 12,
    color: '#999',
  },
  expenseControls: {
    marginLeft: 10,
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusIndicator: {
    marginLeft: 'auto',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expenseActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteText: {
    color: '#FF3B30',
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