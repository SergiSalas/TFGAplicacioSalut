import axios from 'axios';
const API_URL = "http://10.0.2.2:8080";

export async function updateUserProfile(token, profileData) {
  try {
    const response = await axios.post(
      `${API_URL}/user/setDataProfile`,
      profileData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
}

// Nueva función para obtener los tipos de género
export async function getGenderTypes(token) {
  try {
    const response = await axios.get(
      `${API_URL}/user/getGenderData`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de género:', error);
    throw error;
  }
}

/**
 * Obtiene los datos del perfil del usuario
 * @param {string} token - Token de autorización
 * @returns {Promise} - Datos del perfil del usuario
 */
export async function getUserProfile(token) {
  try {
    const response = await axios.get(
      `${API_URL}/user/getDataProfile`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
} 