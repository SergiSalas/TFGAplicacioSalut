import { MMKV } from 'react-native-mmkv';

// Instancias de almacenamiento
export const appStorage = new MMKV({ id: 'app-storage' });
export const activityStorage = new MMKV({ id: 'activity-storage' });

// Claves de almacenamiento (combinadas)
export const STORAGE_KEYS = {
  // Auth keys
  AUTH_TOKEN: 'auth_token',
  TOKEN: 'auth_token',     // Mantener para compatibilidad
  USER_DATA: 'user_data',
  IS_NEW_USER: 'is_new_user',
  
  // Activity keys
  ACTIVITIES_PREFIX: 'activities_',
  SAVED_EXERCISE_IDS: 'saved_exercise_ids',
  SAVED_STEP_IDS: 'saved_step_ids',
  LAST_FETCH_PREFIX: 'last_fetch_',
  LAST_LOAD_TIME: 'last_load_time',
  
  // Health Connect
  HEALTH_CONNECT_LAST_FETCH: 'health_connect_last_fetch'
}; 