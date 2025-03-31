import { useState, useEffect } from 'react';
import healthConnectService from '../service/HealthConnectService';

export const useSleepData = () => {
  const [sleepData, setSleepData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Suscribirse al observable de datos del sueño
    const subscription = healthConnectService
      .getSleepDataObservable()
      .subscribe(data => {
        setSleepData(data);
        setLoading(false);
      });

    // Solicitar una actualización inicial de los datos
    healthConnectService.readSleepData().catch(error => {
      console.error('Error loading sleep data:', error);
      setLoading(false);
    });

    // Limpieza de la suscripción
    return () => subscription.unsubscribe();
  }, []);

  const refreshSleepData = async () => {
    setLoading(true);
    try {
      await healthConnectService.readSleepData();
    } catch (error) {
      console.error('Error refreshing sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    sleepData,
    loading,
    refreshSleepData
  };
}; 