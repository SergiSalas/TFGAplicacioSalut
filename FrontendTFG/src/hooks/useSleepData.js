import { useState, useEffect, useContext } from 'react';
import healthConnectService from '../service/HealthConnectService';
import { getSleepHistory } from '../service/SleepService';
import { AuthContext } from '../contexts/AuthContext';

export const useSleepData = (includeHistory = false) => {
  const [sleepData, setSleepData] = useState(null);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    
    // Suscribirse al observable de datos del sueño
    const subscription = healthConnectService
      .getSleepDataObservable()
      .subscribe(data => {
        setSleepData(data);
        if (!includeHistory) {
          setLoading(false);
        }
      });

    // Si se solicita el historial, obtenerlo
    if (includeHistory && token) {
      getSleepHistory(token)
        .then(history => {
          setSleepHistory(history);
        })
        .catch(error => {
          console.error('Error loading sleep history:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // Solicitar una actualización inicial de los datos
    healthConnectService.readSleepData().catch(error => {
      console.error('Error loading sleep data:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [token, includeHistory]);

  const refreshSleepData = async () => {
    setLoading(true);
    try {
      await healthConnectService.readSleepData();
      if (includeHistory && token) {
        const history = await getSleepHistory(token);
        setSleepHistory(history);
      }
    } catch (error) {
      console.error('Error refreshing sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    sleepData,
    sleepHistory,
    loading,
    refreshSleepData
  };
}; 