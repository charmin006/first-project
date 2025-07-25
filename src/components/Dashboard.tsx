import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { DashboardData, Transaction } from '../types';
import { formatCurrency } from '../utils/currency';

interface DashboardProps {
  data: DashboardData;
  onViewAllTransactions: () => void;
  onAddTransaction: () => void;
}

const screenWidth = Dimensions.get('window').width;

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onViewAllTransactions,
  onAddTransaction
}) => {
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const pieChartData = data.categoryBreakdown.map((item, index) => ({
    name: item.category,
    population: item.amount,
    color: item.color,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const barChartData = {
    labels: data.categoryBreakdown.slice(0, 5).map(item => item.category),
    datasets: [{
      data: data.categoryBreakdown.slice(0, 5).map(item => item.amount)
    }]
  };

  // ✅ Fixed: Using consistent Rupee formatting

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.title}>SmartSpend</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddTransaction}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today's Spending</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(data.dailyTotal)}</Text>
          <Ionicons name="today" size={20} color="#007AFF" style={styles.summaryIcon} />
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Month</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(data.monthlyTotal)}</Text>
          <Ionicons name="calendar" size={20} color="#4ECDC4" style={styles.summaryIcon} />
        </View>
      </View>

      {/* ✅ Fixed: Add income vs expense summary */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Monthly Income</Text>
          <Text style={styles.incomeAmount}>
            +{formatCurrency(data.monthlyIncome || 0)}
          </Text>
        </View>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Monthly Expenses</Text>
          <Text style={styles.expenseAmount}>
            -{formatCurrency(data.monthlyTotal)}
          </Text>
        </View>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={[
            styles.balanceAmount,
            (data.monthlyIncome || 0) - data.monthlyTotal >= 0 ? styles.positiveBalance : styles.negativeBalance
          ]}>
            {(data.monthlyIncome || 0) - data.monthlyTotal >= 0 ? '+' : ''}
            {formatCurrency((data.monthlyIncome || 0) - data.monthlyTotal)}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      {data.categoryBreakdown.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          
          {/* Pie Chart */}
          <View style={styles.chartContainer}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          {/* Category List */}
          <View style={styles.categoryList}>
            {data.categoryBreakdown.map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryPercentage}>{item.percentage.toFixed(1)}%</Text>
                </View>
                <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bar Chart for Top Categories */}
      {data.categoryBreakdown.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={barChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
              yAxisLabel="₹"
              yAxisSuffix=""
            />
          </View>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={onViewAllTransactions}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {data.recentTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {data.recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                  {/* ✅ Fixed: Show need vs want classification */}
                  <View style={styles.classificationContainer}>
                    <View style={[
                      styles.classificationBadge, 
                      transaction.isNeed ? styles.needBadge : styles.wantBadge
                    ]}>
                      <Ionicons 
                        name={transaction.isNeed ? "checkmark-circle" : "heart"} 
                        size={12} 
                        color={transaction.isNeed ? "#34C759" : "#FF6B6B"} 
                      />
                      <Text style={[
                        styles.classificationText,
                        transaction.isNeed ? styles.needText : styles.wantText
                      ]}>
                        {transaction.isNeed ? 'Need' : 'Want'}
                      </Text>
                    </View>
                  </View>
                  {transaction.note && (
                    <Text style={styles.transactionNote}>{transaction.note}</Text>
                  )}
                </View>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'income' && styles.incomeAmount
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your first transaction
            </Text>
          </View>
        )}
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
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  summaryIcon: {
    alignSelf: 'flex-end',
  },
  chartSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryList: {
    marginTop: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionsSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transactionNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  // ✅ Fixed: Added styles for transaction title and classification
  transactionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  classificationContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  classificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  needBadge: {
    backgroundColor: '#E8F5E8',
  },
  wantBadge: {
    backgroundColor: '#FFE8E8',
  },
  classificationText: {
    fontSize: 10,
    fontWeight: '500',
  },
  needText: {
    color: '#34C759',
  },
  wantText: {
    color: '#FF6B6B',
  },
  incomeAmount: {
    color: '#34C759',
  },
  // ✅ Fixed: Added styles for balance section
  balanceContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  positiveBalance: {
    color: '#34C759',
  },
  negativeBalance: {
    color: '#FF3B30',
  },
}); 