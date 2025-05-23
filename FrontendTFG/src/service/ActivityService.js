import axios from 'axios';
import { ActivityCache } from '../cache/ActivityCache';
import { activityStorage, STORAGE_KEYS } from '../storage/AppStorage';
import { useContext } from 'react';

const API_URL = "http://10.0.2.2:8080";

async function handleAuthError(error) {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    console.log('Token inválido detectado, borrando caché y datos guardados...');
    
    try {
      // Usar los nuevos métodos sincronizados
      ActivityCache.clearSavedStepIds();
      ActivityCache.clearSavedExerciseIds();
      ActivityCache.clearActivityData();
      
      console.log('Caché e IDs guardados borrados correctamente');
      return true;
    } catch (clearError) {
      console.error('Error al borrar caché:', clearError);
    }
  }
  return false;
}

export async function getActivities(token, forceRefresh = false, date = null) {
  // Diagnóstico: verificar si token es válido
  console.log('Token valid:', token ? true : false);
  
  try {
    // Si no es forzada y la caché es válida, usar la caché
    if (!forceRefresh && ActivityCache.isCacheValid(date)) {
      const cachedActivities = ActivityCache.getActivities(date);
      if (cachedActivities && cachedActivities.length > 0) {
        console.log('Usando actividades en caché');
        return cachedActivities;
      }
    }
    
    // Verificar token
    if (!token) {
      throw new Error('Token inválido o ausente');
    }
    
    // Obtener datos del servidor
    console.log('Obteniendo actividades del servidor...');
    const response = await axios.get(
      `${API_URL}/activity/getActivities${date ? `?date=${date}` : ''}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // Guardar en caché y devolver
    if (response.data && Array.isArray(response.data)) {
      ActivityCache.saveActivities(response.data, date);
    }
    return response.data;
  } catch (error) {
    // Verificar si es un error de autenticación
    if (error.response && [401, 403].includes(error.response.status)) {
      console.log('Token inválido detectado en getActivities');
      
      // Importar de forma dinámica para evitar dependencias circulares
      const { default: AuthContext } = await import('../contexts/AuthContext');
      const { handleTokenExpiration } = useContext(AuthContext);
      
      // Ejecutar la lógica de expiración de token
      handleTokenExpiration();
      
      // No intentar usar caché como fallback en caso de error de autenticación
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    // Intentar usar caché en caso de error de red
    const cachedActivities = ActivityCache.getActivities(date);
    if (cachedActivities && cachedActivities.length > 0) {
      console.log('Error de red, usando caché como fallback');
      return cachedActivities;
    }
    
    throw error;
  }
}

export async function getActivityTypes(token) {
  try {
    const response = await axios.get(`${API_URL}/activity/getActivityTypes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // Manejar error de autenticación
    const isAuthError = await handleAuthError(error);
    if (isAuthError) {
      return [];
    }
    
    console.error('Error al obtener tipos de actividad:', error);
    throw error;
  }
}

export async function createActivity(token, activityData) {
  try {
    // Verificar token y datos básicos
    if (!token) {
      console.error('Token inválido o ausente');
      await handleAuthError({ response: { status: 401 } });
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    if (!activityData) {
      throw new Error('Datos de actividad inválidos');
    }
    
    // Logs para diagnóstico
    console.log('Enviando actividad al servidor:', {
      tipo: activityData.type,
      origen: activityData.origin,
      externalId: activityData.externalId ? `${activityData.externalId.substring(0, 10)}...` : 'ninguno'
    });
    
    // Asegurarse de que el tipo es una cadena
    if (activityData.type && typeof activityData.type !== 'string') {
      activityData.type = String(activityData.type);
    }
    
    // Usar valores por defecto para campos obligatorios faltantes
    if (!activityData.type) {
      activityData.type = 'OTHER';
    }
    
    if (!activityData.duration || isNaN(activityData.duration) || activityData.duration <= 0) {
      activityData.duration = 30;
    }
    
    try {
      // Enviar al servidor
      const response = await axios.post(`${API_URL}/activity/createActivity`, 
        activityData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Invalidar caché para forzar una actualización en la próxima solicitud
      await ActivityCache.invalidateCache();
      
      // Guardar IDs
      if (activityData.origin === 'HEALTH_CONNECT') {
        if (activityData.dailySteps && activityData.externalId) {
          await ActivityCache.saveStepId(activityData.externalId);
        } else if (activityData.externalId) {
          await ActivityCache.saveExerciseId(activityData.externalId);
        }
      }
      
      return response.data;
    } catch (error) {
      // Detectar duplicados
      if (error.response?.status === 400) {
        const errorData = error.response?.data || {};
        const errorString = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
        
        if (errorString.includes('duplicate') || 
            errorString.includes('ya existe') || 
            errorString.includes('already exists')) {
          console.log('Actividad ya existente:', activityData.externalId);
          
          // Marcar como guardada en caché si es de Health Connect
          if (activityData.origin === 'HEALTH_CONNECT' && activityData.externalId) {
            if (activityData.dailySteps) {
              await ActivityCache.saveStepId(activityData.externalId);
            } else {
              await ActivityCache.saveExerciseId(activityData.externalId);
            }
          }
          
          // Propagar error con metadatos
          const duplicateError = new Error('La actividad ya existe en el sistema');
          duplicateError.isDuplicate = true;
          duplicateError.response = error.response;
          throw duplicateError;
        }
      }
      
      // Verificar si es un error de autenticación
      if (error.response && [401, 403].includes(error.response.status)) {
        await handleAuthError(error);
      }
      
      throw error;
    }
  } catch (error) {
    // No repetir manejo de errores si ya se ha procesado
    if (error.isDuplicate) {
      throw error;
    }
    
    console.error('Error general al crear actividad:', error.message);
    throw error;
  }
}

export async function addDailyObjective(token, dailyActivityObjective) {
  try {
    const response = await axios.post(`${API_URL}/activity/addObjective`, 
      dailyActivityObjective ,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    // Manejar error de autenticación
    const isAuthError = await handleAuthError(error);
    if (isAuthError) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    
    console.error('Error al añadir objetivo diario:', error);
    throw error;
  }
}

export async function getDailyObjective(token) {
  try {
    const response = await axios.get(`${API_URL}/activity/getObjective`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    // Manejar error de autenticación
    const isAuthError = await handleAuthError(error);
    if (isAuthError) {
      return null;
    }
    
    console.error('Error al obtener objetivo diario:', error);
    throw error;
  }
}

/**
 * Obtiene las calorías totales quemadas para una fecha específica
 * @param {string} token - Token de autorización
 * @param {string} date - Fecha en formato YYYY-MM-DD
 */
export async function getTotalCalories(token, date) {
  if (!token) {
    throw new Error('Token inválido o ausente');
  }
  
  try {
    // Intentar obtener calorías de la caché primero
    const cacheKey = `${STORAGE_KEYS.ACTIVITIES_PREFIX}calories_${date}`;
    if (activityStorage.contains(cacheKey)) {
      const cachedData = activityStorage.getString(cacheKey);
      const parsed = JSON.parse(cachedData);
      
      // Verificar si la caché aún es válida (1 hora)
      if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
        console.log('Usando calorías en caché para', date);
        return parsed.calories;
      }
    }
    
    // Si no hay caché válida, obtener del servidor
    console.log('Obteniendo calorías del servidor para', date);
    const response = await axios.get(
      `${API_URL}/activity/getTotalCalories?date=${date}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // Guardar en caché
    const dataToCache = {
      timestamp: Date.now(),
      calories: response.data
    };
    activityStorage.set(cacheKey, JSON.stringify(dataToCache));
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener calorías totales:', error);
    
    // Manejar errores de autenticación
    if (error.response && [401, 403].includes(error.response.status)) {
      await handleAuthError(error);
      throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }
    
    throw error;
  }
}