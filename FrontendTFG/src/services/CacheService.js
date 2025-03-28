import { MMKV } from 'react-native-mmkv';

// Instancia principal
const storage = new MMKV({
  id: 'fitness-app-storage'
});

// Claves de caché
const KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ACTIVITIES_PREFIX: 'activities_',
  SAVED_EXERCISES: 'saved_exercises',
  SAVED_STEPS: 'saved_steps',
  LAST_SYNC: 'last_sync_'
};

const TTL = {
  ACTIVITIES: 3 * 60 * 60 * 1000, // 3 horas en milisegundos
  PROFILE: 24 * 60 * 60 * 1000,   // 1 día
};

export const CacheService = {
  // Autenticación
  setAuthData: (token, userData) => {
    storage.set(KEYS.AUTH_TOKEN, token);
    storage.set(KEYS.USER_DATA, JSON.stringify(userData));
  },
  
  getAuthToken: () => storage.getString(KEYS.AUTH_TOKEN),
  
  getUserData: () => {
    const data = storage.getString(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },
  
  clearAuthData: () => {
    storage.delete(KEYS.AUTH_TOKEN);
    storage.delete(KEYS.USER_DATA);
  },
  
  // Actividades
  saveActivities: (activities, date = null) => {
    const key = date ? 
      `${KEYS.ACTIVITIES_PREFIX}${date}` : 
      `${KEYS.ACTIVITIES_PREFIX}all`;
    
    const data = {
      timestamp: Date.now(),
      activities
    };
    
    storage.set(key, JSON.stringify(data));
  },
  
  getActivities: (date = null) => {
    const key = date ? 
      `${KEYS.ACTIVITIES_PREFIX}${date}` : 
      `${KEYS.ACTIVITIES_PREFIX}all`;
    
    const data = storage.getString(key);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Verificar TTL
    if (Date.now() - parsed.timestamp > TTL.ACTIVITIES) {
      // Caché expirada
      return null;
    }
    
    return parsed.activities;
  },
  
  // IDs de ejercicios y pasos
  getSavedExerciseIds: () => {
    const data = storage.getString(KEYS.SAVED_EXERCISES);
    return data ? JSON.parse(data) : [];
  },
  
  saveExerciseId: (id) => {
    const ids = CacheService.getSavedExerciseIds();
    if (!ids.includes(id)) {
      ids.push(id);
      storage.set(KEYS.SAVED_EXERCISES, JSON.stringify(ids));
    }
  },
  
  getSavedStepIds: () => {
    const data = storage.getString(KEYS.SAVED_STEPS);
    return data ? JSON.parse(data) : [];
  },
  
  saveStepId: (id) => {
    const ids = CacheService.getSavedStepIds();
    if (!ids.includes(id)) {
      ids.push(id);
      storage.set(KEYS.SAVED_STEPS, JSON.stringify(ids));
    }
  },
  
  // Limpieza y reseteo
  invalidateActivitiesCache: () => {
    const allKeys = storage.getAllKeys();
    const activityKeys = allKeys.filter(
      key => key.startsWith(KEYS.ACTIVITIES_PREFIX)
    );
    
    activityKeys.forEach(key => {
      storage.delete(key);
    });
  },
  
  clearAllExerciseData: () => {
    storage.delete(KEYS.SAVED_EXERCISES);
    storage.delete(KEYS.SAVED_STEPS);
    CacheService.invalidateActivitiesCache();
  },
  
  clearAllCache: () => {
    storage.clearAll();
  },
  
  // Utilidades
  hasKey: (key) => storage.contains(key),
  
  getAllKeys: () => storage.getAllKeys()
}; 