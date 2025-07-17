// AI Features Screen - Comprehensive AI functionality
// This screen combines all AI features in one place

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';
import { BudgetSuggestions } from './BudgetSuggestions';
import { DailyForecastComponent } from './DailyForecast';
import { SavingsGoals } from './SavingsGoals';

interface AIFeaturesScreenProps {
  transactions: Transaction[];
  onBudgetCreated?: () => void;
}

type AITab = 'forecast' | 'budgets' | 'goals';

const screenWidth = Dimensions.get('window').width;

export const AIFeaturesScreen: React.FC<AIFeaturesScreenProps> = ({
  transactions,
  onBudgetCreated
}) => {
  const [activeTab, setActiveTab] = useState<AITab>('forecast');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'forecast':
        return (
          <DailyForecastComponent
            transactions={transactions}
            onBudgetUpdated={onBudgetCreated}
          />
        );
      case 'budgets':
        return (
          <BudgetSuggestions
            transactions={transactions}
            onBudgetCreated={onBudgetCreated}
          />
        );
      case 'goals':
        return <SavingsGoals />;
      default:
        return null;
    }
  };

  const getTabIcon = (tab: AITab) => {
    const iconMap = {
      forecast: 'calculator',
      budgets: 'bulb',
      goals: 'flag'
    };
    return iconMap[tab];
  };

  const getTabLabel = (tab: AITab) => {
    const labelMap = {
      forecast: 'Daily Forecast',
      budgets: 'Smart Budgets',
      goals: 'Savings Goals'
    };
    return labelMap[tab];
  };

  const getTabDescription = (tab: AITab) => {
    const descriptionMap = {
      forecast: 'See how much you can spend today',
      budgets: 'AI-powered budget suggestions',
      goals: 'Track your savings progress'
    };
    return descriptionMap[tab];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="sparkles" size={28} color="#007AFF" />
          <Text style={styles.title}>AI Features</Text>
        </View>
        <Text style={styles.subtitle}>
          Intelligent insights to help you manage your money better
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['forecast', 'budgets', 'goals'] as AITab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={getTabIcon(tab) as any}
              size={20}
              color={activeTab === tab ? '#007AFF' : '#666'}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {getTabLabel(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Feature Highlights */}
      <View style={styles.highlightsContainer}>
        <Text style={styles.highlightsTitle}>AI-Powered Features</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightsScroll}
        >
          <View style={styles.highlightCard}>
            <Ionicons name="analytics" size={24} color="#4ECDC4" />
            <Text style={styles.highlightTitle}>Smart Classification</Text>
            <Text style={styles.highlightDescription}>
              Automatically categorize expenses as needs vs wants
            </Text>
          </View>

          <View style={styles.highlightCard}>
            <Ionicons name="trending-up" size={24} color="#FF6B6B" />
            <Text style={styles.highlightTitle}>Spending Forecast</Text>
            <Text style={styles.highlightDescription}>
              Know exactly how much you can spend today
            </Text>
          </View>

          <View style={styles.highlightCard}>
            <Ionicons name="bulb" size={24} color="#FFE66D" />
            <Text style={styles.highlightTitle}>Budget Suggestions</Text>
            <Text style={styles.highlightDescription}>
              AI-generated budget recommendations
            </Text>
          </View>

          <View style={styles.highlightCard}>
            <Ionicons name="flag" size={24} color="#96CEB4" />
            <Text style={styles.highlightTitle}>Savings Goals</Text>
            <Text style={styles.highlightDescription}>
              Track progress towards your financial goals
            </Text>
          </View>
        </ScrollView>
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
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  highlightsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  highlightsScroll: {
    paddingRight: 20,
  },
  highlightCard: {
    width: screenWidth * 0.7,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  highlightDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 