// VISUALIZATION FEATURE START
// Main screen for visualization and finance planning features

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChartViewsComponent } from './ChartViews';
import { CalendarViewComponent } from './CalendarView';
import { Transaction } from '../../types';
import { 
  Income, 
  WeeklyChartData, 
  MonthlyChartData,
  Subscription
} from '../../types/visualizationFeatures';
import { 
  saveIncome, 
  getIncome, 
  saveSubscription, 
  getSubscriptions,
  deleteSubscription 
} from '../../utils/visualizationStorage';
import { 
  generateWeeklyChartData, 
  generateMonthlyChartData
} from '../../utils/visualizationAnalytics';

type TabType = 'charts' | 'calendar' | 'income' | 'cashflow' | 'subscriptions';

export const VisualizationFeaturesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('charts');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyChartData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateChartData();
  }, [transactions, income]);

  const loadData = async () => {
    try {
      // Load transactions from existing storage
      const storedTransactions = await getTransactions();
      setTransactions(storedTransactions);
      
      // Load income data
      const storedIncome = await getIncome();
      setIncome(storedIncome);
      
      // Load subscriptions
      const storedSubscriptions = await getSubscriptions();
      setSubscriptions(storedSubscriptions);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getTransactions = async (): Promise<Transaction[]> => {
    // This would integrate with existing transaction storage
    // For now, return empty array - will be populated by existing app
    return [];
  };

  const updateChartData = () => {
    const weekly = generateWeeklyChartData(transactions, income);
    const monthly = generateMonthlyChartData(transactions, income);
    
    setWeeklyData(weekly);
    setMonthlyData(monthly);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'charts':
        return (
          <ChartViewsComponent
            weeklyData={weeklyData}
            monthlyData={monthlyData}
          />
        );
      case 'calendar':
        return (
          <CalendarViewComponent
            transactions={transactions}
            income={income}
            onClose={() => setActiveTab('charts')}
            onAddTransaction={() => {
              Alert.alert('Info', 'Navigate to add transaction screen');
            }}
          />
        );
      case 'income':
        return (
          <ScrollView style={styles.contentContainer}>
            <View style={styles.incomeHeader}>
              <Text style={styles.sectionTitle}>Income Management</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => Alert.alert('Info', 'Add income functionality')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Income</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.incomeList}>
              {income.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="cash" size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Income Records</Text>
                  <Text style={styles.emptyText}>
                    Start tracking your income by adding your first income entry
                  </Text>
                </View>
              ) : (
                income.map((item) => (
                  <View key={item.id} style={styles.incomeItem}>
                    <View style={styles.incomeInfo}>
                      <Text style={styles.incomeCategory}>{item.category}</Text>
                      <Text style={styles.incomeDate}>{item.date}</Text>
                      {item.note && (
                        <Text style={styles.incomeNote}>{item.note}</Text>
                      )}
                    </View>
                    <Text style={styles.incomeAmount}>
                      +{item.amount.toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        );
      case 'cashflow':
        return (
          <ScrollView style={styles.contentContainer}>
            <View style={styles.emptyState}>
              <Ionicons name="trending-up" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>Cash Flow Analysis</Text>
              <Text style={styles.emptyText}>
                Track your income vs expenses over time
              </Text>
            </View>
          </ScrollView>
        );
      case 'subscriptions':
        return (
          <ScrollView style={styles.contentContainer}>
            <View style={styles.incomeHeader}>
              <Text style={styles.sectionTitle}>Subscription Tracker</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => Alert.alert('Info', 'Add subscription functionality')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Subscription</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.incomeList}>
              {subscriptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="repeat" size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Subscriptions</Text>
                  <Text style={styles.emptyText}>
                    Track your recurring expenses and subscriptions
                  </Text>
                </View>
              ) : (
                subscriptions.map((item) => (
                  <View key={item.id} style={styles.incomeItem}>
                    <View style={styles.incomeInfo}>
                      <Text style={styles.incomeCategory}>{item.name}</Text>
                      <Text style={styles.incomeDate}>{item.renewalCycle}</Text>
                    </View>
                    <Text style={styles.incomeAmount}>
                      ${item.amount.toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  const renderTab = (tab: TabType, icon: string, label: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#007AFF' : '#666'}
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visualization & Planning</Text>
        <Text style={styles.subtitle}>Track, analyze, and plan your finances</Text>
      </View>

      <View style={styles.tabBar}>
        {renderTab('charts', 'bar-chart', 'Charts')}
        {renderTab('calendar', 'calendar', 'Calendar')}
        {renderTab('income', 'cash', 'Income')}
        {renderTab('cashflow', 'trending-up', 'Cash Flow')}
        {renderTab('subscriptions', 'repeat', 'Subscriptions')}
      </View>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
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
    fontSize: 14,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  incomeList: {
    flex: 1,
  },
  incomeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  incomeInfo: {
    flex: 1,
  },
  incomeCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  incomeDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  incomeNote: {
    fontSize: 12,
    color: '#999',
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
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
});

// VISUALIZATION FEATURE END 