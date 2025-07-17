// VISUALIZATION FEATURE START
// Calendar view component for displaying daily transactions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarDayData } from '../../types/visualizationFeatures';
import { Transaction } from '../../types';
import { Income } from '../../types/visualizationFeatures';
import { formatCurrency } from '../../utils/visualizationAnalytics';

interface CalendarViewProps {
  transactions: Transaction[];
  income: Income[];
  onClose: () => void;
  onAddTransaction?: () => void;
}

export const CalendarViewComponent: React.FC<CalendarViewProps> = ({
  transactions,
  income,
  onClose,
  onAddTransaction,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarDayData[]>([]);

  useEffect(() => {
    generateCalendarData();
  }, [currentDate, transactions, income]);

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    
    const data: CalendarDayData[] = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      data.push({
        date: '',
        totalSpent: 0,
        totalIncome: 0,
        transactionCount: 0,
        hasExpenses: false,
        hasIncome: false,
      });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const dayTransactions = transactions.filter(t => t.date === dateString);
      const dayIncome = income.filter(i => i.date === dateString);
      
      const totalSpent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = dayIncome.reduce((sum, i) => sum + i.amount, 0);
      const transactionCount = dayTransactions.length + dayIncome.length;
      
      data.push({
        date: dateString,
        totalSpent,
        totalIncome,
        transactionCount,
        hasExpenses: dayTransactions.length > 0,
        hasIncome: dayIncome.length > 0,
      });
    }
    
    setCalendarData(data);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayPress = (dayData: CalendarDayData) => {
    if (dayData.date) {
      setSelectedDate(dayData.date);
      setShowDayModal(true);
    }
  };

  const getDayTransactions = (date: string) => {
    const dayTransactions = transactions.filter(t => t.date === date);
    const dayIncome = income.filter(i => i.date === date);
    return { transactions: dayTransactions, income: dayIncome };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayNumber = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  const renderCalendarDay = (dayData: CalendarDayData, index: number) => {
    const dayNumber = getDayNumber(dayData.date);
    const isToday = dayData.date === new Date().toISOString().split('T')[0];
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          dayData.hasExpenses && styles.hasExpenses,
          dayData.hasIncome && styles.hasIncome,
          isToday && styles.today,
          !dayData.date && styles.emptyDay,
        ]}
        onPress={() => handleDayPress(dayData)}
        disabled={!dayData.date}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.todayText,
          !dayData.date && styles.emptyDayText,
        ]}>
          {dayNumber}
        </Text>
        
        {dayData.transactionCount > 0 && (
          <View style={styles.dayIndicators}>
            {dayData.hasExpenses && (
              <View style={styles.expenseIndicator} />
            )}
            {dayData.hasIncome && (
              <View style={styles.incomeIndicator} />
            )}
          </View>
        )}
        
        {dayData.totalSpent > 0 && (
          <Text style={styles.dayAmount}>-{formatCurrency(dayData.totalSpent)}</Text>
        )}
        {dayData.totalIncome > 0 && (
          <Text style={styles.dayAmount}>+{formatCurrency(dayData.totalIncome)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayModal = () => {
    if (!selectedDate) return null;
    
    const { transactions: dayTransactions, income: dayIncome } = getDayTransactions(selectedDate);
    const totalSpent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = dayIncome.reduce((sum, i) => sum + i.amount, 0);
    
    return (
      <Modal
        visible={showDayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{formatDate(selectedDate)}</Text>
            <TouchableOpacity onPress={() => setShowDayModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.daySummary}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(totalSpent)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={[styles.summaryAmount, styles.incomeAmount]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Net</Text>
                <Text style={[
                  styles.summaryAmount,
                  totalIncome - totalSpent >= 0 ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {formatCurrency(totalIncome - totalSpent)}
                </Text>
              </View>
            </View>

            {dayTransactions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expenses</Text>
                {dayTransactions.map((transaction, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      {transaction.note && (
                        <Text style={styles.transactionNote}>{transaction.note}</Text>
                      )}
                    </View>
                    <Text style={styles.transactionAmount}>
                      -{formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {dayIncome.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Income</Text>
                {dayIncome.map((incomeItem, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory}>{incomeItem.category}</Text>
                      {incomeItem.note && (
                        <Text style={styles.transactionNote}>{incomeItem.note}</Text>
                      )}
                    </View>
                    <Text style={[styles.transactionAmount, styles.incomeAmount]}>
                      +{formatCurrency(incomeItem.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {dayTransactions.length === 0 && dayIncome.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar" size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>No Transactions</Text>
                <Text style={styles.emptyText}>
                  No expenses or income recorded for this day
                </Text>
                {onAddTransaction && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setShowDayModal(false);
                      onAddTransaction();
                    }}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add Transaction</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Calendar View</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{getMonthName()}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {calendarData.map((dayData, index) => renderCalendarDay(dayData, index))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendIndicator}>
            <View style={styles.expenseIndicator} />
          </View>
          <Text style={styles.legendText}>Expenses</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendIndicator}>
            <View style={styles.incomeIndicator} />
          </View>
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.todayIndicator]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>

      {renderDayModal()}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyDay: {
    backgroundColor: '#f8f9fa',
  },
  today: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  hasExpenses: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
  },
  hasIncome: {
    borderRightWidth: 3,
    borderRightColor: '#34C759',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyDayText: {
    color: '#ccc',
  },
  dayIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    top: 2,
    right: 2,
    gap: 2,
  },
  expenseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  incomeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  dayAmount: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  todayIndicator: {
    backgroundColor: '#007AFF',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  daySummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  incomeAmount: {
    color: '#34C759',
  },
  expenseAmount: {
    color: '#FF3B30',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// VISUALIZATION FEATURE END 