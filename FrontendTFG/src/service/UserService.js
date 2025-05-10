import axios from 'axios';
import { ProfileImageCache } from '../cache/ProfileImageCache';
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

export const getUserLevel = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/challenges/getLevel`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el nivel del usuario:', error);
    throw error;
  }
};

export const uploadProfileImage = async (token, imageFile) =>{
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.fileName || 'profile.jpg'
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.post(`${API_URL}/user/profile-image`, formData, config);
    
    // Guardar en caché después de subir exitosamente
    await ProfileImageCache.saveImageToCache(imageFile.uri);
    
    return response.data;
  } catch (error) {
    console.error('Error al subir la imagen de perfil:', error);
    throw error;
  }
}

// Método para obtener la imagen de perfil
export const getProfileImage = async (token) => {
  try {
    if (!token) {
      throw new Error('Token inválido o ausente');
    }
    
    // Intentar obtener desde caché primero
    const cachedImage = await ProfileImageCache.getImageFromCache();
    if (cachedImage) {
      return cachedImage;
    }
    
    // Si no hay caché, obtener del servidor
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.get(`${API_URL}/user/profile-image`, config);
    
    // Verificar que la respuesta contiene los datos necesarios
    if (!response.data || !response.data.imageData || !response.data.imageType) {
      console.log('Respuesta del servidor no contiene datos de imagen válidos');
      return null;
    }
    
    // Crear URI de datos con el tipo de imagen y los datos en base64
    const imageUri = `data:${response.data.imageType};base64,${response.data.imageData}`;
    
    // Guardar en caché
    if (imageUri) {
      await ProfileImageCache.saveImageToCache(imageUri);
    }
    
    return imageUri;
  } catch (error) {
    console.error('Error al obtener la imagen de perfil:', error);
    // No propagar el error, simplemente devolver null para manejar el caso de error
    return null;
  }
}

