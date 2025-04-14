// NotificationService.js

// Importaciones necesarias
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { 
  AndroidImportance, 
  EventType, 
  TriggerType 
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '@react-native-firebase/app';
import { getDailySteps } from '../service/StepService';
import { getDailyObjective } from '../service/ActivityService';

/**
 * Registro del manejador de eventos en background.
 * Esto se ejecuta cuando la notificación programada dispara el trigger
 * (se debe configurar a nivel de módulo, antes de cualquier otra inicialización).
 */
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Evento en background recibido:', type);
  
  // Se verifica que el evento sea del tipo TRIGGER y que la notificación contenga el dato "step_goal_check"
  if (type === EventType.TRIGGER && detail.notification?.data?.type === 'step_goal_check') {
    console.log('Trigger de verificación de pasos recibido en background');
    try {
      // Se invoca la notificación de fallback; alternativamente podrías llamar a performStepGoalCheck()
      await NotificationService.showFallbackNotification(
        '¡Recordatorio de actividad!',
        'Recuerda completar tu objetivo diario de pasos.'
      );
      console.log('Notificación enviada desde background correctamente');
    } catch (error) {
      console.error('Error en el handler de background:', error);
    }
  }
  return Promise.resolve();
});

/**
 * Clase que encapsula el servicio de notificaciones.
 * Se ha eliminado la duplicación de métodos y se ha consolidado la lógica de manejo
 * tanto de las notificaciones en foreground como en background.
 */
class NotificationServiceClass {
  // Asegura que Firebase esté inicializado
  ensureInitialized() {
    try {
      if (!firebase.apps.length) {
        console.log('Firebase no inicializado, inicializando...');
        firebase.initializeApp();
      }
      return firebase.app();
    } catch (error) {
      console.error('Error al inicializar Firebase:', error);
      return null;
    }
  }

  // Solicita permisos para notificaciones
  async requestUserPermission() {
    try {
      this.ensureInitialized();
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (enabled) {
        console.log('Permiso de notificación concedido:', authStatus);
        return true;
      }
      console.log('El usuario declinó los permisos de notificación');
      return false;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  // Obtiene el token FCM
  async getToken() {
    try {
      const token = await messaging().getToken();
      console.log('Token FCM obtenido:', token);
      return token;
    } catch (error) {
      console.error('Error al obtener el token FCM:', error);
      return null;
    }
  }

  // Registra un manejador para notificaciones en primer plano
  registerForegroundHandler() {
    return messaging().onMessage(async remoteMessage => {
      console.log('Notificación recibida en primer plano:', remoteMessage);
      const { notification, data } = remoteMessage;
      if (notification) {
        this.displayLocalNotification(
          notification.title, 
          notification.body, 
          data,
          remoteMessage.messageId
        );
      }
    });
  }
  
  // Muestra una notificación local con configuración mejorada
  async displayLocalNotification(title, body, data = {}, messageId = '') {
    try {
      let channelId = 'high-priority';
      if (Platform.OS === 'android') {
        channelId = await notifee.createChannel({
          id: 'high-priority',
          name: 'High Priority Notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true
        });
        console.log('Canal creado con ID:', channelId);
      }
      
      const notificationId = await notifee.displayNotification({
        id: messageId || Date.now().toString(),
        title,
        body,
        data,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Asegúrate de que existe este icono en tu proyecto
          ongoing: false,
          showTimestamp: true,
          autoCancel: true,
          color: '#4CAF50',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          vibrationPattern: [300, 500],
        },
        ios: {
          badgeCount: 1,
          sound: 'default',
        },
      });
      
      console.log('Notificación local mostrada (ID):', notificationId);
    } catch (error) {
      console.error('Error al mostrar notificación local:', error);
      await this.showFallbackNotification(title, body);
    }
  }

  // Método fallback para notificaciones en caso de error en la configuración principal
  async showFallbackNotification(title, body) {
    try {
      const defaultChannelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.DEFAULT,
      });
      
      await notifee.displayNotification({
        title: title || 'Nueva notificación',
        body: body || 'Tienes una nueva notificación',
        android: {
          channelId: defaultChannelId,
          smallIcon: 'ic_launcher',
        },
      });
      console.log('Notificación fallback mostrada');
    } catch (fallbackError) {
      console.error('Error en notificación fallback:', fallbackError.message);
    }
  }

  // Registra un handler para notificaciones en background (además del onBackgroundEvent global)
  registerBackgroundHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Notificación en background:', remoteMessage);
      // Aquí puedes manejar datos adicionales si es necesario
    });
  }

  // Registra el handler cuando el usuario abre la notificación y se inicia la app
  registerNotificationOpenedApp() {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notificación abrió la app:', remoteMessage);
      // Aquí podrías redirigir a una pantalla específica
    });
  }

  // Maneja la notificación inicial si la app se abre desde un estado "quit"
  async checkInitialNotification() {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log('App iniciada desde notificación:', remoteMessage);
    }
  }

  // Métodos para suscribir o cancelar temas
  subscribeToTopic(topic) {
    return messaging().subscribeToTopic(topic);
  }
  
  unsubscribeFromTopic(topic) {
    return messaging().unsubscribeFromTopic(topic);
  }

  // Prueba la conexión con Firebase obteniendo el token
  async testFirebaseConnection() {
    try {
      console.log('Probando conexión con Firebase:');
      const token = await this.getToken();
      console.log('- Token FCM obtenido:', token ? 'Sí' : 'No');
      return { success: true, token };
    } catch (error) {
      console.error('Error al probar conexión:', error);
      return { success: false, error: error.message };
    }
  }

  // Verifica si el usuario ha alcanzado el objetivo de pasos (sin requerir userId)
  async checkStepGoals(currentSteps, dailyGoal) {
    try {
      if (currentSteps < dailyGoal) {
        const stepsRemaining = dailyGoal - currentSteps;
        const title = '¡Objetivo de pasos pendiente!';
        const body = `Te faltan ${stepsRemaining} pasos para alcanzar tu objetivo diario de ${dailyGoal} pasos. ¡Ánimo!`;
        const messageId = `steps_reminder_${Date.now()}`;
        await this.displayLocalNotification(title, body, { type: 'step_goal' }, messageId);
        console.log('Notificación de recordatorio enviada');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al verificar objetivos de pasos:', error);
      return false;
    }
  }

  // Programa una notificación de verificación de pasos para las 14:00 diariamente
  async scheduleStepGoalCheck() {
    try {
      // Programar la notificación para las 14:00 cada día
      const triggerTimestamp = this.getNextTriggerTime(14, 0); // 14:00 (2 PM)
      const nextTriggerDate = new Date(triggerTimestamp);
      const nextTriggerTime = nextTriggerDate.toLocaleTimeString();
      const nextTriggerDay = nextTriggerDate.toLocaleDateString();
      console.log(`Programando verificación de pasos para las ${nextTriggerTime} del ${nextTriggerDay}`);
  
      // Cancelar trigger previo, si existe
      const existingTriggerId = await AsyncStorage.getItem('step_goal_check_trigger_id');
      if (existingTriggerId) {
        await notifee.cancelTriggerNotification(existingTriggerId);
        console.log(`Cancelado trigger anterior con ID: ${existingTriggerId}`);
      }
      
      // Crear (o reusar) el canal para las notificaciones
      const channelId = await notifee.createChannel({
        id: 'step_reminder',
        name: 'Step Goal Reminders',
        importance: AndroidImportance.HIGH,
      });
  
      // Crear la notificación con el trigger para las 14:00
      const triggerId = await notifee.createTriggerNotification(
        {
          title: 'Recordatorio de actividad diaria',
          body: 'Es hora de revisar tu progreso de pasos del día.',
          android: {
            channelId,
            smallIcon: 'ic_launcher',
          },
          data: { type: 'step_goal_check' },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerTimestamp,
          repeatFrequency: TriggerType.DAILY, // Repetir diariamente
        }
      );
      
      console.log(`Notificación programada con ID: ${triggerId} para las ${nextTriggerTime} del ${nextTriggerDay}`);
      await AsyncStorage.setItem('step_goal_check_trigger_id', triggerId);
      return triggerId;
    } catch (error) {
      console.error('Error al programar la verificación de pasos:', error);
      return null;
    }
  }
  

  async performStepGoalCheck() {
    try {
      console.log('Ejecutando verificación de objetivos de pasos...');
      
      // Se obtiene el token del usuario (si existe)
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No se encontró usuario autenticado, enviando notificación fallback');
        await this.displayLocalNotification(
          '¡Recordatorio de actividad!',
          'Recuerda completar tu objetivo diario de pasos. ¡Cada paso cuenta!',
          { type: 'step_goal_reminder' },
          `steps_reminder_fallback_${Date.now()}`
        );
      } else {
        // Se obtienen los datos de pasos y objetivo
        const currentStepsData = await getDailySteps(token);
        const currentSteps = currentStepsData?.steps || 0;
        
        const dailyGoalData = await getDailyObjective(token);
        const dailyGoal = dailyGoalData?.steps || 10000;
        
        console.log(`Pasos actuales: ${currentSteps}, Objetivo: ${dailyGoal}`);
        
        // Solo enviar notificación si no ha completado el objetivo
        if (currentSteps < dailyGoal) {
          const stepsRemaining = Math.max(0, dailyGoal - currentSteps);
          const percentComplete = Math.round((currentSteps / dailyGoal) * 100);
          
          let title = '¡Objetivo de pasos pendiente!';
          let body;
          
          // Mensajes motivacionales según el progreso
          if (percentComplete < 30) {
            body = `Te faltan ${stepsRemaining} pasos para alcanzar tu objetivo de ${dailyGoal}. ¡Aún tienes tiempo para lograrlo hoy!`;
          } else if (percentComplete < 60) {
            body = `¡Vas por buen camino! Has completado el ${percentComplete}% de tu objetivo. Solo ${stepsRemaining} pasos más.`;
          } else if (percentComplete < 90) {
            body = `¡Estás muy cerca! Solo te faltan ${stepsRemaining} pasos para completar tu objetivo diario.`;
          } else {
            body = `¡Casi lo logras! Solo ${stepsRemaining} pasos más y habrás alcanzado tu meta de hoy.`;
          }
          
          // Se muestra la notificación con mensaje motivacional
          await this.displayLocalNotification(
            title, 
            body, 
            { type: 'step_goal_reminder' }, 
            `steps_reminder_${Date.now()}`
          );
          console.log(`Notificación enviada: ${title} - ${body}`);
        } else {
          console.log('El usuario ya ha completado su objetivo diario, no se envía notificación');
        }
      }
    } catch (error) {
      console.error('Error durante la verificación de pasos:', error);
      try {
        await notifee.displayNotification({
          title: 'Recordatorio de actividad',
          body: 'Revisa tu progreso de pasos diarios.',
          android: {
            channelId: 'default',
            smallIcon: 'ic_launcher',
          },
        });
      } catch (finalError) {
        console.error('Error en fallback final:', finalError);
      }
    } finally {
      // Reprogramar para el día siguiente a las 14:00
      await this.scheduleStepGoalCheck();
    }
  }
  

  // Configura los manejadores tanto en foreground como para cuando el trigger se dispara
  async setupBackgroundHandler() {
    try {
      console.log('Configurando manejadores de notificaciones (foreground & background)');
      notifee.onForegroundEvent(async ({ type, detail }) => {
        console.log('Evento en foreground:', type);
        if (type === EventType.TRIGGER && detail.notification?.data?.type === 'step_goal_check') {
          console.log('Trigger de verificación recibido en foreground');
          await this.performStepGoalCheck();
        }
      });
      console.log('Manejadores configurados correctamente');
      return true;
    } catch (error) {
      console.error('Error configurando manejadores:', error);
      return false;
    }
  }

  // Método de inicialización del servicio
  async initialize() {
    try {
      console.log('Inicializando NotificationService...');
      this.ensureInitialized();
      
      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) {
        console.log('No se otorgaron permisos para notificaciones');
        return false;
      }
      
      // Configura los handlers
      await this.setupBackgroundHandler();
      this.registerForegroundHandler();
      this.registerBackgroundHandler();
      this.registerNotificationOpenedApp();
      
      // Programa una verificación de pasos para las 14:00
      await this.scheduleStepGoalCheck();
      
      
      console.log('NotificationService inicializado correctamente');
      return true;
    } catch (error) {
      console.error('Error inicializando NotificationService:', error);
      return false;
    }
  }

  // Helper para obtener el próximo tiempo de trigger según hora y minuto
  getNextTriggerTime(hours, minutes) {
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(hours, minutes, 0, 0);
    if (now > triggerDate) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }
    console.log(`Próximo trigger programado para: ${triggerDate.toLocaleString()}`);
    return triggerDate.getTime();
  }
}

// Se exporta una instancia única del servicio
const NotificationService = new NotificationServiceClass();
export default NotificationService;
