import axios from 'axios';
API_URL = "http://10.0.2.2:8080";

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