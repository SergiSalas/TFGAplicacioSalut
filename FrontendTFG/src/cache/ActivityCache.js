import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';

export const ActivityCache = {
  /**
   * Guarda actividades en la caché local con una marca de tiempo
   * @param {Array} activities - Lista de actividades a guardar
   * @param {string|null} date - Fecha específica para la caché (formato YYYY-MM-DD) o null para todas
   * @returns {boolean} - true si se guardó correctamente, false si hubo error
   */
  saveActivities: (activities, date = null) => {
    try {
      const key = date ? 
        `${STORAGE_KEYS.ACTIVITIES_PREFIX}${date}` : 
        `${STORAGE_KEYS.ACTIVITIES_PREFIX}all`;
      
      const data = {
        timestamp: Date.now(),
        activities
      };
      
      activityStorage.set(key, JSON.stringify(data));
      console.log(`Guardadas ${activities.length} actividades en caché ${date ? `para ${date}` : ''}`);
      return true;
    } catch (error) {
      console.error('Error al guardar actividades en caché:', error);
      return false;
    }
  },
  
  /**
   * Recupera actividades de la caché local verificando su validez temporal
   * @param {string|null} date - Fecha específica para recuperar (formato YYYY-MM-DD) o null para todas
   * @returns {Array|null} - Lista de actividades o null si no hay datos válidos
   */
  getActivities: (date = null) => {
    try {
      const key = date ? 
        `${STORAGE_KEYS.ACTIVITIES_PREFIX}${date}` : 
        `${STORAGE_KEYS.ACTIVITIES_PREFIX}all`;
      
      if (!activityStorage.contains(key)) return null;
      
      const data = activityStorage.getString(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      // TTL check - 3 horas
      const TTL = 3 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > TTL) {
        console.log('Caché expirada, datos no válidos');
        return null;
      }
      
      return parsed.activities;
    } catch (error) {
      console.error('Error al recuperar actividades de caché:', error);
      return null;
    }
  },
  
  /**
   * Verifica si la caché para una fecha específica es válida (no ha expirado)
   * @param {string|null} date - Fecha a verificar (formato YYYY-MM-DD) o null para todas
   * @returns {boolean} - true si la caché es válida, false si no existe o ha expirado
   */
  isCacheValid: (date = null) => {
    try {
      const key = date ? 
        `${STORAGE_KEYS.ACTIVITIES_PREFIX}${date}` : 
        `${STORAGE_KEYS.ACTIVITIES_PREFIX}all`;
      
      if (!activityStorage.contains(key)) return false;
      
      const data = activityStorage.getString(key);
      if (!data) return false;
      
      const parsed = JSON.parse(data);
      const TTL = 3 * 60 * 60 * 1000;
      
      return (Date.now() - parsed.timestamp) < TTL;
    } catch (error) {
      console.error('Error al verificar validez de caché:', error);
      return false;
    }
  },
  
  /**
   * Invalida (elimina) la caché de actividades para una fecha específica o todas
   * @param {string|null} date - Fecha específica a invalidar o null para todas
   * @returns {boolean} - true si se invalidó correctamente, false si hubo error
   */
  invalidateCache: (date = null) => {
    try {
      if (date) {
        // Invalidar solo para la fecha específica
        const key = `${STORAGE_KEYS.ACTIVITIES_PREFIX}${date}`;
        activityStorage.delete(key);
        console.log(`Caché invalidada para fecha ${date}`);
      } else {
        // Invalidar todas las cachés de actividades
        const allKeys = activityStorage.getAllKeys();
        const activityKeys = allKeys.filter(key => 
          key.startsWith(STORAGE_KEYS.ACTIVITIES_PREFIX));
        
        activityKeys.forEach(key => {
          activityStorage.delete(key);
        });
        
        console.log('Todas las cachés de actividades invalidadas');
      }
      return true;
    } catch (error) {
      console.error('Error al invalidar caché:', error);
      return false;
    }
  },
  
  /**
   * Recupera los IDs de ejercicios guardados de HealthConnect
   * @returns {Array} - Lista de IDs de ejercicios o array vacío si no hay datos
   */
  getSavedExerciseIds: () => {
    try {
      if (!activityStorage.contains(STORAGE_KEYS.SAVED_EXERCISE_IDS)) return [];
      
      const savedIds = activityStorage.getString(STORAGE_KEYS.SAVED_EXERCISE_IDS);
      return savedIds ? JSON.parse(savedIds) : [];
    } catch (error) {
      console.error('Error al obtener IDs de ejercicios guardados:', error);
      return [];
    }
  },
  
  /**
   * Guarda un ID de ejercicio de HealthConnect si no existe previamente
   * @param {string} exerciseId - ID del ejercicio a guardar
   * @returns {boolean} - true si se guardó correctamente, false si hubo error
   */
  saveExerciseId: (exerciseId) => {
    try {
      const savedIds = ActivityCache.getSavedExerciseIds();
      if (!savedIds.includes(exerciseId)) {
        savedIds.push(exerciseId);
        activityStorage.set(STORAGE_KEYS.SAVED_EXERCISE_IDS, JSON.stringify(savedIds));
        console.log(`ID de ejercicio guardado: ${exerciseId}`);
      }
      return true;
    } catch (error) {
      console.error('Error al guardar ID de ejercicio:', error);
      return false;
    }
  },
  
  /**
   * Recupera los IDs de pasos guardados de HealthConnect
   * @returns {Array} - Lista de IDs de pasos o array vacío si no hay datos
   */
  getSavedStepIds: () => {
    try {
      if (!activityStorage.contains(STORAGE_KEYS.SAVED_STEP_IDS)) return [];
      
      const savedIds = activityStorage.getString(STORAGE_KEYS.SAVED_STEP_IDS);
      return savedIds ? JSON.parse(savedIds) : [];
    } catch (error) {
      console.error('Error al obtener IDs de pasos guardados:', error);
      return [];
    }
  },
  
  /**
   * Guarda un ID de paso de HealthConnect si no existe previamente
   * @param {string} stepId - ID del paso a guardar
   * @returns {boolean} - true si se guardó correctamente, false si hubo error
   */
  saveStepId: (stepId) => {
    try {
      const savedIds = ActivityCache.getSavedStepIds();
      if (!savedIds.includes(stepId)) {
        savedIds.push(stepId);
        activityStorage.set(STORAGE_KEYS.SAVED_STEP_IDS, JSON.stringify(savedIds));
        console.log(`ID de paso guardado: ${stepId}`);
      }
      return true;
    } catch (error) {
      console.error('Error al guardar ID de paso:', error);
      return false;
    }
  },
  
  /**
   * Limpia completamente toda la caché de actividades
   * @returns {boolean} - true si se limpió correctamente, false si hubo error
   */
  clearAllCache: () => {
    try {
      activityStorage.clearAll();
      console.log('Caché completamente limpiada');
      return true;
    } catch (error) {
      console.error('Error al limpiar caché:', error);
      return false;
    }
  },
  
  /**
   * Elimina solo los IDs de ejercicios guardados
   * @returns {boolean} - true si se eliminaron correctamente, false si hubo error
   */
  clearSavedExerciseIds: () => {
    try {
      activityStorage.delete(STORAGE_KEYS.SAVED_EXERCISE_IDS);
      console.log('IDs de ejercicios guardados borrados');
      return true;
    } catch (error) {
      console.error('Error al borrar IDs de ejercicios:', error);
      return false;
    }
  },
  
  /**
   * Elimina solo los IDs de pasos guardados
   * @returns {boolean} - true si se eliminaron correctamente, false si hubo error
   */
  clearSavedStepIds: () => {
    try {
      activityStorage.delete(STORAGE_KEYS.SAVED_STEP_IDS);
      console.log('IDs de pasos guardados borrados');
      return true;
    } catch (error) {
      console.error('Error al borrar IDs de pasos:', error);
      return false;
    }
  },
  
  /**
   * Elimina todos los datos de actividades y marcas de tiempo de última carga
   * @returns {boolean} - true si se eliminaron correctamente, false si hubo error
   */
  clearActivityData: () => {
    try {
      const allKeys = activityStorage.getAllKeys();
      const activityKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.ACTIVITIES_PREFIX) || 
        key.startsWith(STORAGE_KEYS.LAST_FETCH_PREFIX)
      );
      
      activityKeys.forEach(key => {
        activityStorage.delete(key);
      });
      
      console.log('Caché de actividades borrada');
      return true;
    } catch (error) {
      console.error('Error al borrar caché de actividades:', error);
      return false;
    }
  },
  
  /**
   * Registra el momento actual como tiempo de última carga de actividades
   * @returns {boolean} - true si se guardó correctamente, false si hubo error
   */
  setLastLoadTime: () => {
    try {
      activityStorage.set(STORAGE_KEYS.LAST_LOAD_TIME, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Error al guardar tiempo de última carga:', error);
      return false;
    }
  },
  
  /**
   * Obtiene el timestamp de la última carga de actividades
   * @returns {number} - Timestamp en milisegundos o 0 si no hay registro
   */
  getLastLoadTime: () => {
    try {
      if (!activityStorage.contains(STORAGE_KEYS.LAST_LOAD_TIME)) return 0;
      const time = activityStorage.getString(STORAGE_KEYS.LAST_LOAD_TIME);
      return time ? parseInt(time) : 0;
    } catch (error) {
      console.error('Error al obtener tiempo de última carga:', error);
      return 0;
    }
  }
}; 