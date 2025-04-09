// Update imports to use modular API
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle, AndroidVisibility } from '@notifee/react-native';
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
        // Display a local notification to the user with enhanced settings
        this.displayLocalNotification(
          notification.title, 
          notification.body, 
          data,
          remoteMessage.messageId
        );
      }
    });
  }
  
  // Enhanced method to display local notifications
  async displayLocalNotification(title, body, data = {}, messageId = '') {
    try {
      // Create a channel with higher importance for Android
      let channelId = 'high-priority';
      
      if (Platform.OS === 'android') {
        // Create a channel with maximum importance - fix visibility issue
        channelId = await notifee.createChannel({
          id: 'high-priority',
          name: 'High Priority Notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          // Removed visibility property that was causing issues
        });
        
        console.log('Created notification channel with ID:', channelId);
      }
      
      // Display the notification with enhanced settings but with simpler configuration
      const notificationId = await notifee.displayNotification({
        id: messageId || Date.now().toString(),
        title,
        body,
        data,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Use the app icon that definitely exists
          ongoing: false,
          showTimestamp: true,
          autoCancel: true,
          color: '#4CAF50',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          // Remove defaults array that's causing issues
          vibrationPattern: [300, 500],
        },
        ios: {
          badgeCount: 1,
          sound: 'default',
        },
      });
      
      console.log('Local notification displayed with ID:', notificationId);
      console.log('Notification content:', { title, body });
    } catch (error) {
      console.error('Error displaying local notification:', error);
      console.error('Error details:', error.message);
      // Try an even simpler notification as fallback
      this.showFallbackNotification(title, body);
    }
  }

  // Add a new fallback method
  async showFallbackNotification(title, body) {
    try {
      // Create a default channel first
      const defaultChannelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.DEFAULT,
        // No visibility setting in the fallback to avoid errors
      });
      
      // Try with absolute minimal configuration
      await notifee.displayNotification({
        title: title || 'New Notification',
        body: body || 'You have a new notification',
        android: {
          channelId: defaultChannelId,
          smallIcon: 'ic_launcher', // Use the app icon which should definitely exist
        },
      });
      console.log('Fallback notification displayed');
    } catch (fallbackError) {
      console.error('Even fallback notification failed:', fallbackError.message);
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