import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, GestureHandlerRootView } from 'react-native-gesture-handler';

// Components
import { Dashboard } from './src/components/Dashboard';
import { TransactionsList } from './src/components/TransactionsList';
import { Insights } from './src/components/Insights';
import { TransactionForm } from './src/components/TransactionForm';
// AI FEATURE START
import { AIFeaturesScreen } from './src/components/aiFeatures/AIFeaturesScreen';
// AI FEATURE END
// ROUTINE FEATURE START
import { RoutineFeaturesScreen } from './src/components/routineFeatures/RoutineFeaturesScreen';
// ROUTINE FEATURE END
// VISUALIZATION FEATURE START
import { VisualizationFeaturesScreen } from './src/components/visualizationFeatures/VisualizationFeaturesScreen';
// VISUALIZATION FEATURE END

// Utilities
import { 
  saveTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction,
  getCategories,
  saveCategories
} from './src/utils/storage';
import { calculateDashboardData, generateSpendingInsights } from './src/utils/analytics';

// Types and Constants
import { Transaction, DashboardData, SpendingInsight } from './src/types';
import { DEFAULT_CATEGORIES } from './src/constants/categories';

type Screen = 'dashboard' | 'transactions' | 'insights' | 'aiFeatures' | 'routineFeatures' | 'visualizationFeatures';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    dailyTotal: 0,
    monthlyTotal: 0,
    categoryBreakdown: [],
    recentTransactions: []
  });
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // Load data on app start
  useEffect(() => {
    loadData();
  }, []);

  // Update dashboard and insights when transactions change
  useEffect(() => {
    const newDashboardData = calculateDashboardData(transactions);
    const newInsights = generateSpendingInsights(transactions);
    
    setDashboardData(newDashboardData);
    setInsights(newInsights);
  }, [transactions]);

  const loadData = async () => {
    try {
      const [loadedTransactions, loadedCategories] = await Promise.all([
        getTransactions(),
        getCategories()
      ]);

      setTransactions(loadedTransactions);
      
      // Use default categories if none are loaded
      if (loadedCategories.length === 0) {
        await saveCategories(DEFAULT_CATEGORIES);
        setCategories(DEFAULT_CATEGORIES);
      } else {
        setCategories(loadedCategories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please restart the app.');
    }
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      await saveTransaction(newTransaction);
      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    try {
      await updateTransaction(updatedTransaction);
      setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction. Please try again.');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            data={dashboardData}
            onViewAllTransactions={() => setCurrentScreen('transactions')}
            onAddTransaction={() => setShowTransactionForm(true)}
          />
        );
      case 'transactions':
        return (
          <TransactionsList
            transactions={transactions}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddTransaction={() => setShowTransactionForm(true)}
          />
        );
      case 'insights':
        return <Insights insights={insights} />;
      case 'aiFeatures':
        return <AIFeaturesScreen transactions={transactions} />;
      case 'routineFeatures':
        return <RoutineFeaturesScreen transactions={transactions} onAddTransaction={handleAddTransaction} />;
      case 'visualizationFeatures':
        return <VisualizationFeaturesScreen />;
      default:
        return null;
    }
  };

  const getTabIcon = (screen: Screen, isActive: boolean) => {
    const iconMap = {
      dashboard: 'home',
      transactions: 'receipt',
      insights: 'analytics',
      aiFeatures: 'sparkles',
      routineFeatures: 'settings',
      visualizationFeatures: 'bar-chart'
    };
    
    return (
      <Ionicons
        name={iconMap[screen] as any}
        size={24}
        color={isActive ? '#007AFF' : '#666'}
      />
    );
  };

  const getTabLabel = (screen: Screen) => {
    const labelMap = {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      insights: 'Insights',
      aiFeatures: 'AI Features',
      routineFeatures: 'Automation',
      visualizationFeatures: 'Charts'
    };
    
    return labelMap[screen];
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {(['dashboard', 'transactions', 'insights', 'aiFeatures', 'routineFeatures', 'visualizationFeatures'] as Screen[]).map((screen) => (
          <TouchableOpacity
            key={screen}
            style={styles.tab}
            onPress={() => setCurrentScreen(screen)}
          >
            {getTabIcon(screen, currentScreen === screen)}
            <Text style={[
              styles.tabLabel,
              currentScreen === screen && styles.tabLabelActive
            ]}>
              {getTabLabel(screen)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction Form Modal */}
      <TransactionForm
        visible={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSave={handleAddTransaction}
        categories={categories}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
