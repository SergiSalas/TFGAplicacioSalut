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

  // Añadir este nuevo método para verificar objetivos de pasos
  async checkStepGoals(currentSteps, dailyGoal, userId) {
    try {
      // Si los pasos actuales son menores que el objetivo diario
      if (currentSteps < dailyGoal) {
        const stepsRemaining = dailyGoal - currentSteps;
        
        // Crear un mensaje personalizado
        const title = '¡Objetivo de pasos pendiente!';
        const body = `Te faltan ${stepsRemaining} pasos para alcanzar tu objetivo diario de ${dailyGoal} pasos. ¡Ánimo!`;
        
        // Generar un ID único para esta notificación
        const messageId = `steps_reminder_${userId}_${Date.now()}`;
        
        // Mostrar la notificación
        await this.displayLocalNotification(title, body, { type: 'step_goal', userId }, messageId);
        
        console.log(`Notificación de recordatorio de pasos enviada a usuario ${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al verificar objetivos de pasos:', error);
      return false;
    }
  }
  
  // Método para programar verificaciones diarias
  scheduleStepGoalCheck(checkTime = '20:00') {
    // Obtener la hora actual
    const now = new Date();
    const [hours, minutes] = checkTime.split(':').map(Number);
    
    // Configurar la hora de verificación para hoy
    const checkDate = new Date();
    checkDate.setHours(hours, minutes, 0, 0);
    
    // Si la hora ya pasó hoy, programar para mañana
    if (now > checkDate) {
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    // Calcular el tiempo hasta la verificación en milisegundos
    const timeUntilCheck = checkDate.getTime() - now.getTime();
    
    console.log(`Verificación de pasos programada para ${checkDate.toLocaleString()}`);
    
    // Programar la verificación
    setTimeout(() => {
      this.performStepGoalCheck();
      // Volver a programar para el día siguiente
      this.scheduleStepGoalCheck(checkTime);
    }, timeUntilCheck);
  }
  
  // Método que realiza la verificación (debes implementar la lógica para obtener los datos)
  async performStepGoalCheck() {
    try {
      // Aquí deberías obtener los datos de los usuarios desde tu API o base de datos
      // Este es un ejemplo, necesitarás adaptarlo a tu estructura de datos
      
      // Ejemplo: obtener usuarios y sus datos de pasos
      // const usersData = await fetchUsersStepData();
      
      // Para pruebas, usamos datos de ejemplo
      const usersData = [
        { userId: '1', currentSteps: 5000, dailyGoal: 10000 },
        { userId: '2', currentSteps: 9000, dailyGoal: 8000 }
      ];
      
      // Verificar cada usuario
      for (const user of usersData) {
        await this.checkStepGoals(user.currentSteps, user.dailyGoal, user.userId);
      }
      
      console.log('Verificación de objetivos de pasos completada');
    } catch (error) {
      console.error('Error al realizar verificación de pasos:', error);
    }
  }
}

export default new NotificationService();