import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { 
  AndroidImportance, 
  EventType, 
  TriggerType 
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '@react-native-firebase/app';
import { getDailySteps } from './StepService';
import { getDailyObjective } from './ActivityService';

/**
 * Registro del manejador de eventos en background.
 * Esto se ejecuta cuando la notificación programada dispara el trigger
 * (se debe configurar a nivel de módulo, antes de cualquier otra inicialización).
 */
// In the onBackgroundEvent handler at the top of the file
notifee.onBackgroundEvent(async ({ type, detail }) => {
  // Skip empty DELIVERED events
  if (type === 4 && !detail?.notification?.id && !detail?.notification?.data) {
    console.log('Skipping empty DELIVERED event');
    return Promise.resolve();
  }

  // Verificar si ya procesamos este evento
  const eventId = `${type}_${detail?.notification?.id || Date.now()}`;
  try {
    console.log('🔍 BACKGROUND EVENT RECEIVED:', {
      type,
      notificationId: detail?.notification?.id,
      notificationTitle: detail?.notification?.title,
      notificationData: detail?.notification?.data,
      eventId
    });
    
    const processedEvents = await AsyncStorage.getItem('processedBackgroundEvents') || '[]';
    const processedIds = JSON.parse(processedEvents);
    
    if (processedIds.includes(eventId)) {
      console.log('⚠️ DUPLICATE EVENT DETECTED:', eventId);
      return Promise.resolve();
    }
    
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
    
    // Se verifica que el evento sea del tipo TRIGGER y que la notificación contenga el dato "hydration_reminder"
    if (type === EventType.TRIGGER && detail.notification?.data?.type === 'hydration_reminder') {
      console.log('Trigger de recordatorio de hidratación recibido en background');
      try {
        // Se invoca la notificación de fallback para hidratación
        await NotificationService.showFallbackNotification(
          '¡Recordatorio de hidratación!',
          'Recuerda beber agua regularmente para mantenerte hidratado.'
        );
        console.log('Notificación de hidratación enviada desde background correctamente');
      } catch (error) {
        console.error('Error en el handler de background para hidratación:', error);
      }
    }
    
    // Guardar ID como procesado
    processedIds.push(eventId);
    // Mantener solo los últimos 20 IDs
    while (processedIds.length > 20) processedIds.shift();
    await AsyncStorage.setItem('processedBackgroundEvents', JSON.stringify(processedIds));
    
  } catch (error) {
    console.error('Error procesando evento background:', error);
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
    if (!this.backgroundHandlerRegistered) {
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        // Verificar si ya procesamos este mensaje
        const messageId = remoteMessage.messageId || `${Date.now()}`;
        console.log('📱 FCM BACKGROUND MESSAGE:', {
          messageId,
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: remoteMessage.data,
          sentTime: remoteMessage.sentTime,
          from: remoteMessage.from
        });
        
        const processedMessages = await AsyncStorage.getItem('processedNotifications') || '[]';
        const processedIds = JSON.parse(processedMessages);
        
        if (processedIds.includes(messageId)) {
          console.log('⚠️ DUPLICATE MESSAGE DETECTED:', messageId);
          return;
        }
        
        console.log('Notificación en background:', remoteMessage);
        
        // Guardar ID como procesado
        processedIds.push(messageId);
        // Mantener solo los últimos 20 IDs para no crecer indefinidamente
        while (processedIds.length > 20) processedIds.shift();
        await AsyncStorage.setItem('processedNotifications', JSON.stringify(processedIds));
      });
      this.backgroundHandlerRegistered = true;
      console.log('Handler de background registrado');
    } else {
      console.log('Handler de background ya estaba registrado');
    }
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

   // Programa una notificación de recordatorio de hidratación para las 18:00 diariamente
   async scheduleHydrationReminder() {
    try {
      // Programar la notificación para las 18:00 cada día
      const triggerTimestamp = this.getNextTriggerTime(18, 0); // 18:00 (6 PM)
      const nextTriggerDate = new Date(triggerTimestamp);
      const nextTriggerTime = nextTriggerDate.toLocaleTimeString();
      const nextTriggerDay = nextTriggerDate.toLocaleDateString();
      console.log(`Programando recordatorio de hidratación para las ${nextTriggerTime} del ${nextTriggerDay}`);
  
      // Cancelar trigger previo, si existe
      const existingTriggerId = await AsyncStorage.getItem('hydration_reminder_trigger_id');
      if (existingTriggerId) {
        await notifee.cancelTriggerNotification(existingTriggerId);
        console.log(`Cancelado trigger anterior de hidratación con ID: ${existingTriggerId}`);
      }
      
      // Crear (o reusar) el canal para las notificaciones
      const channelId = await notifee.createChannel({
        id: 'hydration_reminder',
        name: 'Hydration Reminders',
        importance: AndroidImportance.HIGH,
      });
  
      // Crear la notificación con el trigger para las 18:00
      const triggerId = await notifee.createTriggerNotification(
        {
          title: 'Recordatorio de hidratación',
          body: '¡Recuerda beber agua! Mantente hidratado para un mejor rendimiento y salud.',
          android: {
            channelId,
            smallIcon: 'ic_launcher',
          },
          data: { type: 'hydration_reminder' },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerTimestamp,
          repeatFrequency: TriggerType.DAILY, // Repetir diariamente
        }
      );
      
      console.log(`Notificación de hidratación programada con ID: ${triggerId} para las ${nextTriggerTime} del ${nextTriggerDay}`);
      await AsyncStorage.setItem('hydration_reminder_trigger_id', triggerId);
      return triggerId;
    } catch (error) {
      console.error('Error al programar el recordatorio de hidratación:', error);
      return null;
    }
  }

  async performHydrationReminder() {
    try {
      console.log('Ejecutando recordatorio de hidratación...');
      
      // Se obtiene el token del usuario (si existe)
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No se encontró usuario autenticado, enviando notificación fallback de hidratación');
        await this.displayLocalNotification(
          '¡Recordatorio de hidratación!',
          'Recuerda beber agua regularmente. ¡Mantenerse hidratado es esencial para tu salud!',
          { type: 'hydration_reminder' },
          `hydration_reminder_fallback_${Date.now()}`
        );
      } else {
        // Importar el servicio de hidratación
        const { getHydrationStatus } = require('./HydrationService');
        
        try {
          // Obtener datos actuales de hidratación
          const hydrationData = await getHydrationStatus(token);
          
          // Calcular el progreso de hidratación
          const currentAmount = hydrationData.currentAmount; // en ml
          const dailyTarget = hydrationData.dailyTarget; // en ml
          const remaining = Math.max(0, dailyTarget - currentAmount);
          const percentComplete = Math.round((currentAmount / dailyTarget) * 100);
          
          let title = '¡Recordatorio de hidratación!';
          let body;
          
          // Personalizar el mensaje según el progreso
          if (percentComplete >= 100) {
            body = '¡Felicidades! Has alcanzado tu objetivo de hidratación diaria. Sigue así para mantener una buena salud.';
          } else if (percentComplete >= 75) {
            body = `¡Vas muy bien! Has completado el ${percentComplete}% de tu objetivo. Solo te faltan ${remaining} ml para completar tu meta diaria.`;
          } else if (percentComplete >= 50) {
            body = `Has bebido ${currentAmount} ml de agua hoy. Te faltan ${remaining} ml para alcanzar tu objetivo diario.`;
          } else if (percentComplete >= 25) {
            body = `Has completado el ${percentComplete}% de tu objetivo de hidratación. Recuerda beber ${remaining} ml más para alcanzar tu meta.`;
          } else {
            body = `¡Es importante mantenerse hidratado! Solo has bebido ${currentAmount} ml de los ${dailyTarget} ml recomendados para hoy.`;
          }
          
          await this.displayLocalNotification(
            title, 
            body, 
            { type: 'hydration_reminder' }, 
            `hydration_reminder_${Date.now()}`
          );
          console.log('Notificación de hidratación personalizada enviada');
        } catch (hydrationError) {
          console.error('Error al obtener datos de hidratación:', hydrationError);
          // Fallback si no se pueden obtener los datos de hidratación
          await this.displayLocalNotification(
            '¡Hora de hidratarse!',
            '¿Has bebido suficiente agua hoy? Recuerda mantener una buena hidratación para tu bienestar.',
            { type: 'hydration_reminder' },
            `hydration_reminder_${Date.now()}`
          );
        }
      }
    } catch (error) {
      console.error('Error durante el recordatorio de hidratación:', error);
      try {
        await notifee.displayNotification({
          title: 'Recordatorio de hidratación',
          body: 'Recuerda beber agua regularmente.',
          android: {
            channelId: 'default',
            smallIcon: 'ic_launcher',
          },
        });
      } catch (finalError) {
        console.error('Error en fallback final de hidratación:', finalError);
      }
    } finally {
      // Reprogramar para el día siguiente a las 18:00
      await this.scheduleHydrationReminder();
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
        if (type === EventType.TRIGGER && detail.notification?.data?.type === 'hydration_reminder') {
          console.log('Trigger de hidratación recibido en foreground');
          await this.performHydrationReminder();
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
      
      // Marcar como inicializado
      await AsyncStorage.setItem('notification_service_initialized', 'true');
      
      // Programa una verificación de pasos para las 14:00
      await this.scheduleStepGoalCheck();

      // Programa un recordatorio de hidratación para las 18:00
      await this.scheduleHydrationReminder();
    
      
      // Debug info
      await this.debugNotificationHandlers();
      
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

  // Debug method to check notification handlers and processed events
  async debugNotificationHandlers() {
    try {
      const isInitialized = await AsyncStorage.getItem('notification_service_initialized');
      const triggerId = await AsyncStorage.getItem('step_goal_check_trigger_id');
      const processedEvents = await AsyncStorage.getItem('processedBackgroundEvents');
      const processedMessages = await AsyncStorage.getItem('processedNotifications');
      
      console.log('📊 NOTIFICATION DEBUG INFO:');
      console.log('- Service initialized:', isInitialized);
      console.log('- Background handler registered:', this.backgroundHandlerRegistered);
      console.log('- Current trigger ID:', triggerId);
      console.log('- Processed background events:', processedEvents);
      console.log('- Processed FCM messages:', processedMessages);
      
      return {
        isInitialized,
        backgroundHandlerRegistered: this.backgroundHandlerRegistered,
        triggerId,
        processedEvents: JSON.parse(processedEvents || '[]'),
        processedMessages: JSON.parse(processedMessages || '[]')
      };
    } catch (error) {
      console.error('Error in debug method:', error);
      return { error: error.message };
    }
  }
  
  // Log Notifee event type constants for debugging
  async logEventTypeNames() {
    console.log('Notifee Event Types:');
    console.log('- UNKNOWN:', EventType.UNKNOWN);
    console.log('- FOREGROUND_ACTION:', EventType.FOREGROUND_ACTION);
    console.log('- PRESS:', EventType.PRESS);
    console.log('- DISMISSED:', EventType.DISMISSED);
    console.log('- DELIVERED:', EventType.DELIVERED);
    console.log('- TRIGGER_NOTIFICATION_CREATED:', EventType.TRIGGER_NOTIFICATION_CREATED);
    console.log('- TRIGGER:', EventType.TRIGGER);
  }
}

// Se exporta una instancia única del servicio
const NotificationService = new NotificationServiceClass();
export default NotificationService;
