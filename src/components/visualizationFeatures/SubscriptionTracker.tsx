// VISUALIZATION FEATURE START
// Component for tracking subscriptions and recurring payments

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription, RenewalCycle } from '../../types/visualizationFeatures';
import { saveSubscription, getSubscriptions, updateSubscription, deleteSubscription } from '../../utils/visualizationStorage';
import { formatCurrency } from '../../utils/visualizationAnalytics';

interface SubscriptionTrackerProps {
  onClose: () => void;
  onAddTransaction?: (transactionData: any) => void;
}

const RENEWAL_CYCLES: { value: RenewalCycle; label: string; days: number }[] = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
  { value: 'yearly', label: 'Yearly', days: 365 },
];

export const SubscriptionTrackerComponent: React.FC<SubscriptionTrackerProps> = ({
  onClose,
  onAddTransaction,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    renewalCycle: 'monthly' as RenewalCycle,
    nextDueDate: new Date().toISOString().split('T')[0],
    category: 'Subscriptions',
    isActive: true,
    autoMarkRecurring: true,
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleSaveSubscription = async () => {
    if (!formData.name.trim() || !formData.amount.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const subscriptionData: Omit<Subscription, 'id' | 'createdAt'> = {
        name: formData.name.trim(),
        amount,
        renewalCycle: formData.renewalCycle,
        nextDueDate: formData.nextDueDate,
        category: formData.category,
        isActive: formData.isActive,
        autoMarkRecurring: formData.autoMarkRecurring,
      };

      if (editingSubscription) {
        await updateSubscription({
          ...editingSubscription,
          ...subscriptionData,
        });
      } else {
        await saveSubscription({
          ...subscriptionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        });
      }

      await loadSubscriptions();
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving subscription:', error);
      Alert.alert('Error', 'Failed to save subscription');
    }
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${subscription.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubscription(subscription.id);
              await loadSubscriptions();
            } catch (error) {
              console.error('Error deleting subscription:', error);
              Alert.alert('Error', 'Failed to delete subscription');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (subscription: Subscription) => {
    try {
      await updateSubscription({
        ...subscription,
        isActive: !subscription.isActive,
      });
      await loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const handleMarkAsPaid = async (subscription: Subscription) => {
    try {
      // Calculate next due date
      const currentDueDate = new Date(subscription.nextDueDate);
      const cycleDays = RENEWAL_CYCLES.find(c => c.value === subscription.renewalCycle)?.days || 30;
      const nextDueDate = new Date(currentDueDate);
      nextDueDate.setDate(currentDueDate.getDate() + cycleDays);

      await updateSubscription({
        ...subscription,
        nextDueDate: nextDueDate.toISOString().split('T')[0],
      });

      // Auto-add transaction if enabled
      if (subscription.autoMarkRecurring && onAddTransaction) {
        const transactionData = {
          amount: subscription.amount,
          category: subscription.category,
          date: new Date().toISOString().split('T')[0],
          note: `Auto: ${subscription.name} subscription`,
        };
        onAddTransaction(transactionData);
      }

      await loadSubscriptions();
      Alert.alert('Success', 'Subscription marked as paid!');
    } catch (error) {
      console.error('Error marking subscription as paid:', error);
      Alert.alert('Error', 'Failed to update subscription');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      renewalCycle: 'monthly',
      nextDueDate: new Date().toISOString().split('T')[0],
      category: 'Subscriptions',
      isActive: true,
      autoMarkRecurring: true,
    });
    setEditingSubscription(null);
  };

  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      amount: subscription.amount.toString(),
      renewalCycle: subscription.renewalCycle,
      nextDueDate: subscription.nextDueDate,
      category: subscription.category,
      isActive: subscription.isActive,
      autoMarkRecurring: subscription.autoMarkRecurring,
    });
    setShowAddModal(true);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueStatus = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return { status: 'overdue', color: '#FF3B30', text: 'Overdue' };
    if (daysUntilDue <= 3) return { status: 'due-soon', color: '#FF9500', text: 'Due Soon' };
    return { status: 'upcoming', color: '#34C759', text: 'Upcoming' };
  };

  const totalMonthlyCost = subscriptions
    .filter(sub => sub.isActive)
    .reduce((total, sub) => {
      const cycle = RENEWAL_CYCLES.find(c => c.value === sub.renewalCycle);
      const monthlyEquivalent = cycle ? (sub.amount * 30) / cycle.days : sub.amount;
      return total + monthlyEquivalent;
    }, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Tracker</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Monthly Overview</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalMonthlyCost)}</Text>
        </View>
        <Text style={styles.summarySubtitle}>
          {subscriptions.filter(sub => sub.isActive).length} active subscriptions
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Subscription</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.subscriptionsList}>
        {subscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Subscriptions</Text>
            <Text style={styles.emptyText}>
              Add your subscriptions to track recurring payments
            </Text>
          </View>
        ) : (
          subscriptions.map((subscription) => {
            const dueStatus = getDueStatus(subscription.nextDueDate);
            const daysUntilDue = getDaysUntilDue(subscription.nextDueDate);
            
            return (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionName}>{subscription.name}</Text>
                    <Text style={styles.subscriptionAmount}>
                      {formatCurrency(subscription.amount)} / {subscription.renewalCycle}
                    </Text>
                    <Text style={styles.subscriptionCategory}>{subscription.category}</Text>
                  </View>
                  
                  <View style={styles.subscriptionActions}>
                    <TouchableOpacity
                      style={[
                        styles.statusBadge,
                        { backgroundColor: dueStatus.color + '20' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: dueStatus.color }]}>
                        {dueStatus.text}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.activeToggle,
                        { backgroundColor: subscription.isActive ? '#34C759' : '#ccc' },
                      ]}
                      onPress={() => handleToggleActive(subscription)}
                    >
                      <Ionicons
                        name={subscription.isActive ? 'checkmark' : 'close'}
                        size={16}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.subscriptionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Due:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(subscription.nextDueDate).toLocaleDateString()}
                      {daysUntilDue !== 0 && (
                        <Text style={[styles.daysText, { color: dueStatus.color }]}>
                          {' '}({daysUntilDue > 0 ? '+' : ''}{daysUntilDue} days)
                        </Text>
                      )}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Auto-add:</Text>
                    <Text style={styles.detailValue}>
                      {subscription.autoMarkRecurring ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </View>

                <View style={styles.subscriptionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(subscription)}
                  >
                    <Ionicons name="create" size={16} color="#007AFF" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handleMarkAsPaid(subscription)}
                  >
                    <Ionicons name="checkmark" size={16} color="#34C759" />
                    <Text style={styles.payButtonText}>Mark Paid</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSubscription(subscription)}
                  >
                    <Ionicons name="trash" size={16} color="#FF3B30" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subscription Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Netflix, Spotify"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.textInput}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Renewal Cycle</Text>
              <View style={styles.cycleSelector}>
                {RENEWAL_CYCLES.map((cycle) => (
                  <TouchableOpacity
                    key={cycle.value}
                    style={[
                      styles.cycleOption,
                      formData.renewalCycle === cycle.value && styles.cycleOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, renewalCycle: cycle.value })}
                  >
                    <Text
                      style={[
                        styles.cycleText,
                        formData.renewalCycle === cycle.value && styles.cycleTextActive,
                      ]}
                    >
                      {cycle.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Next Due Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.nextDueDate}
                onChangeText={(text) => setFormData({ ...formData, nextDueDate: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.textInput}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Subscriptions"
              />
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active Subscription</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    { backgroundColor: formData.isActive ? '#34C759' : '#ccc' },
                  ]}
                  onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  <View style={[styles.switchThumb, { left: formData.isActive ? 20 : 2 }]} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Auto-add as transaction</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    { backgroundColor: formData.autoMarkRecurring ? '#34C759' : '#ccc' },
                  ]}
                  onPress={() => setFormData({ ...formData, autoMarkRecurring: !formData.autoMarkRecurring })}
                >
                  <View style={[styles.switchThumb, { left: formData.autoMarkRecurring ? 20 : 2 }]} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSubscription}>
              <Text style={styles.saveButtonText}>
                {editingSubscription ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
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
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  subscriptionCard: {
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
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subscriptionAmount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  subscriptionCategory: {
    fontSize: 12,
    color: '#666',
  },
  subscriptionActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  daysText: {
    fontWeight: '600',
  },
  subscriptionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f8ff',
    gap: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0fff0',
    gap: 4,
  },
  payButtonText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
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
  cycleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cycleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cycleOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  cycleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cycleTextActive: {
    color: '#fff',
  },
  switchGroup: {
    marginTop: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

// VISUALIZATION FEATURE END 