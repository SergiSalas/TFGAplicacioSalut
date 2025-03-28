import Config from 'react-native-config';
import axios from 'axios';

API_URL = "http://10.0.2.2:8080";

export const registerUser = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error('Registration failed');
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
};

/**
 * Verifica la validez de un token con el servidor
 * @param {string} token - Token a verificar
 * @returns {Promise<boolean>} - True si el token es válido
 */
export const verifyToken = async (token) => {
  try {
    // Asegurarnos de que estamos enviando el token correctamente en el encabezado
    console.log('Enviando token para verificación:', token ? token.substring(0,15)+'...' : 'No hay token');
    
    const response = await axios.post(
      `${API_URL}/auth/verifyToken`,
      {}, // Cuerpo vacío para POST
      {
        headers: {
          'Authorization': `Bearer ${token}`  // Añadir el prefijo "Bearer " al token
        }
      }
    );
    
    console.log('Respuesta de verificación:', response.data);
    return response.data === true;
  } catch (error) {
    console.error('Error en verifyToken:', error.response?.data || error.message);
    return false; // Si hay error, consideramos que el token no es válido
  }
};
