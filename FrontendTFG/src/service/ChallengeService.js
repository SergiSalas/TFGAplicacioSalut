import axios from 'axios';
const API_URL = "http://10.0.2.2:8080";

const ChallengeService = {
  // Obtener los desafíos del usuario
  getUserChallenges: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los desafíos:', error);
      throw error;
    }
  },

  // Generar nuevos desafíos diarios
  generateDailyChallenges: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/challenges/generate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al generar desafíos diarios:', error);
      throw error;
    }
  }
};

export default ChallengeService;