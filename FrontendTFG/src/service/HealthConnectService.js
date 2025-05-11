import { 
  initialize, 
  requestPermission,
  readRecords
} from 'react-native-health-connect';
import { ActivityCache } from '../cache/ActivityCache';
import { SleepCache } from '../cache/SleepCache';
import { createActivity } from './ActivityService';
import { getBackendActivityType, getExerciseTypeName } from '../utils/ExerciseTypeMapper';
import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';
import { BehaviorSubject } from 'rxjs';
import { saveSleepData } from './SleepService';
import { saveDailySteps } from './StepService';

// Control de sincronización
let syncInProgress = false;
let lastSyncTime = 0;
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutos

// Actualizar las constantes para que coincidan exactamente con la documentación oficial
export const SLEEP_STAGES = {
  UNKNOWN: 0,
  AWAKE: 1,
  SLEEPING: 2,
  OUT_OF_BED: 3,
  LIGHT: 4,
  DEEP: 5,
  REM: 6,
  AWAKE_IN_BED: 7
};

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
    
    // Añadir BehaviorSubject para los datos del sueño
    this.sleepDataSubject = new BehaviorSubject(null);
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
  // In the notifyListeners method, update to include step data properly
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        if (data.steps !== undefined) {
          callback({
            type: 'today-steps',
            steps: data.steps,
            date: new Date(),  // Add date for consistency
            duration: 0        // Add duration for consistency
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
      
      // Sincronizar datos de ejercicio
      await this.syncExerciseSessions(timeFilter);
      
      // Sincronizar datos de sueño
      await this.syncSleepSessions(timeFilter,true);
      
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
  
  // Método para sincronizar sesiones de ejercicio
  async syncExerciseSessions(timeFilter) {
    try {
      // Leer sesiones de ejercicio
      const exerciseSessions = await readRecords('ExerciseSession', timeFilter);
      
      if (!exerciseSessions || !exerciseSessions.records || exerciseSessions.records.length === 0) {
        console.log('No se encontraron sesiones de ejercicio en Health Connect');
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
      
      return true;
    } catch (error) {
      console.error('Error durante la sincronización de ejercicios:', error);
      return false;
    }
  }
  
  // Método para sincronizar sesiones de sueño
  
async syncSleepSessions(timeFilter, forceRefresh = false) {
  try {
    console.log('Sincronizando sesiones de sueño...');
    
    // Si se solicita forzar actualización, limpiar IDs guardados
    if (forceRefresh) {
      await SleepCache.clearSavedSleepIds();
      console.log('IDs de sueño guardados borrados para forzar actualización');
    }
    
    // Cargar IDs guardados para evitar duplicados
    const savedSleepIds = await SleepCache.getSavedSleepIds();
    console.log(`IDs de sueño ya guardados: ${savedSleepIds.length}`);
    
    // Leer datos de sueño de Health Connect
    const sleepResponse = await readRecords('SleepSession', timeFilter);
    
    if (sleepResponse?.records?.length > 0) {
      console.log(`Recuperadas ${sleepResponse.records.length} sesiones de sueño`);
      
      // Contador para nuevas sesiones
      let newSessions = 0;
      
      // Procesar cada registro de sueño
      for (const sleepRecord of sleepResponse.records) {
        // Verificar si ya hemos procesado este registro
        const sleepId = sleepRecord.metadata?.id;
        if (!sleepId) {
          console.log('Registro de sueño sin ID, omitiendo');
          continue;
        }
        
        if (savedSleepIds.includes(sleepId)) {
          console.log(`Registro de sueño ${sleepId} ya procesado, omitiendo`);
          continue; // Ya procesado, omitir
        }
        
        console.log(`Procesando nuevo registro de sueño: ${sleepId}`);
        
        // Procesar y guardar la sesión de sueño
        const sleepData = this.processSleepRecord(sleepRecord);
        
        // Guardar en el backend
        if (this.token) {
          try {
            const response = await saveSleepData(this.token, sleepData);
            console.log(`Sesión de sueño guardada en backend: ${sleepId}`, response);
            
            // Solo guardar el ID como procesado si se guardó correctamente
            SleepCache.saveSleepId(sleepId);
            
            // También guardar en caché local
            const sleepDate = new Date(sleepRecord.startTime).toISOString().split('T')[0];
            SleepCache.saveSleepData(sleepData, sleepDate);
            
            newSessions++;
          } catch (error) {
            // Verificar si el error es por duplicado
            if (error.response?.status === 400) {
              const errorData = error.response?.data || {};
              const errorString = JSON.stringify(errorData);
              
              if (errorString.includes('duplicated') || 
                  errorString.includes('ya existe') || 
                  errorString.includes('already exists')) {
                
                console.log(`Sesión de sueño ${sleepId} ya existe en el backend, marcando como guardada`);
                
                // Marcar el ID como guardado solo si ya existe en el backend
                SleepCache.saveSleepId(sleepId);
              } else {
                console.error(`Error al guardar sesión de sueño: ${error.message}`, error.response?.data);
              }
            } else {
              console.error('Error al guardar datos de sueño:', error);
              // NO guardamos el ID como procesado si hubo un error
            }
          }
        }
      }
      
      console.log(`Se guardaron ${newSessions} nuevas sesiones de sueño`);
      
      // Si se guardaron nuevas sesiones, invalidar la caché
      if (newSessions > 0) {
        SleepCache.invalidateCache();
      }
    } else {
      console.log('No hay sesiones de sueño para procesar');
    }
    
    return true;
  } catch (error) {
    console.error('Error sincronizando sesiones de sueño:', error);
    return false;
  }
}

  
  // Método auxiliar para procesar un registro de sueño
  processSleepRecord(sleepRecord) {
    // Calcular duración total
    const startTime = new Date(sleepRecord.startTime);
    const endTime = new Date(sleepRecord.endTime);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  
    const stages = sleepRecord.stages || [];
    
    // Inicializar resumen de etapas
    const stagesSummary = {
      deepSleep: 0,
      lightSleep: 0,
      remSleep: 0,
      awake: 0,
      awakeInBed: 0,  // Añadir esta nueva propiedad
      totalSleep: 0
    };
  
    // Procesar las etapas
    const processedStages = stages.map(stage => {
      const stageStartTime = new Date(stage.startTime);
      const stageEndTime = new Date(stage.endTime);
      const stageDuration = (stageEndTime - stageStartTime) / (1000 * 60 * 60);
      const stageType = parseInt(stage.stage || stage.type, 10);
  
      // Actualizar resumen según el tipo
      switch (stageType) {
        case SLEEP_STAGES.DEEP:
          stagesSummary.deepSleep += stageDuration;
          break;
        case SLEEP_STAGES.LIGHT:
          stagesSummary.lightSleep += stageDuration;
          break;
        case SLEEP_STAGES.REM:
          stagesSummary.remSleep += stageDuration;
          break;
        case SLEEP_STAGES.AWAKE:
          stagesSummary.awake += stageDuration;
          break;
        case SLEEP_STAGES.AWAKE_IN_BED:
          stagesSummary.awakeInBed += stageDuration;  // Usar la nueva propiedad
          break;
        case SLEEP_STAGES.SLEEPING:
          stagesSummary.lightSleep += stageDuration; // Consideramos sueño genérico como ligero
          break;
      }
  
      // Actualizar tiempo total de sueño
      if (stageType !== SLEEP_STAGES.AWAKE && stageType !== SLEEP_STAGES.OUT_OF_BED && stageType !== SLEEP_STAGES.AWAKE_IN_BED) {
        stagesSummary.totalSleep += stageDuration;
      }
  
      return {
        stage: this.getStageName(stageType),
        startTime: stageStartTime,
        endTime: stageEndTime,
        duration: stageEndTime - stageStartTime,
        originalType: stageType
      };
    });
  
    // Calcular calidad del sueño
    const quality = this.calculateSleepQuality(stagesSummary, durationHours);
  
    return {
      durationHours: parseFloat(durationHours.toFixed(1)),
      startTime,
      endTime,
      stages: processedStages,
      stagesSummary,
      quality,
      externalId: sleepRecord.metadata?.id,
      hasDetailedStages: stages.some(stage => {
        const type = parseInt(stage.stage || stage.type, 10);
        return type === SLEEP_STAGES.DEEP || type === SLEEP_STAGES.LIGHT || type === SLEEP_STAGES.REM;
      })
    };
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
      const sixHoursAgo = new Date(now);
      sixHoursAgo.setHours(now.getHours() - 6); // Ampliar la ventana a 6 horas
      
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: sixHoursAgo.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      // Añadir logs para diagnóstico
      console.log('Buscando datos de ritmo cardíaco entre', sixHoursAgo.toISOString(), 'y', now.toISOString());
      
      const heartRateResponse = await readRecords('HeartRate', timeFilter);
      
      // Añadir más información de diagnóstico
      console.log('Respuesta de HeartRate recibida:', 
        heartRateResponse ? 
        `${heartRateResponse.records ? heartRateResponse.records.length : 0} registros` : 
        'sin datos');
      
      if (heartRateResponse && heartRateResponse.records && heartRateResponse.records.length > 0) {
        // Imprimir la estructura del primer registro para depuración
        console.log('Primer registro HeartRate:', JSON.stringify(heartRateResponse.records[0]));
        
        // Ordenar por tiempo para obtener la más reciente
        const sortedRecords = [...heartRateResponse.records].sort((a, b) => {
          return new Date(b.time || b.endTime || b.startTime) - new Date(a.time || a.endTime || a.startTime);
        });
        
        // Buscar el valor del ritmo cardíaco probando diferentes estructuras de datos
        const firstRecord = sortedRecords[0];
        
        // Manejar diferentes estructuras posibles
        let heartRate = null;
        
        if (firstRecord.beatsPerMinute) {
          heartRate = firstRecord.beatsPerMinute;
        } else if (firstRecord.samples && firstRecord.samples.length > 0) {
          // Algunas implementaciones devuelven muestras
          heartRate = firstRecord.samples[0].beatsPerMinute || firstRecord.samples[0].value;
        } else if (firstRecord.value) {
          // Otras implementaciones usan value
          heartRate = firstRecord.value;
        } else if (firstRecord.heartRate) {
          // Otro posible nombre
          heartRate = firstRecord.heartRate;
        }
        
        console.log('Ritmo cardíaco encontrado:', heartRate);
        return heartRate;
      }
      
      console.log('No se encontraron datos de ritmo cardíaco recientes');
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

// Modify the processUpdateQueue method to save steps when updated
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
        
        // Guardar los pasos en el backend si hay token disponible
        if (this.token) {
          try {
            // Crear objeto de datos de pasos
            const stepData = {
              steps: steps,
              date: new Date(),
              duration: 0 // Podemos establecer duración a 0 ya que son pasos acumulados
            };
            
            // Guardar en el backend
            await saveDailySteps(this.token, stepData);
            console.log('Datos de pasos guardados en el backend:', steps);
          } catch (saveError) {
            console.error('Error al guardar datos de pasos en el backend:', saveError);
          }
        }
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

// Also update the loadInitialData method to save initial step data
async loadInitialData() {
  try {
    // Implementa tu lógica para cargar datos
    // Por ejemplo:
    const steps = await this.readStepsData();
    const heartRate = await this.readHeartRateData();
    
    // Actualizar solo si hay cambios reales
    if (steps !== this.stepsSubject.getValue()) {
      this.stepsSubject.next(steps);
      
      // Guardar los pasos iniciales en el backend si hay token disponible
      if (this.token && steps > 0) {
        try {
          const stepData = {
            steps: steps,
            date: new Date(),
            duration: 0
          };
          
          await saveDailySteps(this.token, stepData);
          console.log('Datos iniciales de pasos guardados en el backend:', steps);
        } catch (saveError) {
          console.error('Error al guardar datos iniciales de pasos:', saveError);
        }
      }
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

  // Método para obtener el observable de datos del sueño
  getSleepDataObservable() {
    return this.sleepDataSubject.asObservable();
  }

  // Modificar el método readSleepData para que actualice el subject
  async readSleepData() {
    try {
      if (!this.healthConnectAvailable) {
        console.log('Health Connect no está disponible');
        return;
      }
      
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const timeFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: yesterday.toISOString(),
          endTime: now.toISOString(),
        }
      };
      
      const sleepResponse = await readRecords('SleepSession', timeFilter);
      console.log('Sleep Response:', JSON.stringify(sleepResponse, null, 2));
      
      if (sleepResponse?.records?.length > 0) {
        // Cargar IDs de sueño guardados
        const savedSleepIds = await SleepCache.getSavedSleepIds();
        
        // Procesar cada registro de sueño
        for (const sleepRecord of sleepResponse.records) {
          // Verificar si ya hemos procesado este registro
          const sleepId = sleepRecord.metadata?.id;
          if (sleepId && savedSleepIds.includes(sleepId)) {
            console.log(`Registro de sueño ${sleepId} ya procesado, omitiendo`);
            continue;
          }
          
          // Calcular duración total
          const startTime = new Date(sleepRecord.startTime);
          const endTime = new Date(sleepRecord.endTime);
          const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  
          const stages = sleepRecord.stages || [];
          
          // Inicializar resumen de etapas
          const stagesSummary = {
            deepSleep: 0,
            lightSleep: 0,
            remSleep: 0,
            awake: 0,
            totalSleep: 0
          };
  
          // Procesar las etapas
          const processedStages = stages.map(stage => {
            const stageStartTime = new Date(stage.startTime);
            const stageEndTime = new Date(stage.endTime);
            const stageDuration = (stageEndTime - stageStartTime) / (1000 * 60 * 60);
            const stageType = parseInt(stage.stage || stage.type, 10);
  
            // Actualizar resumen según el tipo
            switch (stageType) {
              case SLEEP_STAGES.DEEP:
                stagesSummary.deepSleep += stageDuration;
                break;
              case SLEEP_STAGES.LIGHT:
                stagesSummary.lightSleep += stageDuration;
                break;
              case SLEEP_STAGES.REM:
                stagesSummary.remSleep += stageDuration;
                break;
              case SLEEP_STAGES.AWAKE:
              case SLEEP_STAGES.AWAKE_IN_BED:
                stagesSummary.awake += stageDuration;
                break;
              case SLEEP_STAGES.SLEEPING:
                stagesSummary.lightSleep += stageDuration; // Consideramos sueño genérico como ligero
                break;
            }
  
            // Actualizar tiempo total de sueño
            if (stageType !== SLEEP_STAGES.AWAKE && stageType !== SLEEP_STAGES.OUT_OF_BED) {
              stagesSummary.totalSleep += stageDuration;
            }
  
            return {
              stage: this.getStageName(stageType),
              startTime: stageStartTime,
              endTime: stageEndTime,
              duration: stageEndTime - stageStartTime,
              originalType: stageType
            };
          });
  
          // Calcular calidad del sueño
          const quality = this.calculateSleepQuality(stagesSummary, durationHours);
  
          const sleepData = {
            durationHours: parseFloat(durationHours.toFixed(1)),
            startTime,
            endTime,
            stages: processedStages,
            stagesSummary,
            quality,
            externalId: sleepId,
            hasDetailedStages: stages.some(stage => {
              const type = parseInt(stage.stage || stage.type, 10);
              return type === SLEEP_STAGES.DEEP || type === SLEEP_STAGES.LIGHT || type === SLEEP_STAGES.REM;
            })
          };
  
          // Guardar los datos en el backend
          if (this.token) {
            try {
              const response = await saveSleepData(this.token, sleepData);
              console.log('Datos de sueño guardados exitosamente en el backend', response);
              
              // Solo guardar el ID como procesado si se guardó correctamente
              if (sleepId) {
                await SleepCache.saveSleepId(sleepId);
              }
              
              // Guardar en caché local
              const sleepDate = startTime.toISOString().split('T')[0];
              await SleepCache.saveSleepData(sleepData, sleepDate);
              
            } catch (error) {
              console.error('Error al guardar datos de sueño:', error);
              // No interrumpimos el flujo si falla el guardado
              // Pero tampoco marcamos el ID como procesado
            }
          }
  
          // Emitir los datos a través del BehaviorSubject
          this.sleepDataSubject.next(sleepData);
        }
        
        // Devolver el último registro procesado para compatibilidad
        const lastSleepData = this.sleepDataSubject.getValue();
        return lastSleepData;
      }
      
      this.sleepDataSubject.next(null);
      return null;
    } catch (error) {
      console.error('Error al leer datos de sueño:', error);
      this.sleepDataSubject.next(null);
      return null;
    }
  }

  async clearSavedSleepIds() {
    try {
      await SleepCache.clearSavedSleepIds();
      console.log('IDs de sueño guardados borrados correctamente');
      return true;
    } catch (error) {
      console.error('Error al borrar IDs de sueño guardados:', error);
      return false;
    }
  }

  calculateBasicSleepQuality(durationHours, hasREM) {
    let quality = 70; // Base quality

    // Ajustar por duración
    if (durationHours >= 7 && durationHours <= 9) quality += 15;
    else if (durationHours < 6 || durationHours > 10) quality -= 15;
    
    // Bonus por tener datos REM
    if (hasREM) quality += 10;

    return Math.min(Math.max(Math.round(quality), 0), 100);
  }

  getStageName(stageType) {
    // Asegurarnos de que stageType es un número
    const stage = parseInt(stageType, 10);
    
    switch (stage) {
      case SLEEP_STAGES.UNKNOWN:
        return 'UNKNOWN';
      case SLEEP_STAGES.AWAKE:
        return 'AWAKE';
      case SLEEP_STAGES.SLEEPING:
        return 'SLEEPING';
      case SLEEP_STAGES.OUT_OF_BED:
        return 'OUT_OF_BED';
      case SLEEP_STAGES.LIGHT:
        return 'LIGHT';
      case SLEEP_STAGES.DEEP:
        return 'DEEP';
      case SLEEP_STAGES.REM:
        return 'REM';
      case SLEEP_STAGES.AWAKE_IN_BED:
        return 'AWAKE_IN_BED';  // Nombre diferenciado
      default:
        return 'UNKNOWN';
    }
  }

  calculateSleepQuality(stagesSummary, totalSleepTime) {
    if (totalSleepTime === 0) return 0;

    // Porcentajes ideales aproximados
    const deepSleepPercent = (stagesSummary.deepSleep / totalSleepTime) * 100;
    const remSleepPercent = (stagesSummary.remSleep / totalSleepTime) * 100;
    const awakePenalty = (stagesSummary.awake / totalSleepTime) * 100;

    // Base score
    let quality = 70;

    // Bonificaciones por sueño profundo y REM
    if (deepSleepPercent >= 20) quality += 15;
    if (remSleepPercent >= 20) quality += 15;

    // Penalización por tiempo despierto
    quality -= Math.min(awakePenalty, 30);

    return Math.min(Math.max(Math.round(quality), 0), 100);
  }
}

// Crear una instancia única del servicio
const healthConnectService = new HealthConnectService();

export default healthConnectService;