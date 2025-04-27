import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://10.0.2.2:8080";

/**
 * Servicio para gestionar la hidratación del usuario
 */
class HydrationService {
  /**
   * Obtiene el estado actual de hidratación del usuario
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} - Datos de hidratación convertidos a ml
   */
  async getHydrationStatus(token) {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      const response = await axios.get(`${API_URL}/hydration/status`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Convertir de litros a mililitros para la interfaz
      const data = response.data;
      return {
        ...data,
        currentAmount: data.currentAmount * 1000, // Convertir L a ml
        dailyTarget: data.dailyTarget * 1000     // Convertir L a ml
      };
    } catch (error) {
      console.error('Error fetching hydration status:', error);
      throw error;
    }
  }

  /**
   * Actualiza la hidratación del usuario
   * @param {string} token - Token de autenticación
   * @param {Object} hydrationData - Datos de hidratación a actualizar
   * @param {number} hydrationData.amount - Cantidad de agua en ml
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async updateHydration(token, hydrationData) {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      // Convertir de ml a litros para el backend
      const hydrationUpdate = {
        amount: hydrationData.amount / 1000, // Convertir ml a L
        date: new Date()
      };

      console.log('Enviando actualización de hidratación (litros):', hydrationUpdate);
      
      const response = await axios.post(`${API_URL}/hydration/update`, hydrationUpdate, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error al actualizar hidratación:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de hidratación del usuario
   * @param {string} token - Token de autenticación
   * @param {string} period - Período de tiempo (day, week, month)
   * @returns {Promise<Object>} - Historial de hidratación convertido a ml
   */
  async getHydrationHistory(token, period = 'day') {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      const response = await axios.get(`${API_URL}/hydration/history/${period}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Convertir valores de litros a mililitros
      const data = response.data;
      if (data && Array.isArray(data.entries)) {
        data.entries = data.entries.map(entry => ({
          ...entry,
          amount: entry.amount * 1000 // Convertir L a ml
        }));
      }

      return data;
    } catch (error) {
      console.error('Error fetching hydration history:', error);
      throw error;
    }
  }

  /**
   * Establece el objetivo diario de hidratación
   * @param {string} token - Token de autenticación
   * @param {number} target - Objetivo diario en ml
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async setDailyTarget(token, target) {
    try {
      if (!token) {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          throw new Error('No authentication token available');
        }
        token = storedToken;
      }

      // Convertir de ml a litros para el backend
      const targetInLiters = target / 1000;

      const response = await axios.post(`${API_URL}/hydration/target`, { target: targetInLiters }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error setting hydration target:', error);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export const hydrationService = new HydrationService();

// Exportar funciones individuales para facilitar su uso
export const getHydrationStatus = (token) => hydrationService.getHydrationStatus(token);
export const updateHydration = (token, data) => hydrationService.updateHydration(token, data);
export const getHydrationHistory = (token, period) => hydrationService.getHydrationHistory(token, period);
export const setDailyTarget = (token, target) => hydrationService.setDailyTarget(token, target);