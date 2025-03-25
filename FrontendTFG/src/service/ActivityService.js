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

export const createActivity = async (token, activityData) => {
  try {
    const response = await fetch(`${API_URL}/activity/createActivity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(activityData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};


export async function addDailyObjective(token, dailyActivityObjective) {
  try {
    const response = await axios.post(`${API_URL}/activity/addObjective`, 
      dailyActivityObjective ,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al añadir objetivo diario:', error);
    throw error;
  }
}

export async function getDailyObjective(token) {
  try {
    const response = await axios.get(`${API_URL}/activity/getObjective`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener objetivo diario:', error);
    throw error;
  }
}