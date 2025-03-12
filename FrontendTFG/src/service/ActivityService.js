import Config from 'react-native-config';
import axios from 'axios';

API_URL = "http://10.0.2.2:8080";

export async function getActivities(token) {
    try {
        const response = await axios.get(`${API_URL}/activity/getActivities`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        throw error;
    }
}

export async function getActivityTypes(token) {
  try {
    const response = await axios.get(`${API_URL}/activity/getActivityTypes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de actividad:', error);
    throw error;
  }
}

export async function createActivity(token, activity) {
  try {
    const response = await axios.post(`${API_URL}/activity/createActivity`, activity, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear actividad:', error);
    throw error;
  }
}