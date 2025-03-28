import { 
  initialize, 
  requestPermission,
  readRecords
} from 'react-native-health-connect';
import { ActivityCache } from '../cache/ActivityCache';
import { createActivity } from './ActivityService';
import { getBackendActivityType, getExerciseTypeName } from '../utils/ExerciseTypeMapper';
import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';
import { BehaviorSubject } from 'rxjs';

// Control de sincronización
let syncInProgress = false;
let lastSyncTime = 0;
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutos

/**
 * Servicio singleton para manejar la sincronización con Health Connect
 */
class HealthConnectService {
  constructor() {
    this.initialized = false;
    this.token = null;
    this.listeners = new Map();
    this.activeScreens = new Map();
    this.stepsSubject = new BehaviorSubject(0);
    this.heartRateSubject = new BehaviorSubject(null);
    this.lastUpdate = {
      steps: 0,
      heartRate: 0
    };
    this.updateQueue = [];
    this.isProcessingQueue = false;
    this.healthConnectAvailable = false;
    
    // Añadir estas propiedades
    this.savedExerciseIds = [];
    this.savedStepIds = [];
  }
  
  /**
   * Inicializa el servicio con el token del usuario
   */
  async initialize(token) {
    if (this.initialized && this.token === token) {
      return this.healthConnectAvailable;
    }
    
    this.token = token;
    
    try {
      // Inicializar correctamente el cliente de Health Connect
      const isAvailable = await initialize();
      
      if (!isAvailable) {
        console.log('Health Connect no está disponible en este dispositivo');
        this.healthConnectAvailable = false;
        return false;
      }
      
      console.log('Health Connect inicializado correctamente');
      
      // Solicitar permisos si es necesario
      try {
        const granted = await requestPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'HeartRate' },
          { accessType: 'read', recordType: 'ExerciseSession' },
          // Añade aquí otros permisos que necesites
        ]);
        
        if (!granted) {
          console.log('No se otorgaron todos los permisos necesarios');
          this.healthConnectAvailable = false;
          return false;
        }
        
        console.log('Permisos de Health Connect concedidos');
        this.healthConnectAvailable = true;
        this.initialized = true;
        
        // Cargar datos iniciales
        await this.loadInitialData();
        
        return true;
      } catch (permissionError) {
        console.error('Error al solicitar permisos:', permissionError);
        this.healthConnectAvailable = false;
        return false;
      }
    } catch (error) {
      console.error('Error al inicializar Health Connect:', error);
      this.healthConnectAvailable = false;
      return false;
    }
  }
  
  /**
   * Carga los IDs guardados desde el almacenamiento
   */
  async loadSavedIds() {
    try {
      const exerciseIds = await ActivityCache.getSavedExerciseIds();
      const stepIds = await ActivityCache.getSavedStepIds();
      
      console.log(`Cargados ${exerciseIds.length} IDs de ejercicios guardados`);
      console.log(`Cargados ${stepIds.length} IDs de pasos guardados`);
      
      // Asignar a las propiedades de la clase
      this.savedExerciseIds = exerciseIds || [];
      this.savedStepIds = stepIds || [];
      
      return {
        exerciseIds,
        stepIds
      };
    } catch (error) {
      console.error('Error al cargar IDs guardados:', error);
      // Asegurar que al menos tengamos arrays vacíos
      this.savedExerciseIds = [];
      this.savedStepIds = [];
      return { exerciseIds: [], stepIds: [] };
    }
  }
  
  /**
   * Cargar datos iniciales de forma eficiente
   */
  async loadInitialData() {
    try {
      // Implementa tu lógica para cargar datos
      // Por ejemplo:
      const steps = await this.readStepsData();
      const heartRate = await this.readHeartRateData();
      
      // Actualizar solo si hay cambios reales
      if (steps !== this.stepsSubject.getValue()) {
        this.stepsSubject.next(steps);
      }
      
      if (heartRate !== this.heartRateSubject.getValue()) {
        this.heartRateSubject.next(heartRate);
      }
      
      return {
        steps,
        heartRate
      };
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      return null;
    }
  }
  
  /**
   * Suscribirse a actualizaciones
   */
  subscribe(dataType, callback) {
    if (dataType === 'steps') {
      return this.stepsSubject.subscribe(callback);
    } else if (dataType === 'heartRate') {
      return this.heartRateSubject.subscribe(callback);
    }
  }
  
  /**
   * Añade un listener para notificaciones de cambios
   * @param {Function} listener - Función callback (data) => {}
   */
  addListener(callback) {
    const id = Date.now().toString();
    this.listeners.set(id, callback);
    return id;
  }
  
  /**
   * Elimina un listener
   */
  removeListener(callbackOrId) {
    if (typeof callbackOrId === 'string') {
      this.listeners.delete(callbackOrId);
    } else {
      // Buscar por función callback
      for (const [id, cb] of this.listeners.entries()) {
        if (cb === callbackOrId) {
          this.listeners.delete(id);
          break;
        }
      }
    }
  }
  
  /**
   * Notifica a todos los listeners con los datos
   */
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        if (data.steps !== undefined) {
          callback({
            type: 'today-steps',
            steps: data.steps
          });
        }
        
        if (data.heartRate !== undefined) {
          callback({
            type: 'heart-rate',
            heartRate: data.heartRate
          });
        }
      } catch (error) {
        console.error('Error en listener de Health Connect:', error);
      }
    });
  }
  
  /**
   * Verifica si es necesario sincronizar con Health Connect
   */
  shouldSync() {
    const now = Date.now();
    
    // No sincronizar si ya hay una sincronización en progreso
    if (syncInProgress) {
      console.log('Ya hay una sincronización en progreso, ignorando');
      return false;
    }
    
    // No sincronizar si no ha pasado suficiente tiempo desde la última sincronización
    if ((now - lastSyncTime) < SYNC_INTERVAL) {
      console.log(`No ha pasado suficiente tiempo desde la última sincronización (${Math.round((now - lastSyncTime) / 60000)} minutos)`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Sincroniza datos de Health Connect con el backend
   * @param {boolean} force - Forzar sincronización sin importar el tiempo
   */
  async syncWithHealthConnect(force = false) {
    // No sincronizar si no está inicializado o no hay token
    if (!this.initialized || !this.token) {
      console.log('No se puede sincronizar, servicio no inicializado o sin token');
      return false;
    }
    
    // Verificar si debemos sincronizar
    if (!force && !this.shouldSync()) {
      return false;
    }
    
    // Marcar que estamos sincronizando
    syncInProgress = true;
    
    try {
      console.log('Iniciando sincronización con Health Connect...');
      
      // Definir periodo (últimos 60 días)
      const now = new Date();
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(now.getDate() - 60);
      
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: sixtyDaysAgo.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      // Leer sesiones de ejercicio
      const exerciseSessions = await readRecords('ExerciseSession', timeFilter);
      
      if (!exerciseSessions || !exerciseSessions.records || exerciseSessions.records.length === 0) {
        console.log('No se encontraron sesiones de ejercicio en Health Connect');
        syncInProgress = false;
        lastSyncTime = Date.now();
        return false;
      }
      
      console.log(`Recuperadas ${exerciseSessions.records.length} sesiones de ejercicio`);
      
      // Cargar IDs más recientes
      await this.loadSavedIds();
      
      // Verificación de seguridad después de cargar IDs
      if (!Array.isArray(this.savedExerciseIds)) {
        console.warn('savedExerciseIds no es un array, inicializando como array vacío');
        this.savedExerciseIds = [];
      }
      
      // Identificar nuevas actividades
      const newExercises = exerciseSessions.records.filter(exercise => {
        const exerciseId = exercise.metadata ? exercise.metadata.id : null;
        
        // Filtrar ejercicios sin ID
        if (!exerciseId) return false;
        
        // Filtrar ejercicios ya guardados
        return !this.savedExerciseIds.includes(exerciseId);
      });
      
      if (newExercises.length === 0) {
        console.log('No hay nuevas actividades para guardar');
        syncInProgress = false;
        lastSyncTime = Date.now();
        return true;
      }
      
      console.log(`Se encontraron ${newExercises.length} nuevas actividades para guardar`);
      
      // Guardar nuevas actividades
      let newActivitiesCreated = 0;
      
      for (const exercise of newExercises) {
        try {
          const exerciseId = exercise.metadata ? exercise.metadata.id : null;
          if (!exerciseId) continue;
          
          // Verificación final antes de guardar
          if (this.savedExerciseIds.includes(exerciseId)) continue;
          
          // Mapear tipo
          const backendType = exercise.exerciseType ? 
            getBackendActivityType(exercise.exerciseType) : 
            'OTHER';
          
          // Calcular duración en minutos
          let durationMinutes = null;
          if (exercise.duration && !isNaN(exercise.duration)) {
            durationMinutes = Math.round(exercise.duration / 60000000);
          } else if (exercise.startTime && exercise.endTime) {
            const start = new Date(exercise.startTime);
            const end = new Date(exercise.endTime);
            durationMinutes = Math.round((end - start) / 60000);
          }
          
          const validDuration = durationMinutes && durationMinutes > 0 ? durationMinutes : 30;
          
          // Descripción
          const readableName = exercise.exerciseType ? 
            getExerciseTypeName(exercise.exerciseType) : 
            'Ejercicio';
            
          const description = exercise.notes && exercise.notes.trim() !== '' 
            ? exercise.notes 
            : `Sesión de ${readableName.toLowerCase()} registrada con Health Connect`;
          
          // Crear objeto para enviar al backend
          const activityToSave = {
            type: backendType,
            duration: validDuration,
            date: exercise.startTime,
            description: description,
            origin: 'HEALTH_CONNECT',
            externalId: exerciseId
          };
          
          console.log(`Intentando guardar actividad: ${exerciseId} (tipo: ${backendType})`);
          
          const result = await createActivity(this.token, activityToSave);
          
          // Guardar ID en la lista de IDs guardados
          this.savedExerciseIds.push(exerciseId);
          await ActivityCache.saveExerciseId(exerciseId);
          
          newActivitiesCreated++;
          console.log(`Actividad guardada correctamente: ${exerciseId}`);
        } catch (error) {
          // Si el error es por duplicado, marcar el ID como guardado
          if (error.response?.status === 400) {
            const errorData = error.response?.data || {};
            const errorString = JSON.stringify(errorData);
            
            if (errorString.includes('duplicated') || 
                errorString.includes('ya existe') || 
                errorString.includes('already exists')) {
              
              console.log(`Actividad ${exercise.metadata?.id} ya existe en el backend, marcando como guardada`);
              
              // Marcar el ID como guardado
              this.savedExerciseIds.push(exercise.metadata?.id);
              await ActivityCache.saveExerciseId(exercise.metadata?.id);
            } else {
              console.error(`Error al guardar actividad: ${error.message}`, error.response?.data);
            }
          } else {
            console.error(`Error al guardar actividad: ${error.message}`);
          }
        }
      }
      
      // Notificar a los listeners si se crearon nuevas actividades
      if (newActivitiesCreated > 0) {
        console.log(`Se guardaron ${newActivitiesCreated} nuevas actividades`);
        ActivityCache.invalidateCache();
        this.notifyListeners({ 
          type: 'new-activities', 
          count: newActivitiesCreated 
        });
      }
      
      // Actualizar tiempo de última sincronización
      lastSyncTime = Date.now();
      activityStorage.set(STORAGE_KEYS.HEALTH_CONNECT_LAST_FETCH, lastSyncTime.toString());
      
      console.log('Sincronización completada con éxito');
      return true;
    } catch (error) {
      console.error('Error durante la sincronización con Health Connect:', error);
      return false;
    } finally {
      // Asegurarse de marcar que ya no estamos sincronizando
      syncInProgress = false;
    }
  }
  
  /**
   * Obtiene datos actuales de Health Connect para mostrar (sin sincronizar)
   */
  async getCurrentData() {
    return {
      steps: this.stepsSubject.getValue(),
      heartRate: this.heartRateSubject.getValue()
    };
  }
  
  // Implementa tus métodos para leer datos específicos
  async readStepsData() {
    try {
      if (!this.healthConnectAvailable) {
        return 0;
      }
      
      // Filtrar para obtener los pasos de hoy
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      const stepsResponse = await readRecords('Steps', timeFilter);
      
      // Sumar todos los pasos del día
      if (stepsResponse && stepsResponse.records && stepsResponse.records.length > 0) {
        const totalSteps = stepsResponse.records.reduce((total, record) => {
          return total + (record.count || 0);
        }, 0);
        
        return totalSteps;
      }
      
      return 0;
    } catch (error) {
      console.error('Error al leer datos de pasos:', error);
      return 0;
    }
  }
  
  async readHeartRateData() {
    try {
      if (!this.healthConnectAvailable) {
        return null;
      }
      
      // Obtener la última lectura de frecuencia cardíaca
      const now = new Date();
      const oneHourAgo = new Date(now);
      oneHourAgo.setHours(now.getHours() - 1);
      
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: oneHourAgo.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      const heartRateResponse = await readRecords('HeartRate', timeFilter);
      
      if (heartRateResponse && heartRateResponse.records && heartRateResponse.records.length > 0) {
        // Ordenar por tiempo para obtener la más reciente
        const sortedRecords = [...heartRateResponse.records].sort((a, b) => {
          return new Date(b.time) - new Date(a.time);
        });
        
        // Devolver la última medición
        return sortedRecords[0].beatsPerMinute || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error al leer datos de frecuencia cardíaca:', error);
      return null;
    }
  }

  // Registrar pantalla activa con prioridad
  registerActiveScreen(screenName, options = { priority: 'normal' }) {
    this.activeScreens.set(screenName, {
      timestamp: Date.now(),
      priority: options.priority
    });
    
    // Programar actualización inicial si es de alta prioridad
    if (options.priority === 'high') {
      this.requestSilentUpdate(screenName);
    }
  }

  unregisterActiveScreen(screenName) {
    this.activeScreens.delete(screenName);
  }

  // Solicitar actualización inmediata
  async requestUpdate(screenName) {
    this.queueUpdate({
      screenName,
      silent: false,
      priority: 'high'
    });
    
    return this.processUpdateQueue();
  }

  // Solicitar actualización silenciosa (sin loading indicators)
  async requestSilentUpdate(screenName) {
    this.queueUpdate({
      screenName,
      silent: true,
      priority: 'normal'
    });
    
    return this.processUpdateQueue();
  }

  // Poner actualización en cola
  queueUpdate(updateRequest) {
    // Verificar si ya existe una solicitud similar
    const existingIndex = this.updateQueue.findIndex(
      req => req.screenName === updateRequest.screenName
    );
    
    if (existingIndex >= 0) {
      // Si la nueva solicitud es de mayor prioridad, actualizar la existente
      if (updateRequest.priority === 'high') {
        this.updateQueue[existingIndex] = updateRequest;
      }
    } else {
      // Añadir nueva solicitud
      this.updateQueue.push(updateRequest);
    }
  }

  // Procesar cola de actualizaciones
  async processUpdateQueue() {
    if (this.isProcessingQueue || this.updateQueue.length === 0) {
      return;
    }
    
    try {
      this.isProcessingQueue = true;
      
      // Ordenar por prioridad
      this.updateQueue.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return 0;
      });
      
      // Obtener y eliminar la primera solicitud
      const request = this.updateQueue.shift();
      
      // Comprobar tiempo desde última actualización
      const now = Date.now();
      const timeSinceLastStepsUpdate = now - this.lastUpdate.steps;
      const timeSinceLastHeartRateUpdate = now - this.lastUpdate.heartRate;
      
      let updatedData = {};
      
      // Actualizar pasos solo si han pasado al menos 30 segundos
      if (timeSinceLastStepsUpdate > 30000) {
        const steps = await this.readStepsData();
        if (steps !== this.stepsSubject.getValue()) {
          this.stepsSubject.next(steps);
          this.lastUpdate.steps = now;
          updatedData.steps = steps;
        }
      }
      
      // Actualizar frecuencia cardíaca solo si han pasado al menos 30 segundos
      if (timeSinceLastHeartRateUpdate > 30000) {
        const heartRate = await this.readHeartRateData();
        if (heartRate !== this.heartRateSubject.getValue()) {
          this.heartRateSubject.next(heartRate);
          this.lastUpdate.heartRate = now;
          updatedData.heartRate = heartRate;
        }
      }
      
      // Notificar a los listeners sobre los cambios
      if (Object.keys(updatedData).length > 0) {
        this.notifyListeners(updatedData);
      }
      
      return updatedData;
    } catch (error) {
      console.error('Error al procesar cola de actualizaciones:', error);
    } finally {
      this.isProcessingQueue = false;
      
      // Procesar siguiente solicitud si existe
      if (this.updateQueue.length > 0) {
        setTimeout(() => this.processUpdateQueue(), 500);
      }
    }
  }
}

// Crear una instancia única del servicio
const healthConnectService = new HealthConnectService();

export default healthConnectService; 