// Update imports to use modular API
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native'; // You'll need to install this package
import firebase from '@react-native-firebase/app';

class NotificationService {
  // Ensure Firebase is initialized
  ensureInitialized() {
    try {
      if (!firebase.apps.length) {
        console.log('Firebase not initialized, initializing now');
        return firebase.initializeApp();
      }
      return firebase.app();
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return null;
    }
  }

  async requestUserPermission() {
    try {
      // Make sure Firebase is initialized before requesting permissions
      this.ensureInitialized();
      
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
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
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

  // Update the registerForegroundHandler method
  registerForegroundHandler() {
    return messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      
      // Extract notification data
      const { notification, data } = remoteMessage;
      
      if (notification) {
        // Display a local notification to the user
        this.displayLocalNotification(notification.title, notification.body, data);
      }
    });
  }
  
  // Add this new method to display local notifications
  async displayLocalNotification(title, body, data = {}) {
    try {
      // For displaying notifications when app is in foreground, we need to use notifee
      // First, create a channel for Android
      let channelId = 'default';
      
      if (Platform.OS === 'android') {
        channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: 4, // max importance
          vibration: true,
        });
      }
      
      // Display the notification
      await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Use your app's icon
          color: '#4CAF50', // Notification color (green)
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          // iOS specific options
          badgeCount: 1,
        },
      });
      
      console.log('Local notification displayed:', { title, body });
    } catch (error) {
      console.error('Error displaying local notification:', error);
    }
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
      // Handle the initial notification
    }
  }

  subscribeToTopic(topic) {
    return messaging().subscribeToTopic(topic);
  }

  unsubscribeFromTopic(topic) {
    return messaging().unsubscribeFromTopic(topic);
  }

  // Add this method to your NotificationService class
  async testFirebaseConnection() {
    try {
      console.log('Firebase connection test:');
      
      // Test FCM
      const token = await this.getToken();
      console.log('- FCM token obtained:', token ? 'Yes' : 'No');
      console.log('- FCM token:', token);
      
      return {
        success: true,
        token: token
      };
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new NotificationService();