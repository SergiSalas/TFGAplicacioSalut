import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = "http://10.0.2.2:8080";

/**
 * Servicio para obtener estadísticas de actividad
 */
class StatsService {
  /**
   * Obtiene estadísticas generales de actividad
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} - Datos de estadísticas
   */
  async getActivityStats(token) {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      // Modificado para usar el formato correcto del token como en ActivityService
      const response = await axios.get(`${API_URL}/stats/activity`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de actividad para un período específico
   * @param {string} token - Token de autenticación
   * @param {string} period - Período de tiempo (week, month, year)
   * @returns {Promise<Object>} - Datos de estadísticas
   */
  async getActivityStatsByPeriod(token, period = 'week') {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      // Modificado para usar el formato correcto del token como en ActivityService
      const response = await axios.get(`${API_URL}/stats/activity/${period}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats by period:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas generales de sueño
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} - Datos de estadísticas de sueño
   */
  async getSleepStats(token) {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      const response = await axios.get(`${API_URL}/stats/sleep`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching sleep stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de sueño para un período específico
   * @param {string} token - Token de autenticación
   * @param {string} period - Período de tiempo (week, month, year)
   * @returns {Promise<Object>} - Datos de estadísticas de sueño
   */
  async getSleepStatsByPeriod(token, period = 'week') {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      const response = await axios.get(`${API_URL}/stats/sleep/${period}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching sleep stats by period:', error);
      throw error;
    }
  }
}

export default new StatsService();