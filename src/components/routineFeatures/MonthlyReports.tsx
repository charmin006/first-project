// ROUTINE FEATURE START
// Component for monthly reports generation and management

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';
import { MonthlyReport } from '../../types/routineFeatures';
import { monthlyReportService } from '../../services/monthlyReport';

interface MonthlyReportsProps {
  onClose: () => void;
  transactions: Transaction[];
}

export const MonthlyReportsComponent: React.FC<MonthlyReportsProps> = ({ 
  onClose, 
  transactions 
}) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [savedReports, setSavedReports] = useState<MonthlyReport[]>([]);
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    loadEmailSettings();
    loadSavedReports();
    setSelectedMonth(monthlyReportService.getCurrentMonth());
  }, []);

  const loadEmailSettings = async () => {
    try {
      const email = await monthlyReportService.getEmailAddress();
      setEmailAddress(email);
    } catch (error) {
      console.error('Error loading email settings:', error);
    }
  };

  const loadSavedReports = async () => {
    try {
      const reports = await monthlyReportService.getSavedReports();
      setSavedReports(reports);
    } catch (error) {
      console.error('Error loading saved reports:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedMonth) {
      Alert.alert('Error', 'Please select a month');
      return;
    }

    setIsGenerating(true);
    try {
      const report = monthlyReportService.generateMonthlyReport(transactions, selectedMonth);
      await monthlyReportService.saveReport(report);
      await loadSavedReports();
      
      Alert.alert(
        'Report Generated',
        'Monthly report has been generated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async (report: MonthlyReport) => {
    try {
      const pdfUri = await monthlyReportService.generatePDF(report);
      await monthlyReportService.sharePDF(pdfUri);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const handleSendEmail = async (report: MonthlyReport) => {
    if (!emailAddress) {
      setShowEmailInput(true);
      return;
    }

    setIsSending(true);
    try {
      const success = await monthlyReportService.sendReportEmail(report, emailAddress);
      if (success) {
        Alert.alert('Success', 'Monthly report has been sent to your email!');
      } else {
        Alert.alert('Error', 'Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailAddress.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await monthlyReportService.saveEmailSettings(emailAddress);
      setShowEmailInput(false);
      Alert.alert('Success', 'Email address saved successfully!');
    } catch (error) {
      console.error('Error saving email:', error);
      Alert.alert('Error', 'Failed to save email address.');
    }
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate options for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push({
        value: monthString,
        label: formatMonth(monthString),
      });
    }
    
    return options;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Reports</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate New Report</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Select Month</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.monthSelector}>
              {getMonthOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.monthOption,
                    selectedMonth === option.value && styles.monthOptionActive,
                  ]}
                  onPress={() => setSelectedMonth(option.value)}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      selectedMonth === option.value && styles.monthOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {savedReports.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Reports</Text>
          
          {savedReports.map((report) => (
            <View key={report.month} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportMonth}>{formatMonth(report.month)}</Text>
                  <Text style={styles.reportTotal}>
                    Total: ${report.totalSpent.toFixed(2)}
                  </Text>
                  <Text style={styles.reportTransactions}>
                    {report.topExpenses.length} transactions
                  </Text>
                </View>
                
                <View style={styles.reportActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleGeneratePDF(report)}
                  >
                    <Ionicons name="download" size={16} color="#007AFF" />
                    <Text style={styles.actionText}>PDF</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSendEmail(report)}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <>
                        <Ionicons name="mail" size={16} color="#007AFF" />
                        <Text style={styles.actionText}>Email</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.reportInsights}>
                <Text style={styles.insightsTitle}>Key Insights:</Text>
                {report.insights.slice(0, 2).map((insight, index) => (
                  <Text key={index} style={styles.insightText}>
                    • {insight}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {showEmailInput && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowEmailInput(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveEmail}
            >
              <Text style={styles.primaryButtonText}>Save Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          Generate monthly reports to track your spending patterns. 
          Reports include category breakdowns, top expenses, and insights. 
          You can download as PDF or email them to yourself.
        </Text>
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
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
  monthSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  monthOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  monthOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  monthOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  monthOptionTextActive: {
    color: '#fff',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportTotal: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  reportTransactions: {
    fontSize: 12,
    color: '#666',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  reportInsights: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
  },
});

// ROUTINE FEATURE END 