import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';

export const ActivityCache = {
  // Gestión de actividades en caché
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
  
  // HealthConnect IDs - Simplificado
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
  
  // Funciones de limpieza - Simplificado
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
  
  // Métodos específicos para limpiezas parciales
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
  
  setLastLoadTime: () => {
    try {
      activityStorage.set(STORAGE_KEYS.LAST_LOAD_TIME, Date.now().toString());
      return true;
    } catch (error) {
      console.error('Error al guardar tiempo de última carga:', error);
      return false;
    }
  },
  
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