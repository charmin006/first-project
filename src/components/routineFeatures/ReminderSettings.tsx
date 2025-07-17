// ROUTINE FEATURE START
// Component for managing daily reminder settings

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderSettings } from '../../types/routineFeatures';
import { getReminderSettings, saveReminderSettings } from '../../utils/routineStorage';
import { notificationService } from '../../services/notifications';

interface ReminderSettingsProps {
  onClose: () => void;
}

export const ReminderSettingsComponent: React.FC<ReminderSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    time: '21:00',
    days: [0, 1, 2, 3, 4, 5, 6],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getReminderSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const handleToggleReminder = async (enabled: boolean) => {
    setLoading(true);
    try {
      const newSettings = { ...settings, enabled };
      setSettings(newSettings);
      
      if (enabled) {
        const success = await notificationService.scheduleReminder(newSettings);
        if (!success) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to use reminders.',
            [{ text: 'OK' }]
          );
          setSettings({ ...newSettings, enabled: false });
          return;
        }
      } else {
        await notificationService.cancelReminder();
      }
      
      await saveReminderSettings(newSettings);
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      Alert.alert('Error', 'Failed to update reminder settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = async (time: string) => {
    try {
      const newSettings = { ...settings, time };
      setSettings(newSettings);
      
      if (settings.enabled) {
        await notificationService.scheduleReminder(newSettings);
      }
      
      await saveReminderSettings(newSettings);
    } catch (error) {
      console.error('Error updating reminder time:', error);
    }
  };

  const handleDayToggle = async (dayIndex: number) => {
    try {
      const newDays = settings.days.includes(dayIndex)
        ? settings.days.filter(d => d !== dayIndex)
        : [...settings.days, dayIndex].sort();
      
      const newSettings = { ...settings, days: newDays };
      setSettings(newSettings);
      
      if (settings.enabled) {
        await notificationService.scheduleReminder(newSettings);
      }
      
      await saveReminderSettings(newSettings);
    } catch (error) {
      console.error('Error updating reminder days:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Reminders</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Enable Daily Reminders</Text>
            <Text style={styles.settingDescription}>
              Get notified to log your daily expenses
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleReminder}
            disabled={loading}
            trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
            thumbColor={settings.enabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {settings.enabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Time</Text>
            <TouchableOpacity
              style={styles.timePicker}
              onPress={() => {
                // In a real app, you'd use a proper time picker
                Alert.prompt(
                  'Set Reminder Time',
                  'Enter time in HH:MM format (24-hour)',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Set',
                      onPress: (time) => {
                        if (time && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                          handleTimeChange(time);
                        } else {
                          Alert.alert('Invalid Time', 'Please enter time in HH:MM format');
                        }
                      },
                    },
                  ],
                  'plain-text',
                  settings.time
                );
              }}
            >
              <Ionicons name="time" size={20} color="#007AFF" />
              <Text style={styles.timeText}>{formatTime(settings.time)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeat Days</Text>
            <View style={styles.daysContainer}>
              {dayNames.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    settings.days.includes(index) && styles.dayButtonActive,
                  ]}
                  onPress={() => handleDayToggle(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      settings.days.includes(index) && styles.dayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Ionicons name="notifications" size={20} color="#007AFF" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoText}>
          Reminders will help you stay consistent with expense tracking. 
          You can customize the time and days when you want to be reminded.
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dayTextActive: {
    color: '#fff',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  testButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
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