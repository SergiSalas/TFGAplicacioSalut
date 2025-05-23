import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';

/**
 * Módulo para gestionar el almacenamiento en caché de datos relacionados con el sueño.
 * Proporciona funciones para guardar, recuperar, validar y limpiar datos de sueño.
 */
export const SleepCache = {
  /**
   * Guarda los datos de sueño en la caché para una fecha específica.
   * @param {Object} sleepData - Datos de sueño a guardar.
   * @param {string|null} date - Fecha opcional en formato ISO (YYYY-MM-DD). Si no se proporciona, se usa la fecha de inicio del sueño o la fecha actual.
   * @returns {boolean} - Verdadero si se guardó correctamente, falso en caso de error.
   */
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
  
  /**
   * Recupera los datos de sueño de la caché para una fecha específica.
   * @param {string|null} date - Fecha opcional en formato ISO (YYYY-MM-DD). Si no se proporciona, se usa la fecha actual.
   * @returns {Object|null} - Datos de sueño si existen y son válidos, o null si no existen o han expirado.
   */
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
  
  /**
   * Verifica si la caché de sueño para una fecha específica es válida (no ha expirado).
   * @param {string|null} date - Fecha opcional en formato ISO (YYYY-MM-DD). Si no se proporciona, se usa la fecha actual.
   * @returns {boolean} - Verdadero si la caché es válida, falso si no existe o ha expirado.
   */
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
  
  /**
   * Invalida la caché de sueño para una fecha específica o todas las cachés de sueño.
   * @param {string|null} date - Fecha opcional en formato ISO (YYYY-MM-DD). Si no se proporciona, se invalidan todas las cachés de sueño.
   * @returns {boolean} - Verdadero si se invalidó correctamente, falso en caso de error.
   */
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
  
  /**
   * Recupera la lista de IDs de sueño guardados.
   * @returns {Array} - Array con los IDs de sueño guardados, o array vacío si no hay ninguno o hay error.
   */
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
  
  /**
   * Guarda un ID de sueño en la lista de IDs guardados si no existe ya.
   * @param {string} sleepId - ID de sueño a guardar.
   * @returns {boolean} - Verdadero si se guardó correctamente, falso en caso de error.
   */
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
  
  /**
   * Elimina todos los IDs de sueño guardados.
   * @returns {boolean} - Verdadero si se eliminaron correctamente, falso en caso de error.
   */
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
  
  /**
   * Elimina todos los datos de sueño almacenados en caché.
   * @returns {boolean} - Verdadero si se eliminaron correctamente, falso en caso de error.
   */
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