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