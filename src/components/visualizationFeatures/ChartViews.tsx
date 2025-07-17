// VISUALIZATION FEATURE START
// Chart components for weekly and monthly data visualization

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeeklyChartData, MonthlyChartData, ChartViewConfig } from '../../types/visualizationFeatures';
import { formatCurrency } from '../../utils/visualizationAnalytics';

const { width } = Dimensions.get('window');

interface ChartViewsProps {
  weeklyData: WeeklyChartData[];
  monthlyData: MonthlyChartData[];
  onConfigChange?: (config: ChartViewConfig) => void;
}

export const ChartViewsComponent: React.FC<ChartViewsProps> = ({
  weeklyData,
  monthlyData,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<ChartViewConfig>({
    type: 'bar',
    period: 'week',
    showIncome: true,
    showExpenses: true,
    showNetSavings: false,
  });

  const handleConfigChange = (newConfig: Partial<ChartViewConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  const renderWeeklyDataTable = () => {
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Week</Text>
          {config.showIncome && <Text style={styles.tableHeaderText}>Income</Text>}
          {config.showExpenses && <Text style={styles.tableHeaderText}>Expenses</Text>}
          {config.showNetSavings && <Text style={styles.tableHeaderText}>Net</Text>}
        </View>
        <ScrollView style={styles.tableBody}>
          {weeklyData.map((data, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{data.week}</Text>
              {config.showIncome && (
                <Text style={[styles.tableCell, styles.incomeCell]}>
                  {formatCurrency(data.income)}
                </Text>
              )}
              {config.showExpenses && (
                <Text style={[styles.tableCell, styles.expenseCell]}>
                  {formatCurrency(data.expenses)}
                </Text>
              )}
              {config.showNetSavings && (
                <Text style={[
                  styles.tableCell,
                  data.netSavings >= 0 ? styles.positiveCell : styles.negativeCell
                ]}>
                  {formatCurrency(data.netSavings)}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderMonthlyDataTable = () => {
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Month</Text>
          {config.showIncome && <Text style={styles.tableHeaderText}>Income</Text>}
          {config.showExpenses && <Text style={styles.tableHeaderText}>Expenses</Text>}
          {config.showNetSavings && <Text style={styles.tableHeaderText}>Net</Text>}
        </View>
        <ScrollView style={styles.tableBody}>
          {monthlyData.map((data, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{data.month}</Text>
              {config.showIncome && (
                <Text style={[styles.tableCell, styles.incomeCell]}>
                  {formatCurrency(data.income)}
                </Text>
              )}
              {config.showExpenses && (
                <Text style={[styles.tableCell, styles.expenseCell]}>
                  {formatCurrency(data.expenses)}
                </Text>
              )}
              {config.showNetSavings && (
                <Text style={[
                  styles.tableCell,
                  data.netSavings >= 0 ? styles.positiveCell : styles.negativeCell
                ]}>
                  {formatCurrency(data.netSavings)}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    if (monthlyData.length === 0) return null;
    
    const latestMonth = monthlyData[monthlyData.length - 1];
    const totalExpenses = latestMonth.categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0);
    
    return (
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Category Breakdown - {latestMonth.month}</Text>
        <ScrollView style={styles.categoryList}>
          {latestMonth.categoryBreakdown.map((category, index) => {
            const percentage = totalExpenses > 0 ? (category.value / totalExpenses) * 100 : 0;
            return (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.label}</Text>
                </View>
                <View style={styles.categoryAmounts}>
                  <Text style={styles.categoryValue}>{formatCurrency(category.value)}</Text>
                  <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderChart = () => {
    if (config.period === 'week') {
      return renderWeeklyDataTable();
    } else {
      if (config.type === 'pie') {
        return renderCategoryBreakdown();
      } else {
        return renderMonthlyDataTable();
      }
    }
  };

  const getInsights = () => {
    if (config.period === 'week' && weeklyData.length > 0) {
      const latestWeek = weeklyData[weeklyData.length - 1];
      const insights = [];
      
      if (latestWeek.income > 0) {
        insights.push(`Income this week: ${formatCurrency(latestWeek.income)}`);
      }
      if (latestWeek.expenses > 0) {
        insights.push(`Expenses this week: ${formatCurrency(latestWeek.expenses)}`);
      }
      if (latestWeek.netSavings > 0) {
        insights.push(`Net savings: ${formatCurrency(latestWeek.netSavings)}`);
      }
      
      return insights;
    } else if (config.period === 'month' && monthlyData.length > 0) {
      const latestMonth = monthlyData[monthlyData.length - 1];
      const insights = [];
      
      if (latestMonth.income > 0) {
        insights.push(`Income this month: ${formatCurrency(latestMonth.income)}`);
      }
      if (latestMonth.expenses > 0) {
        insights.push(`Expenses this month: ${formatCurrency(latestMonth.expenses)}`);
      }
      if (latestMonth.categoryBreakdown.length > 0) {
        const topCategory = latestMonth.categoryBreakdown.reduce((max, current) => 
          current.value > max.value ? current : max
        );
        insights.push(`Top category: ${topCategory.label} (${formatCurrency(topCategory.value)})`);
      }
      
      return insights;
    }
    
    return [];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Charts & Analytics</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              config.period === 'week' && styles.periodButtonActive,
            ]}
            onPress={() => handleConfigChange({ period: 'week' })}
          >
            <Text
              style={[
                styles.periodText,
                config.period === 'week' && styles.periodTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              config.period === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => handleConfigChange({ period: 'month' })}
          >
            <Text
              style={[
                styles.periodText,
                config.period === 'month' && styles.periodTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              config.type === 'bar' && styles.typeButtonActive,
            ]}
            onPress={() => handleConfigChange({ type: 'bar' })}
          >
            <Ionicons
              name="bar-chart"
              size={16}
              color={config.type === 'bar' ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.typeText,
                config.type === 'bar' && styles.typeTextActive,
              ]}
            >
              Table
            </Text>
          </TouchableOpacity>
          {config.period === 'month' && (
            <TouchableOpacity
              style={[
                styles.typeButton,
                config.type === 'pie' && styles.typeButtonActive,
              ]}
              onPress={() => handleConfigChange({ type: 'pie' })}
            >
              <Ionicons
                name="pie-chart"
                size={16}
                color={config.type === 'pie' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.typeText,
                  config.type === 'pie' && styles.typeTextActive,
                ]}
              >
                Categories
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.dataControls}>
        <TouchableOpacity
          style={[
            styles.dataToggle,
            config.showIncome && styles.dataToggleActive,
          ]}
          onPress={() => handleConfigChange({ showIncome: !config.showIncome })}
        >
          <Ionicons
            name="arrow-down-circle"
            size={16}
            color={config.showIncome ? '#fff' : '#34C759'}
          />
          <Text
            style={[
              styles.dataToggleText,
              config.showIncome && styles.dataToggleTextActive,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.dataToggle,
            config.showExpenses && styles.dataToggleActive,
          ]}
          onPress={() => handleConfigChange({ showExpenses: !config.showExpenses })}
        >
          <Ionicons
            name="arrow-up-circle"
            size={16}
            color={config.showExpenses ? '#fff' : '#FF3B30'}
          />
          <Text
            style={[
              styles.dataToggleText,
              config.showExpenses && styles.dataToggleTextActive,
            ]}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        
        {config.period === 'week' && (
          <TouchableOpacity
            style={[
              styles.dataToggle,
              config.showNetSavings && styles.dataToggleActive,
            ]}
            onPress={() => handleConfigChange({ showNetSavings: !config.showNetSavings })}
          >
            <Ionicons
              name="wallet"
              size={16}
              color={config.showNetSavings ? '#fff' : '#007AFF'}
            />
            <Text
              style={[
                styles.dataToggleText,
                config.showNetSavings && styles.dataToggleTextActive,
              ]}
            >
              Net
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>Key Insights</Text>
        {getInsights().map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Ionicons name="bulb" size={16} color="#FF9500" />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#fff',
  },
  dataControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  dataToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },
  dataToggleActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dataToggleText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  dataToggleTextActive: {
    color: '#fff',
  },
  chartContainer: {
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
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  incomeCell: {
    color: '#34C759',
    fontWeight: '500',
  },
  expenseCell: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  positiveCell: {
    color: '#34C759',
    fontWeight: '500',
  },
  negativeCell: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  categoryContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryAmounts: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
  },
  insightsSection: {
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
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

// VISUALIZATION FEATURE END 