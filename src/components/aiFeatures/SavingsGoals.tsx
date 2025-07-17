// AI Feature Component - Savings Goals Tracker
// This component allows users to create and track savings goals

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavingsGoal } from '../../types/aiFeatures';
import { 
  getSavingsGoals, 
  saveSavingsGoal, 
  updateSavingsGoalProgress,
  deleteSavingsGoal 
} from '../../utils/aiStorage';

export const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [progressAmount, setProgressAmount] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await getSavingsGoals();
      setGoals(savedGoals);
    } catch (error) {
      console.error('Error loading savings goals:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle || !newGoalAmount || !newGoalDeadline) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(newGoalAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const deadline = new Date(newGoalDeadline);
    if (isNaN(deadline.getTime()) || deadline <= new Date()) {
      Alert.alert('Error', 'Please enter a valid future date');
      return;
    }

    try {
      const goal: SavingsGoal = {
        id: Date.now().toString(),
        title: newGoalTitle,
        targetAmount: amount,
        currentAmount: 0,
        deadline: newGoalDeadline,
        createdAt: new Date().toISOString(),
        isActive: true,
        weeklyTarget: calculateWeeklyTarget(amount, deadline),
        lastUpdated: new Date().toISOString()
      };

      await saveSavingsGoal(goal);
      setGoals(prev => [...prev, goal]);
      
      // Reset form
      setNewGoalTitle('');
      setNewGoalAmount('');
      setNewGoalDeadline('');
      setShowAddModal(false);
      
      Alert.alert('Success', 'Savings goal created!');
    } catch (error) {
      console.error('Error creating savings goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedGoal || !progressAmount) return;

    const amount = parseFloat(progressAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const newCurrentAmount = selectedGoal.currentAmount + amount;
      await updateSavingsGoalProgress(selectedGoal.id, newCurrentAmount);
      
      const updatedGoals = goals.map(g => 
        g.id === selectedGoal.id 
          ? { ...g, currentAmount: newCurrentAmount, lastUpdated: new Date().toISOString() }
          : g
      );
      setGoals(updatedGoals);
      
      setShowProgressModal(false);
      setSelectedGoal(null);
      setProgressAmount('');
      
      if (newCurrentAmount >= selectedGoal.targetAmount) {
        Alert.alert('Congratulations!', 'You\'ve reached your savings goal! 🎉');
      } else {
        Alert.alert('Success', 'Progress updated!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  const handleDeleteGoal = async (goal: SavingsGoal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavingsGoal(goal.id);
              setGoals(prev => prev.filter(g => g.id !== goal.id));
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          }
        }
      ]
    );
  };

  const calculateWeeklyTarget = (targetAmount: number, deadline: Date): number => {
    const now = new Date();
    const weeksLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    return Math.round((targetAmount / weeksLeft) * 100) / 100;
  };

  const getProgressPercentage = (goal: SavingsGoal): number => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysLeft = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getStatusColor = (goal: SavingsGoal): string => {
    const progress = getProgressPercentage(goal);
    const daysLeft = getDaysLeft(goal.deadline);
    
    if (progress >= 100) return '#4ECDC4'; // Completed
    if (daysLeft <= 7) return '#FF6B6B'; // Urgent
    if (progress >= 75) return '#FFE66D'; // Good progress
    return '#007AFF'; // Normal
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flag" size={24} color="#007AFF" />
        <Text style={styles.title}>Savings Goals</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Savings Goals</Text>
            <Text style={styles.emptySubtitle}>
              Create your first savings goal to start tracking your progress
            </Text>
          </View>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDeadline}>
                    Due: {formatDate(goal.deadline)} ({getDaysLeft(goal.deadline)} days left)
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteGoal(goal)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {getProgressPercentage(goal).toFixed(1)}%
                  </Text>
                </View>
                
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getProgressPercentage(goal)}%`,
                        backgroundColor: getStatusColor(goal)
                      }
                    ]}
                  />
                </View>
              </View>

              <View style={styles.goalStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Weekly Target</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(goal.weeklyTarget)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(goal.targetAmount - goal.currentAmount)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.updateProgressButton}
                onPress={() => {
                  setSelectedGoal(goal);
                  setProgressAmount('');
                  setShowProgressModal(true);
                }}
              >
                <Ionicons name="add-circle" size={20} color="#007AFF" />
                <Text style={styles.updateProgressText}>Update Progress</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Savings Goal</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Goal Title</Text>
              <TextInput
                style={styles.input}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                placeholder="e.g., Vacation Fund"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Target Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={newGoalAmount}
                  onChangeText={setNewGoalAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Deadline</Text>
              <TextInput
                style={styles.input}
                value={newGoalDeadline}
                onChangeText={setNewGoalDeadline}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewGoalTitle('');
                  setNewGoalAmount('');
                  setNewGoalDeadline('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddGoal}
              >
                <Text style={styles.saveButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Progress</Text>
            <Text style={styles.modalSubtitle}>
              Add to your progress for "{selectedGoal?.title}"
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount to Add</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={progressAmount}
                  onChangeText={setProgressAmount}
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
                  setShowProgressModal(false);
                  setSelectedGoal(null);
                  setProgressAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProgress}
              >
                <Text style={styles.saveButtonText}>Update</Text>
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
  goalsList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  updateProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 8,
  },
  updateProgressText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
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