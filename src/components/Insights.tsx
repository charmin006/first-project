import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpendingInsight } from '../types';

interface InsightsProps {
  insights: SpendingInsight[];
}

export const Insights: React.FC<InsightsProps> = ({ insights }) => {
  const getInsightIcon = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'high_spending_day':
        return 'trending-up';
      case 'category_trend':
        return 'pie-chart';
      case 'savings_suggestion':
        return 'bulb';
      default:
        return 'analytics';
    }
  };

  const getInsightColor = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'high_spending_day':
        return '#FF6B6B';
      case 'category_trend':
        return '#4ECDC4';
      case 'savings_suggestion':
        return '#FFE66D';
      default:
        return '#007AFF';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (insights.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Insights Yet</Text>
        <Text style={styles.emptySubtitle}>
          Add more transactions to get personalized spending insights
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Insights</Text>
        <Text style={styles.subtitle}>
          Smart analysis of your spending patterns
        </Text>
      </View>

      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: getInsightColor(insight.type) + '20' }
              ]}>
                <Ionicons
                  name={getInsightIcon(insight.type) as any}
                  size={24}
                  color={getInsightColor(insight.type)}
                />
              </View>
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                {insight.value && (
                  <Text style={[
                    styles.insightValue,
                    { color: getInsightColor(insight.type) }
                  ]}>
                    {formatCurrency(insight.value)}
                  </Text>
                )}
              </View>
            </View>
            
            <Text style={styles.insightDescription}>
              {insight.description}
            </Text>

            {insight.date && (
              <View style={styles.dateContainer}>
                <Ionicons name="calendar" size={14} color="#666" />
                <Text style={styles.dateText}>
                  {new Date(insight.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Smart Spending Tips</Text>
        
        <View style={styles.tipCard}>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          <Text style={styles.tipText}>
            Set daily spending limits to stay on track
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          <Text style={styles.tipText}>
            Review your spending weekly to identify patterns
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          <Text style={styles.tipText}>
            Use categories to understand where your money goes
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          <Text style={styles.tipText}>
            Save 20% of your income for emergencies
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
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
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  insightsContainer: {
    padding: 20,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  tipsSection: {
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
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
}); 