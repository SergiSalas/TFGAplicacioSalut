import { 
  initialize, 
  requestPermission,
  readRecords
} from 'react-native-health-connect';
import { ActivityCache } from '../cache/ActivityCache';
import { createActivity } from './ActivityService';
import { getBackendActivityType, getExerciseTypeName } from '../utils/ExerciseTypeMapper';
import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';

// Control de sincronización
let syncInProgress = false;
let lastSyncTime = 0;
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutos

/**
 * Servicio singleton para manejar la sincronización con Health Connect
 */
class HealthConnectService {
  constructor() {
    this.isInitialized = false;
    this.token = null;
    this.savedExerciseIds = [];
    this.savedStepIds = [];
    this.listeners = [];
    this.updateIntervalId = null;
    this.updateInterval = 15000; // Reducir a 15 segundos en lugar de 60 segundos
    this.activeScreens = new Set(); // Nuevo: para rastrear qué pantallas están activas
  }
  
  /**
   * Inicializa el servicio con el token del usuario
   */
  async initialize(token) {
    if (!token) return false;
    
    this.token = token;
    
    try {
      // Inicializar Health Connect
      const isAvailable = await initialize();
      if (!isAvailable) {
        console.log('Health Connect no está disponible');
        return false;
      }
      
      // Solicitar permisos (añadir HeartRate)
      const permissions = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'ExerciseSession' },
        { accessType: 'read', recordType: 'HeartRate' }, // Añadido permiso de ritmo cardíaco
        { accessType: 'write', recordType: 'ExerciseSession' }
      ]);
      
      if (permissions.length === 0) {
        console.log('No se obtuvieron permisos para Health Connect');
        return false;
      }
      
      // Cargar IDs de ejercicios ya guardados
      await this.loadSavedIds();
      
      this.isInitialized = true;
      console.log('HealthConnectService inicializado correctamente');
      
      // Iniciar actualizaciones periódicas
      this.startPeriodicUpdates();
      
      return true;
    } catch (error) {
      console.error('Error al inicializar HealthConnectService:', error);
      return false;
    }
  }
  
  /**
   * Carga los IDs guardados desde el almacenamiento
   */
  async loadSavedIds() {
    try {
      this.savedExerciseIds = await ActivityCache.getSavedExerciseIds();
      this.savedStepIds = await ActivityCache.getSavedStepIds();
      
      console.log(`Cargados ${this.savedExerciseIds.length} IDs de ejercicios guardados`);
      console.log(`Cargados ${this.savedStepIds.length} IDs de pasos guardados`);
      
      return {
        exerciseIds: this.savedExerciseIds,
        stepIds: this.savedStepIds
      };
    } catch (error) {
      console.error('Error al cargar IDs guardados:', error);
      return { exerciseIds: [], stepIds: [] };
    }
  }
  
  /**
   * Añade un listener para notificaciones de cambios
   * @param {Function} listener - Función callback (data) => {}
   */
  addListener(listener) {
    if (typeof listener === 'function' && !this.listeners.includes(listener)) {
      this.listeners.push(listener);
      return true;
    }
    return false;
  }
  
  /**
   * Elimina un listener
   */
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Notifica a todos los listeners con los datos
   */
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error en listener de HealthConnectService:', error);
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
    if (!this.isInitialized || !this.token) {
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
    if (!this.isInitialized) {
      return { steps: 0, heartRate: null, calories: 0 };
    }
    
    try {
      // Período para hoy (para datos de hoy)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: new Date().toISOString(),
        }
      };
      
      // MODIFICACIÓN: Incluir lectura de calorías activas quemadas
      const [todayStepsData, heartRateData, caloriesData] = await Promise.all([
        readRecords('Steps', todayFilter),
        readRecords('HeartRate', {
          ...todayFilter,
          limit: 5,
          ascendingOrder: false
        }),
        readRecords('ActiveCaloriesBurned', todayFilter) // Añadir esta línea
      ]);
      
      // Calcular pasos totales de hoy
      const stepsToday = todayStepsData && todayStepsData.records 
        ? todayStepsData.records.reduce((sum, step) => sum + step.count, 0) 
        : 0;
      
      // Calcular calorías quemadas hoy
      const caloriesToday = caloriesData && caloriesData.records
        ? caloriesData.records.reduce((sum, record) => sum + record.energy.inKilocalories, 0)
        : 0;
      
      // ¡NECESITAMOS DECLARAR ESTA VARIABLE AQUÍ, FUERA DEL BLOQUE IF!
      let latestHeartRate = null;
      
      // Mejorar la lógica para obtener el ritmo cardíaco más reciente
      if (heartRateData && heartRateData.records && heartRateData.records.length > 0) {
        // Ya tenemos los registros ordenados de más reciente a más antiguo
        
        // Verificar todas las lecturas hasta encontrar una válida
        for (const record of heartRateData.records) {
          if (record.samples && record.samples.length > 0) {
            // Obtener el ritmo cardíaco más reciente
            latestHeartRate = record.samples[0].beatsPerMinute;
            console.log('Ritmo cardíaco encontrado:', latestHeartRate, 'BPM a las', new Date(record.time).toLocaleTimeString());
            
            // Notificar a los listeners
            this.notifyListeners({
              type: 'heart-rate',
              heartRate: latestHeartRate,
              timestamp: record.time
            });
            
            // Salir del bucle una vez encontrado
            break;
          }
        }
        
        if (!latestHeartRate) {
          console.log('No se encontraron muestras válidas en los registros de ritmo cardíaco');
        }
      } else {
        console.log('No se encontraron registros de ritmo cardíaco');
      }
      
      // Notificar a los listeners sobre pasos actualizados
      this.notifyListeners({
        type: 'today-steps',
        steps: stepsToday
      });
      
      // Notificar a los listeners sobre calorías
      this.notifyListeners({
        type: 'calories',
        calories: caloriesToday
      });
      
      return { 
        steps: stepsToday,
        heartRate: latestHeartRate,
        calories: caloriesToday // Incluir calorías en el retorno
      };
    } catch (error) {
      console.error('Error al obtener datos actuales de Health Connect:', error);
      return { steps: 0, heartRate: null, calories: 0 };
    }
  }
  
  // Añadir esta función para iniciar actualizaciones periódicas
  startPeriodicUpdates() {
    // Limpiar cualquier intervalo existente antes de crear uno nuevo
    this.stopPeriodicUpdates();
    
    // Crear un nuevo intervalo de actualización
    this.updateIntervalId = setInterval(async () => {
      if (this.isInitialized && this.token) {
        try {
          console.log('Ejecutando actualización periódica de datos de salud...');
          await this.getCurrentData();
        } catch (error) {
          console.error('Error en actualización periódica:', error);
        }
      }
    }, this.updateInterval);
    
    console.log(`Actualizaciones periódicas iniciadas (cada ${this.updateInterval/1000} segundos)`);
  }
  
  // Función para detener actualizaciones periódicas
  stopPeriodicUpdates() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
      console.log('Actualizaciones periódicas detenidas');
    }
  }
  
  // Asegurarse de limpiar al desconectar
  disconnect() {
    this.stopPeriodicUpdates();
    this.listeners = [];
    this.isInitialized = false;
  }

  // Añadir métodos para rastrear qué pantallas están activas
  registerActiveScreen(screenId) {
    this.activeScreens.add(screenId);
    // Si es la primera pantalla activa, aumentar la frecuencia
    if (this.activeScreens.size === 1) {
      this.increaseUpdateFrequency();
    }
    console.log(`Pantalla ${screenId} registrada como activa. Pantallas activas: ${this.activeScreens.size}`);
  }

  unregisterActiveScreen(screenId) {
    this.activeScreens.delete(screenId);
    // Si no quedan pantallas activas, reducir la frecuencia
    if (this.activeScreens.size === 0) {
      this.decreaseUpdateFrequency();
    }
    console.log(`Pantalla ${screenId} desregistrada. Pantallas activas: ${this.activeScreens.size}`);
  }

  // Método para aumentar frecuencia cuando hay pantallas activas
  increaseUpdateFrequency() {
    this.stopPeriodicUpdates();
    this.updateInterval = 5000; // 5 segundos cuando hay pantallas con datos visibles
    this.startPeriodicUpdates();
    console.log('Frecuencia de actualización aumentada a 5 segundos');
  }

  // Método para reducir frecuencia cuando no hay pantallas activas
  decreaseUpdateFrequency() {
    this.stopPeriodicUpdates();
    this.updateInterval = 15000; // 15 segundos en segundo plano
    this.startPeriodicUpdates();
    console.log('Frecuencia de actualización reducida a 15 segundos');
  }

  // Modificar el método para obtener datos inmediatamente
  async requestImmediateUpdate() {
    if (this.isInitialized && this.token) {
      console.log('Solicitando actualización inmediata de datos de salud...');
      return await this.getCurrentData();
    }
    return null;
  }

  // Añadir este nuevo método
  async refreshHeartRateData() {
    if (!this.isInitialized) return null;
    
    try {
      console.log('Solicitando actualización explícita de ritmo cardíaco');
      
      // Leer solo datos de ritmo cardíaco
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayFilter = {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: new Date().toISOString(),
        }
      };
      
      const heartRateData = await readRecords('HeartRate', todayFilter);
      console.log(`Datos de ritmo cardíaco: ${heartRateData?.records?.length || 0} registros`);
      
      if (heartRateData && heartRateData.records && heartRateData.records.length > 0) {
        // Inspeccionar la estructura de los primeros datos de ritmo cardíaco
        console.log('Estructura del primer registro de ritmo cardíaco:');
        console.log(JSON.stringify(heartRateData.records[0], null, 2));
        
        const record = heartRateData.records[0];
        if (record.samples && record.samples.length > 0) {
          const latestHeartRate = record.samples[0].beatsPerMinute;
          console.log(`Último ritmo cardíaco: ${latestHeartRate}`);
          
          this.notifyListeners({
            type: 'heart-rate',
            heartRate: latestHeartRate
          });
          
          return latestHeartRate;
        } else {
          console.log('No se encontraron muestras en el registro de ritmo cardíaco');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error actualizando datos de ritmo cardíaco:', error);
      return null;
    }
  }
}

// Crear una instancia única del servicio
const healthConnectService = new HealthConnectService();

export default healthConnectService; 