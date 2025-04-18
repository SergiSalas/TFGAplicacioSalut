import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = "http://10.0.2.2:8080";

/**
 * Servicio para obtener datos de tendencias de actividad y pasos
 */
class TrendsService {
  /**
   * Obtiene las tendencias de actividad para un período específico
   * @param {string} token - Token de autenticación
   * @param {string} period - Período de tiempo (week, month, year)
   * @returns {Promise<Object>} - Datos de tendencias
   */
  async getActivityTrends(token, period = 'week') {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      // Modificado para usar el formato correcto del token como en ActivityService
      const response = await axios.get(`${API_URL}/trend/activity/${period}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching activity trends:', error);
      throw error;
    }
  }

  /**
   * Obtiene las tendencias de pasos para un período específico
   * @param {string} token - Token de autenticación
   * @param {string} period - Período de tiempo (week, month, year)
   * @returns {Promise<Object>} - Datos de tendencias
   */
  async getStepsTrends(token, period = 'week') {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      // Modificado para usar el formato correcto del token como en ActivityService
      const response = await axios.get(`${API_URL}/trend/steps/${period}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching steps trends:', error);
      throw error;
    }
  }
}

export default new TrendsService();