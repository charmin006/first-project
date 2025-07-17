// ROUTINE FEATURE START
// Notification service for daily reminders

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ReminderSettings } from '../types/routineFeatures';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private reminderId = 'daily_expense_reminder';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule daily reminder
  async scheduleReminder(settings: ReminderSettings): Promise<boolean> {
    try {
      if (!settings.enabled) {
        await this.cancelReminder();
        return true;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // Cancel existing reminder
      await this.cancelReminder();

      // Parse time
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      // Create trigger for each selected day
      for (const dayOfWeek of settings.days) {
        const trigger: Notifications.NotificationTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          weekday: dayOfWeek + 1, // expo-notifications uses 1-7 (Monday-Sunday)
          repeats: true,
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'SmartSpend Reminder',
            body: 'Time to log your daily expenses! 📱💰',
            data: { type: 'daily_reminder' },
          },
          trigger,
          identifier: `${this.reminderId}_${dayOfWeek}`,
        });
      }

      console.log('Daily reminder scheduled successfully');
      return true;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return false;
    }
  }

  // Cancel all reminders
  async cancelReminder(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const reminderNotifications = scheduledNotifications.filter(
        notification => notification.identifier.startsWith(this.reminderId)
      );
      
      for (const notification of reminderNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      console.log('Reminders cancelled successfully');
    } catch (error) {
      console.error('Error cancelling reminders:', error);
    }
  }

  // Send immediate notification (for testing)
  async sendTestNotification(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SmartSpend Test',
          body: 'This is a test notification! 🧪',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Get scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Add notification listener
  addNotificationListener(callback: (notification: Notifications.Notification) => void): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Add notification response listener (when user taps notification)
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// ROUTINE FEATURE END 