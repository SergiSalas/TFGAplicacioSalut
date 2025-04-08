import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class NotificationService {
  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    console.log('User declined permissions');
    return false;
  }

  async getToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  registerForegroundHandler() {
    return messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      // Handle the notification here - you can use a local notification library
      // to show the notification while the app is in foreground
    });
  }

  registerBackgroundHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background notification:', remoteMessage);
      // Handle background notifications
    });
  }

  registerNotificationOpenedApp() {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      // Navigate to appropriate screen based on notification data
    });
  }

  async checkInitialNotification() {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log('App opened from quit state:', remoteMessage);
      // Handle the initial notification - e.g., navigate to a specific screen
    }
  }

  subscribeToTopic(topic) {
    return messaging().subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic) {
    return messaging().unsubscribeFromTopic(topic);
  }
}

export default new NotificationService();