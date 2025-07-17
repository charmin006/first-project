// AI Feature Component - Classification Badge
// This component displays and allows editing of expense classifications

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';
import { ClassifiedTransaction, ExpenseClassification } from '../../types/aiFeatures';
import { getClassificationByTransactionId, saveClassification } from '../../utils/aiStorage';
import { AIClassificationService } from '../../services/aiClassification';

interface ClassificationBadgeProps {
  transaction: Transaction;
  onClassificationChange?: (classification: ClassifiedTransaction) => void;
}

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  transaction,
  onClassificationChange
}) => {
  const [classification, setClassification] = useState<ClassifiedTransaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClassification();
  }, [transaction.id]);

  const loadClassification = async () => {
    try {
      setIsLoading(true);
      let existingClassification = await getClassificationByTransactionId(transaction.id);
      
      if (!existingClassification) {
        // Generate AI classification if none exists
        existingClassification = await AIClassificationService.classifyTransaction(transaction);
        await saveClassification(existingClassification);
      }
      
      setClassification(existingClassification);
    } catch (error) {
      console.error('Error loading classification:', error);
      // Set default unclassified state
      setClassification({
        transactionId: transaction.id,
        classification: 'unclassified',
        confidence: 0,
        aiGenerated: false,
        classifiedAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassificationChange = async (newClassification: ExpenseClassification) => {
    try {
      const updatedClassification: ClassifiedTransaction = {
        ...classification!,
        classification: newClassification,
        aiGenerated: false, // Mark as manually set
        classifiedAt: new Date().toISOString()
      };
      
      await saveClassification(updatedClassification);
      setClassification(updatedClassification);
      setShowModal(false);
      
      onClassificationChange?.(updatedClassification);
    } catch (error) {
      console.error('Error updating classification:', error);
      Alert.alert('Error', 'Failed to update classification. Please try again.');
    }
  };

  const getClassificationColor = (type: ExpenseClassification): string => {
    switch (type) {
      case 'need':
        return '#4ECDC4';
      case 'want':
        return '#FF6B6B';
      default:
        return '#999';
    }
  };

  const getClassificationIcon = (type: ExpenseClassification): string => {
    switch (type) {
      case 'need':
        return 'checkmark-circle';
      case 'want':
        return 'heart';
      default:
        return 'help-circle';
    }
  };

  const getClassificationText = (type: ExpenseClassification): string => {
    switch (type) {
      case 'need':
        return 'Need';
      case 'want':
        return 'Want';
      default:
        return 'Unclassified';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.badge}>
        <Text style={styles.loadingText}>...</Text>
      </View>
    );
  }

  if (!classification) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.badge,
          { backgroundColor: getClassificationColor(classification.classification) + '20' }
        ]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons
          name={getClassificationIcon(classification.classification) as any}
          size={12}
          color={getClassificationColor(classification.classification)}
        />
        <Text style={[
          styles.badgeText,
          { color: getClassificationColor(classification.classification) }
        ]}>
          {getClassificationText(classification.classification)}
        </Text>
        {classification.aiGenerated && (
          <Ionicons name="sparkles" size={8} color={getClassificationColor(classification.classification)} />
        )}
      </TouchableOpacity>

      {/* Classification Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Classify Expense</Text>
            <Text style={styles.modalSubtitle}>
              Is this a need or a want?
            </Text>
            
            <View style={styles.classificationOptions}>
              <TouchableOpacity
                style={[styles.option, styles.needOption]}
                onPress={() => handleClassificationChange('need')}
              >
                <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                <Text style={styles.optionTitle}>Need</Text>
                <Text style={styles.optionDescription}>
                  Essential expenses for survival and basic living
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, styles.wantOption]}
                onPress={() => handleClassificationChange('want')}
              >
                <Ionicons name="heart" size={24} color="#FF6B6B" />
                <Text style={styles.optionTitle}>Want</Text>
                <Text style={styles.optionDescription}>
                  Discretionary expenses for enjoyment and lifestyle
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingText: {
    fontSize: 10,
    color: '#999',
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
  classificationOptions: {
    gap: 16,
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  needOption: {
    backgroundColor: '#4ECDC420',
    borderColor: '#4ECDC4',
  },
  wantOption: {
    backgroundColor: '#FF6B6B20',
    borderColor: '#FF6B6B',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    flex: 2,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
}); 