import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';

// Extender las claves de almacenamiento para incluir las relacionadas con el sueño
// Esto se debe hacer en AppStorage.js

export const SleepCache = {
  // Gestión de datos de sueño en caché
  saveSleepData: (sleepData, date = null) => {
    try {
      // Si no se proporciona fecha, usar la fecha de inicio del sueño
      const sleepDate = date || 
        (sleepData.startTime ? new Date(sleepData.startTime).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]);
      
      const key = `${STORAGE_KEYS.SLEEP_PREFIX}${sleepDate}`;
      
      const data = {
        timestamp: Date.now(),
        sleepData
      };
      
      activityStorage.set(key, JSON.stringify(data));
      console.log(`Datos de sueño guardados en caché para ${sleepDate}`);
      return true;
    } catch (error) {
      console.error('Error al guardar datos de sueño en caché:', error);
      return false;
    }
  },
  
  getSleepData: (date = null) => {
    try {
      // Si no se proporciona fecha, usar la fecha actual
      const sleepDate = date || new Date().toISOString().split('T')[0];
      const key = `${STORAGE_KEYS.SLEEP_PREFIX}${sleepDate}`;
      
      if (!activityStorage.contains(key)) return null;
      
      const data = activityStorage.getString(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      // TTL check - 3 horas (igual que ActivityCache)
      const TTL = 3 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > TTL) {
        console.log('Caché de sueño expirada, datos no válidos');
        return null;
      }
      
      return parsed.sleepData;
    } catch (error) {
      console.error('Error al recuperar datos de sueño de caché:', error);
      return null;
    }
  },
  
  isCacheValid: (date = null) => {
    try {
      const sleepDate = date || new Date().toISOString().split('T')[0];
      const key = `${STORAGE_KEYS.SLEEP_PREFIX}${sleepDate}`;
      
      if (!activityStorage.contains(key)) return false;
      
      const data = activityStorage.getString(key);
      if (!data) return false;
      
      const parsed = JSON.parse(data);
      const TTL = 3 * 60 * 60 * 1000;
      
      return (Date.now() - parsed.timestamp) < TTL;
    } catch (error) {
      console.error('Error al verificar validez de caché de sueño:', error);
      return false;
    }
  },
  
  invalidateCache: (date = null) => {
    try {
      if (date) {
        // Invalidar solo para la fecha específica
        const key = `${STORAGE_KEYS.SLEEP_PREFIX}${date}`;
        activityStorage.delete(key);
        console.log(`Caché de sueño invalidada para fecha ${date}`);
      } else {
        // Invalidar todas las cachés de sueño
        const allKeys = activityStorage.getAllKeys();
        const sleepKeys = allKeys.filter(key => 
          key.startsWith(STORAGE_KEYS.SLEEP_PREFIX));
        
        sleepKeys.forEach(key => {
          activityStorage.delete(key);
        });
        
        console.log('Todas las cachés de sueño invalidadas');
      }
      return true;
    } catch (error) {
      console.error('Error al invalidar caché de sueño:', error);
      return false;
    }
  },
  
  // Gestión de IDs de sueño guardados
  getSavedSleepIds: () => {
    try {
      if (!activityStorage.contains(STORAGE_KEYS.SAVED_SLEEP_IDS)) return [];
      
      const savedIds = activityStorage.getString(STORAGE_KEYS.SAVED_SLEEP_IDS);
      return savedIds ? JSON.parse(savedIds) : [];
    } catch (error) {
      console.error('Error al obtener IDs de sueño guardados:', error);
      return [];
    }
  },
  
  saveSleepId: (sleepId) => {
    try {
      const savedIds = SleepCache.getSavedSleepIds();
      if (!savedIds.includes(sleepId)) {
        savedIds.push(sleepId);
        activityStorage.set(STORAGE_KEYS.SAVED_SLEEP_IDS, JSON.stringify(savedIds));
        console.log(`ID de sueño guardado: ${sleepId}`);
      }
      return true;
    } catch (error) {
      console.error('Error al guardar ID de sueño:', error);
      return false;
    }
  },
  
  clearSavedSleepIds: () => {
    try {
      activityStorage.delete(STORAGE_KEYS.SAVED_SLEEP_IDS);
      console.log('IDs de sueño guardados borrados');
      return true;
    } catch (error) {
      console.error('Error al borrar IDs de sueño:', error);
      return false;
    }
  },
  
  clearSleepData: () => {
    try {
      const allKeys = activityStorage.getAllKeys();
      const sleepKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.SLEEP_PREFIX)
      );
      
      sleepKeys.forEach(key => {
        activityStorage.delete(key);
      });
      
      console.log('Datos de sueño en caché borrados');
      return true;
    } catch (error) {
      console.error('Error al borrar datos de sueño:', error);
      return false;
    }
  }
};