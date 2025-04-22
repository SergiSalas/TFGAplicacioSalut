import axios from 'axios';
const API_URL = "http://10.0.2.2:8080";

class TrendsService {
  // Endpoint para tendencias de actividad
  async getActivityTrends(token, period = 'week') {
    try {
      const response = await axios.get(`${API_URL}/trend/activity/${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tendencias de actividad:', error);
      throw error;
    }
  }

  // Endpoint para tendencias de pasos
  async getStepsTrends(token, period = 'week') {
    try {
      const response = await axios.get(`${API_URL}/trend/steps/${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tendencias de pasos:', error);
      throw error;
    }
  }

  // Endpoint para tendencias de sueño
  async getSleepTrends(token, period = 'week') {
    try {
      const response = await axios.get(`${API_URL}/trend/sleep/${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tendencias de sueño:', error);
      throw error;
    }
  }

  // Endpoint para tendencias de calidad de sueño
  async getSleepQualityTrends(token, period = 'week') {
    try {
      const response = await axios.get(`${API_URL}/trend/sleep/quality/${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tendencias de calidad de sueño:', error);
      throw error;
    }
  }

  // Endpoint para tendencias de etapas de sueño
  async getSleepStagesTrends(token, period = 'week') {
    try {
      const response = await axios.get(`${API_URL}/trend/sleep/stages/${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tendencias de etapas de sueño:', error);
      throw error;
    }
  }
}

export default new TrendsService();