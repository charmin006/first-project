// ROUTINE FEATURE START
// Web-safe notifications service

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Web-safe notification permissions
  async requestPermissions(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send notification for web
  async scheduleNotification(title: string, body: string, data?: any): Promise<string> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        data,
        icon: '/favicon.png',
      });
      
      // Return a mock notification ID
      return `web_${Date.now()}`;
    }
    
    // Fallback to console log for development
    console.log(`Notification: ${title} - ${body}`, data);
    return `console_${Date.now()}`;
  }

  // Cancel notification (web doesn't support this, but we'll simulate it)
  async cancelNotification(notificationId: string): Promise<void> {
    console.log(`Cancelled notification: ${notificationId}`);
  }

  // Get all scheduled notifications (web doesn't support this)
  async getAllScheduledNotifications(): Promise<any[]> {
    return [];
  }

  // Set notification channel (web doesn't support channels)
  async setNotificationChannel(channelId: string, channelConfig: any): Promise<void> {
    console.log(`Set notification channel: ${channelId}`, channelConfig);
  }

  // Get notification permissions status
  async getPermissionsAsync(): Promise<{ status: string }> {
    if ('Notification' in window) {
      return { status: Notification.permission };
    }
    return { status: 'denied' };
  }

  // Add notification received listener (web doesn't support this)
  addNotificationReceivedListener(callback: (notification: any) => void): any {
    console.log('Notification listener added (web simulation)');
    return { remove: () => console.log('Notification listener removed') };
  }

  // Add notification response received listener (web doesn't support this)
  addNotificationResponseReceivedListener(callback: (response: any) => void): any {
    console.log('Notification response listener added (web simulation)');
    return { remove: () => console.log('Notification response listener removed') };
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// ROUTINE FEATURE END 