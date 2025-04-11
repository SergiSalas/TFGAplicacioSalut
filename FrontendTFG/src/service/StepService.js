import axios from 'axios';
import { ActivityCache } from '../cache/ActivityCache';

const API_URL = "http://10.0.2.2:8080";

/**
 * Handles authentication errors by clearing cache
 */
async function handleAuthError(error) {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    console.log('Token inválido detectado, borrando caché y datos guardados...');
    
    try {
      // Clear cached data
      ActivityCache.clearActivityData();
      console.log('Caché borrada correctamente');
      return true;
    } catch (clearError) {
      console.error('Error al borrar caché:', clearError);
    }
  }
  return false;
}

/**
 * Saves daily step data to the backend
 * @param {string} token - Authentication token
 * @param {object} stepData - Step data object containing steps, date, and duration
 * @returns {Promise} - Response from the server
 */
export const saveDailySteps = async (token, stepData) => {
  try {
    // Verify token
    if (!token) {
      throw new Error('Token inválido o ausente');
    }

    // Format date to match backend expectations (if date is a string)
    let formattedDate = stepData.date;
    if (typeof stepData.date === 'string') {
      formattedDate = new Date(stepData.date);
    } else if (!stepData.date) {
      formattedDate = new Date(); // Use current date if none provided
    }

    // Create the DTO object to match backend expectations
    const dailyStepsDTO = {
      steps: stepData.steps || 0,
      date: formattedDate,
      duration: stepData.duration || 0
    };

    console.log('Sending daily steps to backend:', dailyStepsDTO);

    // Send data to the backend
    const response = await axios.post(
      `${API_URL}/activity/addDailySteps`,
      dailyStepsDTO,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Invalidate cache to ensure fresh data on next fetch
    ActivityCache.invalidateCache();
    
    return response.data;
  } catch (error) {
    // Handle authentication errors
    const isAuthError = await handleAuthError(error);
    if (isAuthError) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    
    console.error('Error al guardar datos de pasos diarios:', error);
    throw error;
  }
};

/**
 * Gets daily step data from the backend
 * @param {string} token - Authentication token
 * @param {string|Date} date - Optional date to get steps for
 * @returns {Promise} - Response from the server
 */
export const getDailySteps = async (token, date = null) => {
  try {
    // Verify token
    if (!token) {
      throw new Error('Token inválido o ausente');
    }
    
    // Format date to ISO format (YYYY-MM-DD) as expected by the backend
    const formattedDate = date 
      ? new Date(date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];
    
    // Get data from server
    console.log(`Obteniendo datos de pasos para ${formattedDate}...`);
    const response = await axios.get(
      `${API_URL}/activity/getDailySteps?date=${formattedDate}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    // Handle authentication errors
    const isAuthError = await handleAuthError(error);
    if (isAuthError) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    
    console.error('Error al obtener datos de pasos diarios:', error);
    throw error;
  }
};

export default {
  saveDailySteps,
  getDailySteps
};