// VISUALIZATION FEATURE START
// Component for displaying cash flow summary

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CashFlowData } from '../../types/visualizationFeatures';
import { formatCurrency } from '../../utils/visualizationAnalytics';

interface CashFlowViewProps {
  data: CashFlowData;
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
  onViewDetails?: () => void;
}

export const CashFlowViewComponent: React.FC<CashFlowViewProps> = ({
  data,
  onPeriodChange,
  onViewDetails,
}) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return { name: 'trending-up' as const, color: '#34C759' };
      case 'down':
        return { name: 'trending-down' as const, color: '#FF3B30' };
      default:
        return { name: 'remove' as const, color: '#666' };
    }
  };

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  const getNetSavingsColor = (netSavings: number) => {
    if (netSavings > 0) return '#34C759';
    if (netSavings < 0) return '#FF3B30';
    return '#666';
  };

  const getPeriodLabel = (period: 'week' | 'month' | 'year') => {
    switch (period) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
    }
  };

  const trendIcon = getTrendIcon(data.trend);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cash Flow</Text>
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                data.period === period && styles.periodButtonActive,
              ]}
              onPress={() => onPeriodChange?.(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  data.period === period && styles.periodTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.periodLabel}>
          <Text style={styles.periodLabelText}>{getPeriodLabel(data.period)}</Text>
          <View style={styles.trendIndicator}>
            <Ionicons name={trendIcon.name} size={16} color={trendIcon.color} />
            <Text style={[styles.trendText, { color: trendIcon.color }]}>
              {getTrendText(data.trend)}
            </Text>
          </View>
        </View>

        <View style={styles.flowGrid}>
          <View style={styles.flowItem}>
            <View style={styles.flowHeader}>
              <Ionicons name="arrow-down-circle" size={20} color="#34C759" />
              <Text style={styles.flowLabel}>Income</Text>
            </View>
            <Text style={styles.flowAmount}>{formatCurrency(data.totalIncome)}</Text>
          </View>

          <View style={styles.flowItem}>
            <View style={styles.flowHeader}>
              <Ionicons name="arrow-up-circle" size={20} color="#FF3B30" />
              <Text style={styles.flowLabel}>Expenses</Text>
            </View>
            <Text style={styles.flowAmount}>{formatCurrency(data.totalExpenses)}</Text>
          </View>
        </View>

        <View style={styles.netSavingsSection}>
          <View style={styles.netSavingsHeader}>
            <Ionicons name="wallet" size={20} color={getNetSavingsColor(data.netSavings)} />
            <Text style={styles.netSavingsLabel}>Net Savings</Text>
          </View>
          <Text style={[styles.netSavingsAmount, { color: getNetSavingsColor(data.netSavings) }]}>
            {formatCurrency(data.netSavings)}
          </Text>
          <Text style={styles.netSavingsDescription}>
            {data.netSavings > 0
              ? 'Great job! You\'re saving money.'
              : data.netSavings < 0
              ? 'You\'re spending more than you earn.'
              : 'Your income equals your expenses.'}
          </Text>
        </View>

        {onViewDetails && (
          <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>Quick Insights</Text>
        <View style={styles.insightItems}>
          <View style={styles.insightItem}>
            <Ionicons name="calculator" size={16} color="#007AFF" />
            <Text style={styles.insightText}>
              {data.totalIncome > 0
                ? `${((data.totalExpenses / data.totalIncome) * 100).toFixed(1)}% of income spent`
                : 'No income recorded'}
            </Text>
          </View>
          
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={16} color="#007AFF" />
            <Text style={styles.insightText}>
              {data.totalIncome > 0
                ? `${((data.netSavings / data.totalIncome) * 100).toFixed(1)}% savings rate`
                : 'No savings rate available'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  periodLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  flowGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  flowItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  flowLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  flowAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  netSavingsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  netSavingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  netSavingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  netSavingsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  netSavingsDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  insightsSection: {
    marginTop: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  insightItems: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

// VISUALIZATION FEATURE END 